const crypto = require('crypto')
const Interview = require('../models/interviewModel')
const User = require('../models/userModel')
const Resume = require('../models/resumeModel')
const { generateQuestions, generateQuiz, evaluateInterview, extractResumeContext, getFastQuestions, generateFollowUpProbe } = require('../services/aiService')

function publicInterview(interview) {
  const obj = interview.toObject ? interview.toObject() : interview
  if (obj.mode === 'quiz' && obj.status !== 'completed') {
    obj.questions = obj.questions.map((q) => ({ ...q, correctIndex: undefined }))
  } else if (Array.isArray(obj.questions)) {
    obj.questions = obj.questions.map((q) =>
      (!q.answer?.trim() && (q.score > 0 || !q.feedback))
        ? { ...q, score: 0, feedback: 'No response was submitted for this question.' }
        : q
    )
  }
  return obj
}

const syncUserResume = (userId, resumeId, fileName, text) =>
  Promise.all([
    Resume.updateMany({ user: userId }, { isActive: false }),
    User.findByIdAndUpdate(userId, { activeResume: resumeId, resumeFileName: fileName, resumeText: text || '' }),
  ])

async function startInterview(req, res) {
  const { role, difficulty, count = 5, experience, mode = 'questions', category = 'General', timerMinutes = 0, questions: preGenerated } = req.body
  const activeResume = await Resume.findOne({ user: req.userId, isActive: true })
  const hasResume = Boolean(activeResume)
  if (!hasResume && !role) return res.status(400).json({ error: 'Tell us the role you want to practise for' })

  let questions = preGenerated
  if (!Array.isArray(questions) || !questions.length) {
    if (mode === 'quiz') {
      try {
        const quiz = await generateQuiz(role, difficulty, count, experience, activeResume?.resumeContext, category)
        questions = quiz.map((q) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, selectedIndex: null }))
      } catch (err) {
        return res.status(503).json({ error: 'Quiz mode needs a working Gemini API key. Add one in admin settings, or use Questions mode.' })
      }
    } else {
      try {
        const prompts = hasResume
          ? await generateQuestions(role, difficulty, count, experience, activeResume.resumeContext, category)
          : await getFastQuestions(role, difficulty, count, category)
        questions = prompts.map((prompt) => ({ prompt }))
      } catch {
        const prompts = await getFastQuestions(role, difficulty, count, category)
        questions = prompts.map((prompt) => ({ prompt }))
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

async function listInterviews(req, res) {
  const interviews = await Interview.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .select('role category experience difficulty mode timerMinutes status overallScore createdAt questions notes')
    .lean()

  res.json({ interviews: interviews.map(({ questions, ...item }) => ({ ...item, questionCount: questions?.length || 0 })) })
}

async function getInterview(req, res) {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
  if (!interview) return res.status(404).json({ error: 'Interview not found' })
  res.json({ interview: publicInterview(interview) })
}

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
      const hasAnswer = Boolean(q.answer)
      const item = result.perQuestion?.[i] || {}
      q.score = hasAnswer ? (item.score ?? 0) : 0
      q.feedback = hasAnswer ? (item.feedback ?? '') : 'No response was submitted for this question.'
      q.rubric = item.rubric || { technicalAccuracy: 0, depthAndTradeoffs: 0, structureAndFlow: 0, communication: 0 }
      q.talkingPoints = item.talkingPoints || []
      q.modelAnswer = item.modelAnswer || ''
    })
    interview.overallScore = result.overallScore
    interview.summary = result.summary
  }

  interview.status = 'completed'
  await interview.save()
  res.json({ interview: publicInterview(interview) })
}

async function probeFollowUp(req, res) {
  const { questionIndex, answer } = req.body
  const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
  const q = interview?.questions?.[questionIndex]
  if (!interview || !q) return res.status(404).json({ error: 'Interview or question not found' })

  const followUp = await generateFollowUpProbe(interview.role, q.prompt, answer || q.answer)
  q.followUpPrompt = followUp
  await interview.save()
  res.json({ ok: true, followUpPrompt: followUp })
}

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

async function getLeaderboard(_req, res) {
  const stats = await Interview.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$user', totalCompleted: { $sum: 1 }, avgScore: { $avg: '$overallScore' }, highestScore: { $max: '$overallScore' } } },
    { $sort: { avgScore: -1, totalCompleted: -1 } },
    { $limit: 20 },
  ])

  const users = await User.find({ _id: { $in: stats.map((s) => s._id) } }).select('name avatar bio').lean()
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

async function deleteInterview(req, res) {
  const result = await Interview.deleteOne({ _id: req.params.id, user: req.userId })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Interview not found' })
  res.json({ ok: true })
}

async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Please attach a PDF file' })

  const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex')
  const fileName = req.file.originalname || 'Resume.pdf'

  const existing = await Resume.findOne({ user: req.userId, fileHash })
  if (existing) {
    await syncUserResume(req.userId, existing._id, existing.fileName, existing.rawText)
    existing.isActive = true
    await existing.save()
    return res.json({ ok: true, cached: true, fileName: existing.fileName, resumeContext: existing.resumeContext, message: 'Resume already processed. Using saved resume context.' })
  }

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

  const resumeContext = await extractResumeContext(text)
  const newResume = await Resume.create({ user: req.userId, fileName, fileHash, rawText: text, resumeContext, isActive: true })
  await syncUserResume(req.userId, newResume._id, fileName, text)

  return res.status(201).json({ ok: true, cached: false, fileName, resumeContext, message: 'Resume parsed and structured context saved.' })
}

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

async function removeActiveResume(req, res) {
  await syncUserResume(req.userId, null, '', '')
  res.json({ ok: true })
}

async function generateQuestionBatch(req, res) {
  const { role, difficulty, count = 2, experience = 'Fresher', mode = 'questions', category = 'General', excludePrompts = [] } = req.body
  const activeResume = await Resume.findOne({ user: req.userId, isActive: true })
  const resumeContext = activeResume ? activeResume.resumeContext : null
  const hasResume = Boolean(resumeContext && (resumeContext.skills?.length || resumeContext.projects?.length))

  if (!hasResume && !role) return res.status(400).json({ error: 'Tell us the role you want to practise for' })

  let questions
  if (mode === 'quiz') {
    try {
      const quiz = await generateQuiz(role, difficulty, Number(count), experience, resumeContext, category, excludePrompts)
      questions = quiz.map((q) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, selectedIndex: null }))
    } catch {
      return res.status(503).json({ error: 'Quiz mode requires an active Gemini API key. Add one in admin settings or use Q&A mode.' })
    }
  } else {
    try {
      const prompts = await generateQuestions(role, difficulty, Number(count), experience, resumeContext, category, excludePrompts)
      questions = prompts.map((prompt) => ({ prompt }))
    } catch {
      return res.status(503).json({ error: hasResume ? 'Resume-tailored question generation failed. Please verify API key.' : 'Question generation failed.' })
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
  probeFollowUp,
}
