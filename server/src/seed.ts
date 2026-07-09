import './config/env'
import mongoose from 'mongoose'
import Question from './models/Question'

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

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log(`Connected: ${MONGODB_URI}`)

  await Question.deleteMany({})
  const inserted = await Question.insertMany(questions)
  console.log(`Seeded ${inserted.length} interview questions.`)

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(async (err) => {
  console.error('Seed failed:', err)
  process.exitCode = 1
  await mongoose.disconnect()
})
