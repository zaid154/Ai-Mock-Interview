import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import interviewRoutes from './routes/interview.routes'
import { notFound, errorHandler } from './middleware/error'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mockmate-server' })
})

app.use('/api/auth', authRoutes)
app.use('/api/interviews', interviewRoutes)

app.use('/api', notFound)
app.use(errorHandler)

export default app
