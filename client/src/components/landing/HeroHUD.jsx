import { useState } from 'react'
import { CheckCircle2, ShieldCheck, Cpu, Clock, Layers } from 'lucide-react'

const TABS = [
  { id: 'prompt', label: 'Technical Prompt' },
  { id: 'rubric', label: 'Evaluation Rubric' },
  { id: 'telemetry', label: 'Scoring Criteria' }
]

export default function HeroHUD() {
  const [activeTab, setActiveTab] = useState('prompt')

  return (
    <div className="reflect-showcase-outer" style={{ maxWidth: '920px', margin: '0 auto' }}>
      <div className="reflect-starlight-h" style={{ top: '-1px', left: '15%' }} />
      <div className="reflect-starlight-h" style={{ bottom: '-1px', right: '15%', animationDelay: '3s' }} />

      <div className="reflect-showcase-inner">
        {/* HUD Top Window Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={14} style={{ color: '#c084fc' }} aria-hidden="true" />
            <span className="mono" style={{ fontSize: '0.76rem', color: '#f8fafc', fontWeight: 600 }}>
              Live Simulation Preview • Distributed Systems
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="glass-pill" style={{ padding: '0.22rem 0.65rem', fontSize: '0.72rem', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.25)' }}>
              <Clock size={12} aria-hidden="true" />
              <span className="mono">28:45 remaining</span>
            </div>
            <div className="glass-pill" style={{ padding: '0.22rem 0.65rem', fontSize: '0.72rem', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
              <span>Session Active</span>
            </div>
          </div>
        </div>

        {/* Interactive Tabs */}
        <div
          role="tablist"
          aria-label="Simulation sections"
          style={{ display: 'flex', gap: '0.5rem', padding: '0.65rem 1.25rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0, 0, 0, 0.2)' }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`hud-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`hud-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.07)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #a855f7' : '2px solid transparent',
                color: activeTab === tab.id ? '#ffffff' : 'rgba(239, 237, 253, 0.6)',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* HUD Body Area */}
        <div
          role="tabpanel"
          id={`hud-panel-${activeTab}`}
          aria-labelledby={`hud-tab-${activeTab}`}
          style={{ padding: '1.35rem', minHeight: '175px' }}
        >
          {activeTab === 'prompt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="glass-pill" style={{ fontSize: '0.7rem', borderColor: 'rgba(168, 85, 247, 0.35)', color: '#d8b4fe' }}>
                  Question 03 of 05 • Senior Track
                </span>
                <span className="glass-pill" style={{ fontSize: '0.7rem', color: 'rgba(239, 237, 253, 0.6)' }}>
                  System Design &amp; Idempotency
                </span>
              </div>
              <p style={{ fontSize: '1rem', lineHeight: '1.65', margin: 0, fontWeight: 500, color: '#f8fafc' }}>
                &ldquo;Design an idempotent payment processing pipeline handling high throughput. How do you guarantee exactly-once semantics across distributed worker queues during network partition events?&rdquo;
              </p>
              <div style={{ background: 'rgba(0, 0, 0, 0.35)', borderRadius: '8px', padding: '0.75rem 1rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: 'rgba(239, 237, 253, 0.7)', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#c084fc' }}>Expected Focus:</span> Two-phase commits vs. Saga choreography, distributed idempotency keys (Redis/DynamoDB), dead-letter reconciliation.
              </div>
            </div>
          )}

          {activeTab === 'rubric' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={14} aria-hidden="true" /> Scalability &amp; Partitions (40%)
                </div>
                <div className="small muted" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Partition tolerance, distributed lock contention, horizontal sharding strategy.
                </div>
              </div>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <Cpu size={14} aria-hidden="true" /> Edge Case Resilience (35%)
                </div>
                <div className="small muted" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Replay attacks, duplicate webhook retries, out-of-order execution recovery.
                </div>
              </div>
              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <ShieldCheck size={14} aria-hidden="true" /> Latency &amp; Queue Bounds (25%)
                </div>
                <div className="small muted" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  p99 service bounds, synchronous vs. asynchronous worker queue trade-offs.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <span className="mono text-muted">Architectural Soundness</span>
                <span className="mono" style={{ color: '#34d399' }}>Saga Choreography Identified</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <span className="mono text-muted">Distributed Key Design</span>
                <span className="mono" style={{ color: '#c084fc' }}>TTL Deduplication Outlined</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                <span className="mono text-muted">Milestone Credential Signer</span>
                <span className="mono" style={{ color: '#34d399' }}>SHA-256 Checksum Ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Insight Banner */}
        <div style={{
          margin: '0 1.25rem 1.25rem',
          padding: '0.85rem 1.15rem',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.07)',
          border: '1px solid rgba(16, 185, 129, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={16} style={{ color: '#34d399' }} aria-hidden="true" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
              Evaluation Preview: <span style={{ fontWeight: 400, color: 'rgba(239, 237, 253, 0.7)' }}>Candidate articulated Saga choreography with compensating transactions cleanly.</span>
            </span>
          </div>
          <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
            Score: 94/100
          </div>
        </div>
      </div>
    </div>
  )
}
