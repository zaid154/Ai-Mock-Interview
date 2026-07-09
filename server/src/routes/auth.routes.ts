import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import User from '../models/User'
import { signToken } from '../utils/token'
import { validate } from '../middleware/validate'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { wrap } from '../utils/asyncHandler'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const publicUser = (u: any) => ({ id: u.id, name: u.name, email: u.email })

router.post(
  '/register',
  validate(registerSchema),
  wrap(async (req, res) => {
    const { name, email, password } = req.body

    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'That email is already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })

    const token = signToken(user.id)
    res.cookie('token', token, cookieOptions)
    res.status(201).json({ token, user: publicUser(user) })
  }),
)

router.post(
  '/login',
  validate(loginSchema),
  wrap(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user.id)
    res.cookie('token', token, cookieOptions)
    res.json({ token, user: publicUser(user) })
  }),
)

router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

router.get(
  '/me',
  requireAuth,
  wrap(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.userId).select('name email')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: publicUser(user) })
  }),
)

export default router
