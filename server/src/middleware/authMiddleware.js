const { verifyToken } = require('../utils/tokenUtils')
const User = require('../models/userModel')
const { getSetting } = require('../utils/settingsUtils')

// Reads the JWT from the Bearer header or the `token` cookie, verifies it,
// confirms the user still exists and the token hasn't been revoked by a password
// reset (tokenVersion), then puts the user id on req.userId.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const bearer = header && header.startsWith('Bearer ') ? header.slice(7) : undefined
  const token = bearer || (req.cookies && req.cookies.token)

  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return res.status(401).json({ error: 'Session expired, please sign in again' })
  }

  try {
    const user = await User.findById(payload.sub).select('tokenVersion email isVerified isEmailVerified role')
    // Reject if the account is gone or the token predates a password reset.
    if (!user || (user.tokenVersion || 0) !== (payload.tv || 0)) {
      return res.status(401).json({ error: 'Session expired, please sign in again' })
    }
    const verificationRequired = (await getSetting('verificationRequired', false)) === true
    const emailVerified = user.isVerified === true || user.isEmailVerified === true
    if (verificationRequired && !emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      })
    }
    req.userId = payload.sub
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

// Must run after requireAuth. Checks the user's admin role without an extra DB query.
async function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin }
