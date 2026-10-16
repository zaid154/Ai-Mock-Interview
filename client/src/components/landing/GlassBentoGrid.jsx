import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Award, BarChart3, ArrowRight, Copy, Check, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react'

export default function GlassBentoGrid() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard?.writeText('https://mockmate.dev/verify/cert_89f2a')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Feature 01: Resume Context Ingestion (Split Left/Right) */}
      <div className="editorial-split">
        {/* Left: Editorial Narrative */}
        <div>
          <div className="section-mono-kicker">// 01 CONTEXT INGESTION</div>
          <h3 className="section-headline">
            Questions tailored to your actual code &amp; projects.
          </h3>
          <p className="section-desc" style={{ marginBottom: '1.25rem' }}>
            Generic LeetCode platforms give every developer the same inversion-of-binary-tree question. MockMate extracts your actual technologies, past project scope, and system responsibilities directly from your PDF resume.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#c9d1d9' }}>
              <CheckCircle2 size={15} style={{ color: '#58a6ff' }} />
              <span>AST-level PDF resume parsing (Node, Postgres, Kafka, React)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#c9d1d9' }}>
              <CheckCircle2 size={15} style={{ color: '#58a6ff' }} />
              <span>Calibrated against the candidate&apos;s real claimed experience</span>
            </div>
          </div>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#58a6ff', fontSize: '0.85rem', fontWeight: 600 }}>
            Upload resume to test drive <ArrowRight size={14} />
          </Link>
        </div>

        {/* Right: Realistic Ingestion Visualizer */}
        <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.85rem', background: '#161b22', borderBottom: '1px solid #21262d', fontSize: '0.74rem', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
            <span>resume_parser.worker</span>
            <span style={{ color: '#34d399' }}>✓ 6 stack entities matched</span>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                EXTRACTED TECH STACK
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'Docker'].map((tech) => (
                  <span key={tech} style={{ fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#161b22', border: '1px solid #30363d', color: '#f0f6fc', fontFamily: 'var(--font-mono)' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: '#090d14', border: '1px solid #21262d', borderRadius: '6px', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#58a6ff', fontWeight: 600, marginBottom: '0.3rem', fontFamily: 'var(--font-mono)' }}>
                SYNTHESIZED ARCHITECTURAL DRILL
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#c9d1d9', lineHeight: 1.5 }}>
                &ldquo;You built an asynchronous transaction ledger with Kafka and PostgreSQL at your previous company. How did you prevent duplicate ledger entries during worker node crashes?&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 02: Multi-Dimensional Engineering Rubric (Split Reversed) */}
      <div className="editorial-split">
        {/* Left: Realistic Rubric Scorecard */}
        <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.85rem', background: '#161b22', borderBottom: '1px solid #21262d', fontSize: '0.74rem', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
            <span>rubric_breakdown.json</span>
            <span style={{ color: '#58a6ff', fontWeight: 600 }}>OVERALL: 91 / 100</span>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { dim: 'System Scalability', score: 94, note: 'Proper horizontal worker isolation' },
              { dim: 'Concurrency & Locks', score: 90, note: 'Redis NX keys with 120s TTL' },
              { dim: 'Edge-Case Recovery', score: 88, note: 'Addressed DB write timeouts' },
              { dim: 'Communication', score: 92, note: 'Clear trade-off justification' }
            ].map((row, i) => (
              <div key={i} style={{ borderBottom: i < 3 ? '1px solid #21262d' : 'none', paddingBottom: i < 3 ? '0.65rem' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0f6fc' }}>{row.dim}</span>
                  <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>{row.score}%</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#8b949e' }}>
                  {row.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editorial Narrative */}
        <div>
          <div className="section-mono-kicker">// 02 RIGOROUS RUBRICS</div>
          <h3 className="section-headline">
            Feedback that actually reflects hiring bar standards.
          </h3>
          <p className="section-desc" style={{ marginBottom: '1.25rem' }}>
            Real engineering hiring committees don&apos;t evaluate candidates with vague percentages. MockMate grades your solutions across the exact dimensions senior interviewers look for: fault tolerance, latency implications, race condition handling, and clear communication.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#c9d1d9' }}>
              <CheckCircle2 size={15} style={{ color: '#34d399' }} />
              <span>Multi-axis evaluation (Correctness, Edge Cases, Architecture)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#34d399' }}>
              <CheckCircle2 size={15} style={{ color: '#34d399' }} />
              <span>Actionable diagnostic feedback rather than generic AI compliments</span>
            </div>
          </div>
          <Link to="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#58a6ff', fontSize: '0.85rem', fontWeight: 600 }}>
            Inspect candidate benchmark scores <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Feature 03: Verifiable Proof Console */}
      <div style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '48ch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <ShieldCheck size={16} style={{ color: '#34d399' }} />
            <span className="mono" style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>
              VERIFIABLE CREDENTIALS
            </span>
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f0f6fc', margin: '0 0 0.35rem' }}>
            Shareable Milestone Certificates
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#8b949e', margin: 0, lineHeight: 1.5 }}>
            Complete milestone interview tracks to unlock public certificates with verified URLs and scannable QR codes for your resume and LinkedIn.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '6px',
          padding: '0.75rem 1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              PUBLIC RECORD PREVIEW
            </div>
            <div className="mono" style={{ fontSize: '0.8rem', color: '#c9d1d9', fontWeight: 600 }}>
              mockmate.dev/verify/cert_89f2a
            </div>
          </div>
          <button
            onClick={handleCopy}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              background: '#21262d',
              border: '1px solid #30363d',
              color: copied ? '#34d399' : '#f0f6fc',
              fontSize: '0.74rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
