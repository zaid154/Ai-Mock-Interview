require('./config/env') // load the shared root .env first
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/userModel')
const Question = require('./models/questionModel')
const Interview = require('./models/interviewModel')
const Setting = require('./models/settingModel')
const Certificate = require('./models/certificateModel')
const CertificateTemplate = require('./models/certificateTemplateModel')
const { DEFAULT_TEMPLATES } = require('./controllers/certificateTemplateController')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate'

const { questions, SAMPLE_CANDIDATES } = require('./seedData')

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
