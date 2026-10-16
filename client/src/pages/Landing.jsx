import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, ArrowRight, Trophy, CheckCircle2, ShieldCheck, Gauge, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { scrollToSectionId } from '../lib/scrollToSection'
import HeroHUD from '../components/landing/HeroHUD'
import TrackExplorer from '../components/landing/TrackExplorer'
import GlassBentoGrid from '../components/landing/GlassBentoGrid'

const METRICS = [
  { value: '4 Tracks', label: 'Frontend, Backend, System Design, DevOps', icon: Gauge },
  { value: '2 Modes', label: 'Technical Q&A & Speed Drills', icon: CheckCircle2 },
  { value: 'Resume Match', label: 'Questions Tailored to Your Stack', icon: Zap },
  { value: 'Shareable', label: 'Verified Milestone Certificates', icon: Award }
]

const PIPELINE_STEPS = [
  { step: '01', title: 'Pick Track or Upload Resume', desc: 'Choose Frontend, Backend, System Design, or upload your PDF resume to generate tailored interview questions.' },
  { step: '02', title: 'Practice Interactive Sessions', desc: 'Answer coding and system architecture scenarios under realistic conditions with instant AI rubric evaluation.' },
  { step: '03', title: 'Track Progress & Share Certificates', desc: 'Review detailed scoring breakdowns, bookmark weak areas, and share verified certificates on your resume or LinkedIn.' }
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
      {/* Hero Section */}
      <section className="container reflect-hero-stage" id="overview">
        <div className="reflect-hero-inner">
          <div className="reflect-badge" style={{ marginBottom: '1rem' }}>
            <span className="reflect-badge-text">Interactive AI Technical Interviews</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            maxWidth: '22ch',
            margin: '0 auto 1rem',
            color: '#f0f6fc'
          }}>
            Master Technical Interviews with MockMate
          </h1>

          <p style={{
            color: '#8b949e',
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            maxWidth: '54ch',
            margin: '0 auto 1.75rem',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Practice real technical interviews with AI and get instant feedback on your design and coding skills.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 3 }}>
            <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.7rem 1.6rem', fontSize: '0.9rem' }}>
              <Zap size={15} /> Start Free Practice <ArrowRight size={15} />
            </Link>
            <Link to="/leaderboard" className="reflect-btn-secondary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}>
              <Trophy size={15} /> View Leaderboard
            </Link>
          </div>

          {/* Interactive Live Simulation Preview — Product Front & Center */}
          <div style={{ position: 'relative', zIndex: 2, margin: '1rem auto 2.5rem' }}>
            <HeroHUD />
          </div>
        </div>
      </section>

      {/* Subtle Divider */}
      <div className="container"><hr className="reflect-gridline-h" style={{ margin: '1.5rem 0 2.5rem' }} /></div>

      {/* Metric Telemetry Ribbon */}
      <section className="container" style={{ padding: '0 0 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {METRICS.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={i} className="reflect-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(88, 166, 255, 0.1)', border: '1px solid rgba(88, 166, 255, 0.25)', display: 'grid', placeItems: 'center', color: '#58a6ff', flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#f0f6fc' }}>{m.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8b949e' }}>{m.label}</div>
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
            <span className="reflect-badge-text">Curricula</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 600, letterSpacing: '-0.025em', margin: '0.5rem 0', color: '#f0f6fc' }}>
            Targeted Technical Tracks
          </h2>
          <p style={{ maxWidth: '52ch', margin: '0 auto', fontSize: '0.95rem', color: '#8b949e', lineHeight: 1.55 }}>
            Choose a track to inspect real interview prompts, evaluation rubrics, and trade-offs.
          </p>
        </div>
        <TrackExplorer user={user} />
      </section>

      {/* Subtle Divider */}
      <div className="container"><hr className="reflect-gridline-h" /></div>

      {/* Bento Grid: Platform Capabilities */}
      <section className="container" id="benefits" style={{ padding: '3.5rem 0', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="reflect-badge" style={{ marginBottom: '0.75rem' }}>
            <span className="reflect-badge-text">Capabilities</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 600, letterSpacing: '-0.025em', margin: '0.5rem 0', color: '#f0f6fc' }}>
            Everything You Need to Clear Technical Rounds
          </h2>
          <p style={{ maxWidth: '54ch', margin: '0 auto', fontSize: '0.95rem', color: '#8b949e', lineHeight: 1.55 }}>
            From targeted resume parsing to real-time rubric breakdowns and shareable credentials.
          </p>
        </div>
        <GlassBentoGrid />
      </section>

      {/* 3-Step Execution Pipeline */}
      <section className="container" id="how-it-works" style={{ padding: '3.5rem 0 5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="reflect-badge" style={{ marginBottom: '0.75rem' }}>
            <span className="reflect-badge-text">Workflow</span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 600, letterSpacing: '-0.025em', margin: '0.5rem 0', color: '#f0f6fc' }}>
            How MockMate Works
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
          {PIPELINE_STEPS.map((s) => (
            <div key={s.step} className="reflect-card" style={{ padding: '1.75rem' }}>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#58a6ff', marginBottom: '0.65rem' }}>{s.step}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.45rem', color: '#f0f6fc' }}>{s.title}</h3>
              <p style={{ fontSize: '0.86rem', lineHeight: '1.6', margin: 0, color: '#8b949e' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Conversion Banner */}
      <section className="container" style={{ paddingBottom: '6rem', position: 'relative', zIndex: 1 }}>
        <div className="reflect-card" style={{ maxWidth: '840px', margin: '0 auto', padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem', color: '#38bdf8' }}>
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.025em', marginBottom: '0.75rem', color: '#f0f6fc' }}>
            Ready to Practice Your Next Technical Interview?
          </h2>
          <p style={{ maxWidth: '52ch', margin: '0 auto 2rem', fontSize: '0.96rem', lineHeight: 1.6, color: '#8b949e' }}>
            Practice realistic system design and engineering scenarios with instant AI feedback and shareable certificates.
          </p>
          <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.8rem 2.2rem', fontSize: '0.92rem' }}>
            <Zap size={16} /> {user ? 'Go to Dashboard' : 'Get Started for Free'} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
