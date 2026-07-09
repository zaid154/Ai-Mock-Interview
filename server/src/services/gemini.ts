import { GoogleGenerativeAI } from '@google/generative-ai'
import Question from '../models/Question'

type Difficulty = 'easy' | 'medium' | 'hard'

interface AnswerItem {
  prompt: string
  answer: string
}

interface Grade {
  score: number
  feedback: string
}

export interface Evaluation {
  perQuestion: Grade[]
  overallScore: number
  summary: string
}

function getModel() {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  // Override with GEMINI_MODEL in .env if this alias is ever retired.
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  return new GoogleGenerativeAI(key).getGenerativeModel({ model })
}

export async function generateQuestions(
  role: string,
  difficulty: Difficulty,
  count: number,
): Promise<string[]> {
  const model = getModel()
  if (!model) return fallbackQuestions(role, difficulty, count)

  const prompt = [
    `You are a senior interviewer. Write ${count} interview questions for a "${role}" candidate`,
    `at ${difficulty} difficulty. Keep each question to one or two sentences and mix conceptual`,
    `and practical/scenario questions. Do not number them.`,
    `Respond as JSON: { "questions": string[] }.`,
  ].join(' ')

  try {
    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    })
    const data = JSON.parse(res.response.text())
    const list: string[] = Array.isArray(data?.questions) ? data.questions : []
    const cleaned = list.map((q) => String(q).trim()).filter(Boolean).slice(0, count)
    return cleaned.length ? cleaned : fallbackQuestions(role, difficulty, count)
  } catch (err) {
    console.warn('Gemini question generation failed, using question bank:', (err as Error).message)
    return fallbackQuestions(role, difficulty, count)
  }
}

export async function evaluateInterview(role: string, items: AnswerItem[]): Promise<Evaluation> {
  const model = getModel()
  if (!model) return fallbackEvaluation(items)

  const transcript = items
    .map((it, i) => `Q${i + 1}: ${it.prompt}\nA${i + 1}: ${it.answer || '(no answer given)'}`)
    .join('\n\n')

  const prompt = [
    `You are grading a mock interview for a "${role}" role.`,
    `For every question give a score from 0 to 10 and one or two sentences of specific,`,
    `constructive feedback. Then give an overall score from 0 to 100 and a two-sentence summary`,
    `of strengths and what to improve.`,
    `Transcript:\n${transcript}\n`,
    `Respond as JSON: { "perQuestion": [{ "score": number, "feedback": string }],`,
    `"overallScore": number, "summary": string }.`,
  ].join(' ')

  try {
    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    })
    const data = JSON.parse(res.response.text())
    const perQuestion: Grade[] = items.map((_, i) => ({
      score: clamp(Number(data?.perQuestion?.[i]?.score) || 0, 0, 10),
      feedback: String(data?.perQuestion?.[i]?.feedback || '').trim() || 'No feedback returned.',
    }))
    return {
      perQuestion,
      overallScore: clamp(Math.round(Number(data?.overallScore) || 0), 0, 100),
      summary: String(data?.summary || '').trim() || 'Interview graded.',
    }
  } catch (err) {
    console.warn('Gemini grading failed, using offline scoring:', (err as Error).message)
    return fallbackEvaluation(items)
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

// ---- Offline fallbacks (no API key) ----

async function fallbackQuestions(role: string, difficulty: Difficulty, count: number) {
  const byRole = await Question.find({ role, difficulty }).lean()
  const byDifficulty = byRole.length < count ? await Question.find({ difficulty }).lean() : []
  const any = byRole.length + byDifficulty.length < count ? await Question.find().lean() : []

  const prompts = [...byRole, ...byDifficulty, ...any].map((q: any) => q.prompt as string)
  const unique = [...new Set(prompts)].slice(0, count)

  while (unique.length < count) {
    unique.push(`Walk me through a challenging problem you solved as a ${role}.`)
  }
  return unique
}

function fallbackEvaluation(items: AnswerItem[]): Evaluation {
  const perQuestion = items.map(({ answer }) => {
    const words = answer.trim().split(/\s+/).filter(Boolean).length
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
      'Offline evaluation — set GEMINI_API_KEY for AI-graded feedback. Aim for structured, ' +
      'example-driven answers and address the question directly.',
  }
}
