import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { formatGeneratedText } from '../lib/text'

// Open-ended interview: answer one question at a time, then submit for grading.
export default function Interview() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [interview, setInterview] = useState(null)
  const [answers, setAnswers] = useState([])
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
        // A quiz session belongs on the quiz screen.
        if (data.mode === 'quiz') {
          navigate(`/quiz/${data._id}`, { replace: true })
          return
        }
        setInterview(data)
        setAnswers(data.questions.map((q) => q.answer || ''))
      })
      .catch((err) => {
        toast.error(apiError(err, 'Could not load the interview'))
        navigate('/dashboard')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const total = interview?.questions.length ?? 0
  const answered = useMemo(() => answers.filter((a) => a.trim()).length, [answers])
  const isLast = current === total - 1

  function updateAnswer(value) {
    setAnswers((prev) => prev.map((a, i) => (i === current ? value : a)))
  }

  async function submit() {
    if (answered === 0) {
      toast.error('Answer at least one question before submitting')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/interviews/${id}/submit`, { answers })
      navigate(`/results/${id}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not submit your answers'))
      setSubmitting(false)
    }
  }

  if (loading) return <main className="page-center muted">Loading interview…</main>
  if (!interview) return null

  const question = interview.questions[current]
  if (!question) return null

  return (
    <main className="container interview">
      <div className="interview-head">
        <div>
          <h2>{interview.role}</h2>
          <p className="muted small">
            {interview.experience} · {interview.difficulty} · {answered}/{total} answered
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
        <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>{formatGeneratedText(question.prompt)}</p>
        <textarea
          value={answers[current]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Type your answer here. Think out loud — structure beats length."
          rows={8}
        />
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
            {submitting ? 'Scoring your answers…' : 'Finish & get feedback'}
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
