import type { RequestHandler } from 'express'

// Forwards rejected promises to Express' error handler so route handlers
// can just `throw` / `await` without wrapping every call in try/catch.
export const wrap =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
