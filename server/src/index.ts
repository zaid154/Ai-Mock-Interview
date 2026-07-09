import './config/env'
import app from './app'
import { connectDB } from './config/db'

const PORT = Number(process.env.PORT) || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate'

connectDB(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MockMate AI server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message)
    process.exit(1)
  })
