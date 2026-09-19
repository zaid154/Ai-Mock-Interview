const mongoose = require('mongoose')
const { Schema } = mongoose

// Flexible key/value config the admin can edit, add, rename, or delete from the
// admin panel — no fixed schema per setting. `value` is Mixed so it can hold a
// string (DB name, label), a boolean (verificationRequired), or an array
// (gemini_api_keys). Not a replacement for real .env secrets — just app config.
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema)
