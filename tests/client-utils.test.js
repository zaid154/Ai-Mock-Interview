import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatGeneratedText, normalizePrompt } from '../client/src/lib/text.js'
import { approxDataUrlKb } from '../client/src/lib/image.js'
import { apiError } from '../client/src/lib/api.js'

describe('Client Text & String Utilities', () => {
  it('normalizes escaped literal newlines and tabs from LLM output', () => {
    const raw = 'First line\\nSecond line\\tIndented\\r\\nThird line'
    const formatted = formatGeneratedText(raw)
    assert.strictEqual(formatted, 'First line\nSecond line\tIndented\nThird line')
  })

  it('handles null and undefined values safely', () => {
    assert.strictEqual(formatGeneratedText(null), '')
    assert.strictEqual(formatGeneratedText(undefined), '')
    assert.strictEqual(normalizePrompt(null), '')
    assert.strictEqual(normalizePrompt(undefined), '')
  })

  it('collapses excessive whitespace and cleans linebreaks in user prompts', () => {
    const dirtyPrompt = '  Explain    event loop \r\n\r\n in Node.js   '
    const cleaned = normalizePrompt(dirtyPrompt)
    assert.strictEqual(cleaned, 'Explain event loop \n\n in Node.js')
  })
})

describe('Client Media & API Utilities', () => {
  it('correctly calculates approximate base64 payload size in KB', () => {
    assert.strictEqual(approxDataUrlKb(null), 0)
    assert.strictEqual(approxDataUrlKb(''), 0)
    // 1024 b64 chars * 0.75 / 1024 = 1 KB
    const dummyB64 = 'data:image/jpeg;base64,' + 'A'.repeat(1024)
    assert.strictEqual(approxDataUrlKb(dummyB64), 1)
  })

  it('extracts human-readable error messages from API responses or falls back', () => {
    const standardError = new Error('Generic failure')
    assert.strictEqual(apiError(standardError, 'Default message'), 'Default message')
    assert.strictEqual(apiError(null, 'Network unavailable'), 'Network unavailable')
  })
})
