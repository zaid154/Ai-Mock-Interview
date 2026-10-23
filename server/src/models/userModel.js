const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    emailVerificationRequiredAt: { type: Date, default: null },
    registrationCompleted: { type: Boolean, default: false },

    otpCode: { type: String, default: null, select: false },
    otpHash: { type: String, default: null, select: false },
    otpExpires: { type: Date, default: null },
    otpPurpose: { type: String, enum: ['verify', 'reset', null], default: null },
    otpLastSentAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },

    tokenVersion: { type: Number, default: 0 },

    resumeText: { type: String, default: '' },
    activeResume: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
    resumeFileName: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    theme: { type: String, enum: ['dark', 'light'], default: 'light' },
  },
  { timestamps: true }
)

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
