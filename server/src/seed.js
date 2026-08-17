require('./config/env') // load the shared root .env first
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User.model')
const Question = require('./models/Question.model')
const Interview = require('./models/Interview.model')
const Setting = require('./models/Setting.model')
const Certificate = require('./models/Certificate.model')
const CertificateTemplate = require('./models/CertificateTemplate.model')
const { DEFAULT_TEMPLATES } = require('./controllers/certificateTemplate.controller')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate'

const questions = [
  // Frontend
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'Explain the difference between let, const, and var in JavaScript.' },
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'What is the box model in CSS?' },
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'How does event delegation work in DOM scripting, and what are its benefits?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: "How does React's virtual DOM work, and why is it useful?" },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'When would you reach for useMemo or useCallback, and what are the risks of overusing them?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'Explain the difference between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR).' },
  { role: 'Frontend Developer', difficulty: 'hard', prompt: 'A page is janky while scrolling a long list. How do you diagnose and fix it?' },
  { role: 'Frontend Developer', difficulty: 'hard', prompt: 'How would you architect a micro-frontend architecture for a large enterprise web portal?' },

  // Backend
  { role: 'Backend Developer', difficulty: 'easy', prompt: 'What is the difference between PUT and PATCH in a REST API?' },
  { role: 'Backend Developer', difficulty: 'easy', prompt: 'What are database indexes, and how do B-tree indexes speed up SELECT queries?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'What are the trade-offs between SQL and NoSQL databases?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'How would you design an idempotent payment endpoint?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'Explain how the Node.js event loop handles non-blocking I/O operations.' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'Design a rate limiter for a public REST API. Walk through your approach.' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'A query that used to take 20ms now takes 3s under load. How do you investigate?' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'How do you handle distributed transactions across multiple microservices without 2PC deadlocks?' },

  // Full Stack
  { role: 'Full Stack Developer', difficulty: 'easy', prompt: 'Walk me through what happens when a user types a URL and hits enter.' },
  { role: 'Full Stack Developer', difficulty: 'easy', prompt: 'What are CORS headers, and how do you configure them securely on client and server?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How would you secure a JWT-based authentication flow end to end?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How do you keep the client and server in sync on shared validation rules?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'Compare WebSockets vs Server-Sent Events (SSE) vs Polling for real-time notifications.' },
  { role: 'Full Stack Developer', difficulty: 'hard', prompt: 'Design a URL shortener. Cover the API, storage, and how you generate short codes.' },
  { role: 'Full Stack Developer', difficulty: 'hard', prompt: 'How would you build a real-time collaborative document editor like Google Docs?' },

  // System Design & DevOps
  { role: 'System Design', difficulty: 'medium', prompt: 'How do content delivery networks (CDNs) cache dynamic asset payloads near edge users?' },
  { role: 'System Design', difficulty: 'hard', prompt: 'Design a high-throughput notification service that handles millions of push notifications per second.' },
  { role: 'DevOps & Cloud', difficulty: 'medium', prompt: 'What is the difference between Docker containers and virtual machines?' },
  { role: 'DevOps & Cloud', difficulty: 'hard', prompt: 'Walk through setting up a zero-downtime blue/green deployment strategy on Kubernetes.' },

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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
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
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
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

  // 2) Staff admins.
  //
  // .env.example documents ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME as the
  // "default admin (created/updated by npm run seed)", but this seed used to
  // ignore them completely and hardcode admin@shop.com — so anyone who filled
  // in those variables got an account that did not exist and a login that
  // failed. Honour the documented contract, and keep admin@shop.com as a
  // fixture so existing setups do not lose their account.
  const ADMINS = [
    {
      email: (process.env.ADMIN_EMAIL || 'admin@mockmate.com').trim().toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      name: process.env.ADMIN_NAME || 'Admin',
      avatar: '',
    },
    {
      email: 'admin@shop.com',
      password: 'Admin@123',
      name: 'Admin Support',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
  ]

  const seenAdminEmails = new Set()
  for (const a of ADMINS) {
    if (!a.email || seenAdminEmails.has(a.email)) continue
    seenAdminEmails.add(a.email)

    const doc = await User.findOneAndUpdate(
      { email: a.email },
      {
        name: a.name,
        email: a.email,
        passwordHash: await bcrypt.hash(a.password, 10),
        role: 'admin',
        avatar: a.avatar,
        isVerified: true,
        isEmailVerified: true,
        verifiedAt: new Date(),
        registrationCompleted: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    if (doc) {
      await Interview.deleteMany({ user: doc._id })
      await Certificate.deleteMany({ user: doc._id })
    }
    console.log(`Admin ready: ${a.name} (${a.email}) / ${a.password}`)
  }

  // 3) Seed Candidates, Completed Interview Sessions, and Persistent Certificates
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

    // Clear old records for this candidate
    await Interview.deleteMany({ user: userDoc._id })
    await Certificate.deleteMany({ user: userDoc._id })

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

    const createdInterviews = await Interview.insertMany(interviewDocs)

    // Seed Certificates for qualifying sessions (score >= 70)
    const certDocs = []
    for (const intDoc of createdInterviews) {
      if (intDoc.overallScore >= 70) {
        const certId = `MM-CERT-${intDoc._id.toString().slice(-8).toUpperCase()}`
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate/${certId}`
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(verifyUrl)}&size=200x200`
        certDocs.push({
          certId,
          user: userDoc._id,
          interview: intDoc._id,
          candidateName: userDoc.name,
          candidateEmail: userDoc.email,
          role: intDoc.role,
          difficulty: intDoc.difficulty,
          score: intDoc.overallScore,
          issueDate: intDoc.createdAt,
          verifyUrl,
          qrCodeUrl,
        })
      }
    }
    if (certDocs.length) {
      await Certificate.insertMany(certDocs)
    }

    console.log(`Candidate #${i + 1} ready: ${cand.name} (${cand.email}) - ${cand.interviews.length} sessions, ${certDocs.length} certificates`)
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
  await Setting.findOneAndUpdate(
    { key: 'cert_signatory_name' },
    { $setOnInsert: { key: 'cert_signatory_name', value: 'Mohd Zaid' } },
    { upsert: true },
  )
  await Setting.findOneAndUpdate(
    { key: 'cert_signatory_title' },
    {
      $setOnInsert: {
        key: 'cert_signatory_title',
        value: 'Global Director of Candidate Assessments, MockMate AI',
      },
    },
    { upsert: true },
  )
  console.log('Default settings ready.')

  // 5) Certificate milestones.
  // Upsert by key rather than wipe-and-insert: re-seeding must not discard a
  // milestone an admin has since retitled, recoloured or switched design on.
  // Only the identity fields are forced; everything else is $setOnInsert.
  for (const t of DEFAULT_TEMPLATES) {
    await CertificateTemplate.findOneAndUpdate(
      { key: t.key },
      { $setOnInsert: t },
      { upsert: true, setDefaultsOnInsert: true },
    )
  }
  const templateCount = await CertificateTemplate.countDocuments()
  console.log(`Certificate milestones ready: ${templateCount} template(s).`)

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
