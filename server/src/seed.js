require('./config/env')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/userModel')
const Question = require('./models/questionModel')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mockmate'

const questions = [
  // Frontend Engineering
  {
    role: 'Frontend Developer',
    difficulty: 'easy',
    prompt: 'In JavaScript, explain how closure scope is preserved in asynchronous event callbacks, and what memory leak risks arise if event listeners on DOM elements are not unbound.',
  },
  {
    role: 'Frontend Developer',
    difficulty: 'easy',
    prompt: 'Explain the browser rendering pipeline (Layout, Paint, Composite). Which CSS properties trigger layout recalculation (reflow), and which only trigger compositing?',
  },
  {
    role: 'Frontend Developer',
    difficulty: 'medium',
    prompt: 'In a React 18 dashboard rendering a live table of 10,000 rows, users report UI lag during input typing. How do you implement virtualization, transition hooks (useTransition), and memoization to keep the main thread responsive?',
  },
  {
    role: 'Frontend Developer',
    difficulty: 'medium',
    prompt: 'Explain the hydration mismatch issue in Next.js or server-rendered React applications. How does the client reconcile server-rendered HTML with client state, and how do you debug hydration errors?',
  },
  {
    role: 'Frontend Developer',
    difficulty: 'hard',
    prompt: 'A production React single-page app shows monotonically increasing memory usage in Chrome DevTools over a 30-minute session. Walk through your step-by-step diagnostic workflow using Heap Snapshots to identify detached DOM nodes.',
  },
  {
    role: 'Frontend Developer',
    difficulty: 'hard',
    prompt: 'Design a resilient micro-frontend architecture for an enterprise portal where Team A deploys React and Team B deploys Vue. How do you isolate styles, share authentication state, and handle cross-app client routing?',
  },

  // Backend Systems
  {
    role: 'Backend Developer',
    difficulty: 'easy',
    prompt: 'In RESTful API design, compare the idempotency guarantees of PUT, POST, and PATCH. Why is PUT required to be idempotent while PATCH is not strictly guaranteed to be?',
  },
  {
    role: 'Backend Developer',
    difficulty: 'easy',
    prompt: 'How do B-tree indexes improve database read performance, and what are the exact write amplification trade-offs on high-frequency INSERT workloads?',
  },
  {
    role: 'Backend Developer',
    difficulty: 'medium',
    prompt: 'Explain the Node.js event loop phases (Timers, Pending Callbacks, Poll, Check, Close). What happens when a CPU-intensive cryptographic calculation blocks the Poll phase, and how do you offload it using Worker Threads?',
  },
  {
    role: 'Backend Developer',
    difficulty: 'medium',
    prompt: 'Design an idempotent payment webhook receiver in Express.js that receives duplicated charge notifications from Stripe. How do you ensure exactly-once database writes using Redis distributed locks and unique constraint idempotency keys?',
  },
  {
    role: 'Backend Developer',
    difficulty: 'hard',
    prompt: 'A PostgreSQL query latency suddenly regressed from 25ms to 3.5s under peak load. Walk through how you interpret an EXPLAIN (ANALYZE, BUFFERS) execution plan, identify sequential scans, and remediate using compound indexes.',
  },
  {
    role: 'Backend Developer',
    difficulty: 'hard',
    prompt: 'How would you design a distributed sliding-window rate limiter in Node.js using Redis sorted sets (ZSET)? Explain how you prevent race conditions between checking window limits and adding timestamps.',
  },

  // Full Stack Systems
  {
    role: 'Full Stack Developer',
    difficulty: 'easy',
    prompt: 'Trace the complete lifecycle of an HTTPS request from the browser address bar to page rendering, detailing DNS resolution, TCP handshake, TLS 1.3 negotiation, and HTTP/2 multiplexing.',
  },
  {
    role: 'Full Stack Developer',
    difficulty: 'easy',
    prompt: 'Explain Cross-Origin Resource Sharing (CORS). What conditions trigger a CORS preflight OPTIONS request, and how do you securely configure headers for an API with authenticated credentials?',
  },
  {
    role: 'Full Stack Developer',
    difficulty: 'medium',
    prompt: 'Architect a secure JWT authentication pipeline with short-lived access tokens (15 mins) and long-lived refresh tokens (7 days). How do you store them securely against XSS/CSRF and implement immediate token revocation using Redis deny-lists?',
  },
  {
    role: 'Full Stack Developer',
    difficulty: 'medium',
    prompt: 'Compare WebSockets vs. Server-Sent Events (SSE) for a real-time trading price dashboard. Which protocol offers better automatic reconnection, proxy traversal, and throughput characteristics?',
  },
  {
    role: 'Full Stack Developer',
    difficulty: 'hard',
    prompt: 'Design a scalable URL shortener service (like Bitly) handling 100M daily writes and 1B daily reads. Detail your database partitioning key, base62 encoding vs hash collisions, and multi-tier cache eviction strategy.',
  },

  // System Design & Architecture
  {
    role: 'System Design',
    difficulty: 'medium',
    prompt: 'Compare Cache-Aside, Write-Through, and Write-Behind caching patterns with Redis. What strategies prevent cache stampede (thundering herd) and cache penetration when hot keys expire?',
  },
  {
    role: 'System Design',
    difficulty: 'hard',
    prompt: 'Design a distributed task scheduler (like BullMQ/Celery) that guarantees at-least-once execution across 50 worker pods. How do you handle worker crashes mid-task, leader election for cron triggers, and partition tolerance?',
  },

  // Behavioral & Engineering Leadership
  {
    role: 'Behavioral',
    difficulty: 'easy',
    prompt: 'Describe an engineering project where you had to evaluate trade-offs between delivery speed and technical debt. How did you prioritize what to ship versus what to refactor?',
  },
  {
    role: 'Behavioral',
    difficulty: 'medium',
    prompt: 'Describe a technical disagreement you had with a senior team member regarding architectural choices (e.g., microservices vs monolith, or SQL vs NoSQL). How did you evaluate trade-offs objectively to reach consensus?',
  },
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
