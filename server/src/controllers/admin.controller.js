const User = require('../models/User.model')
const Setting = require('../models/Setting.model')

// All handlers here run behind requireAuth + requireAdmin (see admin.routes.js).

// GET /api/admin/users — list users with their verification status.
async function listUsers(_req, res) {
  const users = await User.find()
    .select('name email role isVerified createdAt')
    .sort({ createdAt: -1 })
    .lean()
  res.json({ users })
}

// PATCH /api/admin/users/:id/verified  { isVerified }
// Manually verify or unverify a user.
async function setUserVerified(req, res) {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  user.isVerified = Boolean(req.body.isVerified)
  await user.save()
  res.json({ ok: true, isVerified: user.isVerified })
}

// PATCH /api/admin/users/:id/role  { role }
// Promote to admin / demote to user. Can't change your own role (avoids an
// admin accidentally locking themselves out).
async function setUserRole(req, res) {
  if (req.params.id === req.userId) {
    return res.status(400).json({ error: "You can't change your own role" })
  }
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  user.role = req.body.role
  await user.save()
  res.json({ ok: true, role: user.role })
}

// DELETE /api/admin/users/:id — remove a user. Can't delete yourself.
async function deleteUser(req, res) {
  if (req.params.id === req.userId) {
    return res.status(400).json({ error: "You can't delete your own account here" })
  }
  const result = await User.deleteOne({ _id: req.params.id })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' })
  res.json({ ok: true })
}

// GET /api/admin/settings — all key/value config entries.
async function listSettings(_req, res) {
  const settings = await Setting.find().sort({ key: 1 }).lean()
  res.json({ settings })
}

// PUT /api/admin/settings  { key, value }
// Create a new entry or update an existing one (upsert by key).
async function upsertSetting(req, res) {
  const { key, value } = req.body
  if (value === undefined) {
    return res.status(400).json({ error: 'A value is required' })
  }
  const setting = await Setting.findOneAndUpdate(
    { key },
    { key, value },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
  res.json({ setting })
}

// PATCH /api/admin/settings/:key/rename  { newKey }
// Rename a config entry, keeping its value.
async function renameSetting(req, res) {
  const { newKey } = req.body
  const setting = await Setting.findOne({ key: req.params.key })
  if (!setting) return res.status(404).json({ error: 'Setting not found' })
  // Exclude the doc being renamed so renaming a key to itself isn't a false conflict.
  if (await Setting.findOne({ key: newKey, _id: { $ne: setting._id } })) {
    return res.status(409).json({ error: 'A setting with that key already exists' })
  }
  setting.key = newKey
  await setting.save()
  res.json({ setting })
}

// DELETE /api/admin/settings/:key
async function deleteSetting(req, res) {
  await Setting.deleteOne({ key: req.params.key })
  res.json({ ok: true })
}

module.exports = {
  listUsers,
  setUserVerified,
  setUserRole,
  deleteUser,
  listSettings,
  upsertSetting,
  renameSetting,
  deleteSetting,
}
