import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const steps = [
  { n: '01', title: 'Pick a role', text: 'Tell it the job and difficulty you’re preparing for.' },
  { n: '02', title: 'Answer out loud', text: 'Work through the questions one at a time, at your own pace.' },
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
        <p className="kicker">Interview prep, minus the awkward mock call</p>
        <h1>
          Rehearse the questions before they’re <span className="accent">asked for real</span>
        </h1>
        <p className="lead">
          MockMate runs a focused mock interview for the exact role you’re chasing, then grades
          every answer so you walk in knowing what to sharpen.
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
