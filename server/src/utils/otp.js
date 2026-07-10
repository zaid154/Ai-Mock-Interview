// Small OTP helpers, shared by email verification and password reset.
// Kept deliberately simple: a 6-digit code with an expiry timestamp saved on
// the user document. No external OTP library needed.

const OTP_TTL_MINUTES = 10

// Random 6-digit code as a string (e.g. "042817").
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// When the code should stop working.
function otpExpiry() {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
}

// True if the code matches and hasn't expired.
function isOtpValid(user, code) {
  if (!user.otpCode || !user.otpExpires) return false
  if (user.otpCode !== String(code).trim()) return false
  return user.otpExpires.getTime() > Date.now()
}

module.exports = { generateOtp, otpExpiry, isOtpValid, OTP_TTL_MINUTES }
