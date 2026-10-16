/**
 * Text normalization utilities for MockMate AI
 */

function normalizePrompt(val) {
  if (!val) return ''
  return String(val)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = {
  normalizePrompt,
  escapeRegex,
}
