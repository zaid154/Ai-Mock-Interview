import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Zap,
  Sparkles,
  ArrowRight,
  Trophy,
  Globe,
  Sliders,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { scrollToSectionId } from '../lib/scrollToSection'

// Core advantages grid data
const ADVANTAGES = [
  {
    icon: Activity,
    title: 'Amplify Insights',
    desc: 'Unlock data-driven candidate evaluation with comprehensive AI analytics, revealing key growth opportunities for technical rounds.',
  },
  {
    icon: Globe,
    title: 'Control Global Standings',
    desc: 'Track past interview history, verified score reports, and community standings to benchmark your candidate rank worldwide.',
  },
  {
    icon: Sliders,
    title: 'Remove Skill Barriers',
    desc: 'Adapt to diverse engineering domains (Frontend, Backend, DevOps, System Design) with tailored practice modules.',
  },
  {
    icon: TrendingUp,
    title: 'Visualize Technical Growth',
    desc: 'Generate precise, visually compelling score reports illustrating your growth trajectories over time.',
  },
]

// Interactive feature preview items
const FEATURE_PREVIEWS = {
  1: {
    tag: 'Line-by-Line AI Scoring',
    tagBg: 'var(--accent-primary)',
    tagColor: '#fff',
    title: 'Spot Trends in Seconds',
    desc: 'Evaluates code syntax, computational complexity (Big-O), and architectural trade-offs automatically.',
  },
  2: {
    tag: 'ISO 18004 Verified Credential',
    tagBg: 'var(--good)',
    tagColor: '#fff',
    title: 'Shareable Verification Portal',
    desc: 'Generate dynamic, scannable QR certificates with unique verification IDs to showcase on LinkedIn.',
  },
  3: {
    tag: 'PDF Resume Extraction',
    tagBg: 'var(--warn)',
    tagColor: '#000',
    title: 'Personalized Interview Generator',
    desc: 'Extracts tech stacks from your resume PDF to craft custom system design and code questions.',
  },
}

// 3-step simple workflow
const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Select Target Role',
    desc: 'Choose Frontend, Backend, DevOps, or System Design, set difficulty level, or upload your resume PDF.',
  },
  {
    step: '02',
    title: 'Complete Focus HUD Interview',
    desc: 'Answer AI-generated questions in a distraction-free HUD interface with live word count and question palette.',
  },
  {
    step: '03',
    title: 'Review Analytics & Certificate',
    desc: 'Get instant scoring breakdown, save key questions to your revision bank, and download your official verified certificate.',
  },
]

/**
 * Landing Page Component
 * 
 * Clean, high-converting product showcase:
 * 1. Nature landscape panoramic hero with direct CTA
 * 2. 4-column core advantages grid
 * 3. Deep analytics interactive preview selector
 * 4. 3-step candidate workflow
 * 5. Primary conversion call-to-action banner
 */
