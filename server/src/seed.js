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

const SAMPLE_CANDIDATES = [
  {
    name: 'Mohd Zaid',
    email: 'zaidm1323@gmail.com',
    role: 'admin',
    avatar: '👨‍💻',
    bio: 'Lead Fullstack & AI Systems Architect',
    password: 'ChangeMe123!',
    interviews: [
      { role: 'Frontend Developer', difficulty: 'hard', mode: 'questions', overallScore: 94, summary: 'Outstanding technical depth in React fiber reconciliation and DOM optimization.' },
      { role: 'Backend Architect', difficulty: 'hard', mode: 'questions', overallScore: 96, summary: 'Exceptional knowledge of Node.js event loop lag and Redis rate limiting.' },
      { role: 'System Design', difficulty: 'hard', mode: 'questions', overallScore: 92, summary: 'Strong design breakdown for globally distributed URL shortener.' },
      { role: 'DevOps & Cloud', difficulty: 'hard', mode: 'questions', overallScore: 95, summary: 'Excellent explanation of Istio canary deployments and Prometheus alerts.' },
      { role: 'Full Stack Developer', difficulty: 'medium', mode: 'quiz', overallScore: 98, summary: 'Perfect score on end-to-end full stack security & JWT token validation quiz.' },
    ],
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    role: 'user',
    avatar: '🚀',
    bio: 'Senior Distributed Systems & Backend Engineer',
    password: 'Password123!',
    interviews: [
      { role: 'Backend Architect', difficulty: 'hard', mode: 'questions', overallScore: 94, summary: 'Deep expertise in database sharding and distributed consensus protocols.' },
      { role: 'System Design', difficulty: 'medium', mode: 'questions', overallScore: 92, summary: 'Well-structured microservices decomposition with clear fault tolerance.' },
      { role: 'SQL Database Engineer', difficulty: 'medium', mode: 'quiz', overallScore: 89, summary: 'High accuracy in query optimization and index design.' },
      { role: 'Full Stack Developer', difficulty: 'hard', mode: 'questions', overallScore: 90, summary: 'Solid understanding of REST API idempotency and GraphQL resolvers.' },
    ],
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@gmail.com',
    role: 'user',
    avatar: '⚡',
    bio: 'Frontend UI/UX Specialist & React Guru',
    password: 'Password123!',
    interviews: [
      { role: 'Frontend Developer', difficulty: 'hard', mode: 'questions', overallScore: 91, summary: 'Great understanding of web performance metrics and virtualized lists.' },
      { role: 'React Specialist', difficulty: 'medium', mode: 'questions', overallScore: 88, summary: 'Clean state management breakdown with custom hooks.' },
      { role: 'UI Engineer', difficulty: 'easy', mode: 'quiz', overallScore: 92, summary: 'Perfect grasp of CSS Grid, Flexbox layout math, and accessibility.' },
      { role: 'Full Stack Developer', difficulty: 'medium', mode: 'questions', overallScore: 84, summary: 'Good client-server integration awareness.' },
    ],
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@gmail.com',
    role: 'user',
    avatar: '🛡️',
    bio: 'MERN Stack Developer & Cloud Enthusiast',
    password: 'Password123!',
    interviews: [
      { role: 'Full Stack Developer', difficulty: 'medium', mode: 'questions', overallScore: 84, summary: 'Clear communication of Node.js async operations and Express middleware.' },
      { role: 'Backend Developer', difficulty: 'medium', mode: 'quiz', overallScore: 82, summary: 'Good knowledge of MongoDB aggregation pipelines.' },
      { role: 'Frontend Developer', difficulty: 'easy', mode: 'questions', overallScore: 80, summary: 'Solid JavaScript closure and prototype chain understanding.' },
    ],
  },
  {
    name: 'Ananya Gupta',
    email: 'ananya.gupta@gmail.com',
    role: 'user',
    avatar: '☁️',
    bio: 'DevOps & Kubernetes Cloud Specialist',
    password: 'Password123!',
    interviews: [
      { role: 'DevOps & Cloud', difficulty: 'medium', mode: 'questions', overallScore: 82, summary: 'Strong grasp of Docker containerization and CI/CD pipelines.' },
      { role: 'System Reliability', difficulty: 'medium', mode: 'quiz', overallScore: 78, summary: 'Good understanding of monitoring and alert thresholds.' },
      { role: 'Backend Developer', difficulty: 'easy', mode: 'questions', overallScore: 75, summary: 'Decent foundational REST API design skills.' },
    ],
  },
]

async function seed({ reset = true } = {}) {
  await mongoose.connect(MONGODB_URI)
  console.log(`Connected: ${MONGODB_URI}`)

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

  // 2) Secondary Admin (admin@shop.com)
  const secondaryHash = await bcrypt.hash('Admin@123', 10)
  const secAdminDoc = await User.findOneAndUpdate(
    { email: 'admin@shop.com' },
    {
      name: 'Admin Support',
      email: 'admin@shop.com',
      passwordHash: secondaryHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      isEmailVerified: true,
      verifiedAt: new Date(),
      registrationCompleted: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  if (secAdminDoc) {
    await Interview.deleteMany({ user: secAdminDoc._id })
  }

  // 3) Seed Candidates and Completed Interview Sessions
  for (let i = 0; i < SAMPLE_CANDIDATES.length; i++) {
    const cand = SAMPLE_CANDIDATES[i]
    const hash = await bcrypt.hash(cand.password, 10)

    const userDoc = await User.findOneAndUpdate(
      { email: cand.email.toLowerCase() },
      {
        name: cand.name,
        email: cand.email.toLowerCase(),
        passwordHash: hash,
        role: cand.role,
        bio: cand.bio,
        avatar: cand.avatar,
        isVerified: true,
        isEmailVerified: true,
        verifiedAt: new Date(Date.now() - 86400000 * (10 - i)),
        registrationCompleted: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    // Clear old interviews for this sample user and re-seed clean completed sessions
    await Interview.deleteMany({ user: userDoc._id })

    const interviewDocs = cand.interviews.map((item, idx) => ({
      user: userDoc._id,
      role: item.role,
      difficulty: item.difficulty,
      mode: item.mode,
      status: 'completed',
      overallScore: item.overallScore,
      summary: item.summary,
      questions: [
        {
          prompt: `Explain the core architecture and key trade-offs in ${item.role}.`,
          answer: `I design high-performance systems by prioritizing clean separation of concerns, defensive validation, and modular component architecture.`,
          feedback: `Strong candidate response with clear technical depth and structured reasoning.`,
          score: Math.min(10, Math.round(item.overallScore / 10)),
        },
        {
          prompt: `How do you diagnose and resolve performance bottlenecks under heavy load?`,
          answer: `I analyze system metrics using profiling tools, identify slow database queries or un-indexed fields, and implement caching layers like Redis.`,
          feedback: `Excellent analytical approach and systematic troubleshooting workflow.`,
          score: Math.min(10, Math.round(item.overallScore / 10)),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * (i * 2 + idx + 1)),
    }))

    await Interview.insertMany(interviewDocs)
    console.log(`Candidate #${i + 1} ready: ${cand.name} (${cand.email}) - ${cand.interviews.length} sessions`)
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
  console.log('Seed complete!')
}

if (require.main === module) {
  seed().catch(async (err) => {
    console.error('Seed failed:', err)
    process.exitCode = 1
    await mongoose.disconnect()
  })
}

module.exports = { seed }
