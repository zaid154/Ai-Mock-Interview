require('./config/env')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Question = require('./models/Question.model')
const User = require('./models/User.model')
const Setting = require('./models/Setting.model')
const Interview = require('./models/Interview.model')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate'

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

  // 2) Default admin user (credentials from .env)
  const adminEmail = (process.env.ADMIN_EMAIL || 'zaidm1323@gmail.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  const adminName = process.env.ADMIN_NAME || 'Mohd Zaid'
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  
  const adminUser = await User.findOneAndUpdate(
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
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  console.log(`Admin ready: ${adminEmail}`)

  // 2b) Secondary Admin User (admin@shop.com / Admin@123)
  const secondaryHash = await bcrypt.hash('Admin@123', 10)
  await User.findOneAndUpdate(
    { email: 'admin@shop.com' },
    {
      name: 'Mohd Zaid',
      email: 'admin@shop.com',
      passwordHash: secondaryHash,
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      verifiedAt: new Date(),
      registrationCompleted: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  console.log('Secondary Admin ready: admin@shop.com')

  // 3) Seed completed sample interviews for Admin user so all milestone certificates are 100% unlocked
  if (adminUser) {
    const existingCount = await Interview.countDocuments({ user: adminUser._id, status: 'completed' })
    if (existingCount < 5) {
      await Interview.deleteMany({ user: adminUser._id })
      const sampleInterviews = [
        {
          user: adminUser._id,
          role: 'Frontend Developer',
          difficulty: 'hard',
          mode: 'questions',
          status: 'completed',
          overallScore: 94,
          summary: 'Outstanding technical depth and clear architectural explanation of React Virtual DOM fiber reconciliation.',
          createdAt: new Date(Date.now() - 86400000 * 5),
        },
        {
          user: adminUser._id,
          role: 'Backend Architect',
          difficulty: 'hard',
          mode: 'questions',
          status: 'completed',
          overallScore: 96,
          summary: 'Exceptional knowledge of Node.js event loop lag and Redis token bucket rate limiting.',
          createdAt: new Date(Date.now() - 86400000 * 3),
        },
        {
          user: adminUser._id,
          role: 'System Design',
          difficulty: 'hard',
          mode: 'questions',
          status: 'completed',
          overallScore: 92,
          summary: 'Strong design breakdown for globally distributed URL shortener with sub-10ms latency.',
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          user: adminUser._id,
          role: 'DevOps & Cloud',
          difficulty: 'hard',
          mode: 'questions',
          status: 'completed',
          overallScore: 95,
          summary: 'Excellent explanation of Istio canary deployments and automated Prometheus rollback thresholds.',
          createdAt: new Date(Date.now() - 86400000 * 1),
        },
        {
          user: adminUser._id,
          role: 'Full Stack Developer',
          difficulty: 'medium',
          mode: 'quiz',
          status: 'completed',
          overallScore: 98,
          summary: 'Perfect score on end-to-end full stack security & JWT token validation quiz.',
          createdAt: new Date(),
        },
      ]
      await Interview.insertMany(sampleInterviews)
      console.log('Seeded 5 completed sample interviews for Admin user.')
    }
  }

  // 4) Default settings
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
