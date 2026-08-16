const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const helmet = require('helmet') // 🛡️ security headers
const rateLimit = require('express-rate-limit') // 🛡️ brute‑force/DDoS protection
const mongoSanitize = require('express-mongo-sanitize') // 🛡️ NoSQL injection guard

const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const interviewRoutes = require('./routes/interview.routes')
const bookmarkRoutes = require('./routes/bookmark.routes')
const { notFound, errorHandler } = require('./middleware/error')

const app = express()

// Trust reverse proxies (Render, Vercel, Cloudflare, NGINX) to enable rate-limiting behind proxies
app.set('trust proxy', 1)

// CORS: CLIENT_URL accepts one origin or a comma-separated allow-list. This
// lets the Render API serve the live Vercel site (and optional preview URLs)
// without accidentally allowing every production website.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(helmet()) // 🛡️ set secure HTTP headers

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

// Global rate limiting: 1000 requests per 15 minutes per IP in production, skipped in development
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
})
app.use('/api/', apiLimiter) // apply to all API routes

// Strict rate limiter for sensitive authentication endpoints in production
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/verify-otp', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)

app.use(mongoSanitize()) // 🛡️ prevent NoSQL injection

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    const cleanOrigin = origin.replace(/\/$/, '')
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.startsWith('http://localhost:') ||
      cleanOrigin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true)
    }
    return callback(new Error(`CORS policy violation: Origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}))

app.use(express.json({ limit: '10kb' })) // Limit body size to prevent payload flood attacks
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mockmate-server' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/interviews', interviewRoutes)
app.use('/api/sessions', interviewRoutes)
app.use('/api/bookmarks', bookmarkRoutes)

app.use('/api', notFound)
app.use(errorHandler)

module.exports = app
