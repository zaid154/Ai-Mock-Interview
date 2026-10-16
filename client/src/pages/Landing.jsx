import { Link } from 'react-router-dom'
import { ArrowRight, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TRACKS = [
  {
    title: 'Frontend Engineering',
    desc: 'React architecture, state management, rendering performance, web standards, and modern JavaScript / TypeScript.'
  },
  {
    title: 'Backend Architecture',
    desc: 'API design, database schemas, query optimization, caching strategies, concurrency, and microservice patterns.'
  },
  {
    title: 'Fullstack & MERN',
    desc: 'End-to-end application architecture, client-server data flow, authentication, session security, and state synchronization.'
  },
  {
    title: 'System Design',
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
    desc: 'Answer technical questions with voice or text, write code in the integrated editor, and handle realistic interviewer curveballs.'
  },
  {
    title: 'Get instant rubric evaluation & credentials',
    desc: 'Review actionable scores across architecture, edge cases, and trade-offs. Earn verifiable milestone certificates for your LinkedIn and resume.'
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
            <Link to="/leaderboard" className="landing-btn-link">
              <Trophy size={15} />
              <span>Leaderboard</span>
            </Link>
          </div>
        </header>

        <hr className="landing-divider" />

        {/* Tracks List (No Cards, Clean Editorial Layout) */}
        <section className="landing-block">
          <h2 className="landing-block-title">Engineering Tracks</h2>
          <div className="landing-list">
            {TRACKS.map((t) => (
              <div key={t.title} className="landing-list-item">
                <div className="landing-item-title">{t.title}</div>
                <p className="landing-item-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="landing-divider" />

        {/* Workflow (No Cards, Clean Ordered Layout) */}
        <section className="landing-block">
          <h2 className="landing-block-title">How It Works</h2>
          <div className="landing-list">
            {STEPS.map((s, idx) => (
              <div key={s.title} className="landing-step-row">
                <span className="landing-step-index">{`0${idx + 1}`}</span>
                <div className="landing-list-item">
                  <div className="landing-item-title">{s.title}</div>
                  <p className="landing-item-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Callout (No Cards, Clean Text) */}
        <footer className="landing-final">
          <p className="landing-final-text">
            Free to use in browser • No credit card required
          </p>
          <Link to={user ? '/dashboard' : '/register'} className="landing-btn-start">
            <span>{user ? 'Open Dashboard' : 'Get Started'}</span>
            <ArrowRight size={15} />
          </Link>
        </footer>
      </main>
    </div>
  )
}
