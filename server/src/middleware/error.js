// 404 for unknown /api routes.
function notFound(_req, res) {
  res.status(404).json({ error: 'Route not found' })
}

// Central error handler: maps a couple of common Mongo/Multer errors to nicer
// status codes, otherwise 500.
function errorHandler(err, _req, res, _next) {
  if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' })
  if (err?.code === 11000) return res.status(409).json({ error: 'Already exists' })
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File is too large' })

  console.error(err)
  res.status(err?.status || 500).json({ error: err?.message || 'Something went wrong' })
}

module.exports = { notFound, errorHandler }
