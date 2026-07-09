import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/token'

export interface AuthedRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  const token = bearer || req.cookies?.token

  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    req.userId = verifyToken(token).sub
    next()
  } catch {
    res.status(401).json({ error: 'Session expired, please sign in again' })
  }
}
