const { generateOtp, hashOtp, otpExpiry, OTP_RESEND_COOLDOWN_SECONDS } = require('./otpUtils')
const { sendOtpEmail } = require('../services/emailService')

// Cross-domain cookie configuration for Render API and Vercel Client
const isProd = () =>
  process.env.NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_SERVICE_ID)

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: isProd() ? 'none' : 'lax',
  secure: isProd(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
})

const emailVerified = (u) => Boolean(u.isEmailVerified || u.isVerified)

// Strips sensitive fields (hashes, OTP internals) before returning user records
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
  hasResume: Boolean(u.resumeText || u.activeResume || u.resumeFileName),
  resumeFileName: u.resumeFileName || '',
})

// Clears temporary OTP state upon verification or invalidation
function clearOtp(user) {
  user.otpCode = null
  user.otpHash = null
  user.otpExpires = null
  user.otpPurpose = null
  user.otpAttempts = 0
}

// Issues a SHA-256 hashed 6-digit OTP code and dispatches verification email
async function issueOtp(user, purpose) {
  if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    const err = new Error('Please wait ' + OTP_RESEND_COOLDOWN_SECONDS + ' seconds before requesting another OTP.')
    err.status = 429
    throw err
  }
  const code = generateOtp()
  user.otpCode = null
  user.otpHash = hashOtp(code)
  user.otpExpires = otpExpiry()
  user.otpPurpose = purpose
  user.otpLastSentAt = new Date()
  user.otpAttempts = 0
  await user.save()
  await sendOtpEmail(user.email, code, purpose)
}

module.exports = {
  isProd,
  cookieOptions,
  emailVerified,
  publicUser,
  clearOtp,
  issueOtp,
}
