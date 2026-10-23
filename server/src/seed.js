require('./config/env')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/userModel')
const Question = require('./models/questionModel')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate'

const questions = [
  // Frontend
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'Explain the difference between let, const, and var in JavaScript.' },
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'What is the CSS box model and how does box-sizing: border-box work?' },
  { role: 'Frontend Developer', difficulty: 'easy', prompt: 'How does event delegation work in DOM scripting, and what are its advantages?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'How does React Virtual DOM diffing algorithm work, and why are keys important?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'When would you use useMemo or useCallback, and when should you avoid them?' },
  { role: 'Frontend Developer', difficulty: 'medium', prompt: 'Explain the differences between SSR, SSG, and Client-Side Rendering.' },
  { role: 'Frontend Developer', difficulty: 'hard', prompt: 'A web app is experiencing UI jank during scroll. How do you profile and optimize performance?' },
  { role: 'Frontend Developer', difficulty: 'hard', prompt: 'How would you architect a scalable micro-frontend architecture for a large team?' },

  // Backend
  { role: 'Backend Developer', difficulty: 'easy', prompt: 'What is the semantic difference between PUT and PATCH in REST APIs?' },
  { role: 'Backend Developer', difficulty: 'easy', prompt: 'What are database indexes, and how do B-tree indexes speed up queries?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'Compare SQL vs NoSQL databases. When would you choose one over the other?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'How would you design an idempotent payment processing endpoint?' },
  { role: 'Backend Developer', difficulty: 'medium', prompt: 'Explain how the Node.js event loop handles non-blocking asynchronous I/O.' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'Design a sliding-window rate limiter for a public API.' },
  { role: 'Backend Developer', difficulty: 'hard', prompt: 'A database query went from 20ms to 3s under peak traffic. How do you troubleshoot it?' },

  // Full Stack
  { role: 'Full Stack Developer', difficulty: 'easy', prompt: 'Walk through what happens in the browser and network from URL entry to page paint.' },
  { role: 'Full Stack Developer', difficulty: 'easy', prompt: 'What are CORS headers, and how do you configure them securely?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'How do you secure a JWT-based authentication flow with HTTP-only cookies and CSRF protection?' },
  { role: 'Full Stack Developer', difficulty: 'medium', prompt: 'Compare WebSockets, Server-Sent Events (SSE), and long-polling for real-time features.' },
  { role: 'Full Stack Developer', difficulty: 'hard', prompt: 'Design a scalable URL shortener service like Bitly with high read-to-write ratio.' },

  // System Design
  { role: 'System Design', difficulty: 'medium', prompt: 'How do CDNs and edge caching improve performance for dynamic web apps?' },
  { role: 'System Design', difficulty: 'hard', prompt: 'Design a distributed rate limiter across multiple microservices with Redis.' },

  // Behavioral
  { role: 'Behavioral', difficulty: 'easy', prompt: 'Describe a project you are proud of and your specific role in building it.' },
  { role: 'Behavioral', difficulty: 'medium', prompt: 'Tell me about a time you disagreed with an architectural decision. How did you resolve it?' },
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log(`Connected to MongoDB: ${MONGODB_URI}`)

    // 1. Seed fallback questions
    for (const q of questions) {
      await Question.updateOne(
        { role: q.role, difficulty: q.difficulty, prompt: q.prompt },
        { $setOnInsert: q },
        { upsert: true }
      )
    }
    console.log(`Fallback questions seeded (${questions.length} total).`)

    // 2. Seed default admin account
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@mockmate.com').trim().toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
    const adminName = process.env.ADMIN_NAME || 'Admin User'

    const existingAdmin = await User.findOne({ email: adminEmail })
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(adminPassword, salt)

    if (!existingAdmin) {
      await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isEmailVerified: true,
        verifiedAt: new Date(),
      })
      console.log(`Admin account created: ${adminEmail}`)
    } else {
      existingAdmin.passwordHash = passwordHash
      existingAdmin.isEmailVerified = true
      await existingAdmin.save()
      console.log(`Admin account updated: ${adminEmail}`)
    }

    console.log('Database seeding completed successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seed()
