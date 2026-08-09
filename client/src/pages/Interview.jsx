import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Bookmark, Edit3 } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { formatGeneratedText } from '../lib/text'
import Timer from '../components/Timer'

// Open-ended interview: answer one question at a time, then submit for grading.
export default function Interview() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [interview, setInterview] = useState(null)
  const [answers, setAnswers] = useState([])
  const [notes, setNotes] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookmarkedMap, setBookmarkedMap] = useState({})

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
        setNotes(data.questions.map((q) => q.notes || ''))
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

  function updateNote(value) {
    setNotes((prev) => prev.map((n, i) => (i === current ? value : n)))
  }

  async function handleBookmark(prompt) {
    try {
      if (bookmarkedMap[current]) {
        toast.success('Question already bookmarked!')
        return
      }
      await api.post('/bookmarks', {
        prompt,
        role: interview.role,
        category: interview.category,
        answer: answers[current],
        notes: notes[current],
      })
      setBookmarkedMap((prev) => ({ ...prev, [current]: true }))
      toast.success('Question bookmarked!')
    } catch (err) {
      toast.error(apiError(err, 'Could not bookmark question'))
    }
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

  function handleTimeUp() {
    toast.error('Time is up! Submitting your answers...')
    submit()
  }

  if (loading) return <main className="page-center muted">Loading interview…</main>
  if (!interview) return null

  const question = interview.questions[current]
  if (!question) return null

  return (
    <main className="container interview">
      <div className="interview-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2>{interview.role}</h2>
            {interview.category && interview.category !== 'General' && <span className="tag">{interview.category}</span>}
          </div>
          <p className="muted small">
            {interview.experience} · {interview.difficulty} · {answered}/{total} answered
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {interview.timerMinutes > 0 && (
            <Timer minutes={interview.timerMinutes} onTimeUp={handleTimeUp} />
          )}
          <span className="counter">
            {current + 1} <span className="muted">/ {total}</span>
          </span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      <div className="question-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <p className="question-label" style={{ margin: 0 }}>Question {current + 1}</p>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleBookmark(question.prompt)}
            title="Bookmark this question"
          >
            <Bookmark size={15} fill={bookmarkedMap[current] ? 'currentColor' : 'none'} />
            {bookmarkedMap[current] ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>{formatGeneratedText(question.prompt)}</p>

        <textarea
          value={answers[current]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Type your answer here. Think out loud — structure beats length."
          rows={7}
        />

        <div className="notes-box">
          <div className="notes-header">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Edit3 size={14} /> Personal Note / Quick Reminder
            </span>
          </div>
          <input
            type="text"
            value={notes[current]}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Add a note to remember for this question..."
            style={{ fontSize: '0.88rem', padding: '0.5rem 0.75rem' }}
          />
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
