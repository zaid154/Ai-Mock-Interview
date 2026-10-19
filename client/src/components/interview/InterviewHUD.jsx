import Timer from '../Timer'

export default function InterviewHUD({
  interview,
  current,
  total,
  answeredCount,
  answers,
  onSelectQuestion,
  onTimeUp,
}) {
  return (
    <>
      {/* ── Interview Header ── */}
      <div className="interview-hud-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: 600 }}>
              Live Interview
            </span>
            <span className="tag" style={{ textTransform: 'uppercase' }}>
              {interview.role}
            </span>
            {interview.category && interview.category !== 'General' && (
              <span className="tag-soft">{interview.category}</span>
            )}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            {interview.experience} · <span style={{ textTransform: 'capitalize' }}>{interview.difficulty}</span> difficulty ·{' '}
            <strong style={{ color: 'var(--text)' }}>{answeredCount}</strong> of {total} answered
          </p>
        </div>

        <div className="interview-hud-stat-col" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {interview.timerMinutes > 0 && <Timer minutes={interview.timerMinutes} onTimeUp={onTimeUp} />}
          <div className="interview-hud-counter" style={{ textAlign: 'right' }}>
            <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {current + 1} <span className="muted">/ {total}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Question Quick-Jump Palette ── */}
      <div className="interview-jump-palette" role="toolbar" aria-label="Question Quick Jump Navigation">
        <span className="muted small" style={{ fontSize: '0.76rem', fontWeight: 700, marginRight: '0.2rem', flexShrink: 0 }}>
          Questions:
        </span>
        {interview.questions.map((q, idx) => {
          const isCurrent = idx === current
          const isAnswered = Boolean(answers[idx]?.trim())
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className="interview-jump-btn"
              style={{
                border: isCurrent ? '2px solid var(--accent-primary)' : '1px solid var(--border)',
                background: isCurrent ? 'var(--accent-grad-subtle)' : isAnswered ? 'var(--good-soft)' : 'var(--surface-2)',
                color: isCurrent ? 'var(--accent-primary)' : isAnswered ? 'var(--good)' : 'var(--text-muted)',
                fontWeight: isCurrent || isAnswered ? 700 : 500,
              }}
              title={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
            >
              {idx + 1}
              {isAnswered && !isCurrent && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--good)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Progress Track */}
      <div className="progress-track" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
    </>
  )
}
