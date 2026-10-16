const mongoose = require('mongoose')
const { Schema } = mongoose

const bookmarkSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    prompt: { type: String, required: true },
    role: { type: String, default: 'General' },
    category: { type: String, default: 'General' },
    answer: { type: String, default: '' },
    feedback: { type: String, default: '' },
    options: { type: [String], default: undefined },
    correctIndex: { type: Number, default: null },
    notes: { type: String, default: '' },
    modelAnswer: { type: String, default: '' },
    rubric: {
      technicalAccuracy: { type: Number, default: 0 },
      depthAndTradeoffs: { type: Number, default: 0 },
      structureAndFlow: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
    },
    talkingPoints: { type: [String], default: [] },
  },
  { timestamps: true },
)

bookmarkSchema.index({ user: 1, prompt: 1 })


module.exports = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema)
