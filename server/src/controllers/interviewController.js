const crypto = require('crypto')
const Interview = require('../models/interviewModel')
const User = require('../models/userModel')
const Resume = require('../models/resumeModel')
const { generateQuestions, generateQuiz, evaluateInterview, extractResumeContext } = require('../services/aiService')

// Hides correctIndex while a quiz is ongoing to prevent cheating via browser inspection;
// and normalizes unanswered questions in open-ended interviews to 0 score
function publicInterview(interview) {
  const obj = interview.toObject ? interview.toObject() : interview
  if (obj.mode === 'quiz' && obj.status !== 'completed') {
    obj.questions = obj.questions.map((q) => ({ ...q, correctIndex: undefined }))
  }
  if (obj.mode !== 'quiz' && Array.isArray(obj.questions)) {
    obj.questions = obj.questions.map((q) => {
      const hasAnswer = Boolean(q.answer && q.answer.trim())
      if (!hasAnswer && (q.score > 0 || !q.feedback)) {
        return {
          ...q,
          score: 0,
          feedback: 'No response was submitted for this question.',
        }
      }
      return q
    })
  }
  return obj
}

// POST /api/interviews — Generates and initiates an interview or quiz session
async function startInterview(req, res) {
  const { role, difficulty, count = 5, experience, mode = 'questions', category = 'General', timerMinutes = 0, questions: preGenerated } = req.body
  const activeResume = await Resume.findOne({ user: req.userId, isActive: true })
  const hasResume = Boolean(activeResume)
  if (!hasResume && !role) return res.status(400).json({ error: 'Tell us the role you want to practise for' })

  let questions = preGenerated

  // If pre-generated questions were not provided, generate in single fallback request
  if (!Array.isArray(questions) || questions.length === 0) {
    if (mode === 'quiz') {
      try {
        const quiz = await generateQuiz(role, difficulty, count, experience, activeResume?.resumeContext, category)
        questions = quiz.map((q) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, selectedIndex: null }))
      } catch (err) {
        console.warn('Quiz generation failed:', err.message)
        return res.status(503).json({ error: 'Quiz mode needs a working Gemini API key. Add one in admin settings, or use Questions mode.' })
      }
    } else {
      try {
        const prompts = await generateQuestions(role, difficulty, count, experience, activeResume?.resumeContext, category)
        questions = prompts.map((prompt) => ({ prompt }))
      } catch (err) {
        if (hasResume) {
          console.warn('Resume question generation failed:', err.message)
          return res.status(503).json({ error: 'Your resume is saved, but resume-based questions need a working Gemini API key.' })
        }
        throw err
      }
    }
  }

  const interview = await Interview.create({
    user: req.userId,
    role: hasResume ? 'Resume-based Interview' : role,
    category,
    experience,
    difficulty,
    mode,
    timerMinutes: Number(timerMinutes) || 0,
    usesResume: hasResume,
    status: 'in_progress',
    questions,
  })
  res.status(201).json({ interview: publicInterview(interview) })
}

// GET /api/interviews — Retrieves historical interview list for logged-in user
async function listInterviews(req, res) {
  const interviews = await Interview.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .select('role category experience difficulty mode timerMinutes status overallScore createdAt questions notes')
    .lean()

  res.json({
    interviews: interviews.map(({ questions, ...item }) => ({
      ...item,
      questionCount: questions?.length || 0,
    })),
  })
}

// GET /api/interviews/:id — Retrieves single interview session details
async function getInterview(req, res) {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
  if (!interview) return res.status(404).json({ error: 'Interview not found' })
  res.json({ interview: publicInterview(interview) })
}

