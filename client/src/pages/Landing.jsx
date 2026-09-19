import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Zap, Sparkles, ArrowRight, Trophy, Globe, Sliders, TrendingUp, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { scrollToSectionId } from '../lib/scrollToSection'

const ADVANTAGES = [
  { icon: Activity, title: 'Amplify Insights', desc: 'Data-driven candidate evaluation with AI scoring on logic & syntax.' },
  { icon: Globe, title: 'Global Standings', desc: 'Track verified score reports and benchmark your rank worldwide.' },
  { icon: Sliders, title: 'Tailored Modules', desc: 'Practice Frontend, Backend, DevOps, or System Design tracks.' },
  { icon: TrendingUp, title: 'Visual Growth', desc: 'Clear scorecards illustrating your preparation trajectory.' },
]

const PREVIEWS = {
  1: { tag: 'AI Scoring', bg: 'var(--accent-primary)', title: 'Spot Trends in Seconds', desc: 'Evaluates architecture logic, code syntax, and computational complexity.' },
  2: { tag: 'ISO 18004 Verified', bg: 'var(--good)', title: 'Shareable Verification Portal', desc: 'Dynamic QR certificates with unique IDs to showcase on LinkedIn.' },
  3: { tag: 'Resume Match', bg: 'var(--warn)', title: 'Personalized Questions', desc: 'Extracts tech stacks from your resume PDF to craft tailored questions.' },
}

const STEPS = [
  { step: '01', title: 'Pick Role & Level', desc: 'Choose engineering track, difficulty, or upload your resume PDF.' },
  { step: '02', title: 'Live HUD Session', desc: 'Answer questions in a focused interface with voice, text & timer.' },
  { step: '03', title: 'Get Certified', desc: 'Review AI scorecard, save questions, and download verified certificates.' },
]

/**
 * Landing Page: High-conversion product showcase.
 */
export default function Landing() {
  const { user } = useAuth()
  const { hash } = useLocation()
  const [activeFeature, setActiveFeature] = useState(1)

  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const timer = setTimeout(() => scrollToSectionId(id, { smooth: false }), 100)
    return () => clearTimeout(timer)
  }, [hash])

  const preview = PREVIEWS[activeFeature]

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100dvh', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section className="container" id="overview" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
        <div
          style={{
            borderRadius: '24px', overflow: 'hidden', minHeight: '380px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.92) 100%), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem 1.5rem', border: '1px solid var(--border)',
          }}
        >
          <div className="badge-glow" style={{ marginBottom: '1rem', padding: '0.4rem 1.1rem', fontSize: '0.82rem' }}>
            <Sparkles size={14} /> AI-Powered Technical Interview Platform
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: '#fff', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem', maxWidth: '24ch', lineHeight: 1.15 }}>
            Master Technical Interviews with Precision
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.08rem', maxWidth: '54ch', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Practice mock interviews with Gemini AI evaluation, line-by-line feedback, and verifiable milestone certificates.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg" style={{ borderRadius: '999px', padding: '0.75rem 2rem' }}>
              <Zap size={18} /> Start Free Session <ArrowRight size={18} />
            </Link>
            <Link to="/leaderboard" className="btn btn-secondary btn-lg" style={{ borderRadius: '999px', padding: '0.75rem 2rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Trophy size={18} /> Standings
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Advantages */}
      <section className="container" id="benefits" style={{ padding: '3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="tag">Core Advantages</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.5rem 0' }}>Engineered for Tech Rounds</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {ADVANTAGES.map((adv, i) => (
            <div key={i} className="panel glass-card-hover" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent-grad-subtle)', display: 'grid', placeItems: 'center', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                <adv.icon size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{adv.title}</h3>
              <p className="muted" style={{ fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>{adv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Selector */}
      <section className="container" id="specifications" style={{ padding: '3rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <span className="tag">Deep Analytics</span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.5rem 0 1rem' }}>See the Big Picture</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map((num) => (
                <div key={num} onClick={() => setActiveFeature(num)} style={{ display: 'flex', gap: '1rem', cursor: 'pointer', opacity: activeFeature === num ? 1 : 0.6 }}>
                  <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>0{num}</span>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>{PREVIEWS[num].title}</h4>
                    <p className="muted small" style={{ margin: 0 }}>{PREVIEWS[num].desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ padding: '2rem', background: 'var(--surface-elevated)', borderRadius: '20px' }}>
            <span className="tag" style={{ background: preview.bg, color: preview.bg.includes('warn') ? '#000' : '#fff' }}>{preview.tag}</span>
            <h3 style={{ fontSize: '1.3rem', margin: '0.75rem 0 0.5rem' }}>{preview.title}</h3>
            <p className="muted" style={{ lineHeight: '1.6', margin: 0 }}>{preview.desc}</p>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="container" id="how-it-works" style={{ padding: '3rem 0 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="tag">Workflow</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.5rem 0' }}>How It Works</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {STEPS.map((s) => (
            <div key={s.step} className="panel" style={{ padding: '1.75rem' }}>
              <div className="step-badge" style={{ marginBottom: '0.75rem' }}>{s.step}</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{s.title}</h3>
              <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
