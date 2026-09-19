import { Clock, Trash2, Search, Sparkles } from 'lucide-react'

const STEPS = [
  { num: '1', title: 'Pick Format & Role', desc: 'Choose between verbal Q&A or rapid MCQ quiz.' },
  { num: '2', title: 'Answer Simulation', desc: 'Complete timed technical questions with speech or text.' },
  { num: '3', title: 'Review Scorecard', desc: 'Get line-by-line feedback and earn verified credentials.' },
]

/**
 * PerformanceHub: Shows candidate readiness rating, search filter, and recent session history.
 */
export default function PerformanceHub({
  sessions, completedSessions, avgScore, searchFilter, setSearchFilter,
  filteredSessions, fetchingSessions, deleteSession, navigate,
}) {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (avgScore / 100) * circumference

  return (
    <div className="hub-card">
      <div className="studio-card-header">
        <div>
          <h2 className="studio-title">Performance Hub</h2>
          <p className="studio-subtitle">Track readiness rating, score trends, and transcripts.</p>
        </div>
        <span className="subtle small mono" style={{ fontWeight: 700 }}>{sessions.length} sessions</span>
      </div>

      {/* Readiness Rating Card */}
      <div className="readiness-snapshot-card">
        <div className="readiness-info-col">
          <span className="readiness-badge-label">
            {avgScore >= 80 ? '⭐ Elite Ready' : avgScore >= 60 ? '⚡ Strong Potential' : '🎯 Practice Phase'}
          </span>
          <div className="readiness-score-display">
            {avgScore}% <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Avg Score</span>
          </div>
          <div className="readiness-score-sub">
            {completedSessions.length ? `${completedSessions.length} session${completedSessions.length > 1 ? 's' : ''} evaluated` : 'Complete your first drill to generate rating'}
          </div>
        </div>

        <div className="readiness-ring-wrap">
          <svg className="readiness-ring-svg" viewBox="0 0 58 58">
            <circle cx="29" cy="29" r={radius} className="readiness-ring-bg" />
            <circle
              cx="29" cy="29" r={radius} className="readiness-ring-fill"
              style={{ strokeDasharray: circumference, strokeDashoffset: strokeOffset, stroke: avgScore >= 80 ? 'var(--good)' : avgScore >= 60 ? 'var(--accent-primary)' : 'var(--text-subtle)' }}
            />
          </svg>
          <span className="readiness-ring-text">{avgScore}%</span>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="input-icon-wrap">
          <Search size={15} className="input-icon" />
          <input value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder="Search history by role or topic..." style={{ fontSize: '0.84rem' }} />
        </div>
      )}

      {/* History List or Guidance Steps */}
      {fetchingSessions ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }} className="muted small mono">Loading past sessions...</div>
      ) : filteredSessions.length === 0 ? (
        sessions.length === 0 ? (
          <div className="hub-empty-roadmap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>How It Works</span>
            </div>
            {STEPS.map((s) => (
              <div key={s.num} className="roadmap-step-item">
                <span className="roadmap-step-num">{s.num}</span>
                <div className="roadmap-step-content">
                  <div className="roadmap-step-title">{s.title}</div>
                  <div className="roadmap-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <p className="muted small" style={{ margin: 0 }}>No sessions match "{searchFilter}"</p>
          </div>
        )
      ) : (
        <div className="session-feed-list">
          {filteredSessions.map((session) => {
            const score = session.overallScore ?? session.totalScore
            const isPassed = score !== undefined && score >= 70
            const dest = session.status === 'completed' ? `/results/${session._id}` : session.mode === 'quiz' ? `/quiz/${session._id}` : `/interview/${session._id}`
            return (
              <div key={session._id} className="session-feed-card" onClick={() => navigate(dest)}>
                <div className="session-main-meta">
                  <div className="session-pill-cluster">
                    <span className="tag" style={{ fontSize: '0.66rem' }}>{session.mode === 'quiz' ? 'Quiz' : 'Q&A'}</span>
                    <span className="tag-soft" style={{ fontSize: '0.66rem' }}>{session.difficulty}</span>
                    {session.timerMinutes > 0 && <span className="tag-soft" style={{ fontSize: '0.66rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {session.timerMinutes}m</span>}
                  </div>
                  <div className="session-title-text">{session.role}</div>
                  <div className="session-topic-sub">
                    {session.category || session.topic}
                    {session.createdAt && <span> • {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                  </div>
                </div>
                <div className="session-actions-cluster">
                  <span className="session-score-pill" style={{ background: session.status === 'completed' ? (isPassed ? 'var(--good-soft)' : 'var(--surface-3)') : 'var(--warn-soft)', color: session.status === 'completed' ? (isPassed ? 'var(--good)' : 'var(--text)') : 'var(--warn)' }}>
                    {session.status === 'completed' ? (score !== undefined ? `${score}%` : 'Done') : 'In Progress'}
                  </span>
                  <button type="button" className="session-trash-btn" onClick={(e) => deleteSession(session._id, e)} title="Delete Session">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
