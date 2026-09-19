const bcrypt = require('bcryptjs')
const User = require('../models/User.model')
const { signToken, signRegistrationToken, verifyRegistrationToken } = require('../utils/token')
const {
  generateOtp,
  hashOtp,
  otpExpiry,
  isOtpValid,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_MAX_ATTEMPTS,
} = require('../utils/otp')
const { sendOtpEmail } = require('../services/email')
const { getSetting } = require('../utils/settings')

// Environment helper for secure cookies
const isProd = () =>
  process.env.NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_SERVICE_ID)

/**
 * Cookie security options:
 * - httpOnly: true -> Inaccessible to client JavaScript (prevents XSS token theft)
 * - sameSite: 'none' (production) / 'lax' (dev) -> Allows cross-origin requests from Vercel to Render
 * - secure: true in production -> Requires HTTPS
 * - maxAge: 7 days
 */
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: isProd() ? 'none' : 'lax',
  secure: isProd(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

const emailVerified = (user) => user.isEmailVerified === true || user.isVerified === true

/**
 * Sanitizes User document to prevent exposing sensitive internal fields like passwordHash or otpHash.
 */
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  bio: u.bio || '',
  avatar: u.avatar || '',
  theme: u.theme || 'dark',
  isVerified: emailVerified(u),
  isEmailVerified: emailVerified(u),
  verifiedAt: u.verifiedAt || null,
  registrationCompleted: u.registrationCompleted !== false,
  hasResume: Boolean(u.resumeText),
})

/**
 * Clears OTP fields after successful verification or expiration.
 */
function clearOtp(user) {
  user.otpCode = null
  user.otpHash = null
  user.otpExpires = null
  user.otpPurpose = null
  user.otpAttempts = 0
}

function cooldownError() {
  const err = new Error(`Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP.`)
  err.status = 429
  return err
}

/**
 * Issues a crypto-secure 6-digit OTP:
 * 1. Checks 60-second resend cooldown.
 * 2. Generates random 6-digit code.
 * 3. Hashes with SHA-256 before saving to MongoDB (never plain text in DB).
 * 4. Sets 10-minute expiry and delivers email via Brevo or SMTP.
 */
async function issueOtp(user, purpose) {
  if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    throw cooldownError()
  }

  const code = generateOtp()
  user.otpCode = null
  user.otpHash = hashOtp(code)
  user.otpExpires = otpExpiry()
  user.otpPurpose = purpose
  user.otpLastSentAt = new Date()
  user.otpAttempts = 0
  await user.save()

  // Deliver code to candidate's email address
  await sendOtpEmail(user.email, code, purpose)
}

async function registrationVerificationState(user) {
  const mustVerify = (await getSetting('verificationRequired', false)) === true
  try {
    await issueOtp(user, 'verify')
    return { needsVerification: mustVerify, otpSent: true }
  } catch (err) {
    return { needsVerification: mustVerify, otpSent: false, deliveryError: err.message }
  }
}

/**
 * POST /api/auth/register
 * Creates a new user account with hashed password (bcrypt 10 salt rounds)
 * and dispatches initial email verification OTP.
 */
async function register(req, res) {
  const { name, email, password } = req.body
  if (await User.findOne({ email })) return res.status(409).json({ error: 'That email is already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash })
  const verification = await registrationVerificationState(user)

  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())

  return res.status(201).json({
    user: publicUser(user),
    token,
    registrationToken: signRegistrationToken(user.id),
    ...verification,
  })
}

/**
 * POST /api/auth/login
 * Validates candidate credentials:
 * 1. Compares submitted password with stored bcrypt hash.
 * 2. Checks email verification status if enabled by platform admin.
 * 3. Issues 7-day httpOnly JWT cookie with tokenVersion claim.
 */
async function login(req, res) {
  const email = (req.body.email || '').toLowerCase().trim()
  const password = req.body.password || ''
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const mustVerify = (await getSetting('verificationRequired', false)) === true
  if (user.registrationCompleted === false) {
    return res.status(403).json({
      error: 'Please finish creating your account.',
      needsRegistrationCompletion: true,
      email: user.email,
      registrationToken: signRegistrationToken(user.id),
    })
  }
  if (mustVerify && !emailVerified(user)) {
    let otpSent = false
    try {
      await issueOtp(user, 'verify')
      otpSent = true
    } catch (err) {
      console.warn('Login auto-OTP issuance note:', err.message)
    }
    return res.status(403).json({
      error: 'Please verify your email before logging in. A new verification code has been sent.',
      needsVerification: true,
      email: user.email,
      otpSent,
    })
  }

  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  return res.json({ user: publicUser(user), token })
}

/**
 * GET /api/auth/verification-settings
 * Public endpoint exposing verification & certificate signatory configurations.
 */
async function verificationSettings(_req, res) {
  const v = await getSetting('verificationRequired', false)
  const h = await getSetting('hide_theme_toggle', false)
  const certSignatoryName = await getSetting('cert_signatory_name', 'Mohd Zaid')
  const certSignatoryTitle = await getSetting('cert_signatory_title', 'Global Director of Candidate Assessments, MockMate AI')
  const certSignatureImage = await getSetting('cert_signature_image', '')

  const requireEmailVerification = v === true || v === 'true'
  const hideThemeToggle = h === true || h === 'true'

  res.json({ requireEmailVerification, hideThemeToggle, certSignatoryName, certSignatoryTitle, certSignatureImage })
}

/**
 * POST /api/auth/verify-otp
 * Verifies submitted 6-digit code against the SHA-256 hash in MongoDB.
 * Enforces 10-minute expiry and max 5 attempts.
 */
async function verifyOtp(req, res) {
  const { email, otp } = req.body
  const user = await User.findOne({ email }).select('+otpHash +otpCode')
  if (!user) return res.status(400).json({ error: 'Invalid OTP.' })
  if (emailVerified(user)) {
    const token = signToken(user.id, user.tokenVersion)
    res.cookie('token', token, cookieOptions())
    return res.json({ user: publicUser(user), token, alreadyVerified: true })
  }

  if (user.otpPurpose !== 'verify' || !user.otpExpires || user.otpExpires.getTime() <= Date.now()) {
    clearOtp(user)
    await user.save()
    return res.status(400).json({ error: 'OTP has expired.' })
  }
  if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
    clearOtp(user)
    await user.save()
    return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' })
  }
  if (!isOtpValid(user, otp)) {
    user.otpAttempts = (user.otpAttempts || 0) + 1
    const locked = user.otpAttempts >= OTP_MAX_ATTEMPTS
    if (locked) clearOtp(user)
    await user.save()
    return res.status(locked ? 429 : 400).json({
      error: locked ? 'Too many attempts. Please request a new OTP.' : 'Invalid OTP.',
    })
  }

  user.isVerified = true
  user.isEmailVerified = true
  user.verifiedAt = new Date()
  user.registrationCompleted = true
  clearOtp(user)
  await user.save()
  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  return res.json({ user: publicUser(user), token, message: 'Email verified successfully.' })
}

