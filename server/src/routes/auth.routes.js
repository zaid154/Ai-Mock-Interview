const { Router } = require('express')
const { z } = require('zod')
const { validate } = require('../middleware/validate')
const { requireAuth } = require('../middleware/auth')
const { wrap } = require('../utils/asyncHandler')
const auth = require('../controllers/auth.controller')

const router = Router()

// ── Validation schemas (also mirrored on the frontend) ──
const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const emailSchema = z.object({ email: z.string().email('Enter a valid email') })

const otpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().min(4, 'Enter the code from your email'),
})

const resetSchema = z.object({
  email: z.string().email('Enter a valid email'),
  otp: z.string().min(4, 'Enter the code from your email'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

// ── Routes ──
router.post('/register', validate(registerSchema), wrap(auth.register))
router.post('/login', validate(loginSchema), wrap(auth.login))
router.post('/verify-otp', validate(otpSchema), wrap(auth.verifyOtp))
router.post('/resend-otp', validate(emailSchema), wrap(auth.resendOtp))
router.post('/forgot-password', validate(emailSchema), wrap(auth.forgotPassword))
router.post('/reset-password', validate(resetSchema), wrap(auth.resetPassword))
router.post('/logout', auth.logout)
router.get('/me', requireAuth, wrap(auth.me))

module.exports = router
