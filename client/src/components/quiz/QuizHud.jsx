import { HelpCircle } from 'lucide-react'
import Timer from '../Timer'

export default function QuizHud({ quiz, answered, total, current, onTimeUp }) {
  const percent = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <>
      <div className="interview-hud-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span className="tag" style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: 600, fontSize: '0.72rem' }}>
              Multiple Choice
            </span>
            <span className="tag">{quiz.role}</span>
            {quiz.category && quiz.category !== 'General' && <span className="tag-soft">{quiz.category}</span>}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            {quiz.experience} · {quiz.difficulty} difficulty · {answered}/{total} answered
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {quiz.timerMinutes > 0 && <Timer minutes={quiz.timerMinutes} onTimeUp={onTimeUp} />}
          <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {current + 1} <span className="muted">/ {total}</span>
          </span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </>
  )
}
