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
  },
  { timestamps: true },
)

module.exports = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema)
