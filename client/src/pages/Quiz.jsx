import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Bookmark, Edit3, HelpCircle, CheckCircle2 } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { formatGeneratedText } from '../lib/text'
import Timer from '../components/Timer'

// Option labels (A, B, C, D) corresponding to option indices (0, 1, 2, 3)
const LETTERS = ['A', 'B', 'C', 'D']

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()

  // --- State Management ---
  const [quiz, setQuiz] = useState(null)
  const [picks, setPicks] = useState([]) // Array of selected option indices (-1 if unanswered)
  const [notes, setNotes] = useState([]) // Candidate notes per question
  const [current, setCurrent] = useState(0) // Active question index
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookmarkedMap, setBookmarkedMap] = useState({})

  /**
   * Fetches active quiz session from GET /api/interviews/:id.
   * Note: The server automatically hides `correctIndex` until status is 'completed'
   * to prevent candidates from inspecting answers via browser DevTools.
   */
  useEffect(() => {
    api
      .get(`/interviews/${id}`)
      .then((res) => {
        const data = res.data.interview
        if (data.status === 'completed') {
          navigate(`/results/${data._id}`, { replace: true })
          return
        }
        if (data.mode !== 'quiz') {
          navigate(`/interview/${data._id}`, { replace: true })
          return
        }
        setQuiz(data)
        // Initialize all picks to -1 (unanswered)
        setPicks(data.questions.map(() => -1))
        setNotes(data.questions.map((q) => q.notes || ''))
      })
      .catch((err) => {
        toast.error(apiError(err, 'Could not load the quiz'))
        navigate('/dashboard')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  // Computed helper counters
  const total = quiz?.questions?.length ?? 0
  const answered = useMemo(() => picks.filter((p) => p >= 0).length, [picks])
  const isLast = current === total - 1

  /**
   * Records the candidate's selected option index for the active question.
   */
  function pick(optionIndex) {
    setPicks((prev) => prev.map((p, i) => (i === current ? optionIndex : p)))
  }

  /**
   * Updates scratchpad note for the active question.
   */
  function updateNote(value) {
    setNotes((prev) => prev.map((n, i) => (i === current ? value : n)))
  }

  /**
   * Saves this MCQ question, options, and candidate notes to Bookmarks.
   * Endpoint: POST /api/bookmarks
   */
  async function handleBookmark(prompt, options) {
    if (bookmarkedMap[current]) {
      toast.success('Question already bookmarked!')
      return
    }

    try {
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

  /**
   * Submits selected options array to POST /api/interviews/:id/submit.
   * The server scores options deterministically against `correctIndex`.
   */
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

  /**
   * Auto-submits quiz when timer expires.
   */
  function handleTimeUp() {
    toast.error('Time is up! Submitting your quiz...')
    submit()
  }

  if (loading) return <main className="page-center muted">Loading technical quiz…</main>
  if (!quiz) return null

  const question = quiz.questions[current]
  if (!question) return null

  return (
    <main className="container" style={{ maxWidth: '960px' }}>
      {/* ── Quiz HUD Header ── */}
      <div className="interview-hud-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span className="badge-glow" style={{ fontSize: '0.72rem' }}>
              <HelpCircle size={13} /> Technical MCQ Quiz
            </span>
            <span className="tag">{quiz.role}</span>
            {quiz.category && quiz.category !== 'General' && <span className="tag-soft">{quiz.category}</span>}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            {quiz.experience} · {quiz.difficulty} difficulty · {answered}/{total} answered
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {quiz.timerMinutes > 0 && <Timer minutes={quiz.timerMinutes} onTimeUp={handleTimeUp} />}
          <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {current + 1} <span className="muted">/ {total}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* ── Question Card ── */}
      <div className="question-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="tag-soft mono" style={{ fontSize: '0.8rem' }}>
            Question {current + 1} of {total}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleBookmark(question.prompt, question.options)}
            title="Bookmark this question"
          >
            <Bookmark size={15} fill={bookmarkedMap[current] ? 'currentColor' : 'none'} />
            {bookmarkedMap[current] ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>
          {formatGeneratedText(question.prompt)}
        </p>

        {/* MCQ Options List */}
        <div className="options-grid">
          {question.options.map((opt, i) => (
            <button
              type="button"
              key={i}
              className={`option-card ${picks[current] === i ? 'selected' : ''}`}
              onClick={() => pick(i)}
            >
              <span className="option-letter">{LETTERS[i]}</span>
              <span style={{ whiteSpace: 'pre-wrap', flex: 1, fontWeight: 500 }}>
                {formatGeneratedText(opt)}
              </span>
              {picks[current] === i && <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)' }} />}
            </button>
          ))}
        </div>

        {/* Candidate Scratchpad Box */}
        <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.1rem', background: 'var(--surface-2)' }}>
          <span className="field-label" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Edit3 size={15} style={{ color: 'var(--accent-primary)' }} /> Candidate Note / Key Recall
          </span>
          <input
            type="text"
            value={notes[current]}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Add a note to review later for this question..."
            style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
          />
        </div>
      </div>

      {/* ── Navigation Controls ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
          <ChevronLeft size={18} /> Previous Question
        </button>

        {isLast ? (
          <button className="btn btn-primary btn-lg" onClick={submit} disabled={submitting}>
            {submitting ? 'Scoring Quiz…' : 'Finish & See Results'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>
            Next Question <ChevronRight size={18} />
          </button>
        )}
      </div>
    </main>
  )
}
