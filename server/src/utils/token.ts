import jwt from 'jsonwebtoken'

const secret = () => process.env.JWT_SECRET || 'dev-secret-change-me'

export function signToken(userId: string) {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
  return jwt.sign({ sub: userId }, secret(), { expiresIn })
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret()) as { sub: string }
}
