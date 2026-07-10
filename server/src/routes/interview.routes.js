const { Router } = require('express')
const multer = require('multer')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { requireAuth } = require('../middleware/auth')
const { wrap } = require('../utils/asyncHandler')
const interview = require('../controllers/interview.controller')

const router = Router()
router.use(requireAuth) // all interview routes need a signed-in user

// Resume upload: keep the PDF in memory (no disk) and cap it at 5 MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

const startSchema = z.object({
  role: z.string().min(2, 'Tell us the role you want to practise for'),
  experience: z.string().min(1).default('Fresher'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  mode: z.enum(['questions', 'quiz']).default('questions'),
  count: z.coerce.number().int().min(3).max(10).default(5),
  useResume: z.coerce.boolean().default(false),
})

// answers can be strings (questions mode) or numbers (quiz option indexes).
const submitSchema = z.object({
  answers: z.array(z.union([z.string(), z.number()])).min(1, 'Answers are required'),
})

router.post('/', validate(startSchema), wrap(interview.startInterview))
router.get('/', wrap(interview.listInterviews))
router.post('/resume', upload.single('resume'), wrap(interview.uploadResume))
router.get('/:id', wrap(interview.getInterview))
router.post('/:id/submit', validate(submitSchema), wrap(interview.submitInterview))
router.delete('/:id', wrap(interview.deleteInterview))

module.exports = router
