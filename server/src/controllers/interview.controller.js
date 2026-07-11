const Interview = require('../models/Interview.model')
const User = require('../models/User.model')
const { generateQuestions, generateQuiz, evaluateInterview } = require('../services/gemini')

// Hide the answer key while a quiz is still in progress so it can't be read from
// the network response. We reveal correctIndex again on the completed results.
function publicInterview(interview) {
  const obj = interview.toObject ? interview.toObject() : interview
  if (obj.mode === 'quiz' && obj.status !== 'completed') {
    obj.questions = obj.questions.map((q) => ({ ...q, correctIndex: undefined }))
  }
  return obj
}

// POST /api/interviews
// A saved resume is always the candidate profile. Form fields are only used as
// a fallback when the user has not uploaded a resume.
async function startInterview(req, res) {
  const { role, difficulty, count, experience, mode } = req.body

  const user = await User.findById(req.userId).select('resumeText')
  const resumeText = user?.resumeText || ''
  const hasResume = Boolean(resumeText.trim())
  if (!hasResume && !role) {
    return res.status(400).json({ error: 'Tell us the role you want to practise for' })
  }

  let questions
  if (mode === 'quiz') {
    try {
      const quiz = await generateQuiz(role, difficulty, count, experience, resumeText)
      questions = quiz.map((q) => ({
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        selectedIndex: null,
      }))
    } catch (err) {
      // Quiz mode has no offline fallback — it needs a working Gemini key.
      console.warn('Quiz generation failed:', err.message)
      return res.status(503).json({
        error: 'Quiz mode needs a working Gemini API key. Add one in admin settings, or use Questions mode.',
      })
    }
  } else {
    try {
      const prompts = await generateQuestions(role, difficulty, count, experience, resumeText)
      questions = prompts.map((prompt) => ({ prompt }))
    } catch (err) {
      if (hasResume) {
        console.warn('Resume question generation failed:', err.message)
        return res.status(503).json({
          error: 'Your resume is saved, but resume-based questions need a working Gemini API key.',
        })
      }
      throw err
    }
  }

  const interview = await Interview.create({
    user: req.userId,
    role: hasResume ? 'Resume-based Interview' : role,
    experience,
    difficulty,
    mode,
    usesResume: hasResume,
    status: 'in_progress',
    questions,
  })

  res.status(201).json({ interview: publicInterview(interview) })
}

// GET /api/interviews — summaries for the dashboard history list.
async function listInterviews(req, res) {
  const interviews = await Interview.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .select('role difficulty mode status overallScore createdAt questions')
    .lean()
  // Dashboard only needs the total count, never the actual question text.
  res.json({
    interviews: interviews.map(({ questions, ...interview }) => ({
      ...interview,
      questionCount: questions?.length || 0,
    })),
  })
}

// GET /api/interviews/:id — one full interview (answer key hidden if quiz + open).
async function getInterview(req, res) {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
  if (!interview) return res.status(404).json({ error: 'Interview not found' })
  res.json({ interview: publicInterview(interview) })
}

// POST /api/interviews/:id/submit
// Questions mode: body.answers (string[]) → AI/heuristic grading.
// Quiz mode: body.answers (number[] of chosen option indexes) → score by key.
async function submitInterview(req, res) {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
  if (!interview) return res.status(404).json({ error: 'Interview not found' })
  if (interview.status === 'completed') {
    return res.status(400).json({ error: 'This interview has already been submitted' })
  }

  const answers = Array.isArray(req.body.answers) ? req.body.answers : []

  if (interview.mode === 'quiz') {
    // Grade locally: 10 points for a correct pick, 0 otherwise. No AI needed.
    let correct = 0
    interview.questions.forEach((q, i) => {
      // Accept a numeric index or a numeric string ("2"); anything else = unanswered.
      const n = Number(answers[i])
      const picked = answers[i] !== '' && answers[i] !== null && Number.isInteger(n) && n >= 0 && n < q.options.length
        ? n
        : null
      q.selectedIndex = picked
      const right = picked === q.correctIndex
      if (right) correct += 1
      q.score = right ? 10 : 0
      q.feedback = right
        ? 'Correct.'
        : `Incorrect — the right answer was option ${String.fromCharCode(65 + q.correctIndex)}.`
    })
    interview.overallScore = Math.round((correct / (interview.questions.length || 1)) * 100)
    interview.summary = `You scored ${correct} out of ${interview.questions.length} on this quiz.`
  } else {
    // Questions mode: store answers then grade with Gemini (heuristic fallback).
    interview.questions.forEach((q, i) => {
      q.answer = String(answers[i] ?? '').trim()
    })
    const result = await evaluateInterview(
      interview.role,
      interview.questions.map((q) => ({ prompt: q.prompt, answer: q.answer })),
    )
    interview.questions.forEach((q, i) => {
      q.score = result.perQuestion[i]?.score ?? 0
      q.feedback = result.perQuestion[i]?.feedback ?? ''
    })
    interview.overallScore = result.overallScore
    interview.summary = result.summary
  }

  interview.status = 'completed'
  await interview.save()
  res.json({ interview: publicInterview(interview) })
}

// DELETE /api/interviews/:id — remove one of your own interviews from history.
async function deleteInterview(req, res) {
  const result = await Interview.deleteOne({ _id: req.params.id, user: req.userId })
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Interview not found' })
  res.json({ ok: true })
}

// POST /api/interviews/resume — upload a CV (PDF). We extract the text in memory
// (nothing is written to disk, so it works on serverless hosts) and save it on
// the user so future interviews can be tailored to it.
async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Please attach a PDF file' })

  let text = ''
  try {
    // unpdf is ESM-only, so load it with a dynamic import from CommonJS. It wraps
    // an up-to-date pdf.js that reads modern PDFs (Word/Docs/Canva exports) that
    // the old pdf-parse choked on, and runs fine on serverless hosts.
    const { extractText, getDocumentProxy } = await import('unpdf')
    const pdf = await getDocumentProxy(new Uint8Array(req.file.buffer))
    const result = await extractText(pdf, { mergePages: true })
    text = String(result.text || '').trim()
  } catch {
    return res.status(400).json({ error: 'Could not read that PDF. Try another file.' })
  }
  if (!text) return res.status(400).json({ error: 'No readable text found in that PDF' })

  await User.findByIdAndUpdate(req.userId, { resumeText: text })
  res.json({ ok: true, hasResume: true })
}

module.exports = {
  startInterview,
  listInterviews,
  getInterview,
  submitInterview,
  deleteInterview,
  uploadResume,
}