/**
 * POST /api/auth/complete-registration
 */
async function completeRegistration(req, res) {
  let payload
  try {
    payload = verifyRegistrationToken(req.body.registrationToken)
  } catch {
    return res.status(401).json({ error: 'Your registration session has expired. Please sign in.' })
  }

  const user = await User.findById(payload.sub)
  if (!user) return res.status(404).json({ error: 'Account not found' })

  const mustVerify = (await getSetting('verificationRequired', false)) === true
  if (mustVerify && !emailVerified(user)) {
    return res.status(403).json({ error: 'Please verify your email before continuing.', needsVerification: true, email: user.email })
  }

  user.registrationCompleted = true
  await user.save()
  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  return res.json({ user: publicUser(user), token })
}

/**
 * POST /api/auth/resend-otp
 * Resends a fresh 6-digit OTP code subject to the 60s cooldown limit.
 */
async function resendOtp(req, res) {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.json({ ok: true })
  if (emailVerified(user)) return res.json({ ok: true, alreadyVerified: true })
  await issueOtp(user, 'verify')
  return res.json({ ok: true, cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS })
}

/**
 * POST /api/auth/forgot-password
 * Initiates password reset by issuing an OTP with purpose 'reset'.
 */
async function forgotPassword(req, res) {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (user) await issueOtp(user, 'reset')
  return res.json({ ok: true })
}

/**
 * POST /api/auth/reset-password
 * Verifies reset OTP, sets new bcrypt password hash, and increments `tokenVersion`
 * to immediately invalidate any existing JWT sessions across devices.
 */
async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body
  const user = await User.findOne({ email }).select('+otpHash +otpCode')
  if (!user || user.otpPurpose !== 'reset' || !isOtpValid(user, otp)) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  user.isVerified = true
  user.isEmailVerified = true
  user.verifiedAt = user.verifiedAt || new Date()
  user.registrationCompleted = true
  user.tokenVersion = (user.tokenVersion || 0) + 1
  clearOtp(user)
  await user.save()

  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  return res.json({ ok: true, user: publicUser(user), token })
}

/**
 * PATCH /api/auth/profile
 * Updates candidate profile details (name, bio, avatar, theme).
 */
async function updateProfile(req, res) {
  const { name, bio, avatar, theme } = req.body
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (typeof name === 'string' && name.trim()) user.name = name.trim()
  if (typeof bio === 'string') user.bio = bio.trim()
  if (typeof avatar === 'string') user.avatar = avatar.trim()
  if (typeof theme === 'string' && ['dark', 'light'].includes(theme)) user.theme = theme

  await user.save()
  return res.json({ user: publicUser(user) })
}

/**
 * POST /api/auth/change-password
 * Changes password for logged-in user and increments `tokenVersion` for security.
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' })
  }

  const user = await User.findById(req.userId)
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(400).json({ error: 'Current password is incorrect.' })
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10)
  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save()

  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  return res.json({ user: publicUser(user), message: 'Password updated successfully.' })
}

/**
 * POST /api/auth/logout
 * Clears the httpOnly token cookie.
 */
function logout(_req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: isProd() ? 'none' : 'lax', secure: isProd(), path: '/' })
  res.json({ ok: true })
}

/**
 * GET /api/auth/me
 * Returns sanitized profile of currently authenticated user.
 */
async function me(req, res) {
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
}

module.exports = {
  register,
  login,
  verificationSettings,
  verifyOtp,
  completeRegistration,
  resendOtp,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  logout,
  me,
}
