import type { Request, Response, NextFunction } from 'express'

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' })
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' })
  if (err?.code === 11000) return res.status(409).json({ error: 'Already exists' })

  console.error(err)
  res.status(err?.status || 500).json({ error: err?.message || 'Something went wrong' })
}
