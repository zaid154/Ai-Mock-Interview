import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, ArrowRight, Trophy, Terminal, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { scrollToSectionId, goToSection } from '../lib/scrollToSection'
import HeroHUD from '../components/landing/HeroHUD'
import TrackExplorer from '../components/landing/TrackExplorer'
import GlassBentoGrid from '../components/landing/GlassBentoGrid'

const TELEMETRY_STATS = [
  { value: '4 Engineering Tracks', label: 'Frontend • Backend • System Design • DevOps' },
  { value: 'PDF Resume Ingestion', label: 'Matches questions to your actual production stack' },
  { value: 'Multi-Axis Rubrics', label: 'Calibrated against Senior & Staff hiring bars' },
  { value: 'Verifiable Credentials', label: 'Cryptographic public proof for LinkedIn & resume' }
]

const PIPELINE_STEPS = [
  {
    step: '01 // INGEST',
    title: 'Pick Track or Ingest Resume',
    desc: 'Select a target engineering domain or upload your PDF resume to calibrate questions against your real production stack.'
  },
  {
    step: '02 // SIMULATE',
    title: 'Live Conversational Drill',
    desc: 'Answer realistic system design and coding prompts with simultaneous voice dictation, code editor, and interviewer curveballs.'
  },
  {
    step: '03 // AUDIT',
    title: 'Rubric Scoring & Verification',
    desc: 'Inspect detailed scores across architecture, edge cases, and trade-offs. Bookmark weak spots and earn verified certificates.'
  }
]

const QUICK_ROLES = [
  { id: 'backend', label: 'Staff Backend' },
  { id: 'frontend', label: 'Frontend Architect' },
  { id: 'systemDesign', label: 'Distributed Systems' }
]

export default function Landing() {
  const { user } = useAuth()
  const { hash, pathname } = useLocation()
  const [activeRole, setActiveRole] = useState('backend')

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const timer = setTimeout(() => scrollToSectionId(id, { smooth: false }), 100)
    return () => clearTimeout(timer)
  }, [hash])

  function handleScroll(id) {
    goToSection(id, { pathname, navigate: () => {} })
  }

  return (
    <div className="reflect-canvas" style={{ minHeight: '100dvh' }}>
      {/* 1. Asymmetrical Hero Section */}
      <section className="container" id="overview" style={{ paddingBottom: '1rem' }}>
        <div className="saas-hero-stage">
          {/* Left Column: Editorial Headline & Conviction */}
          <div>
            <div className="dev-kicker">
              <span className="dev-kicker-dot" />
              <span className="dev-kicker-active">LIVE EVALUATION ENGINE</span>
              <span style={{ color: '#30363d' }}>|</span>
              <span>v2.4 SIMULATOR</span>
            </div>

            <h1 className="saas-hero-title">
              Technical interviews aren&apos;t LeetCode quizzes.
              <span className="saas-hero-sub">
                Master the architectural trade-offs that actually decide offers.
              </span>
            </h1>

            <p className="saas-hero-desc">
              Practice conversational system design, distributed concurrency, and edge-case mitigation with an AI interviewer calibrated against senior engineering rubrics.
            </p>

            <div className="saas-hero-actions">
              <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                <Zap size={15} /> Start Practice Session <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={() => handleScroll('specifications')}
                className="reflect-btn-secondary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Inspect Curriculum
              </button>
              <Link to="/leaderboard" style={{ fontSize: '0.84rem', color: '#8b949e', marginLeft: '0.25rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Trophy size={14} /> Standings
              </Link>
            </div>

            {/* Quick Interactive Role Selector to Drive the Right Preview */}
            <div className="dev-role-strip">
              <span>Preview track:</span>
              {QUICK_ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRole(r.id)}
                  className={`dev-role-tag ${activeRole === r.id ? 'active' : ''}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Developer Console */}
          <div>
            <HeroHUD activeTrack={activeRole} />
          </div>
        </div>
      </section>

      {/* 2. Integrated Telemetry Matrix (Single continuous strip, no repeated cards) */}
      <section className="container" style={{ padding: 0 }}>
        <div className="dev-telemetry-matrix">
          {TELEMETRY_STATS.map((item, i) => (
            <div key={i} className="dev-telemetry-cell">
              <div className="dev-telemetry-num">{item.value}</div>
              <div className="dev-telemetry-desc">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Curriculum Specifications Section */}
      <section className="container" id="specifications" style={{ padding: '2rem var(--rail-gutter) 4rem' }}>
        <div className="section-editorial">
          <div className="section-mono-kicker">// 01 CURRICULUM SPECIFICATIONS</div>
          <h2 className="section-headline">Targeted Engineering Tracks</h2>
          <p className="section-desc">
            Inspect real interview prompts, follow-up curveballs, and evaluation criteria before you begin.
          </p>
        </div>
        <TrackExplorer user={user} />
      </section>

      {/* 4. Platform Architecture & Deep Dives */}
      <section className="container" id="benefits" style={{ padding: '1rem var(--rail-gutter) 4rem' }}>
        <div className="section-editorial">
          <div className="section-mono-kicker">// 02 PLATFORM ARCHITECTURE</div>
          <h2 className="section-headline">Everything You Need to Clear Technical Rounds</h2>
          <p className="section-desc">
            From targeted resume parsing to real-time rubric breakdowns and shareable credentials.
          </p>
        </div>
        <GlassBentoGrid />
      </section>

      {/* 5. 3-Step Execution Pipeline */}
      <section className="container" id="how-it-works" style={{ padding: '1rem var(--rail-gutter) 5rem' }}>
        <div className="section-editorial">
          <div className="section-mono-kicker">// 03 EXECUTION PIPELINE</div>
          <h2 className="section-headline">How a MockMate Session Runs</h2>
          <p className="section-desc">
            Three disciplined stages from initial ingest to post-interview diagnostic scorecard.
          </p>
        </div>
        <div className="dev-pipeline-strip">
          {PIPELINE_STEPS.map((s) => (
            <div key={s.step} className="dev-pipeline-step">
              <div className="dev-pipeline-num">{s.step}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem', color: '#f0f6fc' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '0.84rem', lineHeight: '1.55', margin: 0, color: '#8b949e' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Terminal Call to Action */}
      <section className="container" style={{ paddingBottom: '6rem' }}>
        <div className="dev-terminal-cta">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '4px', padding: '0.3rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#58a6ff', marginBottom: '1.25rem' }}>
            <Terminal size={14} />
            <span>mockmate start --track=system-design</span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem', color: '#f0f6fc' }}>
            Ready to test your technical reasoning?
          </h2>
          <p style={{ maxWidth: '52ch', margin: '0 auto 1.75rem', fontSize: '0.92rem', lineHeight: 1.6, color: '#8b949e' }}>
            Practice realistic system design and concurrency scenarios with instant rubric feedback and shareable certificates.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
              <Zap size={15} /> {user ? 'Go to Dashboard' : 'Start Free Practice'} <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#6e7681', marginTop: '1rem' }}>
            No credit card required • Instant access in browser
          </div>
        </div>
      </section>
    </div>
  )
}
