import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api, { apiError } from '../lib/api'

const LETTERS = ['A', 'B', 'C', 'D']

// Multiple-choice quiz. Pick one option per question, then submit. Scoring is
// done on the server by comparing picks to the answer key.
export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [picks, setPicks] = useState([]) // selected option index per question, -1 = none
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get(`/interviews/${id}`)
      .then((res) => {
        const data = res.data.interview
        if (data.status === 'completed') {
          navigate(`/results/${data._id}`, { replace: true })
          return
        }
        // A questions session belongs on the interview screen.
        if (data.mode !== 'quiz') {
          navigate(`/interview/${data._id}`, { replace: true })
          return
        }
        setQuiz(data)
        setPicks(data.questions.map(() => -1))
      })
      .catch((err) => {
        toast.error(apiError(err, 'Could not load the quiz'))
        navigate('/dashboard')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const total = quiz?.questions.length ?? 0
  const answered = useMemo(() => picks.filter((p) => p >= 0).length, [picks])
  const isLast = current === total - 1

  function pick(optionIndex) {
    setPicks((prev) => prev.map((p, i) => (i === current ? optionIndex : p)))
  }

  async function submit() {
    if (answered === 0) {
      toast.error('Answer at least one question before submitting')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/interviews/${id}/submit`, { answers: picks })
      navigate(`/results/${id}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not submit your quiz'))
      setSubmitting(false)
    }
  }

  if (loading) return <main className="page-center muted">Loading quiz…</main>
  if (!quiz) return null

  const question = quiz.questions[current]
  if (!question) return null

  return (
    <main className="container interview">
      <div className="interview-head">
        <div>
          <h2>{quiz.role} · Quiz</h2>
          <p className="muted small">
            {quiz.experience} · {quiz.difficulty} · {answered}/{total} answered
          </p>
        </div>
        <span className="counter">
          {current + 1} <span className="muted">/ {total}</span>
        </span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      <div className="question-card">
        <p className="question-label">Question {current + 1}</p>
        {/* pre-wrap so code snippets keep their line breaks */}
        <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>
          {question.prompt}
        </p>

        <div className="options">
          {question.options.map((opt, i) => (
            <button
              type="button"
              key={i}
              className={`option ${picks[current] === i ? 'selected' : ''}`}
              onClick={() => pick(i)}
            >
              <span className="option-letter">{LETTERS[i]}</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="interview-nav">
        <button
          className="btn btn-ghost"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isLast ? (
          <button className="btn btn-primary" onClick={submit} disabled={submitting}>
            {submitting ? 'Scoring…' : 'Finish & see score'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </main>
  )
}
