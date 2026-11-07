const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const { signToken, signRegistrationToken, verifyRegistrationToken } = require('../utils/tokenUtils')
const { isOtpValid, OTP_RESEND_COOLDOWN_SECONDS, OTP_MAX_ATTEMPTS } = require('../utils/otpUtils')
const { getSetting } = require('../utils/settingsUtils')
const { isProd, cookieOptions, emailVerified, publicUser, clearOtp, issueOtp } = require('../utils/authHelpers')

function sendAuthResponse(res, user, extra = {}, status = 200) {
  const token = signToken(user.id, user.tokenVersion)
  res.cookie('token', token, cookieOptions())
  return res.status(status).json({ user: publicUser(user), token, ...extra })
}

async function register(req, res) {
  const { name, email, password } = req.body
  if (await User.findOne({ email })) return res.status(409).json({ error: 'That email is already registered' })

  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) })
  const mustVerify = (await getSetting('verificationRequired', false)) === true
  let otpSent = false, deliveryError
  try {
    await issueOtp(user, 'verify')
    otpSent = true
  } catch (err) {
    deliveryError = err.message
  }

  return sendAuthResponse(res, user, {
    registrationToken: signRegistrationToken(user.id),
    needsVerification: mustVerify,
    otpSent,
    deliveryError,
  }, 201)
}

async function login(req, res) {
  const email = (req.body.email || '').toLowerCase().trim()
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  if (user.registrationCompleted === false) {
    return res.status(403).json({
      error: 'Please finish creating your account.',
      needsRegistrationCompletion: true,
      email: user.email,
      registrationToken: signRegistrationToken(user.id),
    })
  }

  const mustVerify = (await getSetting('verificationRequired', false)) === true
  if (mustVerify && !emailVerified(user)) {
    let otpSent = false
    try { await issueOtp(user, 'verify'); otpSent = true } catch (_) {}
    return res.status(403).json({
      error: 'Please verify your email before logging in. A new verification code has been sent.',
      needsVerification: true,
      email: user.email,
      otpSent,
    })
  }

  return sendAuthResponse(res, user)
}

async function verificationSettings(_req, res) {
  const [v, h, certSignatoryName, certSignatoryTitle, certSignatureImage] = await Promise.all([
    getSetting('verificationRequired', false),
    getSetting('hide_theme_toggle', false),
    getSetting('cert_signatory_name', 'Mohd Zaid'),
    getSetting('cert_signatory_title', 'Global Director of Candidate Assessments, MockMate AI'),
    getSetting('cert_signature_image', ''),
  ])
  res.json({
    requireEmailVerification: v === true || v === 'true',
    hideThemeToggle: h === true || h === 'true',
    certSignatoryName,
    certSignatoryTitle,
    certSignatureImage,
  })
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body
  const user = await User.findOne({ email }).select('+otpHash +otpCode')
  if (!user) return res.status(400).json({ error: 'Invalid OTP.' })
  if (emailVerified(user)) return sendAuthResponse(res, user, { alreadyVerified: true })

  if (user.otpPurpose !== 'verify' || !user.otpExpires || user.otpExpires.getTime() <= Date.now()) {
    clearOtp(user); await user.save()
    return res.status(400).json({ error: 'OTP has expired.' })
  }
  const attempts = user.otpAttempts || 0
  if (attempts >= OTP_MAX_ATTEMPTS) {
    clearOtp(user); await user.save()
    return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' })
  }
  if (!isOtpValid(user, otp)) {
    user.otpAttempts = attempts + 1
    const locked = user.otpAttempts >= OTP_MAX_ATTEMPTS
    if (locked) clearOtp(user)
    await user.save()
    return res.status(locked ? 429 : 400).json({ error: locked ? 'Too many attempts. Please request a new OTP.' : 'Invalid OTP.' })
  }

  Object.assign(user, { isVerified: true, isEmailVerified: true, verifiedAt: new Date(), registrationCompleted: true })
  clearOtp(user)
  await user.save()
  return sendAuthResponse(res, user, { message: 'Email verified successfully.' })
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

  if ((await getSetting('verificationRequired', false)) === true && !emailVerified(user)) {
    return res.status(403).json({ error: 'Please verify your email before continuing.', needsVerification: true, email: user.email })
  }

  user.registrationCompleted = true
  await user.save()
  return sendAuthResponse(res, user)
}

async function resendOtp(req, res) {
  const email = (req.body.email || '').toLowerCase().trim()
  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ error: 'No account found with this email address. Please sign up.' })
  if (emailVerified(user)) return res.json({ ok: true, alreadyVerified: true, message: 'Your email is already verified.' })

  const { code, emailDelivered } = await issueOtp(user, 'verify')
  return res.json({
    ok: true,
    cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    emailDelivered,
    devCode: emailDelivered ? undefined : code,
  })
}

async function forgotPassword(req, res) {
  const email = (req.body.email || '').toLowerCase().trim()
  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ error: 'No account found with this email address.' })
  const { code, emailDelivered } = await issueOtp(user, 'reset')
  return res.json({
    ok: true,
    emailDelivered,
    devCode: emailDelivered ? undefined : code,
  })
}

async function resetPassword(req, res) {
  const email = (req.body.email || '').toLowerCase().trim()
  const otp = String(req.body.otp || '').trim()
  const user = await User.findOne({ email }).select('+otpHash +otpCode')
  if (!user || user.otpPurpose !== 'reset' || !isOtpValid(user, otp)) {
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  user.passwordHash = await bcrypt.hash(req.body.newPassword || '', 10)
  Object.assign(user, { isVerified: true, isEmailVerified: true, verifiedAt: user.verifiedAt || new Date(), registrationCompleted: true })
  user.tokenVersion = (user.tokenVersion || 0) + 1
  clearOtp(user)
  await user.save()
  return sendAuthResponse(res, user, { ok: true })
}

async function updateProfile(req, res) {
  const { name, bio, avatar, theme } = req.body
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (name?.trim()) user.name = name.trim()
  if (typeof bio === 'string') user.bio = bio.trim()
  if (typeof avatar === 'string') user.avatar = avatar.trim()
  if (['dark', 'light'].includes(theme)) user.theme = theme

  await user.save()
  return res.json({ user: publicUser(user) })
}

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
  return sendAuthResponse(res, user, { message: 'Password updated successfully.' })
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
