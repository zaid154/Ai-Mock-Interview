const mongoose = require('mongoose')

/**
 * Connect to MongoDB with automatic reconnect handling and event monitoring.
 */
async function connectDB(uri) {
  mongoose.set('strictQuery', true)

  mongoose.connection.on('connected', () => {
    console.log('[Database] MongoDB connected successfully')
  })

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err.message)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected. Waiting for automatic reconnect...')
  })

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  })
}

module.exports = { connectDB }
