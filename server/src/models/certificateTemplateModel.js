const mongoose = require('mongoose')
const { Schema } = mongoose

// The milestone definitions used to live as a hardcoded MILESTONES array inside
// client/src/pages/Certificates.jsx, so an admin could not add, retitle, retune
// or retire a credential without a code change. They are documents now.
//
// `design` picks which layout the certificate renders in. Every design reads the
// same fields, so switching one is purely presentational and never invalidates an
// already-issued credential.
const DESIGNS = ['classic', 'modern', 'elegant']

const certificateTemplateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },

    // Awarded when the candidate has `reqCount` completed sessions scoring at
    // least `reqMinScore`. If `reqScore` is set it instead means "any single
    // session at or above this score", which is how the honours credential works.
    reqCount: { type: Number, default: 1, min: 1, max: 500 },
    reqMinScore: { type: Number, default: 60, min: 0, max: 100 },
    reqScore: { type: Number, default: null, min: 0, max: 100 },

    design: { type: String, enum: DESIGNS, default: 'classic' },
    accent: { type: String, default: '#4f46e5', trim: true },
    // Printed under the milestone title on the certificate itself.
    subtitle: { type: String, default: 'has successfully completed technical qualification for', trim: true },

    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

certificateTemplateSchema.statics.DESIGNS = DESIGNS

module.exports =
  mongoose.models.CertificateTemplate ||
  mongoose.model('CertificateTemplate', certificateTemplateSchema)
