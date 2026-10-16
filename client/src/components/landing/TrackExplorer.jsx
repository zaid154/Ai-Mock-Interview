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
    <div className="reflect-card" style={{ padding: '2rem' }}>
      {/* Track Selector Tabs */}
      <div
        role="tablist"
        aria-label="Engineering Tracks"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.75rem'
        }}
      >
        {TRACKS.map((track) => {
          const Icon = track.icon
          const isActive = selectedTrack === track.id
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
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: isActive ? '1px solid #58a6ff' : '1px solid #30363d',
                background: isActive ? '#161b22' : 'transparent',
                color: isActive ? '#f0f6fc' : '#8b949e',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: isActive ? 'rgba(88, 166, 255, 0.15)' : '#21262d',
                border: isActive ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid #30363d',
                display: 'grid',
                placeItems: 'center',
                color: isActive ? '#58a6ff' : '#8b949e',
                flexShrink: 0
              }}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {track.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
                  {track.roles.split('/')[0]}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Track Detail Surface */}
      <div
        role="tabpanel"
        id="track-tabpanel"
        aria-labelledby={`track-tab-${selectedTrack}`}
        style={{
          borderRadius: '8px',
          padding: '1.5rem',
          background: '#161b22',
          border: '1px solid #30363d'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(88, 166, 255, 0.1)', border: '1px solid rgba(88, 166, 255, 0.25)', color: '#58a6ff', fontFamily: 'var(--font-mono)' }}>
            {current.badge}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
            Target: {current.roles}
          </span>
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.25rem', color: '#f0f6fc' }}>
          &ldquo;{current.question}&rdquo;
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {current.criteria.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: '#c9d1d9' }}>
              <CheckCircle2 size={15} style={{ color: '#34d399', marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={user ? '/dashboard' : '/register'} className="reflect-btn-primary" style={{ padding: '0.55rem 1.4rem', fontSize: '0.85rem' }}>
            Practice This Track <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
