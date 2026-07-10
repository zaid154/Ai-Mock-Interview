const mongoose = require('mongoose')

// Connect to MongoDB. We read MONGODB_URI (see .env). Kept tiny on purpose.
async function connectDB(uri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}

module.exports = { connectDB }
