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
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: Sparkles, title: 'AI-generated questions', text: 'Every session gives you fresh questions — no repeats, tailored to the exact role you picked.' },
  { icon: ListChecks, title: 'Questions & quizzes', text: 'Open-ended answers or timed MCQs, including "what\'s the output?" code puzzles.' },
  { icon: FileText, title: 'Resume-aware prep', text: 'Drop your CV as a PDF. The AI reads it and asks questions about your actual experience.' },
  { icon: BarChart3, title: 'Scored feedback', text: 'Each answer gets a 0–10 score with line-by-line notes on what to fix.' },
  { icon: SlidersHorizontal, title: 'Dial your level', text: 'Fresher or 5+ years? Easy or hard? You set it, and the questions follow.' },
  { icon: ShieldCheck, title: 'Your data, secured', text: 'Email verification, OTP login, encrypted sessions — your prep history stays private.' },
]

const steps = [
  { n: '1', title: 'Choose your interview', text: 'Pick the job role, your experience level, and how hard you want it.' },
  { n: '2', title: 'Answer the questions', text: 'Type out answers or take a multiple-choice quiz — your call.' },
  { n: '3', title: 'Review your scores', text: 'Get a score and specific feedback for every single answer.' },
]

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function Landing() {
  const { user } = useAuth()

  return (
    <main className="landing">
      {/* ── Hero ── */}
      <motion.section
        className="hero"
        initial="hidden"
        animate="show"
        variants={fade}
        transition={{ duration: 0.4 }}
      >
        <span className="hero-badge">
          <Sparkles size={13} /> Powered by Google Gemini
        </span>
        <h1>
          Stop guessing.<br />
          <span className="accent">Start rehearsing.</span>
        </h1>
        <p className="lead">
          MockMate gives you a real mock interview for any tech role — AI-generated
          questions, instant grading, and feedback you can actually use.
        </p>
        <div className="hero-cta">
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
            {user ? 'Go to dashboard' : 'Get started free'} <ArrowRight size={18} />
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-ghost btn-lg">
              Sign in
            </Link>
          )}
        </div>
        <div className="hero-proof">
          <CheckCircle2 size={15} /> No credit card needed
          <span className="dot">·</span>
          <CheckCircle2 size={15} /> Free forever tier
        </div>
      </motion.section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="section-head">
          <h2>Everything you need to prep</h2>
          <p>One place for questions, quizzes, and honest feedback.</p>
        </div>

        <div className="features">
          {FEATURES.map((f, i) => (
            <motion.div
              className="feature-card"
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fade}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <div className="feature-ic">
                <f.icon size={22} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <div className="section-head">
          <h2>Three steps. That's it.</h2>
          <p>No setup, no config files, no boilerplate.</p>
        </div>

        <div className="steps">
          {steps.map((s, i) => (
            <motion.div
              className="step"
              key={s.n}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={fade}
              transition={{ duration: 0.35, delay: i * 0.1 }}
            >
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <motion.section
        className="bottom-cta"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fade}
        transition={{ duration: 0.4 }}
      >
        <h2>Ready to practice?</h2>
        <p className="muted">Start a mock interview in under 30 seconds. For free.</p>
        <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
          {user ? 'Open dashboard' : 'Create free account'} <ArrowRight size={18} />
        </Link>
      </motion.section>
    </main>
  )
}
