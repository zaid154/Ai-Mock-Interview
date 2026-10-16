import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Bot, User, Code2, MessageSquare, BarChart2, Mic, ArrowRight, Sparkles, Terminal } from 'lucide-react'

const TRACK_SCENARIOS = {
  backend: {
    title: 'session_04 • Staff Backend: Idempotent Payment Pipeline',
    status: 'AI Interviewer Active',
    timeLeft: '24:15 remaining',
    prompt: 'Let\'s design an idempotent payment processing endpoint. If a client sends POST /api/v1/payments and times out before receiving an ACK, how do you prevent a second charge on their retry?',
    codeLang: 'typescript',
    codeSnippet: `// POST /api/v1/payments with atomic deduplication
async function handlePaymentIntent(req: Request, res: Response) {
  const idempotencyKey = req.headers['idempotency-key']
  if (!idempotencyKey) return res.status(400).json({ error: 'Key required' })

  // 1. Acquire Redis distributed lock with 120s TTL
  const acquired = await redis.set(\`pay:\${idempotencyKey}\`, 'IN_PROGRESS', 'NX', 'EX', 120)
  if (!acquired) {
    return res.status(409).json({ error: 'Request in flight or already settled' })
  }
  // 2. Execute charge against gateway with exponential retry...
}`,
    candidateAnswer: 'We require a client-generated Idempotency-Key header per intent. In Redis, we acquire an atomic lock using SET key IN_PROGRESS NX EX 120. If already locked or settled, we replay the cached response instead of charging again.',
    scores: [
      { label: 'System Scalability', score: 94, color: '#38bdf8' },
      { label: 'Idempotency & Locks', score: 90, color: '#34d399' },
      { label: 'Edge-Case Recovery', score: 88, color: '#a855f7' }
    ],
    feedback: 'Strong point: Immediate identification of Redis atomic NX keys with TTL for double-spend prevention.',
    evalPoints: [
      { title: 'Partition Safety (40%)', desc: 'Handles network timeouts without issuing duplicate authorizations.' },
      { title: 'TTL Deduplication (35%)', desc: 'Redis TTL evicts completed keys after the SLA settlement window.' },
      { title: 'Error Semantics (25%)', desc: 'Accurately distinguishes 409 Conflict, 400 Bad Request, and 200 Replay.' }
    ]
  },
  frontend: {
    title: 'session_02 • Frontend Architect: Optimistic UI & Race Conditions',
    status: 'AI Interviewer Active',
    timeLeft: '18:40 remaining',
    prompt: 'How would you implement an optimistic UI update in React (such as liking a post) so the UI updates immediately, while cleanly rolling back on server error without race conditions?',
    codeLang: 'typescript',
    codeSnippet: `// Optimistic state update with abort controller
function useOptimisticMutation(mutateFn, { onRollback }) {
  const abortRef = useRef<AbortController | null>(null)
  
  const execute = async (payload) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    // 1. Snapshot previous state & apply optimistic delta
    const previous = queryClient.getQueryData(['item', payload.id])
    queryClient.setQueryData(['item', payload.id], (old) => ({ ...old, ...payload }))
    // 2. Send network request with abort signal...
  }
}`,
    candidateAnswer: 'We snapshot the current cache state and immediately apply the optimistic delta. If the server fails or a new action is dispatched, we abort in-flight requests and cleanly rollback to the saved snapshot.',
    scores: [
      { label: 'State Management', score: 96, color: '#38bdf8' },
      { label: 'Race Mitigation', score: 92, color: '#34d399' },
      { label: 'UX Rollback Elegance', score: 91, color: '#a855f7' }
    ],
    feedback: 'Strong point: Proper usage of AbortController signal to prevent out-of-order server responses from overwriting newer local state.',
    evalPoints: [
      { title: 'Cache Snapshotting (40%)', desc: 'Immediately stores previous state before speculative mutations.' },
      { title: 'Signal Cancellation (35%)', desc: 'Cancels stale in-flight requests on rapid repeated user clicks.' },
      { title: 'User Notification (25%)', desc: 'Provides clear visual retry triggers when rollback triggers.' }
    ]
  },
  systemDesign: {
    title: 'session_07 • Distributed Systems: Event-Driven Push Pipeline',
    status: 'AI Interviewer Active',
    timeLeft: '32:00 remaining',
    prompt: 'Design a notification pipeline delivering 50,000 push/SMS alerts/sec. How do you guarantee at-least-once delivery without spamming users during downstream provider outages?',
    codeLang: 'typescript',
    codeSnippet: `// Partitioned Kafka producer with deduplication ring
interface NotificationEvent {
  userId: string
  idempotencyHash: string
  channel: 'sms' | 'push' | 'email'
  payload: Record<string, unknown>
}

async function enqueueNotification(event: NotificationEvent) {
  // Hash partition by userId to preserve ordering per recipient
  const partition = murmurHash(event.userId) % TOTAL_PARTITIONS
  await kafkaProducer.send({ topic: 'alerts.v1', partition, messages: [event] })
}`,
    candidateAnswer: 'We partition Kafka queues by userId to guarantee chronological delivery per user, with worker pools consuming messages backed by a Redis deduplication filter and exponential backoff retry topics.',
    scores: [
      { label: 'Queue Partitioning', score: 95, color: '#38bdf8' },
      { label: 'Backpressure Tuning', score: 89, color: '#34d399' },
      { label: 'Provider Circuit Breakers', score: 92, color: '#a855f7' }
    ],
    feedback: 'Strong point: Partitioning by userId ensures no out-of-order password reset alerts while isolating high-volume marketing traffic.',
    evalPoints: [
      { title: 'Partitioning Strategy (40%)', desc: 'Ensures sequential delivery per subscriber across worker nodes.' },
      { title: 'Dead Letter Queues (35%)', desc: 'Reroutes poisoned payloads without halting the main ingestion pipeline.' },
      { title: 'Downstream Throttling (25%)', desc: 'Circuit breakers prevent cascading socket exhaustion.' }
    ]
  }
}

