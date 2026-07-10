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

    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpPurpose: { type: String, enum: ['verify', 'reset', null], default: null },

    // Bumped on password reset to invalidate any JWTs issued before the reset.
    tokenVersion: { type: Number, default: 0 },

    resumeText: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
