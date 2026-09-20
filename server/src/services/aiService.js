const { GoogleGenerativeAI } = require('@google/generative-ai')
const Question = require('../models/questionModel')
const Setting = require('../models/settingModel')

// Multi-key rotation with cooldown guard (60s) to handle quota/rate limits gracefully
const COOLDOWN_MS = 60 * 1000
const lastFailedAt = new Map()
let currentKeyIndex = 0

// Fetches and deduplicates Gemini API keys from admin DB settings and environment variables
async function getKeys() {
  const keys = []
  try {
    const doc = await Setting.findOne({ key: 'gemini_api_keys' }).lean()
    if (doc && Array.isArray(doc.value)) keys.push(...doc.value)
  } catch (_) {}
  if (process.env.GEMINI_API_KEYS) keys.push(...process.env.GEMINI_API_KEYS.split(','))
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY)
  return [
    ...new Set(
      keys
        .map((k) => (typeof k === 'object' && k !== null && k.key ? k.key : String(k || '')).trim())
        .filter(Boolean)
    ),
  ]
}

const modelName = () => process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

// Cleans JSON string escape artifacts from AI responses
const cleanText = (val) => String(val || '').replaceAll('\\r\\n', '\n').replaceAll('\\n', '\n').replaceAll('\\t', '\t').trim()

// Executes Gemini API call with automatic key rotation and cooldown tracking
async function generateJson(prompt) {
  const keys = await getKeys()
  if (!keys.length) throw new Error('no-keys')

  const now = Date.now()
  const fresh = keys.filter((k) => !lastFailedAt.has(k) || now - lastFailedAt.get(k) > COOLDOWN_MS)
  const cooling = keys.filter((k) => !fresh.includes(k))

  // True round-robin load balancing across healthy keys
  const startIdx = fresh.length > 0 ? (currentKeyIndex++ % fresh.length) : 0
  const prioritized = fresh.length > 0
    ? [...fresh.slice(startIdx), ...fresh.slice(0, startIdx), ...cooling]
    : cooling
  let lastErr

  for (const key of prioritized) {
    try {
      const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: modelName() })
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      })
      lastFailedAt.delete(key)
      return JSON.parse(res.response.text())
    } catch (err) {
      lastFailedAt.set(key, Date.now())
      lastErr = err
      console.warn(`Gemini key ...${key.slice(-4)} failed, rotating:`, err.message)
    }
  }
  throw lastErr || new Error('all-keys-failed')
}

function promptContext(role, difficulty, experience, resumeText, category) {
  const cat = category && category !== 'General' ? ` focus specifically on the "${category}" domain.` : ''
  if (resumeText) {
    const trimmed = resumeText.replace(/\s+/g, ' ').trim().slice(0, 1500)
    return {
      profile: 'the candidate described exclusively in the uploaded resume at an inferred challenge level',
      rules: ` Use the resume as sole source of truth. Ask about concrete technologies, projects, and achievements in it.\n"""${trimmed}"""${cat}`,
    }
  }
  return {
    profile: `a "${role}" candidate with experience level "${experience || 'Fresher'}" at ${difficulty} difficulty`,
    rules: cat,
  }
}

// Generates open-ended interview questions tailored to role or parsed resume
async function generateQuestions(role, difficulty, count, experience, resumeText, category) {
  const ctx = promptContext(role, difficulty, experience, resumeText, category)
  const prompt = `You are a senior technical interviewer. Write ${count} interview questions for ${ctx.profile}.${ctx.rules} Match depth to experience level (freshers get fundamentals, seniors get scenario/system design). Keep questions to 1-2 sentences. Mix conceptual and practical questions. Do not number them. Respond as JSON: { "questions": string[] }.`

  try {
    const data = await generateJson(prompt)
    const list = Array.isArray(data?.questions) ? data.questions : []
    const cleaned = list.map((q) => String(q).trim()).filter(Boolean).slice(0, count)
    if (cleaned.length) return cleaned
  } catch (err) {
    if (resumeText) throw err
    console.warn('Gemini question generation fallback:', err.message)
  }
  if (resumeText) throw new Error('empty-resume-questions')
  return fallbackQuestions(role, difficulty, count)
}

