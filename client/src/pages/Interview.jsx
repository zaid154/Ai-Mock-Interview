import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Bookmark, Edit3, Sparkles, CheckCircle2, Clock } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { formatGeneratedText } from '../lib/text'
import Timer from '../components/Timer'

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

  if (loading) return <main className="page-center muted">Loading focus session environment…</main>
  if (!interview) return null

  const question = interview.questions[current]
  if (!question) return null

  return (
    <main className="container" style={{ maxWidth: '960px' }}>
      {/* Focus Mode HUD Header */}
      <div className="interview-hud-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <span className="badge-glow" style={{ fontSize: '0.72rem' }}>
              <Sparkles size={12} /> Focus Mode Session
            </span>
            <span className="tag">{interview.role}</span>
            {interview.category && interview.category !== 'General' && (
              <span className="tag-soft">{interview.category}</span>
            )}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            {interview.experience} · {interview.difficulty} difficulty · {answered}/{total} answered
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {interview.timerMinutes > 0 && (
            <Timer minutes={interview.timerMinutes} onTimeUp={handleTimeUp} />
          )}
          <span className="mono" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {current + 1} <span className="muted">/ {total}</span>
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* Question Workbench Card */}
      <div className="question-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="tag-soft mono" style={{ fontSize: '0.8rem' }}>Question {current + 1} of {total}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleBookmark(question.prompt)}
            title="Bookmark this question"
          >
            <Bookmark size={15} fill={bookmarkedMap[current] ? 'currentColor' : 'none'} />
            {bookmarkedMap[current] ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>
          {formatGeneratedText(question.prompt)}
        </p>

        <textarea
          value={answers[current]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="Type your response here. Structure your logic clearly — mention trade-offs, architecture choices, or code examples..."
          rows={8}
          style={{ fontSize: '1rem', lineHeight: '1.6', padding: '1.1rem' }}
        />

        {/* Candidate Note Drawer */}
        <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.1rem', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span className="field-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Edit3 size={15} style={{ color: 'var(--accent-primary)' }} /> Candidate Notepad / Scratchpad
            </span>
          </div>
          <input
            type="text"
            value={notes[current]}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Jot down quick key points or formulas to remember..."
            style={{ fontSize: '0.9rem', padding: '0.65rem 0.85rem' }}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
        >
          <ChevronLeft size={18} /> Previous Question
        </button>

        {isLast ? (
          <button className="btn btn-primary btn-lg" onClick={submit} disabled={submitting}>
            {submitting ? 'Scoring your answers…' : 'Finish & Get Feedback'}
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
