const CertificateTemplate = require('../models/CertificateTemplate.model')

// The four credentials the app shipped with. Used to seed an empty collection so
// a fresh install still shows the milestones it always did, and as the reset
// target for the admin panel.
const DEFAULT_TEMPLATES = [
  {
    key: 'm1',
    title: 'Interview Pioneer Certificate',
    description: 'Complete your first interview session with a score of 60% or higher.',
    reqCount: 1,
    reqMinScore: 60,
    reqScore: null,
    design: 'classic',
    accent: '#4f46e5',
    order: 1,
  },
  {
    key: 'm3',
    title: 'Interview Specialist Certificate',
    description: 'Complete 3 interview sessions with a score of 70% or higher.',
    reqCount: 3,
    reqMinScore: 70,
    reqScore: null,
    design: 'modern',
    accent: '#0f766e',
    order: 2,
  },
  {
    key: 'm5',
    title: 'MockMate AI Master Certificate',
    description: 'Complete 5 interview sessions with a score of 75% or higher.',
    reqCount: 5,
    reqMinScore: 75,
    reqScore: null,
    design: 'elegant',
    accent: '#7c3aed',
    order: 3,
  },
  {
    key: 'm_score',
    title: 'High Performance Honours Certificate',
    description: 'Achieve a score of 85% or higher in any single session.',
    reqCount: 1,
    reqMinScore: 60,
    reqScore: 85,
    design: 'elegant',
    accent: '#b45309',
    order: 4,
  },
]

// Creates the defaults only when the collection is completely empty, so an admin
// who deliberately deleted a milestone does not get it back on the next boot.
async function ensureSeeded() {
  const count = await CertificateTemplate.estimatedDocumentCount()
  if (count > 0) return
  await CertificateTemplate.insertMany(DEFAULT_TEMPLATES)
}

// GET /api/certificates/templates — public. The Certificates page renders from
// this, so it must work for any signed-in candidate, not just admins.
async function listPublicTemplates(_req, res) {
  await ensureSeeded()
  const templates = await CertificateTemplate.find({ enabled: true })
    .sort({ order: 1, createdAt: 1 })
    .lean()
  res.json({ templates })
}

// GET /api/admin/certificate-templates — admin sees disabled ones too.
async function listTemplates(_req, res) {
  await ensureSeeded()
  const templates = await CertificateTemplate.find().sort({ order: 1, createdAt: 1 }).lean()
  res.json({ templates, designs: CertificateTemplate.DESIGNS })
}

// POST /api/admin/certificate-templates
async function createTemplate(req, res) {
  const body = pickWritable(req.body)
  if (!body.key) body.key = slugify(body.title || '')
  if (!body.key) return res.status(400).json({ error: 'A key or title is required' })

  if (await CertificateTemplate.findOne({ key: body.key })) {
    return res.status(409).json({ error: 'A milestone with that key already exists' })
  }
  if (body.order === undefined) {
    const last = await CertificateTemplate.findOne().sort({ order: -1 }).lean()
    body.order = (last?.order || 0) + 1
  }
  const template = await CertificateTemplate.create(body)
  res.status(201).json({ template })
}

// PATCH /api/admin/certificate-templates/:id
async function updateTemplate(req, res) {
  const template = await CertificateTemplate.findById(req.params.id)
  if (!template) return res.status(404).json({ error: 'Milestone not found' })

  const body = pickWritable(req.body)
  if (body.key && body.key !== template.key) {
    if (await CertificateTemplate.findOne({ key: body.key, _id: { $ne: template._id } })) {
      return res.status(409).json({ error: 'A milestone with that key already exists' })
    }
  }
  Object.assign(template, body)
  await template.save()
  res.json({ template })
}

// DELETE /api/admin/certificate-templates/:id
async function deleteTemplate(req, res) {
  const result = await CertificateTemplate.deleteOne({ _id: req.params.id })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Milestone not found' })
  res.json({ ok: true })
}

// POST /api/admin/certificate-templates/reset — restore the shipped set.
async function resetTemplates(_req, res) {
  await CertificateTemplate.deleteMany({})
  const templates = await CertificateTemplate.insertMany(DEFAULT_TEMPLATES)
  res.json({ templates })
}

// Whitelist: never let a request set _id, timestamps or unknown keys.
function pickWritable(body = {}) {
  const out = {}
  const strings = ['key', 'title', 'description', 'design', 'accent', 'subtitle']
  const numbers = ['reqCount', 'reqMinScore', 'order']

  for (const k of strings) {
    if (typeof body[k] === 'string') out[k] = body[k].trim()
  }
  for (const k of numbers) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== '') {
      const n = Number(body[k])
      if (Number.isFinite(n)) out[k] = n
    }
  }
  // reqScore is deliberately nullable — null means "not a single-score award".
  if (body.reqScore === null || body.reqScore === '') out.reqScore = null
  else if (body.reqScore !== undefined) {
    const n = Number(body.reqScore)
    if (Number.isFinite(n)) out.reqScore = n
  }
  if (body.enabled !== undefined) out.enabled = Boolean(body.enabled)

  return out
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

module.exports = {
  DEFAULT_TEMPLATES,
  ensureSeeded,
  listPublicTemplates,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  resetTemplates,
}
