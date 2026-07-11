const { verifyToken } = require('../utils/token')
const User = require('../models/User.model')
const { getSetting } = require('../utils/settings')

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
    const user = await User.findById(payload.sub).select('tokenVersion email isVerified isEmailVerified')
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
    next()
  } catch (err) {
    next(err) // a DB error is not an auth failure
  }
}

// Must run after requireAuth. Loads the user and checks the admin role.
async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('role')
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' })
    }
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { requireAuth, requireAdmin }