// Generates 4-option multiple choice questions with single correct answer index
async function generateQuiz(role, difficulty, count, experience, resumeText, category) {
  const ctx = promptContext(role, difficulty, experience, resumeText, category)
  const prompt = `You are creating a multiple-choice quiz for ${ctx.profile}.${ctx.rules} Write ${count} questions. Include problem-solving questions with code snippets where relevant. Each question must have exactly 4 options and exactly one correct answer. Respond as JSON: { "questions": [{ "prompt": string, "options": string[4], "correctIndex": number }] }.`

  const data = await generateJson(prompt)
  const list = Array.isArray(data?.questions) ? data.questions : []
  const cleaned = list
    .map((q) => {
      const options = Array.isArray(q?.options) ? q.options.map(cleanText).slice(0, 4) : []
      return { prompt: cleanText(q?.prompt), options, correctIndex: clamp(Number(q?.correctIndex) || 0, 0, options.length - 1) }
    })
    .filter((q) => q.prompt && q.options.length === 4)
    .slice(0, count)

  if (!cleaned.length) throw new Error('empty-quiz')
  return cleaned
}

// Evaluates candidate open-ended responses with 0-10 per-question score and constructive feedback
async function evaluateInterview(role, items) {
  const transcript = items.map((it, i) => `Q${i + 1}: ${it.prompt}\nA${i + 1}: ${it.answer || '(no answer given)'}`).join('\n\n')
  const prompt = `You are grading a mock interview for a "${role}" role. For every question give a score from 0 to 10 and constructive feedback. Then give overall score 0-100 and a 2-sentence summary of strengths and areas to improve.\n\nTranscript:\n${transcript}\n\nRespond as JSON: { "perQuestion": [{ "score": number, "feedback": string }], "overallScore": number, "summary": string }.`

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
    console.warn('Gemini grading fallback:', err.message)
    return fallbackEvaluation(items)
  }
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

// Offline question bank fallback when Gemini API keys are unavailable or rate-limited
async function fallbackQuestions(role, difficulty, count) {
  const [byRole, byDiff, any] = await Promise.all([
    Question.find({ role, difficulty }).lean(),
    Question.find({ difficulty }).lean(),
    Question.find().lean(),
  ])
  const pool = [...shuffle(byRole), ...shuffle(byDiff), ...shuffle(any)].map((q) => q.prompt)
  const selection = shuffle([...new Set(pool)]).slice(0, count)

  const DEFAULTS = [
    `Walk me through a challenging architecture problem you solved as a ${role}.`,
    `How do you handle production outages and perform root cause analysis as a ${role}?`,
    `Explain your step-by-step approach to code reviews and maintaining quality standards.`,
    `How do you evaluate performance bottlenecks and memory leaks in your applications?`,
    `Describe how you design secure, scalable REST/GraphQL APIs for high concurrency.`,
  ]
  let idx = 0
  while (selection.length < count) {
    selection.push(DEFAULTS[idx % DEFAULTS.length])
    idx++
  }
  return selection
}

// Heuristic offline scoring fallback based on candidate answer depth and structure
function fallbackEvaluation(items) {
  const perQuestion = items.map(({ answer }) => {
    const words = (answer || '').trim().split(/\s+/).filter(Boolean).length
    if (!words) return { score: 0, feedback: 'No answer was given for this question.' }
    const score = clamp(Math.round(words / 12) + 3, 2, 9)
    const feedback = words < 20
      ? 'A reasonable start — back it up with a concrete example and go one level deeper.'
      : 'Good detail. Lead with your main point and keep the structure tight.'
    return { score, feedback }
  })

  const avg = perQuestion.reduce((s, q) => s + q.score, 0) / (perQuestion.length || 1)
  return {
    perQuestion,
    overallScore: Math.round(avg * 10),
    summary: 'Offline evaluation — add a working GEMINI_API_KEY for AI-graded feedback. Aim for structured, example-driven answers.',
  }
}

module.exports = { generateQuestions, generateQuiz, evaluateInterview }
