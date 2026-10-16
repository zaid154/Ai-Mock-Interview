import { Brain, FileText, Award, BarChart3, ArrowUpRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function GlassBentoGrid() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText('https://mockmate.dev/verify/cert_89f2a')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bento-grid">
      {/* Bento 1: Detailed Skill Analysis */}
      <div className="reflect-card bento-span-7" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'grid', placeItems: 'center', color: '#38bdf8' }}>
                <Brain size={18} aria-hidden="true" />
              </div>
              <span className="mono" style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.04em' }}>
                EVALUATION BREAKDOWN
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '999px', padding: '0.2rem 0.6rem' }}>
              Instant Scoring
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.4rem', color: '#f0f6fc' }}>
            Detailed Skill Analysis
          </h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.55', margin: '0 0 1.25rem', color: '#8b949e' }}>
            Clear evaluation across system design, algorithmic efficiency, and edge case coverage after every session.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'System Design', score: 92, color: '#38bdf8' },
            { label: 'Problem Solving', score: 86, color: '#34d399' },
            { label: 'Edge Cases', score: 89, color: '#a855f7' },
          ].map((bar, i) => (
            <div key={i} style={{ padding: '0.75rem', borderRadius: '8px', background: '#161b22', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#8b949e' }}>{bar.label}</span>
                <span className="mono" style={{ fontWeight: 700, color: bar.color }}>{bar.score}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={bar.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${bar.label} score`}
                style={{ width: '100%', height: '4px', background: '#21262d', borderRadius: '2px', overflow: 'hidden' }}
              >
                <div style={{ width: `${bar.score}%`, height: '100%', background: bar.color, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bento 2: Tailored to Your Stack */}
      <div className="reflect-card bento-span-5" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'grid', placeItems: 'center', color: '#fbbf24' }}>
              <FileText size={18} aria-hidden="true" />
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.04em' }}>
              RESUME MATCHING
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.4rem', color: '#f0f6fc' }}>
            Tailored to Your Stack
          </h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.55', margin: '0 0 1.25rem', color: '#8b949e' }}>
            Upload your PDF resume to generate role-specific questions tailored to your actual skills and projects.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'TypeScript'].map((tech) => (
            <span key={tech} style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', fontFamily: 'var(--font-mono)' }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Bento 3: Shareable Certificates */}
      <div className="reflect-card bento-span-6" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)', display: 'grid', placeItems: 'center', color: '#34d399' }}>
              <Award size={18} aria-hidden="true" />
            </div>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.04em' }}>
              VERIFIED CREDENTIALS
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.4rem', color: '#f0f6fc' }}>
            Shareable Certificates
          </h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.55', margin: '0 0 1.25rem', color: '#8b949e' }}>
            Complete milestone interviews to earn shareable certificates with public verification links for your resume and LinkedIn.
          </p>
        </div>

        {/* Realistic Shareable Link Preview Card */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: '#161b22',
          border: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} /> Verified Certificate
            </div>
            <div className="mono" style={{ fontSize: '0.76rem', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              mockmate.dev/verify/cert_89f2a
            </div>
          </div>
          <button
            onClick={handleCopy}
            type="button"
            title="Copy verification link"
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: '#21262d',
              border: '1px solid #30363d',
              color: copied ? '#34d399' : '#c9d1d9',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Bento 4: Progress & Leaderboard */}
      <div className="reflect-card bento-span-6" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'grid', placeItems: 'center', color: '#a855f7' }}>
                <BarChart3 size={18} aria-hidden="true" />
              </div>
              <span className="mono" style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, letterSpacing: '0.04em' }}>
                BENCHMARKING
              </span>
            </div>
            <Link to="/leaderboard" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#58a6ff' }}>
              Leaderboard <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.4rem', color: '#f0f6fc' }}>
            Track Your Progression
          </h3>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.55', margin: '0 0 1.25rem', color: '#8b949e' }}>
            Compare your scores across sessions, identify weak technical domains, and watch your rank climb on the global leaderboard.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }}>
            Global Standings
          </span>
          <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }}>
            Track Percentiles
          </span>
        </div>
      </div>
    </div>
  )
}
