import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  ListChecks,
  FileText,
  BarChart3,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Feature cards shown under the hero.
const FEATURES = [
  { icon: Sparkles, title: 'AI-generated questions', text: 'Fresh questions every session, written by Gemini for the exact role you pick.' },
  { icon: ListChecks, title: 'Questions or Quiz', text: 'Answer open-ended, or take an MCQ quiz — including “what’s the output?” code problems.' },
  { icon: FileText, title: 'Resume-tailored', text: 'Upload your CV (PDF) and get questions based on your real experience.' },
  { icon: BarChart3, title: 'Instant scoring', text: 'Every answer graded 0–10 with specific, actionable feedback and an overall score.' },
  { icon: SlidersHorizontal, title: 'Role + experience', text: 'Fresher to 5+ years, easy to hard — the difficulty tunes to your level.' },
  { icon: ShieldCheck, title: 'Secure accounts', text: 'Email OTP verification and password reset built in, so your history stays yours.' },
]

const steps = [
  { n: '01', title: 'Pick a role', text: 'Tell it the job, your experience, and difficulty you’re preparing for.' },
  { n: '02', title: 'Answer or quiz', text: 'Work through open questions, or take a multiple-choice quiz.' },
  { n: '03', title: 'Get scored', text: 'Every answer comes back with a score and a specific note.' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <main className="landing">
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <span className="hero-badge">
          <Sparkles size={14} /> Powered by Google Gemini
        </span>
        <h1>
          Rehearse the questions before they’re <span className="accent">asked for real</span>
        </h1>
        <p className="lead">
          MockMate runs a focused mock interview for the exact role and experience level you’re
          chasing, then grades every answer so you walk in knowing what to sharpen.
        </p>
        <div className="hero-cta">
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Go to dashboard' : 'Start a mock interview'} <ArrowRight size={18} />
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-ghost btn-lg">
              I already have an account
            </Link>
          )}
        </div>
      </motion.section>

      <section className="section-head">
        <h2>Everything you need to prep</h2>
        <p>A focused toolkit — real AI questions, quizzes, and honest feedback in one place.</p>
      </section>
      <section className="features">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-ic">
              <f.icon size={20} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="steps">
        {steps.map((s) => (
          <div className="step" key={s.n}>
            <span className="step-num">{s.n}</span>
            <h3>{s.title}</h3>
            <p className="muted">{s.text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
