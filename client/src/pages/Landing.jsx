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
  Globe,
  Sliders,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()
  const [activeFeature, setActiveFeature] = useState(1)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Floating Centered Pill Navigation */}
      <div style={{ position: 'sticky', top: '1.25rem', zIndex: 100, display: 'flex', justifyContent: 'center', padding: '0 1rem', marginBottom: '2rem' }}>
        <nav
          style={{
            background: 'var(--surface-elevated)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            padding: '0.5rem 1.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <a href="#overview" style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Overview
          </a>
          <a href="#benefits" style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Benefits
          </a>
          <a href="#specifications" style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Specifications
          </a>
          <a href="#how-it-works" style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            How-to
          </a>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: '999px', padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
          >
            {user ? 'Workbench' : 'Get Started'} <ArrowRight size={14} />
          </Link>
        </nav>
      </div>

      {/* Top Panoramic Hero Visual Canvas */}
      <section className="container" id="overview" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: '28px',
            overflow: 'hidden',
            height: '380px',
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%), url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justify: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            className="badge-glow"
            style={{
              marginBottom: '1rem',
              padding: '0.4rem 1.1rem',
              fontSize: '0.82rem',
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.25)',
            }}
          >
            <Sparkles size={14} /> AI-Powered Mock Interview Platform
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              color: '#ffffff',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
              maxWidth: '22ch',
              lineHeight: 1.15,
            }}
          >
            Master Technical Interviews with Precision
          </h1>

          <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '1.1rem', maxWidth: '54ch', margin: '0 auto 1.8rem', lineHeight: 1.6 }}>
            Real-time Gemini AI candidate evaluation, line-by-line code feedback, and verifiable ISO certificates.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg" style={{ borderRadius: '999px', padding: '0.75rem 2rem' }}>
              <Zap size={18} /> Start Free Session <ArrowRight size={18} />
            </Link>
            <Link to="/leaderboard" className="btn btn-secondary btn-lg" style={{ borderRadius: '999px', padding: '0.75rem 2rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Trophy size={18} /> Community Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Column Minimal Feature Icons Grid */}
      <section className="container" id="benefits" style={{ padding: '3.5rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem' }}>
          <div>
            <div style={{ marginBottom: '1.2rem', color: 'var(--text)' }}>
              <Activity size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.6rem' }}>Amplify Insights</h3>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.65', margin: 0 }}>
              Unlock data-driven candidate evaluation with comprehensive AI analytics, revealing key growth opportunities for technical rounds.
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '1.2rem', color: 'var(--text)' }}>
              <Globe size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.6rem' }}>Control Your Global Standings</h3>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.65', margin: 0 }}>
              Track past interview history, verified score reports, and community standings to benchmark your candidate rank worldwide.
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '1.2rem', color: 'var(--text)' }}>
              <Sliders size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.6rem' }}>Remove Skill Barriers</h3>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.65', margin: 0 }}>
              Adapt to diverse engineering domains (Frontend, Backend, DevOps, System Design) with tailored practice modules.
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '1.2rem', color: 'var(--text)' }}>
              <TrendingUp size={26} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.6rem' }}>Visualize Technical Growth</h3>
            <p className="muted" style={{ fontSize: '0.94rem', lineHeight: '1.65', margin: 0 }}>
              Generate precise, visually compelling score reports illustrating your growth trajectories over time.
            </p>
          </div>
        </div>
      </section>

      {/* Split Section: "See the Big Picture" */}
      <section className="container" id="specifications" style={{ padding: '4rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          {/* Left Column Text & Numbered List */}
          <div>
            <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
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
                  opacity: activeFeature === 1 ? 1 : 0.65,
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-subtle)' }}>01</span>
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
                  opacity: activeFeature === 2 ? 1 : 0.65,
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-subtle)' }}>02</span>
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
                  opacity: activeFeature === 3 ? 1 : 0.65,
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-subtle)' }}>03</span>
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

          {/* Right Column Showcase Container */}
          <div>
            <div
              style={{
                borderRadius: '28px',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                padding: '2.5rem 2rem',
                minHeight: '440px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {activeFeature === 1 && (
                <div>
                  <div className="score-chip" style={{ fontSize: '1.2rem', padding: '0.5rem 1.4rem', margin: '0 auto 1.2rem' }}>
                    94.5% Overall Average Score
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>Line-by-Line AI Scoring</h3>
                  <p className="muted" style={{ maxWidth: '36ch', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Evaluates code syntax, computational complexity (Big-O), and architectural trade-offs automatically.
                  </p>
                </div>
              )}

              {activeFeature === 2 && (
                <div>
                  <div className="tag" style={{ background: 'var(--good)', color: '#fff', padding: '0.4rem 1.1rem', margin: '0 auto 1.2rem', fontSize: '0.9rem' }}>
                    <ShieldCheck size={16} /> ISO 18004 Verified Credential
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>Shareable Verification Portal</h3>
                  <p className="muted" style={{ maxWidth: '36ch', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Generate dynamic, scannable QR certificates with unique verification IDs to showcase on LinkedIn.
                  </p>
                </div>
              )}

              {activeFeature === 3 && (
                <div>
                  <div className="badge-glow" style={{ margin: '0 auto 1.2rem', padding: '0.4rem 1.1rem' }}>
                    <FileText size={16} /> Resume PDF Extraction
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>Personalized Interview Generator</h3>
                  <p className="muted" style={{ maxWidth: '36ch', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Extracts tech stacks from your resume PDF to craft custom system design and code questions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Middle Panoramic Mountain Canvas Image Banner */}
      <section className="container" style={{ padding: '2rem 0' }}>
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
      <section className="container" id="how-it-works" style={{ padding: '5rem 0' }}>
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
