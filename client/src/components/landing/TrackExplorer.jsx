import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Code2, Server, Network, TerminalSquare, ArrowRight, CheckCircle2 } from 'lucide-react'

const TRACKS = [
  {
    id: 'frontend',
    title: 'Full Stack & Frontend',
    icon: Code2,
    badge: 'React 19 • Next.js • Web Vitals',
    roles: 'Staff UI Engineer / Full-Stack Lead',
    question: 'How does React 19 Actions and useTransition mitigate race conditions in optimistic UI updates? Explain reconciliation and microtask queuing.',
    criteria: ['Concurrent rendering & fiber trees', 'SSR hydration mismatches & boundaries', 'INP / LCP optimization techniques']
  },
  {
    id: 'backend',
    title: 'Distributed Backend',
    icon: Server,
    badge: 'Node.js • Redis • Kafka • Go',
    roles: 'Senior Backend Engineer / Architect',
    question: 'Prevent cascading failures and handle thread pool exhaustion in Node.js when downstream microservices experience p99 latency spikes.',
    criteria: ['Circuit breaker patterns (Hystrix/Resilience4j)', 'Worker threads vs. cluster module', 'Backpressure streams & queue backlogs']
  },
  {
    id: 'system-design',
    title: 'System Design & HLD',
    icon: Network,
    badge: 'High Scale • Sharding • Event-Driven',
    roles: 'Principal Architect / Engineering Director',
    question: 'Architect a globally distributed notification service handling 100M daily pushes with regional deduplication, failover, and strict p95 SLAs.',
    criteria: ['Multi-region active-active database replication', 'Idempotent delivery keys & deduplication', 'Kafka partition keys & consumer rebalancing']
  },
  {
    id: 'devops',
    title: 'Cloud & DevOps',
    icon: TerminalSquare,
    badge: 'Kubernetes • Docker • CI/CD • AWS',
    roles: 'DevOps Lead / SRE Specialist',
    question: 'Troubleshoot an intermittent CrashLoopBackOff in a Kubernetes Pod caused by memory leaks vs. JVM cgroup memory limit misalignment.',
    criteria: ['cgroups v1 vs v2 OOM killer semantics', 'Zero-downtime canary deployments via Argo', 'Prometheus custom metrics & HPA scaling']
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
                borderRadius: '12px',
                border: isActive ? '1px solid rgba(186, 156, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive ? 'linear-gradient(180deg, rgba(147, 100, 255, 0.15) 0%, rgba(147, 100, 255, 0.05) 100%)' : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#ffffff' : 'rgba(239, 237, 253, 0.65)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? '0 0 20px rgba(147, 100, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)' : 'none'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isActive ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: isActive ? '1px solid rgba(192, 132, 252, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                placeItems: 'center',
                color: isActive ? '#e59cff' : 'rgba(239, 237, 253, 0.6)',
                flexShrink: 0
              }}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {track.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(239, 237, 253, 0.5)' }}>
                  {track.roles.split('/')[0]}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Track Detail Glass Surface */}
      <div
        role="tabpanel"
        id="track-tabpanel"
        aria-labelledby={`track-tab-${selectedTrack}`}
        style={{
          borderRadius: '16px',
          padding: '1.5rem',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="glass-pill" style={{ borderColor: 'rgba(186, 156, 255, 0.3)', color: '#d8b4fe' }}>
            {current.badge}
          </div>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'rgba(239, 237, 253, 0.6)' }}>
            Target: {current.roles}
          </span>
        </div>

        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.55, marginBottom: '1.25rem', color: '#f8fafc' }}>
          &ldquo;{current.question}&rdquo;
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {current.criteria.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'rgba(239, 237, 253, 0.75)' }}>
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
