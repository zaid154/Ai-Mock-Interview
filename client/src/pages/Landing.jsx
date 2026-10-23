import { Link } from 'react-router-dom'
import { ArrowRight, Code2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TRACKS = [
  {
    role: 'Frontend Engineering',
    desc: 'React 18 concurrency, rendering lifecycles, DOM event loop, CSS layout engines, web performance, and state machines.'
  },
  {
    role: 'Backend Architecture',
    desc: 'Node.js event loop, asynchronous I/O, relational indexing vs. NoSQL document modeling, idempotent APIs, and caching.'
  },
  {
    role: 'Fullstack & MERN',
    desc: 'End-to-end data flow, React-Express synchronization, schema validation, optimistic UI updates, and token authentication.'
  },
  {
    role: 'System Design & Scalability',
    desc: 'High-scale distributed systems, throughput vs. latency, caching layers, message queues, and horizontal partitioning.'
  }
]

const STEPS = [
  {
    title: 'Select a track or ingest your resume',
    desc: 'Choose an engineering domain or upload your PDF resume to calibrate interview questions against your actual tech stack.'
  },
  {
    title: 'Practice conversational technical rounds',
    desc: 'Answer technical questions with voice or text, walk through system trade-offs, and handle realistic interviewer follow-ups.'
  },
  {
    title: 'Get instant rubric evaluation',
    desc: 'Review actionable scores across technical depth, system architecture, and communication clarity. Bookmark tricky questions for quick revision.'
  }
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing-page">
      <main className="landing-content">
        {/* Intro */}
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 className="landing-headline">
            Practice technical interviews with AI.
          </h1>
          <p className="landing-lead">
            Simulate realistic frontend, backend, and distributed systems interviews. Get instant rubric-based evaluation on your code, trade-offs, and architecture.
          </p>

          <div className="landing-actions">
            <Link to={user ? '/dashboard' : '/register'} className="landing-btn-start">
              <span>{user ? 'Go to Dashboard' : 'Start Practicing Free'}</span>
              <ArrowRight size={16} />
            </Link>
            <Link to={user ? '/practice' : '/login'} className="landing-btn-link">
              <Code2 size={15} />
              <span>Explore Tracks</span>
            </Link>
          </div>
        </header>

        <hr className="landing-divider" />

        {/* Tracks List */}
        <section className="landing-block">
          <h2 className="landing-block-title">Engineering Tracks</h2>
          <div className="landing-track-list">
            {TRACKS.map((track) => (
              <div key={track.role} className="landing-track-item">
                <div className="landing-track-name">{track.role}</div>
                <div className="landing-track-desc">{track.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="landing-divider" />

        {/* How it Works */}
        <section className="landing-block">
          <h2 className="landing-block-title">How It Works</h2>
          <div className="landing-step-list">
            {STEPS.map((step, idx) => (
              <div key={step.title} className="landing-step-item">
                <div className="landing-step-num">0{idx + 1}</div>
                <div>
                  <div className="landing-step-title">{step.title}</div>
                  <div className="landing-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="landing-divider" />

        {/* Bottom CTA */}
        <section className="landing-cta-block">
          <h2 className="landing-cta-title">Ready to test your knowledge?</h2>
          <p className="landing-cta-sub">
            Pick a role, start a session, and get calibrated feedback in minutes.
          </p>
          <Link to={user ? '/dashboard' : '/register'} className="landing-btn-start">
            <span>{user ? 'Launch Dashboard' : 'Get Started Free'}</span>
            <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    </div>
  )
}
