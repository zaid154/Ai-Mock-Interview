const Bookmark = require('../models/bookmarkModel')
const { normalizePrompt, escapeRegex } = require('../utils/textUtils')

// GET /api/bookmarks — get user's bookmarks
async function listBookmarks(req, res) {
  const bookmarks = await Bookmark.find({ user: req.userId }).sort({ createdAt: -1 }).lean()
  res.json({ bookmarks })
}

// POST /api/bookmarks — create a new bookmark
async function addBookmark(req, res) {
  const { prompt, role, category, answer, feedback, options, correctIndex, notes, modelAnswer, rubric, talkingPoints } = req.body

  const cleanPrompt = normalizePrompt(prompt)
  if (!cleanPrompt) {
    return res.status(400).json({ error: 'Question prompt is required' })
  }

  const promptRegex = new RegExp('^' + escapeRegex(cleanPrompt) + '$', 'i')
  const existing = await Bookmark.findOne({ user: req.userId, $or: [{ prompt: cleanPrompt }, { prompt: promptRegex }] })
  if (existing) {
    return res.status(409).json({ error: 'This question is already bookmarked', bookmark: existing })
  }

  const bookmark = await Bookmark.create({
    user: req.userId,
    prompt: cleanPrompt,
    role: role || 'General',
    category: category || 'General',
    answer: answer || '',
    feedback: feedback || '',
    options,
    correctIndex,
    notes: notes || '',
    modelAnswer: modelAnswer || '',
    rubric: rubric || undefined,
    talkingPoints: talkingPoints || [],
  })

  res.status(201).json({ bookmark })
}

// POST /api/bookmarks/toggle — Toggle bookmark (add if absent, remove if already present)
async function toggleBookmark(req, res) {
  const { prompt, role, category, answer, feedback, options, correctIndex, notes, modelAnswer, rubric, talkingPoints } = req.body

  const cleanPrompt = normalizePrompt(prompt)
  if (!cleanPrompt) {
    return res.status(400).json({ error: 'Question prompt is required' })
  }

  const promptRegex = new RegExp('^' + escapeRegex(cleanPrompt) + '$', 'i')
  const existing = await Bookmark.findOne({ user: req.userId, $or: [{ prompt: cleanPrompt }, { prompt: promptRegex }] })

  if (existing) {
    // Delete all matching copies (preventing any duplicate ghost records)
    await Bookmark.deleteMany({ user: req.userId, $or: [{ prompt: cleanPrompt }, { prompt: promptRegex }] })
    return res.json({ ok: true, bookmarked: false, message: 'Bookmark removed' })
  }

  const bookmark = await Bookmark.create({
    user: req.userId,
    prompt: cleanPrompt,
    role: role || 'General',
    category: category || 'General',
    answer: answer || '',
    feedback: feedback || '',
    options,
    correctIndex,
    notes: notes || '',
    modelAnswer: modelAnswer || '',
    rubric: rubric || undefined,
    talkingPoints: talkingPoints || [],
  })

  return res.status(201).json({ ok: true, bookmarked: true, bookmark, message: 'Question saved to Bookmarks' })
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
  toggleBookmark,
  updateBookmarkNotes,
  removeBookmark,
}
