import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, ArrowRight, Trophy, CheckCircle2, ShieldCheck, Gauge, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { scrollToSectionId } from '../lib/scrollToSection'
import HeroHUD from '../components/landing/HeroHUD'
import TrackExplorer from '../components/landing/TrackExplorer'
import GlassBentoGrid from '../components/landing/GlassBentoGrid'

const METRICS = [
  { value: '4 Tracks', label: 'Frontend, Backend, System Design, Cloud', icon: Gauge },
  { value: '2 Modes', label: 'Technical Q&A & Speed MCQ Drills', icon: CheckCircle2 },
  { value: 'Contextual', label: 'PDF Resume-Tailored Questions', icon: Zap },
  { value: 'SHA-256', label: 'Verifiable Milestone Diplomas', icon: Award }
]

const PIPELINE_STEPS = [
  { step: '01', title: 'Pick Track or Upload Resume', desc: 'Choose Full Stack, Distributed Systems, or upload your PDF resume to generate role-targeted interview scenarios.' },
  { step: '02', title: 'Complete Interactive Session', desc: 'Answer technical scenario questions and receive structured feedback on system design and algorithmic trade-offs.' },
  { step: '03', title: 'Milestone Certification', desc: 'Track your score progression over time, review revision notes, and unlock verifiable SHA-256 certificates.' }
]

export default function Landing() {
  const { user } = useAuth()
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const timer = setTimeout(() => scrollToSectionId(id, { smooth: false }), 100)
    return () => clearTimeout(timer)
  }, [hash])

  return (
    <div className="reflect-canvas" style={{ minHeight: '100dvh' }}>
      <div className="reflect-ambient-glow" />

      {/* Hero Section with Product-First Interactive Simulation Preview */}
      <section className="container reflect-hero-stage" id="overview">
        <div className="reflect-hero-inner">
          <h1 style={{
            fontSize: 'clamp(2.1rem, 4.4vw, 3.6rem)',
            fontWeight: 600,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            maxWidth: '22ch',
            margin: '0 auto 0.75rem',
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.78) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Master Technical Interviews with MockMate
          </h1>

          <p style={{
            color: 'rgba(239, 237, 253, 0.75)',
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            maxWidth: '52ch',
            margin: '0 auto 1.5rem',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Real-time AI evaluation, distributed systems critique, and verified diplomas.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 3 }}>
            <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.65rem 1.6rem', fontSize: '0.88rem' }}>
              <Zap size={15} /> Start Free Session <ArrowRight size={15} />
            </Link>
            <Link to="/leaderboard" className="reflect-btn-secondary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}>
              <Trophy size={15} /> Global Standings
            </Link>
          </div>

          {/* Interactive Live Simulation Preview — Product Front & Center */}
          <div style={{ position: 'relative', zIndex: 2, margin: '1rem auto 2.5rem' }}>
            <HeroHUD />
          </div>
        </div>
      </section>

      {/* Reflect Divider */}
      <div className="container"><hr className="reflect-gridline-h" style={{ margin: '1rem 0 2rem' }} /></div>

      {/* Metric Telemetry Ribbon */}
      <section className="container" style={{ padding: '1rem 0 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {METRICS.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={i} className="reflect-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'grid', placeItems: 'center', color: '#c084fc', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#f8fafc' }}>{m.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(239, 237, 253, 0.6)' }}>{m.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Interactive Track Explorer */}
      <section className="container" id="specifications" style={{ padding: '3.5rem 0', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="reflect-badge" style={{ marginBottom: '0.75rem' }}>
            <span className="reflect-badge-text">Production Curricula</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '-0.025em', margin: '0.5rem 0', background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Realistic Production Scenarios
          </h2>
          <p style={{ maxWidth: '52ch', margin: '0 auto', fontSize: '0.95rem', color: 'rgba(239, 237, 253, 0.7)' }}>
            Choose a specialization to inspect real interview prompts, architectural trade-offs, and evaluation criteria.
          </p>
        </div>
        <TrackExplorer user={user} />
      </section>

      {/* Reflect Divider */}
      <div className="container"><hr className="reflect-gridline-h" /></div>

      {/* Bento Grid: Diagnostic Telemetry */}
      <section className="container" id="benefits" style={{ padding: '3.5rem 0', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="reflect-badge" style={{ marginBottom: '0.75rem' }}>
            <span className="reflect-badge-text">Platform Capabilities</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '-0.025em', margin: '0.5rem 0', background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Engineered for Practice Depth
          </h2>
          <p style={{ maxWidth: '54ch', margin: '0 auto', fontSize: '0.95rem', color: 'rgba(239, 237, 253, 0.7)' }}>
            Resume context parsing, algorithmic reasoning checks, and cryptographically verifiable credentials.
          </p>
        </div>
        <GlassBentoGrid />
      </section>

      {/* 3-Step Execution Pipeline */}
      <section className="container" id="how-it-works" style={{ padding: '3.5rem 0 5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="reflect-badge" style={{ marginBottom: '0.75rem' }}>
            <span className="reflect-badge-text">Getting Started</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 600, letterSpacing: '-0.025em', margin: '0.5rem 0', background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            How It Works
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
          {PIPELINE_STEPS.map((s) => (
            <div key={s.step} className="reflect-card" style={{ padding: '1.75rem' }}>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e59cff', marginBottom: '0.75rem' }}>{s.step}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f8fafc' }}>{s.title}</h3>
              <p style={{ fontSize: '0.88rem', lineHeight: '1.6', margin: 0, color: 'rgba(239, 237, 253, 0.7)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Conversion Banner */}
      <section className="container" style={{ paddingBottom: '6rem', position: 'relative', zIndex: 1 }}>
        <div className="reflect-showcase-outer" style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div className="reflect-starlight-h" style={{ top: '-1px', left: '30%' }} />
          <div className="reflect-showcase-inner" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.35)', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem', color: '#e59cff' }}>
              <ShieldCheck size={26} />
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.75rem', color: '#f8fafc' }}>
              Ready to Practice Your Next Interview?
            </h2>
            <p style={{ maxWidth: '52ch', margin: '0 auto 2rem', fontSize: '1rem', lineHeight: 1.6, color: 'rgba(239, 237, 253, 0.72)' }}>
              Practice realistic system design and engineering scenarios with structured AI feedback and verifiable diplomas.
            </p>
            <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
              <Zap size={18} /> {user ? 'Go to Dashboard' : 'Get Started for Free'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
