require('./config/env')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Question = require('./models/Question.model')
const User = require('./models/User.model')
const Setting = require('./models/Setting.model')
const Interview = require('./models/Interview.model')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate'

// NOTE: this bank is ONLY the offline fallback for "questions" mode when no
// Gemini key works. It is NOT a quiz bank — quizzes are always AI-generated.
const questions = [
  // Frontend
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'Explain the difference between let, const, and var in JavaScript.' },
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'What is the box model in CSS?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: "How does React's virtual DOM work, and why is it useful?" },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'When would you reach for useMemo or useCallback, and what are the risks of overusing them?' },
  { role: 'Frontend Developer', difficulty: 'hard', prompt: 'A page is janky while scrolling a long list. How do you diagnose and fix it?' },

  // Backend
  { role: 'Backend Developer', difficulty: 'easy', prompt: 'What is the difference between PUT and PATCH in a REST API?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'What are the trade-offs between SQL and NoSQL databases?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'How would you design an idempotent payment endpoint?' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'Design a rate limiter for a public REST API. Walk through your approach.' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'A query that used to take 20ms now takes 3s under load. How do you investigate?' },

  // Full Stack
  { role: 'Full Stack Developer', difficulty: 'easy', prompt: 'Walk me through what happens when a user types a URL and hits enter.' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How would you secure a JWT-based authentication flow end to end?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How do you keep the client and server in sync on shared validation rules?' },
  { role: 'Full Stack Developer', difficulty: 'hard', prompt: 'Design a URL shortener. Cover the API, storage, and how you generate short codes.' },

  // Behavioral
  { role: 'Behavioral', difficulty: 'easy', prompt: 'Tell me about a time you resolved a conflict with a teammate.' },
  { role: 'Behavioral', difficulty: 'easy', prompt: 'Describe a project you are proud of and your specific contribution to it.' },
  { role: 'Behavioral', difficulty: 'medium', prompt: 'Tell me about a time you disagreed with a technical decision. What did you do?' },
  { role: 'Behavioral', difficulty: 'medium', prompt: 'Describe a time you shipped something under a tight deadline. What did you trade off?' },
]

// Normal mode preserves user-created data. Reset mode is intentionally
// destructive: it clears every app collection before recreating the defaults.
async function seed({ reset = false } = {}) {
  await mongoose.connect(MONGODB_URI)
  console.log(`Connected: ${MONGODB_URI}`)

  if (reset) {
    await Promise.all([
      Interview.deleteMany({}),
      Question.deleteMany({}),
      User.deleteMany({}),
      Setting.deleteMany({}),
    ])
    console.log('Reset complete: users, interviews, questions, and settings deleted.')
  }

  // 1) Offline fallback question bank
  const result = await Question.bulkWrite(
    questions.map((question) => ({
      updateOne: {
        filter: { role: question.role, difficulty: question.difficulty, prompt: question.prompt },
        update: { $setOnInsert: question },
        upsert: true,
      },
    })),
  )
  console.log(`Fallback questions ready (${result.upsertedCount || 0} added).`)

  // 2) Default admin user (credentials from .env, with safe fallbacks).
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@mockmate.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const adminName = process.env.ADMIN_NAME || 'Admin'
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      verifiedAt: new Date(),
      registrationCompleted: true,
    },
    { upsert: true, setDefaultsOnInsert: true },
  )
  console.log(`Admin ready: ${adminEmail} (password from ADMIN_PASSWORD)`)

  // 3) Default settings. Use $setOnInsert so re-running the seed never clobbers a
  //    value the admin changed at runtime (e.g. turning verification on).
  //    `verificationRequired` off means unverified users can still log in.
  //    `gemini_api_keys` starts empty — add keys from the admin panel.
  await Setting.findOneAndUpdate(
    { key: 'verificationRequired' },
    { $setOnInsert: { key: 'verificationRequired', value: false } },
    { upsert: true },
  )
  await Setting.findOneAndUpdate(
    { key: 'gemini_api_keys' },
    { $setOnInsert: { key: 'gemini_api_keys', value: [] } },
    { upsert: true },
  )
  console.log('Default settings ready.')

  await mongoose.disconnect()
  console.log('Done.')
}

if (require.main === module) {
  seed().catch(async (err) => {
    console.error('Seed failed:', err)
    process.exitCode = 1
    await mongoose.disconnect()
  })
}

module.exports = { seed }
