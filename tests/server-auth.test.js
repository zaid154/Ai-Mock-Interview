const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const {
  generateOtp,
  hashOtp,
  otpExpiry,
  isOtpValid,
  OTP_LENGTH,
  OTP_TTL_MINUTES,
} = require('../server/src/utils/otpUtils')
const { normalizePrompt, escapeRegex } = require('../server/src/utils/textUtils')

describe('Server Authentication & OTP Security', () => {
  it('generates a 6-digit numeric string OTP', () => {
    const code = generateOtp()
    assert.strictEqual(typeof code, 'string')
    assert.strictEqual(code.length, OTP_LENGTH)
    assert.match(code, /^\d{6}$/)
  })

  it('hashes OTPs deterministically with SHA-256', () => {
    const code = '123456'
    const hash1 = hashOtp(code)
    const hash2 = hashOtp(' 123456 ') // handles trimming
    assert.strictEqual(hash1, hash2)
    assert.strictEqual(hash1.length, 64) // 256 bits = 64 hex chars
  })

  it('calculates future expiry timestamp matching OTP_TTL_MINUTES', () => {
    const before = Date.now() + OTP_TTL_MINUTES * 60 * 1000
    const expiry = otpExpiry().getTime()
    const diff = Math.abs(expiry - before)
    assert.ok(diff < 1000, 'Expiry time must be within 1 second of expected future time')
  })

  it('validates matching unexpired OTPs successfully', () => {
    const code = '789123'
    const user = {
      otpHash: hashOtp(code),
      otpExpires: new Date(Date.now() + 5 * 60 * 1000), // expires in 5m
    }
    assert.strictEqual(isOtpValid(user, code), true)
  })

  it('rejects incorrect or expired OTPs safely', () => {
    const code = '789123'
    const expiredUser = {
      otpHash: hashOtp(code),
      otpExpires: new Date(Date.now() - 1000), // already expired
    }
    assert.strictEqual(isOtpValid(expiredUser, code), false)

    const activeUser = {
      otpHash: hashOtp(code),
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    }
    assert.strictEqual(isOtpValid(activeUser, '000000'), false)
  })
})

describe('Server Text & Search Regex Utilities', () => {
  it('escapes special regex characters to prevent ReDoS / injection', () => {
    const rawSearch = 'user+admin*test[1]?^$'
    const escaped = escapeRegex(rawSearch)
    assert.strictEqual(escaped, 'user\\+admin\\*test\\[1\\]\\?\\^\\$')
    const regex = new RegExp(escaped)
    assert.ok(regex.test(rawSearch))
  })

  it('normalizes prompt whitespace on the server symmetrically with the client', () => {
    assert.strictEqual(normalizePrompt(''), '')
    assert.strictEqual(normalizePrompt('  Design   URL   Shortener '), 'Design URL Shortener')
  })
})
