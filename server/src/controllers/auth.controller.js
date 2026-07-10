const bcrypt = require('bcryptjs')
const User = require('../models/User.model')
const { signToken } = require('../utils/token')
const { generateOtp, otpExpiry, isOtpValid } = require('../utils/otp')
const { sendOtpEmail } = require('../services/email')
const { getSetting } = require('../utils/settings')

// Cookie the JWT is stored in. `secure` + `sameSite: none` in production so the
// cookie survives a cross-site setup (frontend and API on different domains).
const isProd = () => process.env.NODE_ENV === 'production'
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: isProd() ? 'none' : 'lax',
  secure: isProd(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

// Shape of the user we send to the client (never the password hash / OTP).
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  isVerified: u.isVerified,
  hasResume: Boolean(u.resumeText),
})

// Create a fresh OTP on the user, save it, and email it. `purpose` is 'verify'
// (email confirmation) or 'reset' (password reset).
async function issueOtp(user, purpose) {
  const code = generateOtp()
  user.otpCode = code
  user.otpExpires = otpExpiry()
  user.otpPurpose = purpose
  await user.save()
  // fire-and-forget: a mail failure shouldn't break the request
  sendOtpEmail(user.email, code, purpose).catch((err) => console.error('OTP email failed:', err.message))
}

// POST /api/auth/register
// Always creates the account (unverified) and logs the user in. They can verify
// now on the next screen or skip and verify later.
async function register(req, res) {
  const { name, email, password } = req.body
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: 'That email is already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash })
  await issueOtp(user, 'verify')

  // If the admin made verification mandatory, don't hand out a session yet — the
  // user must verify first. Otherwise log them straight in (they can verify later).
  const mustVerify = (await getSetting('verificationRequired', false)) === true
  if (mustVerify) {
    return res.status(201).json({ user: publicUser(user), needsVerification: true })
  }

  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  res.status(201).json({ token, user: publicUser(user) })
}

// POST /api/auth/login
// If the admin has made verification mandatory, unverified users are blocked
// with a flag the client uses to show the "verify your email" prompt.
async function login(req, res) {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const mustVerify = (await getSetting('verificationRequired', false)) === true
  if (mustVerify && !user.isVerified) {
    return res.status(403).json({
      error: 'Please verify your email before signing in.',
      needsVerification: true,
      email: user.email,
    })
  }

  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  res.json({ token, user: publicUser(user) })
}

// POST /api/auth/verify-otp  { email, otp }
async function verifyOtp(req, res) {
  const { email, otp } = req.body
  const user = await User.findOne({ email })
  if (!user || user.otpPurpose !== 'verify' || !isOtpValid(user, otp)) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  user.isVerified = true
  user.otpCode = null
  user.otpExpires = null
  user.otpPurpose = null
  await user.save()
  res.json({ user: publicUser(user) })
}

// POST /api/auth/resend-otp  { email }  — used for verification and by the
// "resend" buttons on the verify screen.
async function resendOtp(req, res) {
  const { email } = req.body
  const user = await User.findOne({ email })
  // Don't reveal whether the email exists; always answer 200.
  if (user && !user.isVerified) await issueOtp(user, 'verify')
  res.json({ ok: true })
}

// POST /api/auth/forgot-password  { email }  — sends a reset OTP.
async function forgotPassword(req, res) {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (user) await issueOtp(user, 'reset')
  res.json({ ok: true })
}

// POST /api/auth/reset-password  { email, otp, newPassword }
async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body
  const user = await User.findOne({ email })
  if (!user || user.otpPurpose !== 'reset' || !isOtpValid(user, otp)) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  user.isVerified = true // a valid reset OTP already proves they own the mailbox
  user.tokenVersion = (user.tokenVersion || 0) + 1 // invalidate old sessions/tokens
  user.otpCode = null
  user.otpExpires = null
  user.otpPurpose = null
  await user.save()
  res.json({ ok: true })
}

// POST /api/auth/logout
function logout(_req, res) {
  // Clear with the SAME attributes used to set it, or cross-site prod browsers
  // ignore the clear and keep the cookie.
  res.clearCookie('token', { httpOnly: true, sameSite: isProd() ? 'none' : 'lax', secure: isProd(), path: '/' })
  res.json({ ok: true })
}

// GET /api/auth/me
async function me(req, res) {
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
}

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logout,
  me,
}
