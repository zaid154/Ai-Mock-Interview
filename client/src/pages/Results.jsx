import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RotateCcw, Check, X, Bookmark, Award, Edit3, Save, Sparkles } from 'lucide-react'
import api, { apiError } from '../lib/api'
import ScoreChart from '../components/ScoreChart'
import { formatGeneratedText } from '../lib/text'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * Maps overall score percentage to an actionable candidate readiness verdict.
 */
function verdict(score) {
  if (score >= 80) return { label: 'Strong Candidate', className: 'score-chip', desc: 'Ready for real-world interviews!' }
  if (score >= 55) return { label: 'Solid, with minor gaps', className: 'chip-pending', desc: 'Good foundation. Review key feedback areas below.' }
  return { label: 'Needs Practice', className: 'tag-soft', desc: 'Revisit core concepts and try another practice session.' }
}

export default function Results() {
  const { id } = useParams()

  // --- States ---
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookmarkedMap, setBookmarkedMap] = useState({})
  const [sessionNotes, setSessionNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  /**
   * Fetches completed interview scorecard from GET /api/interviews/:id.
   */
  useEffect(() => {
    api
      .get(`/interviews/${id}`)
      .then((res) => {
        const data = res.data.interview
        setInterview(data)
        setSessionNotes(data.notes || '')
      })
      .catch((err) => toast.error(apiError(err, 'Could not load results')))
      .finally(() => setLoading(false))
  }, [id])

  /**
   * Saves a specific question with its answer, score, and AI feedback to Bookmarks.
   * Endpoint: POST /api/bookmarks
   */
  async function handleBookmarkQuestion(q) {
    try {
      await api.post('/bookmarks', {
        prompt: q.prompt,
        role: interview.role,
        category: interview.category,
        answer: q.answer,
        feedback: q.feedback,
        options: q.options,
        correctIndex: q.correctIndex,
        notes: q.notes,
      })
      setBookmarkedMap((prev) => ({ ...prev, [q.prompt]: true }))
      toast.success('Question saved to Bookmarks!')
    } catch (err) {
      toast.error(apiError(err, 'Could not bookmark question'))
    }
  }

  /**
   * Saves overall candidate session takeaways to MongoDB.
   * Endpoint: PATCH /api/interviews/:id/notes
   */
  async function handleSaveSessionNotes() {
    setSavingNotes(true)
    try {
      await api.patch(`/interviews/${id}/notes`, { notes: sessionNotes })
      toast.success('Session notes saved!')
    } catch (err) {
      toast.error(apiError(err, 'Could not save notes'))
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) return <main className="page-center muted">Evaluating performance results…</main>
  if (!interview) return <main className="page-center muted">Results not found.</main>

  const v = verdict(interview.overallScore)
  const isQuiz = interview.mode === 'quiz'

  return (
    <main className="container">
      {/* ── Results Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="badge-glow" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={13} /> Performance Audit Complete
            </span>
            <span className="tag">{interview.role}</span>
            {interview.category && interview.category !== 'General' && <span className="tag-soft">{interview.category}</span>}
          </div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Candidate Session Results</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link to="/certificates" className="btn btn-secondary">
            <Award size={16} /> View Certificates
          </Link>
          <Link to="/dashboard" className="btn btn-primary">
            <RotateCcw size={16} /> Start New Session
          </Link>
        </div>
      </div>

      {/* ── Top 2-Column Analytics Overview ── */}
      <div className="results-overview-grid" style={{ marginBottom: '2rem' }}>
        {/* Left Column: Overall Score Meter */}
        <div className="panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="subtle small uppercase" style={{ letterSpacing: '0.06em', fontWeight: 700 }}>
              Readiness Rating
            </span>
            <span className={v.className}>{v.label}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="mono" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>
              {interview.overallScore}%
            </span>
            <span className="muted" style={{ fontSize: '1.1rem' }}>overall rating</span>
          </div>

          <p className="muted small" style={{ margin: 0 }}>{v.desc}</p>
          {interview.summary && (
            <p style={{ marginTop: '1rem', fontSize: '0.92rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
              {formatGeneratedText(interview.summary)}
            </p>
          )}
        </div>

        {/* Right Column: Interactive Score Breakdown Chart */}
        <div className="panel" style={{ padding: '1.75rem' }}>
          <span className="subtle small uppercase" style={{ letterSpacing: '0.06em', fontWeight: 700, display: 'block', marginBottom: '1rem' }}>
            Question-by-Question Progression
          </span>
          <ScoreChart questions={interview.questions} />
        </div>
      </div>

      {/* ── Candidate Session Notes Card ── */}
      <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className="field-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Edit3 size={15} style={{ color: 'var(--accent-primary)' }} /> Session Takeaways &amp; Retrospective Notes
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSaveSessionNotes}
            disabled={savingNotes}
          >
            <Save size={13} /> {savingNotes ? 'Saving…' : 'Save Notes'}
          </button>
        </div>
        <textarea
          rows={3}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Capture your key takeaways, concepts to revise, or algorithmic patterns to practice..."
          style={{ width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
        />
      </div>

      {/* ── Question Breakdown List ── */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Detailed Question Evaluation</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {interview.questions.map((q, idx) => {
          const isBookmarked = Boolean(bookmarkedMap[q.prompt])
          return (
            <div key={idx} className="panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="tag-soft mono" style={{ fontSize: '0.78rem' }}>Q{idx + 1}</span>
                  <span className="score-chip" style={{ fontSize: '0.78rem' }}>
                    {isQuiz ? (q.score === 10 ? 'Correct (+10)' : 'Incorrect (0)') : `${q.score ?? 0} / 100`}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleBookmarkQuestion(q)}
                  title="Save question"
                >
                  <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                  {isBookmarked ? 'Saved' : 'Bookmark'}
                </button>
              </div>

              <p style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                {formatGeneratedText(q.prompt)}
              </p>

              {/* Quiz Mode: Display Options with Correct vs Picked Indicator */}
              {isQuiz && Array.isArray(q.options) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctIndex
                    const isPicked = optIdx === q.selectedIndex
                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: '0.7rem 0.9rem',
                          borderRadius: '8px',
                          border: isCorrect
                            ? '1px solid var(--good)'
                            : isPicked
                            ? '1px solid var(--bad)'
                            : '1px solid var(--border)',
                          background: isCorrect
                            ? 'var(--good-soft)'
                            : isPicked
                            ? 'var(--bad-soft)'
                            : 'var(--surface-2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          fontSize: '0.88rem',
                        }}
                      >
                        <span className="mono" style={{ fontWeight: 700 }}>{LETTERS[optIdx]}.</span>
                        <span style={{ flex: 1 }}>{formatGeneratedText(opt)}</span>
                        {isCorrect && <Check size={16} style={{ color: 'var(--good)' }} />}
                        {isPicked && !isCorrect && <X size={16} style={{ color: 'var(--bad)' }} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Questions Mode: Show Candidate's Answer */}
              {!isQuiz && q.answer && (
                <div style={{ marginBottom: '1rem', padding: '0.9rem', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 700 }}>Your Response:</span>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0 }}>{q.answer}</p>
                </div>
              )}

              {/* AI Qualitative Feedback */}
              {q.feedback && (
                <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    AI Feedback &amp; Suggestions:
                  </span>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {formatGeneratedText(q.feedback)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
