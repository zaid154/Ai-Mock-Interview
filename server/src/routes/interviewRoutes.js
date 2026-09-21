const { Router } = require('express')
const multer = require('multer')
const { z } = require('zod')
const { validate } = require('../middleware/validateMiddleware')
const { requireAuth } = require('../middleware/authMiddleware')
const { wrap } = require('../utils/asyncHandler')
const interview = require('../controllers/interviewController')

const router = Router()

// Public route for global leaderboard
router.get('/leaderboard', wrap(interview.getLeaderboard))

router.use(requireAuth) // remaining interview routes need a signed-in user

// Resume upload: keep the PDF in memory (no disk) and cap it at 5 MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

const startSchema = z.object({
  // Form fields are only required when the user has no saved resume.
  role: z.string().trim().max(120).default(''),
  category: z.string().trim().default('General'),
  experience: z.string().min(1).default('Fresher'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  mode: z.enum(['questions', 'quiz']).default('questions'),
  timerMinutes: z.coerce.number().int().min(0).max(120).default(0),
  count: z.coerce.number().int().min(1).max(10).default(5),
  questions: z.array(z.any()).optional(),
})

const batchSchema = z.object({
  role: z.string().trim().max(120).default(''),
  category: z.string().trim().default('General'),
  experience: z.string().min(1).default('Fresher'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  mode: z.enum(['questions', 'quiz']).default('questions'),
  count: z.coerce.number().int().min(1).max(5).default(2),
  excludePrompts: z.array(z.string()).optional(),
  batchIndex: z.coerce.number().optional(),
})

// answers can be strings (questions mode) or numbers (quiz option indexes).
const submitSchema = z.object({
  answers: z.array(z.union([z.string(), z.number()])).min(1, 'Answers are required'),
})

router.post('/', validate(startSchema), wrap(interview.startInterview))
router.post('/batch', validate(batchSchema), wrap(interview.generateQuestionBatch))
router.get('/', wrap(interview.listInterviews))
router.get('/resume/active', wrap(interview.getActiveResume))
router.delete('/resume/active', wrap(interview.removeActiveResume))
router.post('/resume', upload.single('resume'), wrap(interview.uploadResume))
router.get('/:id', wrap(interview.getInterview))
router.post('/:id/submit', validate(submitSchema), wrap(interview.submitInterview))
router.patch('/:id/notes', wrap(interview.updateNotes))
router.delete('/:id', wrap(interview.deleteInterview))

module.exports = router
