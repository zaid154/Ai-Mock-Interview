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

module.exports = { signToken, verifyToken }
