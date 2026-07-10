const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const interviewRoutes = require('./routes/interview.routes')
const { notFound, errorHandler } = require('./middleware/error')

const app = express()

// CORS: CLIENT_URL accepts one origin or a comma-separated allow-list. This
// lets the Render API serve the live Vercel site (and optional preview URLs)
// without accidentally allowing every production website.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header are server-to-server tools/health checks.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true)
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mockmate-server' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/interviews', interviewRoutes)

app.use('/api', notFound)
app.use(errorHandler)

module.exports = app