export default function Landing() {
  const { user } = useAuth()
  const { hash } = useLocation()
  const [activeFeature, setActiveFeature] = useState(1)

  // Smooth scroll handler for deep-link anchors (e.g. /#benefits, /#how-it-works)
  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')

    let takenOver = false
    const yield_ = () => { takenOver = true }
    const EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    EVENTS.forEach((e) => window.addEventListener(e, yield_, { passive: true, once: true }))

    const run = () => { if (!takenOver) scrollToSectionId(id, { smooth: false }) }
    const timers = [setTimeout(run, 60), setTimeout(run, 400), setTimeout(run, 900)]
    if (document.fonts?.ready) document.fonts.ready.then(run).catch(() => {})

    return () => {
      timers.forEach(clearTimeout)
      EVENTS.forEach((e) => window.removeEventListener(e, yield_))
    }
  }, [hash])

  const currentPreview = FEATURE_PREVIEWS[activeFeature]

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100dvh', overflowX: 'hidden' }}>
      {/* ── Panoramic Hero Section ── */}
      <section className="container" id="overview" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: '28px',
            overflow: 'hidden',
            minHeight: '420px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.92) 100%), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '3.5rem 2rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="badge-glow" style={{ marginBottom: '1.2rem', padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
            <Sparkles size={15} /> AI-Powered Technical Interview Platform
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              color: '#ffffff',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              maxWidth: '24ch',
              lineHeight: 1.12,
            }}
          >
            Master Technical Interviews with Precision
          </h1>

          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.15rem', maxWidth: '58ch', margin: '0 auto 2.2rem', lineHeight: 1.6 }}>
            Practice role-specific mock interviews with real-time Gemini AI evaluation, line-by-line code feedback, and verifiable ISO credentials.
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg" style={{ borderRadius: '999px', padding: '0.85rem 2.4rem', fontSize: '1rem' }}>
              <Zap size={19} /> Start Free Session <ArrowRight size={19} />
            </Link>
            <Link to="/leaderboard" className="btn btn-secondary btn-lg" style={{ borderRadius: '999px', padding: '0.85rem 2.4rem', fontSize: '1rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Trophy size={19} /> Community Standings
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4-Column Advantages Grid ── */}
      <section className="container" id="benefits" style={{ paddingTop: '4.5rem', paddingBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="tag" style={{ marginBottom: '0.8rem', padding: '0.35rem 0.9rem' }}>
            Core Advantages
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 0.5rem' }}>
            Engineered for High-Stakes Tech Rounds
          </h2>
          <p className="muted" style={{ maxWidth: '58ch', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Everything you need to benchmark your technical depth, refine system architecture reasoning, and get certified.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {ADVANTAGES.map((adv, i) => (
            <div key={i} className="panel glass-card-hover" style={{ padding: '2rem 1.6rem', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'grid', placeItems: 'center', color: 'var(--accent-primary)', marginBottom: '1.3rem' }}>
                <adv.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>{adv.title}</h3>
              <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Split Feature Deep Dive ── */}
      <section className="container" id="specifications" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <div className="tag" style={{ marginBottom: '0.8rem', padding: '0.35rem 0.9rem' }}>
              Deep Analytics &amp; Scoring
            </div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              See the Big Picture
            </h2>
            <p className="muted" style={{ fontSize: '1.08rem', lineHeight: '1.65', marginBottom: '2.5rem', maxWidth: '44ch' }}>
              MockMate turns your technical response data into clear, vibrant visual feedback that shows you exactly where to refine your architecture logic.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              {[1, 2, 3].map((num) => {
                const item = FEATURE_PREVIEWS[num]
                const isActive = activeFeature === num
                return (
                  <div
                    key={num}
                    onClick={() => setActiveFeature(num)}
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      paddingBottom: '1.2rem',
                      borderBottom: '1px solid var(--border-soft)',
                      opacity: isActive ? 1 : 0.6,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      0{num}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                        {item.title}
                      </h4>
                      <p className="muted small" style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.55' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Feature Graphic Canvas */}
          <div>
            <div
              style={{
                borderRadius: '28px',
                backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                padding: '2.5rem 1.8rem',
                minHeight: '440px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '1.4rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  textAlign: 'left',
                }}
              >
                <span className="tag" style={{ background: currentPreview.tagBg, color: currentPreview.tagColor, marginBottom: '0.6rem' }}>
                  {currentPreview.tag}
                </span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>{currentPreview.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.82)', lineHeight: '1.55' }}>
                  {currentPreview.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Step Simple Workflow ── */}
      <section className="container" id="how-it-works" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.5rem' }}>Simple Workflow</span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800 }}>How MockMate Works</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {WORKFLOW_STEPS.map((wf) => (
            <div key={wf.step} className="panel" style={{ padding: '2rem' }}>
              <div className="step-badge" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{wf.step}</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{wf.title}</h3>
              <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.6', margin: 0 }}>
                {wf.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="container" style={{ paddingBottom: '6rem' }}>
        <div
          className="panel"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'var(--surface-elevated)',
            borderRadius: '28px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Elevate Your Technical Interviews Today
          </h2>
          <p className="muted" style={{ maxWidth: '56ch', margin: '0 auto 2.2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Join software engineers practicing daily with AI-powered mock sessions, resume intelligence, and verified credentials.
          </p>

          <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg" style={{ borderRadius: '999px', padding: '0.85rem 2.4rem' }}>
            <Sparkles size={18} /> {user ? 'Launch Dashboard Workbench' : 'Create Free Account Now'} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
