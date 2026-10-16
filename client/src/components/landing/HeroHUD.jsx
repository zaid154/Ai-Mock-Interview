import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Bot, User, Code2, MessageSquare, BarChart2, Mic, ArrowRight, Sparkles } from 'lucide-react'

const TABS = [
  { id: 'flow', label: 'Conversation Flow', icon: MessageSquare },
  { id: 'solution', label: 'Code Solution', icon: Code2 },
  { id: 'eval', label: 'Rubric Breakdown', icon: BarChart2 }
]

const SKILL_SCORES = [
  { label: 'System Architecture', score: 94, color: '#38bdf8' },
  { label: 'Idempotency & Edge Cases', score: 90, color: '#34d399' },
  { label: 'Distributed Reliability', score: 88, color: '#a855f7' }
]

export default function HeroHUD() {
  const [activeTab, setActiveTab] = useState('flow')

  return (
    <div style={{
      maxWidth: '960px',
      margin: '0 auto',
      background: '#0d1117',
      border: '1px solid #30363d',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
      textAlign: 'left'
    }}>
      {/* Top Window Chrome */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        background: '#161b22',
        borderBottom: '1px solid #21262d',
        fontSize: '0.78rem',
        color: '#8b949e',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        {/* Window controls & session label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
          </div>
          <span style={{ color: '#c9d1d9', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            session_04 • System Design: Idempotent Payment Pipeline
          </span>
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.72rem', fontWeight: 500 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            AI Interviewer Active
          </div>
          <span style={{ color: '#6e7681', fontFamily: 'var(--font-mono)' }}>24:15 remaining</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.5rem 1rem',
        background: '#0d1117',
        borderBottom: '1px solid #21262d'
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? '#21262d' : 'transparent',
                color: isActive ? '#f0f6fc' : '#8b949e',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Main Interactive Work Area */}
      <div style={{ padding: '1.25rem', minHeight: '270px' }}>
        {activeTab === 'flow' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Conversation Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Interviewer Bubble */}
              <div style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '0.85rem 1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>
                  <Bot size={14} /> Interviewer (AI)
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#c9d1d9', lineHeight: 1.55 }}>
                  &ldquo;Let&apos;s design an idempotent payment processing endpoint. If a client sends <code style={{ color: '#f0883e', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '4px' }}>POST /api/v1/payments</code> and times out before receiving an ACK, how do you prevent a second charge on their retry?&rdquo;
                </p>
              </div>

              {/* Candidate Bubble */}
              <div style={{
                background: '#0f141c',
                border: '1px solid #28303e',
                borderRadius: '8px',
                padding: '0.85rem 1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: '#a855f7', fontSize: '0.75rem', fontWeight: 600 }}>
                  <User size={14} /> Candidate
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9d1d9', lineHeight: 1.55 }}>
                  &ldquo;We require the client to generate a unique <code style={{ color: '#7ee787', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '4px' }}>Idempotency-Key</code> header per intent. In Redis, we acquire an atomic lock using <code style={{ color: '#7ee787', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '4px' }}>SET key IN_PROGRESS NX EX 120</code>. If already locked or completed, we replay the cached response instead of charging again.&rdquo;
                </p>
              </div>
            </div>

            {/* Live Evaluator Rail */}
            <div style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={14} style={{ color: '#34d399' }} /> Real-Time Feedback
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                    92% Pass
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}>
                  {SKILL_SCORES.map((s, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                        <span>{s.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: s.color }}>{s.score}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#21262d', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.score}%`, height: '100%', background: s.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.76rem', color: '#8b949e', lineHeight: 1.45, background: '#0d1117', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #21262d' }}>
                  <strong style={{ color: '#34d399' }}>Strong point:</strong> Immediate identification of Redis atomic <code style={{ color: '#f0f6fc' }}>NX</code> keys with TTL for double-spend prevention.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'solution' && (
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            color: '#c9d1d9',
            overflowX: 'auto'
          }}>
            <div style={{ color: '#8b949e', marginBottom: '0.5rem' }}>// POST /api/v1/payments with atomic deduplication</div>
            <div><span style={{ color: '#ff7b72' }}>async function</span> <span style={{ color: '#d2a8ff' }}>handlePaymentIntent</span>(req, res) &#123;</div>
            <div style={{ paddingLeft: '1.2rem' }}>
              <span style={{ color: '#ff7b72' }}>const</span> idempotencyKey = req.headers[<span style={{ color: '#a5d6ff' }}>&apos;idempotency-key&apos;</span>];<br />
              <span style={{ color: '#ff7b72' }}>if</span> (!idempotencyKey) <span style={{ color: '#ff7b72' }}>return</span> res.status(400).json(&#123; error: <span style={{ color: '#a5d6ff' }}>&apos;Key required&apos;</span> &#125;);<br /><br />
              <span style={{ color: '#8b949e' }}>// 1. Acquire Redis distributed lock with 120s TTL</span><br />
              <span style={{ color: '#ff7b72' }}>const</span> acquired = <span style={{ color: '#ff7b72' }}>await</span> redis.set(<span style={{ color: '#a5d6ff' }}>`pay:$&#123;idempotencyKey&#125;`</span>, <span style={{ color: '#a5d6ff' }}>&apos;IN_PROGRESS&apos;</span>, <span style={{ color: '#a5d6ff' }}>&apos;NX&apos;</span>, <span style={{ color: '#a5d6ff' }}>&apos;EX&apos;</span>, 120);<br />
              <span style={{ color: '#ff7b72' }}>if</span> (!acquired) &#123;<br />
              &nbsp;&nbsp;<span style={{ color: '#ff7b72' }}>return</span> res.status(409).json(&#123; error: <span style={{ color: '#a5d6ff' }}>&apos;Request already in flight or processed&apos;</span> &#125;);<br />
              &#125;<br />
              <span style={{ color: '#8b949e' }}>// 2. Execute charge against gateway &amp; cache result</span>
            </div>
            <div>&#125;</div>
          </div>
        )}

        {activeTab === 'eval' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={14} /> Partition Safety (40%)
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e', lineHeight: 1.5 }}>
                Handles network timeout without retrying duplicate card authorizations.
              </p>
            </div>
            <div style={{ padding: '0.85rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={14} /> TTL Deduplication (35%)
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e', lineHeight: 1.5 }}>
                Redis TTL cleans up completed transaction keys after SLA window expires.
              </p>
            </div>
            <div style={{ padding: '0.85rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a855f7', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={14} /> Error Semantics (25%)
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e', lineHeight: 1.5 }}>
                Distinguishes between 409 Conflict, 400 Bad Request, and 200 Cached Result.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Bottom Bar with Audio Waveform */}
      <div style={{
        padding: '0.75rem 1.25rem',
        background: '#161b22',
        borderTop: '1px solid #21262d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Subtle Audio Waveform Visualizer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '16px' }}>
            <Mic size={13} style={{ color: '#38bdf8', marginRight: '4px' }} />
            {[8, 14, 6, 12, 16, 10, 14, 8, 12, 6].map((h, i) => (
              <span
                key={i}
                style={{
                  width: '2px',
                  height: `${h}px`,
                  background: '#38bdf8',
                  borderRadius: '1px',
                  opacity: 0.75
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
            Interactive voice &amp; text mode
          </span>
        </div>

        <Link
          to="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1rem',
            borderRadius: '6px',
            background: '#238636',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease'
          }}
        >
          Try Live Session <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
