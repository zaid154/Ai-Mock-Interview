// 404 for unknown /api routes.
function notFound(_req, res) {
  res.status(404).json({ error: 'Route not found' })
}

// Central error handler: maps Mongo/Multer errors and prevents leaking stack traces or internal DB paths in production
function errorHandler(err, _req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production'
  const statusCode = err?.status || err?.statusCode || 500

  // Log error internally on server console
  console.error('🔴 API Error:', err)

  // Map known database / file upload errors safely
  if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid resource ID format' })
  if (err?.code === 11000) return res.status(409).json({ error: 'Resource already exists' })
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Uploaded file size exceeds limit' })
  if (err?.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ')
    return res.status(400).json({ error: message || 'Validation failed' })
  }

  // Hide stack traces and internal paths in production
  if (isProd) {
    return res.status(statusCode).json({
      error: statusCode === 500 ? 'Internal Server Error' : err?.message || 'An unexpected error occurred',
    })
  }

  // Development environment exposes stack for debugging
  return res.status(statusCode).json({
    error: err?.message || 'Something went wrong',
    stack: err.stack,
  })
}

module.exports = { notFound, errorHandler }
