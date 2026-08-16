import { useState, useRef } from 'react'
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
  Pause,
  Terminal,
  Cpu,
  Layers,
  Star,
  Users,
  Check,
  QrCode,
  FileUp,
  Share2,
  Lock,
  Flame,
  Globe,
  Maximize2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DEMO_TRACKS = [
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    badge: 'Senior React & Performance',
    question: 'How does React 19 Server Components (RSC) differ from Client Components, and how do you optimize hydration boundaries?',
    sampleAnswer: 'Server Components run exclusively on the server and send zero JS bundle payload to the client. Hydration boundaries are defined using "use client", minimizing client-side JS overhead.',
    score: 9.5,
    metrics: [
      { label: 'Technical Depth', val: '96%' },
      { label: 'Architecture Clarity', val: '94%' },
      { label: 'Code Quality', val: '95%' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Architecture',
    badge: 'Staff Node.js & Distributed Systems',
    question: 'Explain how event loop lag occurs under heavy CPU-bound workloads in Node.js, and design a Redis sliding window rate limiter.',
    sampleAnswer: 'Event loop lag happens when long-running synchronous JS blocks the main thread. A Redis sliding window script executed via EVALSHA guarantees atomic multi-node rate limiting.',
    score: 9.8,
    metrics: [
      { label: 'System Scalability', val: '98%' },
      { label: 'Concurrency Handling', val: '97%' },
      { label: 'Fault Tolerance', val: '96%' },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    badge: 'Principal Cloud & Microservices',
    question: 'Design a globally distributed URL shortener service handling 500M active requests daily with sub-5ms read latency.',
    sampleAnswer: 'Use Base62 encoding algorithm with pre-allocated key ranges, multi-region Cloudflare edge caching, and DynamoDB global tables for horizontal scaling.',
    score: 9.2,
    metrics: [
      { label: 'Global Availability', val: '99.99%' },
      { label: 'Latency Efficiency', val: '95%' },
      { label: 'Data Sharding', val: '94%' },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud Security',
    badge: 'Lead Kubernetes & CI/CD',
    question: 'How do you implement Zero-Downtime Canary Deployments with Istio service mesh and automated Prometheus rollback thresholds?',
    sampleAnswer: 'Use Istio VirtualService weights to divert 5% traffic to canary pods, continuously monitoring HTTP 5xx error rate thresholds before automated promotion.',
    score: 9.6,
    metrics: [
      { label: 'Deployment Safety', val: '97%' },
      { label: 'Prometheus Alerts', val: '96%' },
      { label: 'Istio Mesh Security', val: '95%' },
    ],
  },
]

const TESTIMONIALS = [
  {
    name: 'Mohd Zaid',
    role: 'Lead Fullstack & AI Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    quote: 'MockMate AI transformed my interview prep. The line-by-line Gemini 2.5 feedback and realistic questions helped me land top engineering offers!',
    score: '98% Top Scorer',
  },
  {
    name: 'Aarav Sharma',
    role: 'Senior Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'The resume parsing feature is incredible. It generated exact System Design questions directly from my past microservices architecture project!',
    score: '94% Score',
  },
  {
    name: 'Priya Patel',
    role: 'Frontend UI/UX Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    quote: 'Having verified certificate credentials linked to my LinkedIn profile gave recruiters instant confidence in my technical skills.',
    score: '92% Score',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const [selectedTrack, setSelectedTrack] = useState(DEMO_TRACKS[0])
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef(null)

  function togglePlayVideo() {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section className="container" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem', textAlign: 'center' }}>
        <div className="hero" style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div
            className="badge-glow"
            style={{
              margin: '0 auto 1.4rem',
              padding: '0.45rem 1.25rem',
              fontSize: '0.85rem',
              gap: '0.55rem',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>Powered by Google Gemini 2.5 AI Engine</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.8vw, 4.2rem)',
              marginBottom: '1.25rem',
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Master Technical Interviews with <br />
            <span className="gradient-text">Real-Time AI Evaluation</span>
          </h1>

          <p
            className="lead"
            style={{
              margin: '0 auto 2.5rem',
              fontSize: '1.15rem',
              lineHeight: 1.6,
              maxWidth: '62ch',
              color: 'var(--text-muted)',
            }}
          >
            Practice role-specific mock interviews tailored to your exact target position and resume.
            Receive line-by-line code scoring, actionable feedback charts, and official verified certificates.
          </p>

          {/* Hero CTAs */}
          <div className="hero-cta" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg" style={{ padding: '0.85rem 2.2rem', fontSize: '1rem' }}>
              <Zap size={19} /> {user ? 'Launch Workbench' : 'Start Practice Free'} <ArrowRight size={19} />
            </Link>

            <Link to="/leaderboard" className="btn btn-secondary btn-lg" style={{ padding: '0.85rem 2.2rem', fontSize: '1rem' }}>
              <Trophy size={19} /> Global Standings
            </Link>
          </div>

          {/* Value Highlights */}
          <div
            style={{
              display: 'flex',
              justify: 'center',
              gap: '1.8rem',
              flexWrap: 'wrap',
              marginTop: '2.5rem',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--good)' }} /> Gemini 2.5 Line-by-Line AI Scoring
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--good)' }} /> PDF Resume Parsing
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--good)' }} /> ISO QR Verified Certificates
            </span>
          </div>
        </div>

        {/* Video Player Demo Box (Screen Recording Player) */}
        <div
          className="panel"
          style={{
            marginTop: '3.5rem',
            padding: 0,
            overflow: 'hidden',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'left',
            background: 'var(--surface)',
            position: 'relative',
          }}
        >
          {/* Top Window HUD Title bar */}
          <div
            style={{
              padding: '0.85rem 1.4rem',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="hud-dots" style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              </div>
              <span className="mono muted" style={{ fontSize: '0.8rem' }}>
                mockmate://recorded-demo-walkthrough.mp4
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={togglePlayVideo}
                style={{ fontSize: '0.75rem', gap: '0.35rem' }}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlaying ? 'Pause Recording' : 'Play Recording'}</span>
              </button>
              <span className="tag" style={{ fontSize: '0.72rem', background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)' }}>
                <Terminal size={13} /> Real App Walkthrough
              </span>
            </div>
          </div>

          {/* Embedded Video Showcase Player */}
          <div style={{ position: 'relative', width: '100%', background: '#000000', minHeight: '340px' }}>
            <video
              ref={videoRef}
              src="/demo-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              style={{
                width: '100%',
                maxHeight: '620px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>

          {/* Role Track Overlay Selector */}
          <div
            style={{
              padding: '0.9rem 1.4rem',
              background: 'var(--surface-2)',
              borderTop: '1px solid var(--border-soft)',
              display: 'flex',
              gap: '0.6rem',
              overflowX: 'auto',
              alignItems: 'center',
            }}
          >
            <span className="muted small" style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', marginRight: '0.4rem' }}>
              Explore Tracks:
            </span>
            {DEMO_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrack(track)}
                className={`btn btn-sm ${selectedTrack.id === track.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '999px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              >
                {track.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Spotlights Section (Bento Grid Style) */}
      <section style={{ padding: '5rem 0', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 3rem', maxWidth: '640px' }}>
            <span className="tag" style={{ marginBottom: '0.5rem' }}>Architected for High Performance</span>
            <h2>Why Engineers Practice on MockMate AI</h2>
            <p>Everything you need to simulate real-world technical interviews and benchmark your performance.</p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="panel feature-card" style={{ padding: '1.8rem' }}>
              <div className="feature-icon-box" style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)', display: 'grid', placeItems: 'center', marginBottom: '1.1rem' }}>
                <Brain size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Gemini 2.5 AI Context Engine</h3>
              <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Our AI model crafts non-generic, deep-dive technical questions mapped to your target position and experience level.
              </p>
            </div>

            <div className="panel feature-card" style={{ padding: '1.8rem' }}>
              <div className="feature-icon-box" style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)', display: 'grid', placeItems: 'center', marginBottom: '1.1rem' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Resume PDF Intelligence Parser</h3>
              <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Upload your resume PDF to extract key tech stacks, project achievements, and experience for hyper-tailored practice sessions.
              </p>
            </div>

            <div className="panel feature-card" style={{ padding: '1.8rem' }}>
              <div className="feature-icon-box" style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)', display: 'grid', placeItems: 'center', marginBottom: '1.1rem' }}>
                <BarChart3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Line-by-Line Feedback &amp; Score Charts</h3>
              <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Analyze question-by-question score breakdown charts, donut gauges, personal takeaways, and revision bookmarks.
              </p>
            </div>

            <div className="panel feature-card" style={{ padding: '1.8rem' }}>
              <div className="feature-icon-box" style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)', display: 'grid', placeItems: 'center', marginBottom: '1.1rem' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Scannable ISO Verified Certificates</h3>
              <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Earn official, scannable QR certificate credentials upon reaching milestone practice scores to share on LinkedIn.
              </p>
            </div>

            <div className="panel feature-card" style={{ padding: '1.8rem' }}>
              <div className="feature-icon-box" style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)', display: 'grid', placeItems: 'center', marginBottom: '1.1rem' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Q&amp;A &amp; MCQ Quiz Formats</h3>
              <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Switch seamlessly between open-ended technical Q&amp;A interview simulations and fast-paced multiple-choice technical quizzes.
              </p>
            </div>

            <div className="panel feature-card" style={{ padding: '1.8rem' }}>
              <div className="feature-icon-box" style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)', display: 'grid', placeItems: 'center', marginBottom: '1.1rem' }}>
                <Trophy size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Global Community Standings</h3>
              <p className="muted" style={{ fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Benchmark your candidate performance on community leaderboard podiums and track your rank among engineering peers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="container" style={{ padding: '5rem 0' }}>
        <div className="section-head" style={{ textAlign: 'center', margin: '0 auto 3rem', maxWidth: '640px' }}>
          <span className="tag" style={{ marginBottom: '0.5rem' }}>Community Social Proof</span>
          <h2>Loved by Developers Worldwide</h2>
          <p>Read how candidates use MockMate AI to ace interviews at top tech companies.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
              <p style={{ fontSize: '0.96rem', lineHeight: '1.65', color: 'var(--text)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={t.avatar} alt={t.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                    <div className="muted small" style={{ fontSize: '0.78rem' }}>{t.role}</div>
                  </div>
                </div>
                <span className="tag-soft" style={{ fontSize: '0.72rem', color: 'var(--good)' }}>{t.score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Call-To-Action Banner */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div
          className="panel"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            background: 'var(--accent-grad-subtle)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.8rem', fontWeight: 800 }}>
            Ready to Ace Your Next Technical Interview?
          </h2>
          <p className="muted" style={{ maxWidth: '58ch', margin: '0 auto 2.2rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Join software engineers practicing daily with AI-powered mock sessions, resume intelligence, and verified credentials.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg" style={{ padding: '0.85rem 2.2rem' }}>
              <Sparkles size={19} /> {user ? 'Launch Workbench' : 'Create Free Account'} <ArrowRight size={19} />
            </Link>
            <Link to="/leaderboard" className="btn btn-secondary btn-lg" style={{ padding: '0.85rem 2.2rem' }}>
              <Trophy size={19} /> Community Leaderboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
