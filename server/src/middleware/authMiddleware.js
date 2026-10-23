const { verifyToken } = require('../utils/tokenUtils')
const User = require('../models/userModel')
const { getSetting } = require('../utils/settingsUtils')

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

async function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' })
  }
  next()
}

module.exports = { requireAuth, requireAdmin }
