import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Code2, Server, Network, TerminalSquare, ArrowRight, CheckCircle2 } from 'lucide-react'

const TRACKS = [
  {
    id: 'frontend',
    title: 'Frontend & Full Stack',
    icon: Code2,
    badge: 'React • Next.js • TypeScript',
    roles: 'Senior Frontend / Full Stack Engineer',
    question: 'How would you implement an optimistic UI update in React (such as liking a post or submitting a comment) so the UI updates immediately, while ensuring server errors roll back cleanly without race conditions?',
    criteria: ['Optimistic state rollbacks', 'Race condition mitigation with abort signals', 'Graceful error handling & user feedback']
  },
  {
    id: 'backend',
    title: 'Backend & APIs',
    icon: Server,
    badge: 'Node.js • PostgreSQL • Redis',
    roles: 'Backend Engineer / Microservices Lead',
    question: 'Suppose your API depends on a downstream third-party service that suddenly starts taking 10+ seconds to respond. How do you prevent your server from exhausting connection pools and cascading failures across your application?',
    criteria: ['Timeouts & circuit breaker patterns', 'Connection pool tuning & backpressure', 'Fallback responses & graceful degradation']
  },
  {
    id: 'system-design',
    title: 'System Design & Architecture',
    icon: Network,
    badge: 'Distributed Systems • Scalability',
    roles: 'Senior / Staff Systems Architect',
    question: 'Design a notification service that reliably sends millions of push, email, and SMS notifications daily. How do you guarantee exactly-once or at-least-once delivery without sending duplicate alerts to users?',
    criteria: ['Event queues (Kafka/RabbitMQ) & worker pools', 'Idempotency keys & database deduplication', 'Rate limiting & retry exponential backoff']
  },
  {
    id: 'devops',
    title: 'DevOps & Infrastructure',
    icon: TerminalSquare,
    badge: 'Docker • Kubernetes • CI/CD',
    roles: 'DevOps Engineer / Site Reliability Engineer',
    question: 'Walk me through how you would troubleshoot a production service in Kubernetes that is intermittently crashing with an OOMKilled (Exit Code 137) status, and how you configure container resource requests vs limits safely.',
    criteria: ['Log inspection & container crash analytics', 'Resource requests vs limit configurations', 'Health probes (liveness vs readiness) & rollbacks']
  }
]

export default function TrackExplorer({ user }) {
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0].id)
  const current = TRACKS.find((t) => t.id === selectedTrack) || TRACKS[0]

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #30363d',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Workbench Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1rem',
        background: '#161b22',
        borderBottom: '1px solid #21262d',
        fontSize: '0.76rem',
        color: '#8b949e',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#58a6ff' }}>curricula/</span>
          <span style={{ color: '#f0f6fc', fontWeight: 600 }}>track_matrix.ts</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#6e7681' }}>
          4 Engineering Tracks • Calibrated Rubrics
        </span>
      </div>

      {/* Split Body: Sidebar & Detail Viewport */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 310px) 1fr',
        minHeight: '380px'
      }}>
        {/* Left Track Navigation Strip */}
        <div
          role="tablist"
          aria-label="Engineering Tracks"
          style={{
            background: '#090d14',
            borderRight: '1px solid #21262d',
            display: 'flex',
            flexDirection: 'column',
            padding: '0.5rem'
          }}
        >
          {TRACKS.map((track, idx) => {
            const Icon = track.icon
            const isActive = selectedTrack === track.id
            const stepNum = String(idx + 1).padStart(2, '0')
            return (
              <button
                key={track.id}
                role="tab"
                id={`track-tab-${track.id}`}
                aria-selected={isActive}
                aria-controls="track-tabpanel"
                onClick={() => setSelectedTrack(track.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #30363d' : '1px solid transparent',
                  background: isActive ? '#161b22' : 'transparent',
                  color: isActive ? '#f0f6fc' : '#8b949e',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  marginBottom: '0.25rem'
                }}
              >
                <span className="mono" style={{ fontSize: '0.74rem', color: isActive ? '#58a6ff' : '#6e7681', fontWeight: 700, marginTop: '2px' }}>
                  {stepNum}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: isActive ? '#f0f6fc' : '#c9d1d9', marginBottom: '0.2rem' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6e7681', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.badge}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Detail Viewport */}
        <div
          role="tabpanel"
          id="track-tabpanel"
          aria-labelledby={`track-tab-${selectedTrack}`}
          style={{
            padding: '1.75rem',
            background: '#0d1117',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#161b22', border: '1px solid #30363d', color: '#58a6ff', fontFamily: 'var(--font-mono)' }}>
                  {current.badge}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                Target: {current.roles}
              </span>
            </div>

            <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '6px', padding: '1.1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                // SAMPLE INTERVIEW SCENARIO
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#f0f6fc', lineHeight: 1.6 }}>
                &ldquo;{current.question}&rdquo;
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                // EVALUATION CRITERIA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                {current.criteria.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#c9d1d9', background: '#090d14', border: '1px solid #21262d', padding: '0.55rem 0.75rem', borderRadius: '4px' }}>
                    <CheckCircle2 size={14} style={{ color: '#34d399', marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #21262d' }}>
            <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.55rem 1.35rem', fontSize: '0.84rem' }}>
              Start {current.title} Simulation <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
