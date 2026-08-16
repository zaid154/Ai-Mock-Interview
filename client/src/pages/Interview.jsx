import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Bookmark, Edit3, Sparkles, CheckCircle2, Clock, RotateCcw, Copy, Check, FileText } from 'lucide-react'
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
  const [copiedPrompt, setCopiedPrompt] = useState(false)

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
  const answeredCount = useMemo(() => answers.filter((a) => a.trim()).length, [answers])
  const isLast = current === total - 1

  const currentAnswer = answers[current] || ''
  const wordCount = useMemo(() => {
    const trimmed = currentAnswer.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [currentAnswer])

  function updateAnswer(value) {
    setAnswers((prev) => prev.map((a, i) => (i === current ? value : a)))
  }

  function updateNote(value) {
    setNotes((prev) => prev.map((n, i) => (i === current ? value : n)))
  }

  function clearCurrentAnswer() {
    updateAnswer('')
    toast.success('Answer field cleared')
  }

  function copyQuestionPrompt(prompt) {
    navigator.clipboard.writeText(prompt)
    setCopiedPrompt(true)
    toast.success('Question copied to clipboard!')
    setTimeout(() => setCopiedPrompt(false), 3000)
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
    if (answeredCount === 0) {
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
    <main className="container" style={{ maxWidth: '980px' }}>
      {/* Focus Mode HUD Header */}
      <div className="interview-hud-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <span className="badge-glow" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={13} /> Focus Mode Session
            </span>
            <span
              style={{
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'var(--accent-grad-subtle)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              {interview.role}
            </span>
            {interview.category && interview.category !== 'General' && (
              <span
                style={{
                  padding: '0.2rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  background: 'var(--surface-2)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {interview.category}
              </span>
            )}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            {interview.experience} · <span style={{ textTransform: 'capitalize' }}>{interview.difficulty}</span> difficulty ·{' '}
            <strong style={{ color: 'var(--text)' }}>{answeredCount}</strong> of {total} answered
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {interview.timerMinutes > 0 && <Timer minutes={interview.timerMinutes} onTimeUp={handleTimeUp} />}
          <div style={{ textAlign: 'right' }}>
            <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {current + 1} <span className="muted">/ {total}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Question Number Palette Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '1.2rem 0 0.8rem',
          flexWrap: 'wrap',
          background: 'var(--surface)',
          padding: '0.65rem 0.9rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}
      >
        <span className="muted small" style={{ fontSize: '0.76rem', fontWeight: 700, uppercase: 'true', letterSpacing: '0.05em', marginRight: '0.2rem' }}>
          Questions:
        </span>
        {interview.questions.map((q, idx) => {
          const isCurrent = idx === current
          const isAnswered = Boolean(answers[idx]?.trim())
          return (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: isCurrent ? '2px solid var(--accent-primary)' : '1px solid var(--border)',
                background: isCurrent ? 'var(--accent-grad-subtle)' : isAnswered ? 'var(--good-soft)' : 'var(--surface-2)',
                color: isCurrent ? 'var(--accent-primary)' : isAnswered ? 'var(--good)' : 'var(--text-muted)',
                fontWeight: isCurrent || isAnswered ? 700 : 500,
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
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

      {/* Question Workbench Card */}
      <div className="panel" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              background: 'var(--surface-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            QUESTION {current + 1} OF {total}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => copyQuestionPrompt(question.prompt)} title="Copy question prompt">
              {copiedPrompt ? <Check size={14} style={{ color: 'var(--good)' }} /> : <Copy size={14} />}
              <span>{copiedPrompt ? 'Copied' : 'Copy Question'}</span>
            </button>

            <button className="btn btn-ghost btn-sm" onClick={() => handleBookmark(question.prompt)} title="Bookmark this question">
              <Bookmark size={14} fill={bookmarkedMap[current] ? 'currentColor' : 'none'} style={{ color: bookmarkedMap[current] ? 'var(--accent-primary)' : 'inherit' }} />
              <span>{bookmarkedMap[current] ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>
        </div>

        <p className="question-text" style={{ fontSize: '1.12rem', lineHeight: '1.65', fontWeight: 600, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
          {formatGeneratedText(question.prompt)}
        </p>

        {/* Answer Input Area */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={answers[current]}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="Type your structured response here. Explain your architecture logic, trade-offs, step-by-step algorithms, or code implementations..."
            rows={9}
            style={{
              fontSize: '0.98rem',
              lineHeight: '1.6',
              padding: '1.1rem',
              borderRadius: '12px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              width: '100%',
              resize: 'vertical',
            }}
          />

          {/* Word Count HUD Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              marginTop: '0.5rem',
              padding: '0.4rem 0.2rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="mono">
                <FileText size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>

              {wordCount > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: wordCount < 30 ? 'var(--warn)' : wordCount < 120 ? 'var(--accent-primary)' : 'var(--good)',
                  }}
                >
                  {wordCount < 30 ? '• Recommend more detail' : wordCount < 120 ? '• Good depth' : '• Thorough detailed response'}
                </span>
              )}
            </div>

            {currentAnswer.trim() && (
              <button
                type="button"
                onClick={clearCurrentAnswer}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <RotateCcw size={13} /> Clear Answer
              </button>
            )}
          </div>
        </div>

        {/* Candidate Scratchpad Drawer */}
        <div style={{ marginTop: '1.25rem', padding: '1rem 1.2rem', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span className="field-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
              <Edit3 size={14} style={{ color: 'var(--accent-primary)' }} /> Candidate Scratchpad / Personal Notes
            </span>
          </div>
          <input
            type="text"
            value={notes[current]}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Jot down personal reminders or key terms for this question..."
            style={{ fontSize: '0.88rem', padding: '0.55rem 0.8rem', borderRadius: '8px' }}
          />
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
          <ChevronLeft size={18} /> Previous Question
        </button>

        {isLast ? (
          <button className="btn btn-primary btn-lg" onClick={submit} disabled={submitting}>
            {submitting ? 'Scoring your answers…' : <>Finish &amp; Get Feedback <CheckCircle2 size={18} /></>}
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
