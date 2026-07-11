const { GoogleGenerativeAI } = require('@google/generative-ai')
const Question = require('../models/Question.model')
const Setting = require('../models/Setting.model')

// ── AI layer ────────────────────────────────────────────────────────────────
// Everything that talks to Gemini lives here. Three public functions:
//   generateQuestions() → open-ended interview questions (strings)
//   generateQuiz()      → multiple-choice questions (with options + answer)
//   evaluateInterview() → grades the open-ended answers
// Each one falls back gracefully (seed bank / heuristic) if Gemini is unavailable
// so the app never hard-fails.

// Multiple API keys with auto-fallback. When a key hits a rate/quota error we
// remember the time in this in-memory map and skip it for COOLDOWN_MS, then let
// it back into rotation. Simple timestamp check — no queue or worker.
const COOLDOWN_MS = 60 * 1000
const lastFailedAt = new Map() // apiKey -> timestamp(ms)

// Collect keys from the admin settings (gemini_api_keys array) plus env
// (comma-separated GEMINI_API_KEYS, or a single GEMINI_API_KEY). De-duplicated.
async function getKeys() {
  const keys = []

  try {
    const doc = await Setting.findOne({ key: 'gemini_api_keys' }).lean()
    if (doc && Array.isArray(doc.value)) keys.push(...doc.value)
  } catch {
    // settings unreadable (e.g. no DB yet) — just use env keys
  }

  if (process.env.GEMINI_API_KEYS) keys.push(...process.env.GEMINI_API_KEYS.split(','))
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY)

  return [...new Set(keys.map((k) => String(k).trim()).filter(Boolean))]
}

function modelName() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash'
}

// Ask Gemini for JSON, trying each key in order. Keys in cooldown are skipped
// first; if every fresh key fails we retry the cooling-down ones as a last shot.
// Throws when there are no keys or all of them failed — callers then use the
// offline fallback.
async function generateJson(prompt) {
  const keys = await getKeys()
  if (!keys.length) throw new Error('no-keys')

  const now = Date.now()
  const fresh = keys.filter((k) => !lastFailedAt.has(k) || now - lastFailedAt.get(k) > COOLDOWN_MS)
  const cooling = keys.filter((k) => !fresh.includes(k))
  const order = [...fresh, ...cooling]

  let lastErr
  for (const key of order) {
    try {
      const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: modelName() })
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      })
      lastFailedAt.delete(key) // worked — clear any cooldown
      return JSON.parse(res.response.text())
    } catch (err) {
      lastFailedAt.set(key, Date.now()) // rate limit / quota / bad key — cool it down
      lastErr = err
      console.warn(`Gemini key ...${key.slice(-4)} failed, trying next:`, err.message)
    }
  }
  throw lastErr || new Error('all-keys-failed')
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

// Gemini occasionally returns double-escaped line breaks ("\\n") inside a
// parsed JSON string. Store real line breaks so every client renders them well.
function normalizeGeneratedText(value) {
  return String(value || '')
    .replaceAll('\\r\\n', '\n')
    .replaceAll('\\n', '\n')
    .replaceAll('\\t', '\t')
    .trim()
}

// A short line describing the candidate, reused across prompts.
function candidateLine(role, experience) {
  return `a "${role}" candidate with experience level "${experience || 'Fresher'}"`
}

// Only include a trimmed slice of the resume so the prompt stays small.
function resumeLine(resumeText) {
  if (!resumeText) return ''
  const trimmed = resumeText.replace(/\s+/g, ' ').trim().slice(0, 1500)
  return ` Tailor the questions to this candidate's resume where relevant:\n"""${trimmed}"""`
}

// ── Open-ended questions ─────────────────────────────────────────────────────
async function generateQuestions(role, difficulty, count, experience, resumeText) {
  const profile = resumeText
    ? 'the candidate described exclusively in the uploaded resume'
    : candidateLine(role, experience)
  const level = resumeText
    ? 'at a challenge level inferred from that resume'
    : `at ${difficulty} difficulty`
  const resumeRules = resumeText
    ? ' Use the resume as the only candidate-profile source of truth. Do not use or mention role, experience, or difficulty values from a form. Ask about concrete technologies, projects, achievements, and responsibilities in it.'
    : ''
  const prompt = [
    `You are a senior interviewer. Write ${count} interview questions for ${profile} ${level}.`,
    `Match the depth to the experience level (freshers get fundamentals,`,
    `senior candidates get scenario/design questions). Keep each question to one or two sentences and`,
    `mix conceptual and practical questions. Do not number them.${resumeRules}${resumeLine(resumeText)}`,
    `Respond as JSON: { "questions": string[] }.`,
  ].join(' ')

  try {
    const data = await generateJson(prompt)
    const list = Array.isArray(data?.questions) ? data.questions : []
    const cleaned = list.map((q) => String(q).trim()).filter(Boolean).slice(0, count)
    if (cleaned.length) return cleaned
  } catch (err) {
    if (resumeText) throw err
    console.warn('Gemini question generation failed, using question bank:', err.message)
  }
  if (resumeText) throw new Error('empty-resume-questions')
  return fallbackQuestions(role, difficulty, count)
}

