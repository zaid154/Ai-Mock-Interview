const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')

const authRoutes = require('./routes/authRoutes')
const interviewRoutes = require('./routes/interviewRoutes')
const bookmarkRoutes = require('./routes/bookmarkRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

app.set('trust proxy', 1)

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(helmet())

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
})
app.use('/api/', apiLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/verify-otp', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)

app.use(mongoSanitize())

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      const cleanOrigin = origin.replace(/\/$/, '')
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.startsWith('http://localhost:') ||
        cleanOrigin.startsWith('http://127.0.0.1:') ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true)
      }
      return callback(new Error(`CORS policy violation: Origin ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

// Health checks
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'mockmate-server', uptime: Math.round(process.uptime()) })
})

app.get('/api', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mockmate-server',
    message: 'MockMate AI API is running',
    health: '/api/health',
  })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mockmate-server' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/interviews', interviewRoutes)
app.use('/api/bookmarks', bookmarkRoutes)

// Error handling
app.use('/api', notFound)
app.use(errorHandler)

module.exports = app
