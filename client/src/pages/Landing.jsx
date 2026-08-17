import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  Globe,
  Sliders,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { scrollToSectionId } from '../lib/scrollToSection'

export default function Landing() {
  const { user } = useAuth()
  const { hash } = useLocation()
  const [activeFeature, setActiveFeature] = useState(1)

  // Deep link like /#benefits — same offset rule as the navbar and footer.
  // A single pass lands short: on a cold load the hero art and the web fonts are
  // still settling, so the geometry measured on mount is stale by the time the
  // page has painted. Correct once more after fonts resolve, but bail out if the
  // reader has already scrolled themselves.
  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')

    // Detect a real gesture rather than inferring one from scrollY: the layout
    // settling under us moves the page too, and treating that as "the reader
    // took over" was exactly what left the deep link short of its section.
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
    // Keyed on the hash, not just on mount: arriving at /#benefits while already
    // on / is a same-document navigation, so the component never remounts and a
    // mount-only effect would leave the browser's raw fragment jump in place.
  }, [hash])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100dvh', overflowX: 'hidden' }}>
      {/* Nature Landscape Panoramic Hero Visual Canvas */}
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
          <div
            className="badge-glow"
            style={{
              marginBottom: '1.2rem',
              padding: '0.45rem 1.25rem',
              fontSize: '0.85rem',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
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

      {/* 4-Column Feature Cards Section */}
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
          <div className="panel glass-card-hover" style={{ padding: '2rem 1.6rem', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'grid', placeItems: 'center', color: 'var(--accent-primary)', marginBottom: '1.3rem' }}>
              <Activity size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Amplify Insights</h3>
            <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
              Unlock data-driven candidate evaluation with comprehensive AI analytics, revealing key growth opportunities for technical rounds.
            </p>
          </div>

          <div className="panel glass-card-hover" style={{ padding: '2rem 1.6rem', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'grid', placeItems: 'center', color: 'var(--accent-primary)', marginBottom: '1.3rem' }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Control Global Standings</h3>
            <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
              Track past interview history, verified score reports, and community standings to benchmark your candidate rank worldwide.
            </p>
          </div>

          <div className="panel glass-card-hover" style={{ padding: '2rem 1.6rem', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'grid', placeItems: 'center', color: 'var(--accent-primary)', marginBottom: '1.3rem' }}>
              <Sliders size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Remove Skill Barriers</h3>
            <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
              Adapt to diverse engineering domains (Frontend, Backend, DevOps, System Design) with tailored practice modules.
            </p>
          </div>

          <div className="panel glass-card-hover" style={{ padding: '2rem 1.6rem', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'grid', placeItems: 'center', color: 'var(--accent-primary)', marginBottom: '1.3rem' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>Visualize Technical Growth</h3>
            <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>
              Generate precise, visually compelling score reports illustrating your growth trajectories over time.
            </p>
          </div>
        </div>
      </section>

      {/* Split Section: "See the Big Picture" */}
      <section className="container" id="specifications" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          {/* Left Column Text & Numbered List */}
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
              {/* Point 01 */}
              <div
                onClick={() => setActiveFeature(1)}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  paddingBottom: '1.2rem',
                  borderBottom: '1px solid var(--border-soft)',
                  opacity: activeFeature === 1 ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>01</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                    Spot Trends in Seconds
                  </h4>
                  <p className="muted small" style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.55' }}>
                    No more digging through raw notes. Get instant line-by-line AI scoring breakdown and key takeaways.
                  </p>
                </div>
              </div>

              {/* Point 02 */}
              <div
                onClick={() => setActiveFeature(2)}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  paddingBottom: '1.2rem',
                  borderBottom: '1px solid var(--border-soft)',
                  opacity: activeFeature === 2 ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>02</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                    Get Everyone on the Same Page
                  </h4>
                  <p className="muted small" style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.55' }}>
                    Share easy-to-verify certificate credentials and performance reports with hiring managers and recruiters.
                  </p>
                </div>
              </div>

              {/* Point 03 */}
              <div
                onClick={() => setActiveFeature(3)}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  paddingBottom: '1.2rem',
                  opacity: activeFeature === 3 ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>03</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                    Resume Intelligence Matching
                  </h4>
                  <p className="muted small" style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.55' }}>
                    Upload your resume PDF to automatically generate targeted questions from your past project achievements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Graphic Card */}
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
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '1.4rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  textAlign: 'left',
                }}
              >
                {activeFeature === 1 && (
                  <div>
                    <span className="tag" style={{ background: 'var(--accent-primary)', color: '#fff', marginBottom: '0.6rem' }}>
                      Line-by-Line AI Scoring
                    </span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>Spot Trends in Seconds</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.82)', lineHeight: '1.55' }}>
                      Evaluates code syntax, computational complexity (Big-O), and architectural trade-offs automatically.
                    </p>
                  </div>
                )}

                {activeFeature === 2 && (
                  <div>
                    <span className="tag" style={{ background: 'var(--good)', color: '#fff', marginBottom: '0.6rem' }}>
                      ISO 18004 Verified Credential
                    </span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>Shareable Verification Portal</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.82)', lineHeight: '1.55' }}>
                      Generate dynamic, scannable QR certificates with unique verification IDs to showcase on LinkedIn.
                    </p>
                  </div>
                )}

                {activeFeature === 3 && (
                  <div>
                    <span className="tag" style={{ background: 'var(--warn)', color: '#000', marginBottom: '0.6rem' }}>
                      PDF Resume Extraction
                    </span>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: '#ffffff' }}>Personalized Interview Generator</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.82)', lineHeight: '1.55' }}>
                      Extracts tech stacks from your resume PDF to craft custom system design and code questions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Panoramic Mountain Canvas Image Banner */}
      <section className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div
          style={{
            borderRadius: '28px',
            overflow: 'hidden',
            height: '320px',
            width: '100%',
            backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        />
      </section>

      {/* 3-Step How-To Section */}
      <section className="container" id="how-it-works" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.5rem' }}>Simple Workflow</span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800 }}>How MockMate Works</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="panel" style={{ padding: '2rem' }}>
            <div className="step-badge" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>01</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Select Target Role</h3>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.6', margin: 0 }}>
              Choose Frontend, Backend, DevOps, or System Design, set difficulty level, or upload your resume PDF.
            </p>
          </div>

          <div className="panel" style={{ padding: '2rem' }}>
            <div className="step-badge" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>02</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Complete Focus HUD Interview</h3>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.6', margin: 0 }}>
              Answer AI-generated questions in a distraction-free HUD interface with live word count and question palette.
            </p>
          </div>

          <div className="panel" style={{ padding: '2rem' }}>
            <div className="step-badge" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>03</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Review Analytics &amp; Certificate</h3>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.6', margin: 0 }}>
              Get instant scoring breakdown, save key questions to your revision bank, and download your official verified certificate.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
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
