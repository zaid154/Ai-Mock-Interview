// Secure OTP helpers, shared by email verification and password reset.
// The database stores only a one-way hash of each issued code.
const crypto = require('crypto')

const OTP_TTL_MINUTES = 10
const OTP_LENGTH = 6
const OTP_RESEND_COOLDOWN_SECONDS = 60
const OTP_MAX_ATTEMPTS = 5

// Random 6-digit code as a string (e.g. "042817").
function generateOtp() {
  return String(crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH))
}

function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code).trim()).digest('hex')
}

// When the code should stop working.
function otpExpiry() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
}

// True if the code matches and hasn't expired.
function isOtpValid(user, code) {
  if (!user.otpHash || !user.otpExpires || user.otpExpires.getTime() <= Date.now()) return false
  const expected = Buffer.from(user.otpHash, 'hex')
  const received = Buffer.from(hashOtp(code), 'hex')
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}

module.exports = {
  generateOtp,
  hashOtp,
  otpExpiry,
  isOtpValid,
  OTP_TTL_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_MAX_ATTEMPTS,
}
