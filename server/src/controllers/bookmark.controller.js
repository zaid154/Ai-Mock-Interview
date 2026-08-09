const Bookmark = require('../models/Bookmark.model')

// GET /api/bookmarks — get user's bookmarks
async function listBookmarks(req, res) {
  const bookmarks = await Bookmark.find({ user: req.userId }).sort({ createdAt: -1 }).lean()
  res.json({ bookmarks })
}

// POST /api/bookmarks — create a new bookmark
async function addBookmark(req, res) {
  const { prompt, role, category, answer, feedback, options, correctIndex, notes } = req.body

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Question prompt is required' })
  }

  // Prevent exact duplicate bookmark for the user
  const existing = await Bookmark.findOne({ user: req.userId, prompt: prompt.trim() })
  if (existing) {
    return res.status(409).json({ error: 'This question is already bookmarked', bookmark: existing })
  }

  const bookmark = await Bookmark.create({
    user: req.userId,
    prompt: prompt.trim(),
    role: role || 'General',
    category: category || 'General',
    answer: answer || '',
    feedback: feedback || '',
    options,
    correctIndex,
    notes: notes || '',
  })

  res.status(201).json({ bookmark })
}

// PATCH /api/bookmarks/:id/notes — update notes on a bookmark
async function updateBookmarkNotes(req, res) {
  const { notes } = req.body
  const bookmark = await Bookmark.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { notes: String(notes || '').trim() },
    { new: true },
  )

  if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' })
  res.json({ bookmark })
}

// DELETE /api/bookmarks/:id — remove a bookmark
async function removeBookmark(req, res) {
  const result = await Bookmark.deleteOne({ _id: req.params.id, user: req.userId })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Bookmark not found' })
  res.json({ ok: true })
}

module.exports = {
  listBookmarks,
  addBookmark,
  updateBookmarkNotes,
  removeBookmark,
}
