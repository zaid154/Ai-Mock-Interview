const mongoose = require('mongoose')
const { Schema } = mongoose

const certificateSchema = new Schema(
  {
    certId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    interview: { type: Schema.Types.ObjectId, ref: 'Interview', required: true },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    role: { type: String, required: true },
    difficulty: { type: String, default: 'medium' },
    score: { type: Number, required: true },
    issueDate: { type: Date, default: Date.now },
    verifyUrl: { type: String, required: true },
    qrCodeUrl: { type: String, required: true },
  },
  { timestamps: true },
)

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema)
