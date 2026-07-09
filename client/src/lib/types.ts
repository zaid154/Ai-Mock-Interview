export type Difficulty = 'easy' | 'medium' | 'hard'

export interface User {
  id: string
  name: string
  email: string
}

export interface InterviewQuestion {
  prompt: string
  answer: string
  score: number
  feedback: string
}

export interface Interview {
  _id: string
  role: string
  difficulty: Difficulty
  status: 'in_progress' | 'completed'
  questions: InterviewQuestion[]
  overallScore: number
  summary: string
  createdAt: string
}

// List endpoint returns a trimmed version without the questions array.
export type InterviewSummary = Pick<
  Interview,
  '_id' | 'role' | 'difficulty' | 'status' | 'overallScore' | 'createdAt'
>
