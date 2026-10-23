import { Clock, Trash2, Search, ArrowRight, MessageSquare, Bookmark, Layers } from 'lucide-react'

const STEPS = [
  { num: '01', title: 'Choose Track', desc: 'Select Frontend, Backend, Fullstack, or System Design.' },
  { num: '02', title: 'Answer Scenarios', desc: 'Speak or type your answers with live AI evaluation.' },
  { num: '03', title: 'Review Rubric', desc: 'Check 4-pillar rubric scores and bookmark tough questions.' },
]

export default function PerformanceHub({
  user, sessions, completedSessions, avgScore, searchFilter, setSearchFilter,
  filteredSessions, fetchingSessions, deleteSession, navigate, onOpenStudio,
}) {
  const firstName = user?.name?.split(' ')[0] || 'Candidate'
  const targetRole = user?.targetRole || 'Fullstack Developer'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.2rem', color: '#111827', letterSpacing: '-0.02em' }}>
            Welcome, {firstName}
          </h1>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#6b7280' }}>
            Candidate overview, skill assessments, and recent practice sessions.
          </p>
        </div>
        {onOpenStudio && (
          <button
            type="button"
            className="reflect-btn-primary"
            onClick={onOpenStudio}
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', gap: '0.45rem' }}
          >
            Start Practice <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Action Cards */}
      <div className="hub-action-grid">
        <div className="hub-action-card" onClick={() => navigate('/practice')}>
          <div className="hub-action-card-header">
            <div className="hub-action-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', color: '#2563eb' }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#111827', marginBottom: '0.2rem' }}>Technical Mock Interview</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.45 }}>
                Simulate real technical hiring screens with live speech-to-text dictation and AI rubrics.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600 }}>
            Launch Studio <ArrowRight size={13} />
          </div>
        </div>

        <div className="hub-action-card" onClick={() => navigate('/bookmarks')}>
          <div className="hub-action-card-header">
            <div className="hub-action-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', color: '#2563eb' }}>
              <Bookmark size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#111827', marginBottom: '0.2rem' }}>Saved Bookmarks</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.45 }}>
                Review saved tricky questions and ideal answers before your real interview.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600 }}>
            View Saved Questions <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {completedSessions.length > 0 && (
        <div className="hub-stats-row">
          <div className="hub-stat-tile">
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 600 }}>Completed Interviews</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{completedSessions.length} <span style={{ fontSize: '0.78rem', fontWeight: 400, color: '#6b7280' }}>sessions</span></div>
          </div>
          <div className="hub-stat-tile">
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 600 }}>Average Score</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: avgScore >= 75 ? '#16a34a' : '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {avgScore}% <span style={{ fontSize: '0.72rem', fontWeight: 500, padding: '0.15rem 0.45rem', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.05)', color: '#4b5563' }}>{avgScore >= 80 ? 'Proficient' : 'In Progress'}</span>
            </div>
          </div>
          <div className="hub-stat-tile">
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 600 }}>Target Track</span>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{targetRole}</div>
          </div>
        </div>
      )}

      {/* History List or First-time Roadmap */}
      <div className="hub-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Layers size={15} style={{ color: '#2563eb' }} />
            Recent Practice History
          </div>
          {sessions.length > 0 && (
            <div className="input-icon-wrap" style={{ maxWidth: '280px', margin: 0 }}>
              <Search size={14} className="input-icon" />
              <input value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder="Filter by topic or role..." style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem 0.35rem 2rem' }} />
            </div>
          )}
        </div>

        {fetchingSessions ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0' }} className="muted small mono">Loading practice history...</div>
        ) : filteredSessions.length === 0 ? (
          sessions.length === 0 ? (
            <div className="hub-empty-roadmap" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', marginBottom: '0.3rem' }}>
                How It Works
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                Simulate technical interviews tailored to your target engineering track and get instant rubric feedback.
              </p>
              <div className="hub-roadmap-steps">
                {STEPS.map((s) => (
                  <div key={s.num} className="hub-step-card">
                    <span className="hub-step-num">{s.num}</span>
                    <span className="hub-step-title">{s.title}</span>
                    <span className="hub-step-desc">{s.desc}</span>
                  </div>
                ))}
              </div>
              {onOpenStudio && (
                <button
                  type="button"
                  className="reflect-btn-primary"
                  onClick={onOpenStudio}
                  style={{ marginTop: '1.5rem', padding: '0.55rem 1.4rem', fontSize: '0.86rem' }}
                >
                  Start Your First Interview
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }} className="muted small">No sessions matching "{searchFilter}"</div>
          )
        ) : (
          <div className="session-feed-list">
            {filteredSessions.map((session) => {
              const isDone = session.status === 'completed'
              const score = session.overallScore ?? session.totalScore
              const dateStr = session.createdAt
                ? new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recently'

              return (
                <div
                  key={session._id}
                  className="session-feed-card"
                  onClick={() => navigate(isDone ? `/results/${session._id}` : `/interview/${session._id}`)}
                >
                  <div className="session-main-meta">
                    <div className="session-pill-cluster">
                      <span className="tag-soft" style={{ fontSize: '0.66rem' }}>
                        {session.difficulty || 'Medium'}
                      </span>
                      {session.timerMinutes > 0 && (
                        <span className="tag-soft" style={{ fontSize: '0.66rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={10} /> {session.timerMinutes}m
                        </span>
                      )}
                    </div>
                    <div className="session-title-text">{session.role || 'Software Engineer'}</div>
                    <div className="session-topic-sub">
                      {session.category || session.topic || 'General'}
                      <span> &bull; {dateStr}</span>
                    </div>
                  </div>

                  <div className="session-actions-cluster">
                    <span
                      className="session-score-pill"
                      style={{
                        background: isDone ? 'rgba(37, 99, 235, 0.1)' : 'rgba(234, 179, 8, 0.15)',
                        color: isDone ? '#2563eb' : '#d97706',
                      }}
                    >
                      {isDone ? (score !== undefined ? `${score}%` : 'Completed') : 'In Progress'}
                    </span>
                    <button
                      type="button"
                      className="session-trash-btn"
                      onClick={(e) => deleteSession(session._id, e)}
                      title="Delete Session"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
