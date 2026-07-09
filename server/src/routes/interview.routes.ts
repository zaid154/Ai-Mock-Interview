import { Router } from 'express'
import { z } from 'zod'
import Interview from '../models/Interview'
import { generateQuestions, evaluateInterview } from '../services/gemini'
import { validate } from '../middleware/validate'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { wrap } from '../utils/asyncHandler'

const router = Router()
router.use(requireAuth)

const startSchema = z.object({
  role: z.string().min(2, 'Tell us the role you want to practise for'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.coerce.number().int().min(3).max(10).default(5),
})

const submitSchema = z.object({
  answers: z.array(z.string()).min(1, 'Answers are required'),
})

// Start a session: generate the questions up front, answers come later.
router.post(
  '/',
  validate(startSchema),
  wrap(async (req: AuthedRequest, res) => {
    const { role, difficulty, count } = req.body
    const prompts = await generateQuestions(role, difficulty, count)

    const interview = await Interview.create({
      user: req.userId,
      role,
      difficulty,
      status: 'in_progress',
      questions: prompts.map((prompt) => ({ prompt })),
    })

    res.status(201).json({ interview })
  }),
)

router.get(
  '/',
  wrap(async (req: AuthedRequest, res) => {
    const interviews = await Interview.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select('role difficulty status overallScore createdAt')
    res.json({ interviews })
  }),
)

router.get(
  '/:id',
  wrap(async (req: AuthedRequest, res) => {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
    if (!interview) return res.status(404).json({ error: 'Interview not found' })
    res.json({ interview })
  }),
)

router.post(
  '/:id/submit',
  validate(submitSchema),
  wrap(async (req: AuthedRequest, res) => {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId })
    if (!interview) return res.status(404).json({ error: 'Interview not found' })
    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'This interview has already been submitted' })
    }

    const { answers } = req.body as { answers: string[] }
    interview.questions.forEach((q, i) => {
      q.answer = (answers[i] ?? '').trim()
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
    interview.status = 'completed'
    await interview.save()

    res.json({ interview })
  }),
)

export default router
