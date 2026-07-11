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

const isProd = () => process.env.NODE_ENV === 'production'
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: isProd() ? 'none' : 'lax',
  secure: isProd(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

const emailVerified = (user) => user.isEmailVerified === true || user.isVerified === true

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  // Keep `isVerified` for existing client code and expose the clearer field too.
  isVerified: emailVerified(u),
  isEmailVerified: emailVerified(u),
  verifiedAt: u.verifiedAt || null,
  registrationCompleted: u.registrationCompleted !== false,
  hasResume: Boolean(u.resumeText),
})

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

async function issueOtp(user, purpose) {
  if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    throw cooldownError()
  }

  const code = generateOtp()
  // Send before saving state so a delivery failure never leaves an unusable OTP
  // in the database. The plaintext code is only held in memory for this call.
  await sendOtpEmail(user.email, code, purpose)
  user.otpCode = null
  user.otpHash = hashOtp(code)
  user.otpExpires = otpExpiry()
  user.otpPurpose = purpose
  user.otpLastSentAt = new Date()
  user.otpAttempts = 0
  await user.save()
}

async function registrationVerificationState(user) {
  const mustVerify = (await getSetting('verificationRequired', false)) === true
  try {
    await issueOtp(user, 'verify')
    return { needsVerification: mustVerify, otpSent: true }
  } catch (err) {
    // Account is intentionally retained. The verification screen can resend once
    // mail delivery is configured/recovered, without leaking an OTP in a log.
    return { needsVerification: mustVerify, otpSent: false, deliveryError: err.message }
  }
}

async function register(req, res) {
  const { name, email, password } = req.body
  if (await User.findOne({ email })) return res.status(409).json({ error: 'That email is already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash })
  const verification = await registrationVerificationState(user)

  // A user record is needed to deliver/validate an OTP, but a real session is
  // withheld until they verify or explicitly choose to skip verification.
  return res.status(201).json({
    user: publicUser(user),
    registrationToken: signRegistrationToken(user.id),
    ...verification,
  })
}

async function login(req, res) {
  const { email, password } = req.body
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
    return res.status(403).json({
      error: 'Please verify your email before logging in.',
      needsVerification: true,
      email: user.email,
    })
  }

  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  return res.json({ token, user: publicUser(user) })
}

// This is public so visitors can learn whether verification is mandatory
// before they have an authenticated session.
async function verificationSettings(_req, res) {
  const requireEmailVerification = (await getSetting('verificationRequired', false)) === true
  res.json({ requireEmailVerification })
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body
  const user = await User.findOne({ email }).select('+otpHash +otpCode')
  if (!user) return res.status(400).json({ error: 'Invalid OTP.' })
  if (emailVerified(user)) return res.json({ user: publicUser(user), alreadyVerified: true })

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
  return res.json({ token, user: publicUser(user), message: 'Email verified successfully.' })
}

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
  return res.json({ token, user: publicUser(user) })
}

async function resendOtp(req, res) {
  const { email } = req.body
  const user = await User.findOne({ email })
  // Do not disclose whether an unknown email exists.
  if (!user) return res.json({ ok: true })
  if (emailVerified(user)) return res.json({ ok: true, alreadyVerified: true })
  await issueOtp(user, 'verify')
  return res.json({ ok: true, cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS })
}

async function forgotPassword(req, res) {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (user) await issueOtp(user, 'reset')
  return res.json({ ok: true })
}

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
  return res.json({ ok: true })
}

function logout(_req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: isProd() ? 'none' : 'lax', secure: isProd(), path: '/' })
  res.json({ ok: true })
}

async function me(req, res) {
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
}

module.exports = { register, login, verificationSettings, verifyOtp, completeRegistration, resendOtp, forgotPassword, resetPassword, logout, me }