// POST /api/interviews/:id/submit — Finalizes responses with AI grading or quiz scoring
async function submitInterview(req, res) {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
  if (!interview) return res.status(404).json({ error: 'Interview not found' })
  if (interview.status === 'completed') return res.status(400).json({ error: 'This interview has already been submitted' })

  const answers = Array.isArray(req.body.answers) ? req.body.answers : []

  if (interview.mode === 'quiz') {
    let correct = 0
    interview.questions.forEach((q, i) => {
      const n = Number(answers[i])
      const picked = answers[i] !== '' && answers[i] !== null && Number.isInteger(n) && n >= 0 && n < q.options.length ? n : null
      q.selectedIndex = picked
      const right = picked === q.correctIndex
      if (right) correct += 1
      q.score = right ? 10 : 0
      q.feedback = right ? 'Correct.' : `Incorrect — the right answer was option ${String.fromCharCode(65 + q.correctIndex)}.`
    })
    interview.overallScore = Math.round((correct / (interview.questions.length || 1)) * 100)
    interview.summary = `You scored ${correct} out of ${interview.questions.length} on this quiz.`
  } else {
    interview.questions.forEach((q, i) => { q.answer = String(answers[i] ?? '').trim() })
    const result = await evaluateInterview(interview.role, interview.questions.map((q) => ({ prompt: q.prompt, answer: q.answer })))
    interview.questions.forEach((q, i) => {
      const hasAnswer = Boolean(q.answer && q.answer.trim())
      q.score = hasAnswer ? (result.perQuestion[i]?.score ?? 0) : 0
      q.feedback = hasAnswer ? (result.perQuestion[i]?.feedback ?? '') : 'No response was submitted for this question.'
    })
    interview.overallScore = result.overallScore
    interview.summary = result.summary
  }

  interview.status = 'completed'
  await interview.save()
  res.json({ interview: publicInterview(interview) })
}

// PATCH /api/interviews/:id/notes — Persists candidate notes on interview or specific question
async function updateNotes(req, res) {
  const { notes, questionIndex } = req.body
  const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
  if (!interview) return res.status(404).json({ error: 'Interview not found' })

  if (typeof questionIndex === 'number' && interview.questions[questionIndex]) {
    interview.questions[questionIndex].notes = String(notes || '').trim()
  } else {
    interview.notes = String(notes || '').trim()
  }

  await interview.save()
  res.json({ ok: true, interview: publicInterview(interview) })
}

// GET /api/interviews/leaderboard — Aggregates top 20 candidates across platform
async function getLeaderboard(_req, res) {
  const stats = await Interview.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$user',
        totalCompleted: { $sum: 1 },
        avgScore: { $avg: '$overallScore' },
        highestScore: { $max: '$overallScore' },
      },
    },
    { $sort: { avgScore: -1, totalCompleted: -1 } },
    { $limit: 20 },
  ])

  const userIds = stats.map((s) => s._id)
  const users = await User.find({ _id: { $in: userIds } }).select('name avatar bio').lean()
  const userMap = new Map(users.map((u) => [String(u._id), u]))

  const leaderboard = stats.map((stat, idx) => {
    const info = userMap.get(String(stat._id)) || { name: 'Anonymous User', avatar: '', bio: '' }
    return {
      rank: idx + 1,
      userId: stat._id,
      name: info.name,
      avatar: info.avatar,
      bio: info.bio,
      totalCompleted: stat.totalCompleted,
      avgScore: Math.round(stat.avgScore || 0),
      highestScore: stat.highestScore || 0,
    }
  })
  res.json({ leaderboard })
}

// DELETE /api/interviews/:id — Removes completed or in-progress session
async function deleteInterview(req, res) {
  const result = await Interview.deleteOne({ _id: req.params.id, user: req.userId })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Interview not found' })
  res.json({ ok: true })
}

