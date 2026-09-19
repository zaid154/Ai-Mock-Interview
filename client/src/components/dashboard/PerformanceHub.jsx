import { Clock, Trash2, Search, Sparkles } from 'lucide-react'

// Onboarding steps displayed when no interview sessions exist yet
const ROADMAP_STEPS = [
  {
    num: '1',
    title: 'Select Format & Role Track',
    desc: 'Choose between verbal Q&A mock or rapid MCQ drill tailored to your target position.',
  },
  {
    num: '2',
    title: 'Interactive AI Simulation',
    desc: 'Respond via voice or text with a realistic timer simulating real hiring loops.',
  },
  {
    num: '3',
    title: 'Granular Scorecard & Badges',
    desc: 'Review AI-generated feedback, save key questions, and unlock verified credentials.',
  },
]

/**
 * PerformanceHub Component
 * 
 * Displays candidate progress analytics:
 * 1. Radial readiness meter (Avg Score %)
 * 2. Searchable history feed of recent mock sessions
 * 3. Quick links to review transcripts (/results/:id) or resume sessions
 * 4. Step-by-step guidance empty state
 */
export default function PerformanceHub({
  sessions,
  completedSessions,
  avgScore,
  searchFilter,
  setSearchFilter,
  filteredSessions,
  fetchingSessions,
  deleteSession,
  navigate,
}) {
  // Radial circular progress calculation (radius = 24)
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (avgScore / 100) * circumference

  return (
    <div className="hub-card">
      <div className="studio-card-header">
        <div>
          <h2 className="studio-title">Performance Hub</h2>
          <p className="studio-subtitle">Track candidate readiness, score trends, and transcripts.</p>
        </div>
        <span className="subtle small mono" style={{ fontWeight: 700 }}>
          {sessions.length} sessions
        </span>
      </div>

      {/* Radial Readiness Rating Card */}
      <div className="readiness-snapshot-card">
        <div className="readiness-info-col">
          <span className="readiness-badge-label">
            {avgScore >= 80 ? '⭐ Elite Ready' : avgScore >= 60 ? '⚡ Strong Potential' : '🎯 Practice Phase'}
          </span>
          <div className="readiness-score-display">
            {avgScore}% <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Avg Score</span>
          </div>
          <div className="readiness-score-sub">
            {completedSessions.length > 0
              ? `${completedSessions.length} completed session${completedSessions.length > 1 ? 's' : ''} evaluated`
              : 'Complete your first drill to generate rating'}
          </div>
        </div>

        <div className="readiness-ring-wrap">
          <svg className="readiness-ring-svg" viewBox="0 0 58 58">
            <circle cx="29" cy="29" r={radius} className="readiness-ring-bg" />
            <circle
              cx="29"
              cy="29"
              r={radius}
              className="readiness-ring-fill"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeOffset,
                stroke:
                  avgScore >= 80
                    ? 'var(--good)'
                    : avgScore >= 60
                    ? 'var(--accent-primary)'
                    : 'var(--text-subtle)',
              }}
            />
          </svg>
          <span className="readiness-ring-text">{avgScore}%</span>
        </div>
      </div>

      {/* History Search Bar */}
      {sessions.length > 0 && (
        <div className="input-icon-wrap">
          <Search size={15} className="input-icon" />
          <input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search history by role or topic..."
            style={{ fontSize: '0.84rem' }}
          />
        </div>
      )}

      {/* Session Feed List or Clean Roadmap */}
      {fetchingSessions ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0' }} className="muted small mono">
          Loading past sessions...
        </div>
      ) : filteredSessions.length === 0 ? (
        sessions.length === 0 ? (
          <div className="hub-empty-roadmap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>How Assessment Works</span>
            </div>

            {ROADMAP_STEPS.map((step) => (
              <div key={step.num} className="roadmap-step-item">
                <span className="roadmap-step-num">{step.num}</span>
                <div className="roadmap-step-content">
                  <div className="roadmap-step-title">{step.title}</div>
                  <div className="roadmap-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            <p className="muted small" style={{ margin: 0 }}>
              No sessions match <strong>"{searchFilter}"</strong>
            </p>
          </div>
        )
      ) : (
        <div className="session-feed-list">
          {filteredSessions.map((session) => {
            const score = session.overallScore ?? session.totalScore
            const isPassed = score !== undefined && score >= 70
            return (
              <div
                key={session._id}
                className="session-feed-card"
                onClick={() => {
                  if (session.status === 'completed') {
                    navigate(`/results/${session._id}`)
                  } else if (session.mode === 'quiz') {
                    navigate(`/quiz/${session._id}`)
                  } else {
                    navigate(`/interview/${session._id}`)
                  }
                }}
              >
                <div className="session-main-meta">
                  <div className="session-pill-cluster">
                    <span className="tag" style={{ fontSize: '0.66rem' }}>
                      {session.mode === 'quiz' ? 'Quiz' : 'Q&A'}
                    </span>
                    <span className="tag-soft" style={{ fontSize: '0.66rem' }}>
                      {session.difficulty}
                    </span>
                    {session.timerMinutes > 0 && (
                      <span
                        className="tag-soft"
                        style={{
                          fontSize: '0.66rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <Clock size={10} /> {session.timerMinutes}m
                      </span>
                    )}
                  </div>

                  <div className="session-title-text">{session.role}</div>

                  <div className="session-topic-sub">
                    {session.category || session.topic}
                    {session.createdAt && (
                      <span>
                        {' '}•{' '}
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="session-actions-cluster">
                  {session.status === 'completed' ? (
                    <span
                      className="session-score-pill"
                      style={{
                        background: isPassed ? 'var(--good-soft)' : 'var(--surface-3)',
                        color: isPassed ? 'var(--good)' : 'var(--text)',
                        border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border)'}`,
                      }}
                    >
                      {score !== undefined ? `${score}%` : 'Done'}
                    </span>
                  ) : (
                    <span
                      className="session-score-pill"
                      style={{
                        background: 'var(--warn-soft)',
                        color: 'var(--warn)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                      }}
                    >
                      In Progress
                    </span>
                  )}

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
  )
}
