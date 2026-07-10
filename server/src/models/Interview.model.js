const mongoose = require('mongoose')
const { Schema } = mongoose

// One question inside an interview. For "questions" mode we use prompt/answer/
// score/feedback. For "quiz" mode we also use options/correctIndex/selectedIndex.
const questionSchema = new Schema(
  {
    prompt: { type: String, required: true },
    // questions mode
    answer: { type: String, default: '' },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    // quiz mode (multiple choice)
    options: { type: [String], default: undefined },
    correctIndex: { type: Number, default: null },
    selectedIndex: { type: Number, default: null },
  },
  { _id: false },
)

const interviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
    experience: { type: String, default: 'Fresher' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    mode: { type: String, enum: ['questions', 'quiz'], default: 'questions' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    questions: [questionSchema],
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.models.Interview || mongoose.model('Interview', interviewSchema)
