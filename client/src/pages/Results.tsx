import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RotateCcw } from 'lucide-react'
import api, { apiError } from '../lib/api'
import ScoreChart from '../components/ScoreChart'
import type { Interview } from '../lib/types'

function verdict(score: number) {
  if (score >= 80) return { label: 'Strong', className: 'grade-good' }
  if (score >= 55) return { label: 'Solid, with gaps', className: 'grade-mid' }
  return { label: 'Needs work', className: 'grade-low' }
}

export default function Results() {
  const { id } = useParams()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/interviews/${id}`)
      .then((res) => setInterview(res.data.interview))
      .catch((err) => toast.error(apiError(err, 'Could not load results')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <main className="page-center muted">Loading results…</main>
  if (!interview) return <main className="page-center muted">Results not found.</main>

  const v = verdict(interview.overallScore)

  return (
    <main className="container results">
      <div className="results-head">
        <div>
          <p className="muted small">{interview.role} · {interview.difficulty}</p>
          <h2>Your results</h2>
        </div>
        <Link to="/dashboard" className="btn btn-ghost">
          <RotateCcw size={16} /> New interview
        </Link>
      </div>

      <div className="results-top">
        <div className="score-ring">
          <div className="score-donut" style={{ '--pct': interview.overallScore } as CSSProperties}>
            <div className="score-donut-inner">
              <span className="score-value">{interview.overallScore}</span>
              <span className="muted small">/ 100</span>
            </div>
          </div>
          <span className={`grade-badge ${v.className}`}>{v.label}</span>
        </div>
        <div className="panel chart-panel">
          <h3>Score per question</h3>
          <ScoreChart scores={interview.questions.map((q) => q.score)} />
        </div>
      </div>

      {interview.summary && (
        <div className="panel summary-panel">
          <h3>Summary</h3>
          <p>{interview.summary}</p>
        </div>
      )}

      <div className="answers">
        <h3>Question breakdown</h3>
        {interview.questions.map((q, i) => (
          <div className="answer-card" key={i}>
            <div className="answer-head">
              <p className="question-text">
                <span className="muted">Q{i + 1}.</span> {q.prompt}
              </p>
              <span className="q-score">{q.score}/10</span>
            </div>
            <p className="your-answer">{q.answer || <em className="muted">No answer given.</em>}</p>
            <p className="feedback">{q.feedback}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
