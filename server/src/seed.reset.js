// Destructive reset seed. Use this only when you want to remove every user,
// interview, fallback question, and database setting, then recreate defaults.
const { seed } = require('./seed')

seed({ reset: true }).catch(async (err) => {
  console.error('Reset seed failed:', err)
  process.exitCode = 1
  const mongoose = require('mongoose')
  await mongoose.disconnect()
})
