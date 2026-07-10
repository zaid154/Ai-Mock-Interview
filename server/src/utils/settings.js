const Setting = require('../models/Setting.model')

// Read a single setting's value, returning `fallback` if it's missing.
async function getSetting(key, fallback = null) {
  const doc = await Setting.findOne({ key }).lean()
  return doc ? doc.value : fallback
}

module.exports = { getSetting }
