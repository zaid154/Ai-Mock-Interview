const mongoose = require('mongoose')
const { Schema } = mongoose

// App user. `role` gates the admin panel. `isVerified` + the otp* fields drive
// email OTP verification (and are reused for password reset). `resumeText` holds
// the extracted text of an uploaded CV so questions can be tailored to it.
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // `isVerified` remains for backwards compatibility with existing accounts.
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    emailVerificationRequiredAt: { type: Date, default: null },
    registrationCompleted: { type: Boolean, default: false },

    // OTPs are never stored in plain text. `otpCode` is only retained so old
    // documents can be read; all newly-issued OTPs use `otpHash`.
    otpCode: { type: String, default: null, select: false },
    otpHash: { type: String, default: null, select: false },
    otpExpires: { type: Date, default: null },
    otpPurpose: { type: String, enum: ['verify', 'reset', null], default: null },
    otpLastSentAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },

    // Bumped on password reset to invalidate any JWTs issued before the reset.
    tokenVersion: { type: Number, default: 0 },

    resumeText: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
