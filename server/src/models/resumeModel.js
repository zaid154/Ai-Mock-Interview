const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    fileHash: { type: String, required: true, index: true },
    rawText: { type: String, default: '' },
    resumeContext: {
      name: { type: String, default: '' },
      summary: { type: String, default: '' },
      skills: [{ type: String }],
      experience: [
        {
          role: { type: String, default: '' },
          company: { type: String, default: '' },
          duration: { type: String, default: '' },
          summary: { type: String, default: '' },
        },
      ],
      projects: [
        {
          name: { type: String, default: '' },
          technologies: [{ type: String }],
          description: { type: String, default: '' },
        },
      ],
      education: [
        {
          degree: { type: String, default: '' },
          institution: { type: String, default: '' },
          year: { type: String, default: '' },
        },
      ],
      certifications: [{ type: String }],
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

// Prevent duplicate resume records for the same user with identical file content
resumeSchema.index({ user: 1, fileHash: 1 }, { unique: true })

module.exports = mongoose.model('Resume', resumeSchema)
