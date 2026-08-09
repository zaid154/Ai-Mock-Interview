import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Bookmark, Edit3 } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { formatGeneratedText } from '../lib/text'
import Timer from '../components/Timer'

const LETTERS = ['A', 'B', 'C', 'D']

// Multiple-choice quiz. Pick one option per question, then submit. Scoring is
// done on the server by comparing picks to the answer key.
export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [picks, setPicks] = useState([]) // selected option index per question, -1 = none
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
        // A questions session belongs on the interview screen.
        if (data.mode !== 'quiz') {
          navigate(`/interview/${data._id}`, { replace: true })
          return
        }
        setQuiz(data)
        setPicks(data.questions.map(() => -1))
        setNotes(data.questions.map((q) => q.notes || ''))
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

  function updateNote(value) {
    setNotes((prev) => prev.map((n, i) => (i === current ? value : n)))
  }

  async function handleBookmark(prompt, options) {
    try {
      if (bookmarkedMap[current]) {
        toast.success('Question already bookmarked!')
        return
      }
      await api.post('/bookmarks', {
        prompt,
        role: quiz.role,
        category: quiz.category,
        options,
        notes: notes[current],
      })
      setBookmarkedMap((prev) => ({ ...prev, [current]: true }))
      toast.success('Quiz question bookmarked!')
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
      await api.post(`/interviews/${id}/submit`, { answers: picks })
      navigate(`/results/${id}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not submit your quiz'))
      setSubmitting(false)
    }
  }

  function handleTimeUp() {
    toast.error('Time is up! Submitting your quiz...')
    submit()
  }

  if (loading) return <main className="page-center muted">Loading quiz…</main>
  if (!quiz) return null

  const question = quiz.questions[current]
  if (!question) return null

  return (
    <main className="container interview">
      <div className="interview-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2>{quiz.role} · Quiz</h2>
            {quiz.category && quiz.category !== 'General' && <span className="tag">{quiz.category}</span>}
          </div>
          <p className="muted small">
            {quiz.experience} · {quiz.difficulty} · {answered}/{total} answered
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {quiz.timerMinutes > 0 && (
            <Timer minutes={quiz.timerMinutes} onTimeUp={handleTimeUp} />
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
            onClick={() => handleBookmark(question.prompt, question.options)}
            title="Bookmark this question"
          >
            <Bookmark size={15} fill={bookmarkedMap[current] ? 'currentColor' : 'none'} />
            {bookmarkedMap[current] ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        {/* pre-wrap so code snippets keep their line breaks */}
        <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>
          {formatGeneratedText(question.prompt)}
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
              <span style={{ whiteSpace: 'pre-wrap' }}>{formatGeneratedText(opt)}</span>
            </button>
          ))}
        </div>

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
