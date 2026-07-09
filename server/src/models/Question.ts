import mongoose, { Schema } from 'mongoose'

// Seed-time question bank. Also used as an offline fallback by the Gemini
// service when GEMINI_API_KEY isn't set.
const questionSchema = new Schema(
  {
    role: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    prompt: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.models.Question || mongoose.model('Question', questionSchema)
