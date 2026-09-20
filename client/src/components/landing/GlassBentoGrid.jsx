import { Brain, FileText, Award, BarChart3, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function GlassBentoGrid() {
  return (
    <div className="bento-grid">
      {/* Bento 1: AI Evaluation Engine */}
      <div className="reflect-card bento-span-7" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'grid', placeItems: 'center', color: '#c084fc' }}>
                <Brain size={18} />
              </div>
              <span className="mono" style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700 }}>
                GEMINI 2.5 REASONING CORE
              </span>
            </div>
            <span className="glass-pill" style={{ color: '#34d399', fontSize: '0.72rem', border: '1px solid rgba(52, 211, 153, 0.25)' }}>&lt;650ms Latency</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
            Multi-Dimensional Diagnostics
          </h3>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 1.25rem', color: 'rgba(239, 237, 253, 0.7)' }}>
            Evaluated on architectural reasoning, algorithmic complexity (Big-O), and fault-tolerant concurrency.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Architecture', score: '94%', color: '#a855f7' },
            { label: 'Complexity', score: '88%', color: '#34d399' },
            { label: 'Resilience', score: '91%', color: '#fbbf24' },
          ].map((bar, i) => (
            <div key={i} style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'rgba(239, 237, 253, 0.6)' }}>{bar.label}</span>
                <span className="mono" style={{ fontWeight: 700, color: bar.color }}>{bar.score}</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: bar.score, height: '100%', background: bar.color, borderRadius: '999px', boxShadow: `0 0 8px ${bar.color}` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bento 2: Resume PDF Deep-Parser */}
      <div className="reflect-card bento-span-5" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'grid', placeItems: 'center', color: '#fbbf24' }}>
              <FileText size={18} />
            </div>
            <span className="mono" style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>RESUME CONTEXTUALIZER</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Tailored to Your Stack</h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 1.25rem', color: 'rgba(239, 237, 253, 0.7)' }}>
            Parses frameworks and metrics from your resume to challenge you on claimed production designs.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {['React 19', 'Node.js', 'PostgreSQL', 'Redis Sharding', 'Kafka', 'Docker'].map((tech) => (
            <span key={tech} className="glass-pill" style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', border: '1px solid rgba(255,255,255,0.08)' }}>{tech}</span>
          ))}
        </div>
      </div>

      {/* Bento 3: Cryptographic Certificate */}
      <div className="reflect-card bento-span-6" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'grid', placeItems: 'center', color: '#34d399' }}>
              <Award size={18} />
            </div>
            <span className="mono" style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>CRYPTOGRAPHIC PROOF</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Verifiable Credentials</h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 1.25rem', color: 'rgba(239, 237, 253, 0.7)' }}>
            Milestone achievements produce an ISO-18004 QR credential signed with a SHA-256 hash.
          </p>
        </div>
        <div style={{ padding: '0.65rem 0.9rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>VERIFIED: MOCK-2026-9841-A</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(239, 237, 253, 0.6)' }}>MockMate AI Tamper-Proof Protocol</div>
          </div>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'rgba(239, 237, 253, 0.5)' }}>SHA-256</span>
        </div>
      </div>

      {/* Bento 4: Global Standings */}
      <div className="reflect-card bento-span-6" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'grid', placeItems: 'center', color: '#c084fc' }}>
                <BarChart3 size={18} />
              </div>
              <span className="mono" style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700 }}>GLOBAL BENCHMARK</span>
            </div>
            <Link to="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#c084fc' }}>
              Leaderboard <ArrowUpRight size={13} />
            </Link>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Percentile Benchmarking</h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 1.25rem', color: 'rgba(239, 237, 253, 0.7)' }}>
            Benchmark response speed, logic precision, and architecture against engineers globally.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="glass-pill" style={{ borderColor: 'rgba(168, 85, 247, 0.35)', color: '#d8b4fe' }}>Top 2.4% Global Percentile</span>
          <span className="glass-pill" style={{ color: 'rgba(239, 237, 253, 0.6)' }}>15,000+ Sessions</span>
        </div>
      </div>
    </div>
  )
}