// ── Multiple-choice quiz ─────────────────────────────────────────────────────
// Returns [{ prompt, options: string[4], correctIndex: 0..3 }]. Includes
// "what is the output of this code" style problem-solving questions.
async function generateQuiz(role, difficulty, count, experience, resumeText) {
  const profile = resumeText
    ? 'the candidate described exclusively in the uploaded resume'
    : candidateLine(role, experience)
  const level = resumeText
    ? 'at a challenge level inferred from that resume'
    : `at ${difficulty} difficulty`
  const resumeRules = resumeText
    ? ' Use the resume as the only candidate-profile source of truth. Do not use or mention role, experience, or difficulty values from a form. Focus on concrete technologies, projects, achievements, and responsibilities in it.'
    : ''
  const prompt = [
    `You are creating a multiple-choice quiz for ${profile} ${level}.`,
    `Write ${count} questions. Match difficulty to the experience level. Include a few problem-solving`,
    `"what is the output of this code?" questions with a short code snippet in the question text. Use real`,
    `line breaks in code; never write the literal characters \\n in a question or option. Each question must have exactly 4 options and exactly one correct answer.${resumeRules}${resumeLine(resumeText)}`,
    `Respond as JSON: { "questions": [{ "prompt": string, "options": string[4], "correctIndex": number }] }.`,
  ].join(' ')

  const data = await generateJson(prompt) // quiz has no offline fallback — let caller handle the error
  const list = Array.isArray(data?.questions) ? data.questions : []
  const cleaned = list
    .map((q) => {
      const options = Array.isArray(q?.options) ? q.options.map(normalizeGeneratedText).slice(0, 4) : []
      const correctIndex = clamp(Number(q?.correctIndex) || 0, 0, options.length - 1)
      return { prompt: normalizeGeneratedText(q?.prompt), options, correctIndex }
    })
    .filter((q) => q.prompt && q.options.length === 4)
    .slice(0, count)

  if (!cleaned.length) throw new Error('empty-quiz')
  return cleaned
}

// ── Grading (open-ended mode only) ───────────────────────────────────────────
async function evaluateInterview(role, items) {
  const transcript = items
    .map((it, i) => `Q${i + 1}: ${it.prompt}\nA${i + 1}: ${it.answer || '(no answer given)'}`)
    .join('\n\n')

  const prompt = [
    `You are grading a mock interview for a "${role}" role.`,
    `For every question give a score from 0 to 10 and one or two sentences of specific, constructive`,
    `feedback. Then give an overall score from 0 to 100 and a two-sentence summary of strengths and`,
    `what to improve. Transcript:\n${transcript}\n`,
    `Respond as JSON: { "perQuestion": [{ "score": number, "feedback": string }], "overallScore": number, "summary": string }.`,
  ].join(' ')

  try {
    const data = await generateJson(prompt)
    const perQuestion = items.map((_, i) => ({
      score: clamp(Number(data?.perQuestion?.[i]?.score) || 0, 0, 10),
      feedback: String(data?.perQuestion?.[i]?.feedback || '').trim() || 'No feedback returned.',
    }))
    return {
      perQuestion,
      overallScore: clamp(Math.round(Number(data?.overallScore) || 0), 0, 100),
      summary: String(data?.summary || '').trim() || 'Interview graded.',
    }
  } catch (err) {
    console.warn('Gemini grading failed, using offline scoring:', err.message)
    return fallbackEvaluation(items)
  }
}

// ── Offline fallbacks (no working key) ───────────────────────────────────────
async function fallbackQuestions(role, difficulty, count) {
  const byRole = await Question.find({ role, difficulty }).lean()
  const byDifficulty = byRole.length < count ? await Question.find({ difficulty }).lean() : []
  const any = byRole.length + byDifficulty.length < count ? await Question.find().lean() : []

  const prompts = [...byRole, ...byDifficulty, ...any].map((q) => q.prompt)
  const unique = [...new Set(prompts)].slice(0, count)
  while (unique.length < count) {
    unique.push(`Walk me through a challenging problem you solved as a ${role}.`)
  }
  return unique
}

function fallbackEvaluation(items) {
  const perQuestion = items.map(({ answer }) => {
    const words = (answer || '').trim().split(/\s+/).filter(Boolean).length
    if (!words) return { score: 0, feedback: 'No answer was given for this question.' }
    const score = clamp(Math.round(words / 12) + 3, 2, 9)
    const feedback =
      words < 20
        ? 'A reasonable start — back it up with a concrete example and go one level deeper.'
        : 'Good detail. Lead with your main point and keep the structure tight.'
    return { score, feedback }
  })

  const avg = perQuestion.reduce((s, q) => s + q.score, 0) / (perQuestion.length || 1)
  return {
    perQuestion,
    overallScore: Math.round(avg * 10),
    summary:
      'Offline evaluation — add a working GEMINI_API_KEY for AI-graded feedback. Aim for structured, ' +
      'example-driven answers that address the question directly.',
  }
}

module.exports = { generateQuestions, generateQuiz, evaluateInterview }
