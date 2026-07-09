import mongoose, { Schema } from 'mongoose'

const questionSchema = new Schema(
  {
    prompt: { type: String, required: true },
    answer: { type: String, default: '' },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
  },
  { _id: false },
)

const interviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    questions: [questionSchema],
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model('Interview', interviewSchema)