const TABS = [
  { id: 'flow', label: 'Conversation Stream', icon: MessageSquare },
  { id: 'solution', label: 'Candidate Solution', icon: Code2 },
  { id: 'eval', label: 'Rubric Scorecard', icon: BarChart2 }
]

export default function HeroHUD({ activeTrack = 'backend' }) {
  const [activeTab, setActiveTab] = useState('flow')
  const scenario = TRACK_SCENARIOS[activeTrack] || TRACK_SCENARIOS.backend

  return (
    <div style={{
      width: '100%',
      background: '#0d1117',
      border: '1px solid #30363d',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4)',
      textAlign: 'left'
    }}>
      {/* Chrome Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 0.9rem',
        background: '#161b22',
        borderBottom: '1px solid #21262d',
        fontSize: '0.76rem',
        color: '#8b949e',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        {/* Terminal traffic lights & session title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
          </div>
          <span style={{ color: '#c9d1d9', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {scenario.title}
          </span>
        </div>

        {/* Status indicator & timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.72rem', fontWeight: 500 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            {scenario.status}
          </div>
          <span style={{ color: '#6e7681', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{scenario.timeLeft}</span>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.45rem 0.85rem',
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
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                border: 'none',
                background: isActive ? '#21262d' : 'transparent',
                color: isActive ? '#f0f6fc' : '#8b949e',
                fontSize: '0.76rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Main Workspace Body */}
      <div style={{ padding: '1rem', minHeight: '260px' }}>
        {activeTab === 'flow' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Conversation Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '0.75rem 0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', color: '#58a6ff', fontSize: '0.72rem', fontWeight: 600 }}>
                  <Bot size={13} /> Interviewer (AI Evaluator)
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#c9d1d9', lineHeight: 1.5 }}>
                  &ldquo;{scenario.prompt}&rdquo;
                </p>
              </div>

              <div style={{ background: '#090d14', border: '1px solid #21262d', borderRadius: '6px', padding: '0.75rem 0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', color: '#818cf8', fontSize: '0.72rem', fontWeight: 600 }}>
                  <User size={13} /> Candidate Response
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#c9d1d9', lineHeight: 1.5 }}>
                  &ldquo;{scenario.candidateAnswer}&rdquo;
                </p>
              </div>
            </div>

            {/* Rubric Feedback Rail */}
            <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={13} style={{ color: '#34d399' }} /> Live Rubric Feedback
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>
                    92% Pass
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {scenario.scores.map((s, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8b949e', marginBottom: '0.15rem' }}>
                        <span>{s.label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: s.color, fontWeight: 600 }}>{s.score}%</span>
                      </div>
                      <div style={{ height: '3px', background: '#21262d', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.score}%`, height: '100%', background: s.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.74rem', color: '#8b949e', lineHeight: 1.45, background: '#090d14', padding: '0.55rem 0.65rem', borderRadius: '4px', border: '1px solid #21262d' }}>
                  <strong style={{ color: '#34d399' }}>Analysis:</strong> {scenario.feedback}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'solution' && (
          <div style={{
            background: '#090d14',
            border: '1px solid #21262d',
            borderRadius: '6px',
            padding: '0.85rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            color: '#c9d1d9',
            overflowX: 'auto',
            whiteSpace: 'pre'
          }}>
            {scenario.codeSnippet}
          </div>
        )}

        {activeTab === 'eval' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {scenario.evalPoints.map((pt, i) => (
              <div key={i} style={{ padding: '0.75rem', background: '#161b22', border: '1px solid #30363d', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#58a6ff', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <CheckCircle2 size={13} /> {pt.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.73rem', color: '#8b949e', lineHeight: 1.45 }}>
                  {pt.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Ribbon with Audio Waveform */}
      <div style={{
        padding: '0.65rem 1rem',
        background: '#161b22',
        borderTop: '1px solid #21262d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
            <Mic size={12} style={{ color: '#58a6ff', marginRight: '3px' }} />
            {[6, 12, 5, 10, 14, 8, 12, 6, 10, 5].map((h, i) => (
              <span key={i} style={{ width: '2px', height: `${h}px`, background: '#58a6ff', borderRadius: '1px', opacity: 0.75 }} />
            ))}
          </div>
          <span style={{ fontSize: '0.73rem', color: '#8b949e' }}>
            Simultaneous Speech &amp; Code Input
          </span>
        </div>

        <Link
          to="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '4px',
            background: '#238636',
            color: '#ffffff',
            fontSize: '0.76rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Test Live Simulation <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
