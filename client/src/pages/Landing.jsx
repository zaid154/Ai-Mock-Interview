import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Brain,
  Code2,
  Trophy,
  Award,
  FileText,
  BarChart3,
  ShieldCheck,
  Play,
  Terminal,
  Cpu,
  Layers,
  Star,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const SAMPLE_ROLES = [
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    topic: 'React & Web Performance',
    question: 'How does React Virtual DOM reconciliation work under the hood, and what are key techniques to prevent unnecessary re-renders in large component trees?',
    sampleAnswer: 'React uses a fiber architecture with a 2-phase reconciliation process (Render & Commit). We optimize using React.memo, useMemo, useCallback, and atomic state design.',
    score: 9.2,
    badge: 'Senior Level',
  },
  {
    id: 'backend',
    title: 'Backend Architect',
    topic: 'Node.js & Distributed Systems',
    question: 'Explain how event loop lag occurs in Node.js, and how would you design a rate limiter using Redis token bucket algorithm for multi-node deployments?',
    sampleAnswer: 'Event loop lag happens when CPU-bound tasks block the main thread. A Redis sliding window/token bucket script using atomic Lua guarantees node concurrency.',
    score: 9.5,
    badge: 'Staff Level',
  },
  {
    id: 'system-design',
    title: 'System Design',
    topic: 'Scalability & Storage',
    question: 'Design a globally distributed URL shortener handling 100M active requests daily with sub-10ms read latency and 99.999% availability.',
    sampleAnswer: 'Leverage a Base62 encoding algorithm with pre-allocated key ranges, multi-region CDN caching, and Cassandra/DynamoDB for horizontal scale.',
    score: 9.0,
    badge: 'Principal Level',
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    topic: 'Kubernetes & CI/CD',
    question: 'How do you implement Zero-Downtime Canary Deployments with Istio service mesh and automated Prometheus rollback metrics?',
    sampleAnswer: 'Use Istio VirtualServices to route 5% traffic to canary pods, monitoring HTTP 5xx error rate thresholds before automated promotion.',
    score: 9.4,
    badge: 'Lead Level',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState(SAMPLE_ROLES[0])

  return (
    <div>
      {/* Hero Section */}
      <section className="container" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
        <div className="hero">
          <div
            className="badge-glow"
            style={{
              margin: '0 auto 1.25rem',
              padding: '0.4rem 1.1rem',
              fontSize: '0.82rem',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Technical Mock Interview Platform</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)', marginBottom: '1.2rem', lineHeight: 1.15 }}>
            Ace your engineering interviews with <br />
            <span className="gradient-text">Real-Time AI Feedback</span>
          </h1>

          <p className="lead" style={{ margin: '0 auto 2.2rem', fontSize: '1.1rem', maxWidth: '58ch' }}>
            Practice role-specific mock interviews tailored to your target position and resume. Get line-by-line code evaluation,
            instant scoring, and official verified certificates.
          </p>

          <div className="hero-cta">
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
              <Zap size={18} /> {user ? 'Go to Workbench' : 'Start Practice Free'} <ArrowRight size={18} />
            </Link>
            <Link to={user ? '/leaderboard' : '/login'} className="btn btn-secondary btn-lg">
              <Trophy size={18} /> Community Standings
            </Link>
          </div>

          <div className="hero-proof" style={{ marginTop: '2rem' }}>
            <span><CheckCircle2 size={15} style={{ color: 'var(--good)' }} /> Instant Line-by-Line AI Scoring</span>
            <span><CheckCircle2 size={15} style={{ color: 'var(--good)' }} /> Resume PDF Parsing</span>
            <span><CheckCircle2 size={15} style={{ color: 'var(--good)' }} /> Official Certificate Verification</span>
          </div>
        </div>

        {/* Live Interactive Preview HUD */}
        <div className="hero-preview-hud">
          <div className="hud-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="hud-dots">
                <span className="hud-dot red" />
                <span className="hud-dot yellow" />
                <span className="hud-dot green" />
              </div>
              <span className="mono subtle" style={{ fontSize: '0.8rem' }}>
                mockmate://interactive-simulation
              </span>
            </div>
            <span className="tag" style={{ fontSize: '0.68rem' }}>
              <Terminal size={12} /> Interactive Simulator
            </span>
          </div>

          {/* Role Tabs Selector */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border-soft)',
              display: 'flex',
              gap: '0.6rem',
              overflowX: 'auto',
            }}
          >
            {SAMPLE_ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`btn btn-sm ${selectedRole.id === role.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '999px', fontSize: '0.82rem' }}
              >
                {role.title}
              </button>
            ))}
          </div>

          <div className="hud-body">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span className="tag">{selectedRole.title}</span>
                <span className="tag-soft">{selectedRole.badge}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', lineHeight: '1.45', marginBottom: '0.9rem' }}>
                {selectedRole.question}
              </h3>
              
              <div
                style={{
                  padding: '1rem 1.1rem',
                  background: 'var(--surface-2)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="muted mono small" style={{ marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                  Candidate Response Analysis:
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.55' }}>
                  "{selectedRole.sampleAnswer}"
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.9rem',
                background: 'var(--surface-2)',
                padding: '1.25rem 1.35rem',
                borderRadius: '14px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div className="score-chip" style={{ fontSize: '1rem', padding: '0.35rem 0.95rem', margin: '0 auto 0.4rem' }}>
                  <Star size={15} fill="var(--good)" /> {selectedRole.score} / 10 Score
                </div>
                <p className="muted small" style={{ margin: 0, fontSize: '0.78rem' }}>
                  Evaluated across Technical Depth &amp; Trade-offs.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="muted">Technical Accuracy</span>
                  <span className="mono" style={{ color: 'var(--good)', fontWeight: 700 }}>96%</span>
                </div>
                <div className="progress-track" style={{ height: '5px', margin: 0 }}>
                  <div className="progress-fill" style={{ width: '96%' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span className="muted">Communication Clarity</span>
                  <span className="mono" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>92%</span>
                </div>
                <div className="progress-track" style={{ height: '5px', margin: 0 }}>
                  <div className="progress-fill" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Spotlights */}
      <section style={{ padding: '4rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 2.5rem' }}>
            <span className="tag" style={{ marginBottom: '0.5rem' }}>Engineered for Growth</span>
            <h2>Why Top Developers Practice on MockMate</h2>
            <p>Built with Google Gemini AI to simulate high-stakes engineering interviews at leading tech companies.</p>
          </div>

          <div className="features-grid">
            <div className="panel feature-card">
              <div className="feature-icon-box">
                <Brain size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Dynamic AI Context Engine</h3>
              <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
                Our Gemini AI engine crafts non-generic, deep-dive technical questions mapped precisely to your target role and resume context.
              </p>
            </div>

            <div className="panel feature-card">
              <div className="feature-icon-box">
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Resume PDF Parser</h3>
              <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
                Upload your resume PDF to extract key tech stacks, project achievements, and experience levels for hyper-personalized interview sessions.
              </p>
            </div>

            <div className="panel feature-card">
              <div className="feature-icon-box">
                <BarChart3 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Line-by-Line Feedback &amp; Charts</h3>
              <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
                Review detailed question-by-question breakdown charts, score donut gauges, actionable takeaways, and personal revision bookmarks.
              </p>
            </div>

            <div className="panel feature-card">
              <div className="feature-icon-box">
                <Award size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Verified Credential Certificates</h3>
              <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
                Earn official, verifiable certificate credentials upon achieving milestone interview practice scores to showcase on LinkedIn.
              </p>
            </div>

            <div className="panel feature-card">
              <div className="feature-icon-box">
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Q&amp;A &amp; MCQ Quiz Formats</h3>
              <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
                Switch seamlessly between open-ended technical Q&amp;A interview simulations and fast-paced multiple-choice technical quizzes.
              </p>
            </div>

            <div className="panel feature-card">
              <div className="feature-icon-box">
                <Trophy size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Community Standings Podium</h3>
              <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
                Compare candidate performance on community leaderboard podiums and track your rank among engineering peers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Roadmap */}
      <section className="container" style={{ padding: '4.5rem 0' }}>
        <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 2.5rem' }}>
          <span className="tag" style={{ marginBottom: '0.5rem' }}>Simple 3-Step Workflow</span>
          <h2>How MockMate AI Works</h2>
          <p>From setup to verified certificate in under 15 minutes.</p>
        </div>

        <div className="steps-grid">
          <div className="panel step-card">
            <div className="step-badge">01</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Configure Session &amp; Resume</h3>
            <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
              Select target role (Frontend, Backend, DevOps, System Design), difficulty level, timer duration, or upload your resume PDF.
            </p>
          </div>

          <div className="panel step-card">
            <div className="step-badge">02</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Complete Focus HUD Interview</h3>
            <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
              Answer AI-generated questions in a distraction-free HUD interface with live countdown timer, code syntax highlighting, and candidate scratchpad.
            </p>
          </div>

          <div className="panel step-card">
            <div className="step-badge">03</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Review Analytics &amp; Certificate</h3>
            <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.55', margin: 0 }}>
              Get instant scoring breakdown, save key questions to your revision bookmarks bank, and download your official verified certificate.
            </p>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div
          className="panel"
          style={{
            marginTop: '4rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            background: 'var(--accent-grad-subtle)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>Ready to Elevate Your Interview Performance?</h2>
          <p className="muted" style={{ maxWidth: '54ch', margin: '0 auto 1.8rem', fontSize: '1rem' }}>
            Join thousands of software engineers practicing daily with AI-powered mock sessions.
          </p>
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
            <Sparkles size={18} /> {user ? 'Launch Dashboard Workbench' : 'Create Free Account Now'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