// POST /api/interviews/resume — Parses uploaded PDF, hashes content, saves structured context
async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Please attach a PDF file' })

  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex')
  const fileName = req.file.originalname || 'Resume.pdf'

  // 1. Content Hash Deduplication: If this exact resume was already processed for this user, reuse it!
  const existing = await Resume.findOne({ user: req.userId, fileHash })
  if (existing) {
    await Resume.updateMany({ user: req.userId }, { isActive: false })
    existing.isActive = true
    await existing.save()
    await User.findByIdAndUpdate(req.userId, {
      activeResume: existing._id,
      resumeFileName: existing.fileName,
      resumeText: existing.rawText || '',
    })
    return res.json({
      ok: true,
      cached: true,
      fileName: existing.fileName,
      resumeContext: existing.resumeContext,
      message: 'Resume already processed. Using saved resume context.',
    })
  }

  // 2. New Resume Upload: Extract text from PDF once
  let text = ''
  try {
    const { extractText, getDocumentProxy } = await import('unpdf')
    const pdf = await getDocumentProxy(new Uint8Array(req.file.buffer))
    const result = await extractText(pdf, { mergePages: true })
    text = String(result.text || '').trim()
  } catch {
    return res.status(400).json({ error: 'Could not read that PDF. Try another file.' })
  }
  if (!text) return res.status(400).json({ error: 'No readable text found in that PDF' })

  // 3. Extract compact structured context once
  const resumeContext = await extractResumeContext(text)

  // 4. Deactivate old resumes and save new resume
  await Resume.updateMany({ user: req.userId }, { isActive: false })
  const newResume = await Resume.create({
    user: req.userId,
    fileName,
    fileHash,
    rawText: text,
    resumeContext,
    isActive: true,
  })

  await User.findByIdAndUpdate(req.userId, {
    activeResume: newResume._id,
    resumeFileName: fileName,
    resumeText: text,
  })

  return res.status(201).json({
    ok: true,
    cached: false,
    fileName,
    resumeContext,
    message: 'Resume parsed and structured context saved.',
  })
}

// GET /api/interviews/resume/active — Retrieves candidate's active saved resume
async function getActiveResume(req, res) {
  const resume = await Resume.findOne({ user: req.userId, isActive: true }).select('fileName createdAt resumeContext')
  if (!resume) return res.json({ active: false, fileName: '', resumeContext: null })
  return res.json({
    active: true,
    fileName: resume.fileName,
    uploadedAt: resume.createdAt,
    hasContext: Boolean(resume.resumeContext?.skills?.length || resume.resumeContext?.projects?.length),
  })
}

// DELETE /api/interviews/resume/active — Detaches active resume from candidate profile
async function removeActiveResume(req, res) {
  await Resume.updateMany({ user: req.userId }, { isActive: false })
  await User.findByIdAndUpdate(req.userId, { activeResume: null, resumeFileName: '', resumeText: '' })
  return res.json({ ok: true })
}

// POST /api/interviews/batch — Generates a micro-batch of questions (1 or 2) using cached resume context
async function generateQuestionBatch(req, res) {
  const { role, difficulty, count = 2, experience = 'Fresher', mode = 'questions', category = 'General', excludePrompts = [] } = req.body

  const activeResume = await Resume.findOne({ user: req.userId, isActive: true })
  const resumeContext = activeResume ? activeResume.resumeContext : null
  const hasResume = Boolean(resumeContext && (resumeContext.skills?.length || resumeContext.projects?.length))

  if (!hasResume && !role) {
    return res.status(400).json({ error: 'Tell us the role you want to practise for' })
  }

  let questions
  if (mode === 'quiz') {
    try {
      const quiz = await generateQuiz(role, difficulty, Number(count), experience, resumeContext, category, excludePrompts)
      questions = quiz.map((q) => ({
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: null,
      }))
    } catch (err) {
      console.warn('Batch quiz generation failed:', err.message)
      return res.status(503).json({ error: 'Quiz mode requires an active Gemini API key. Add one in admin settings or use Q&A mode.' })
    }
  } else {
    try {
      const prompts = await generateQuestions(role, difficulty, Number(count), experience, resumeContext, category, excludePrompts)
      questions = prompts.map((prompt) => ({ prompt }))
    } catch (err) {
      console.warn('Batch question generation failed:', err.message)
      if (hasResume) {
        return res.status(503).json({ error: 'Resume-tailored question generation failed. Please verify API key.' })
      }
      return res.status(503).json({ error: 'Question generation failed.' })
    }
  }

  return res.json({ ok: true, questions })
}

module.exports = {
  startInterview,
  listInterviews,
  getInterview,
  submitInterview,
  updateNotes,
  getLeaderboard,
  deleteInterview,
  uploadResume,
  getActiveResume,
  removeActiveResume,
  generateQuestionBatch,
}
