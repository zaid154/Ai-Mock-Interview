const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const interviewRoutes = require('./routes/interview.routes')
const { notFound, errorHandler } = require('./middleware/error')

const app = express()

// CORS: allow the configured client origin and send cookies. In same-origin
// production (client served from the API host) CLIENT_URL can be blank.
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }))
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
