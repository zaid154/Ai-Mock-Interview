const jwt = require('jsonwebtoken')

// Signing secret comes from .env; a dev default keeps things running locally.
const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me'

// Put the user id in `sub` and the tokenVersion in `tv` so requireAuth can both
// identify the user and reject tokens issued before a password reset.
function signToken(userId, tokenVersion = 0) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ sub: userId, tv: tokenVersion }, secret(), { expiresIn })
}

function verifyToken(token) {
  return jwt.verify(token, secret())
}

// A short-lived registration ticket is deliberately not an auth token. It only
// lets the person who just registered finish the optional verification step.
function signRegistrationToken(userId) {
  return jwt.sign({ sub: userId, purpose: 'complete-registration' }, secret(), { expiresIn: '30m' })
}

function verifyRegistrationToken(token) {
  const payload = jwt.verify(token, secret())
  if (payload.purpose !== 'complete-registration') throw new Error('Invalid registration token')
  return payload
}

module.exports = { signToken, verifyToken, signRegistrationToken, verifyRegistrationToken }
