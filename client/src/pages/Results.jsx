import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RotateCcw, Check, X, Bookmark, Award, Edit3, Save, Sparkles, ArrowRight, FileCheck } from 'lucide-react'
import api, { apiError } from '../lib/api'
import ScoreChart from '../components/ScoreChart'
import { formatGeneratedText } from '../lib/text'

const LETTERS = ['A', 'B', 'C', 'D']

function verdict(score) {
  if (score >= 80) return { label: 'Strong Candidate', className: 'score-chip', desc: 'Ready for real-world interviews!' }
  if (score >= 55) return { label: 'Solid, with minor gaps', className: 'chip-pending', desc: 'Good foundation. Review key feedback areas below.' }
  return { label: 'Needs Practice', className: 'tag-soft', desc: 'Revisit core concepts and try another practice session.' }
}

export default function Results() {
  const { id } = useParams()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookmarkedMap, setBookmarkedMap] = useState({})
  const [sessionNotes, setSessionNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

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
      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
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

      {/* Top 2-Column Analytics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Overall Score Gauge Donut */}
        <div className="panel score-ring">
          <div className="score-donut" style={{ '--pct': interview.overallScore }}>
            <div className="score-donut-inner">
              <span className="score-value">{interview.overallScore}</span>
              <span className="muted small">/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span className={v.className} style={{ fontSize: '0.9rem', marginBottom: '0.3rem', display: 'inline-block' }}>
              {v.label}
            </span>
            <p className="muted small" style={{ margin: '0.3rem 0 0' }}>{v.desc}</p>
          </div>
        </div>

        {/* Score Per Question Chart */}
        <div className="panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Score Per Question</h3>
          <ScoreChart scores={interview.questions.map((q) => q.score)} />
        </div>
      </div>

      {/* Session AI Summary */}
      {interview.summary && (
        <div className="panel" style={{ marginBottom: '1.5rem', background: 'var(--surface-2)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} /> AI Summary &amp; Key Recommendations
          </h3>
          <p className="muted" style={{ margin: 0, lineHeight: '1.65' }}>{interview.summary}</p>
        </div>
      )}

      {/* Candidate Session Notes Editor */}
      <div className="panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem' }}>
            <Edit3 size={16} style={{ color: 'var(--accent-primary)' }} /> Personal Session Takeaways &amp; Action Plan
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={handleSaveSessionNotes} disabled={savingNotes}>
            <Save size={14} /> {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
        <textarea
          rows={3}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Jot down key topics or concepts you want to revise..."
        />
      </div>

      {/* Detailed Question Breakdown List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Detailed Question Breakdown</h3>

        {interview.questions.map((q, i) =>
          isQuiz ? (
            <div className="glass-card" key={i} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <p className="question-text" style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                  <span className="muted mono" style={{ marginRight: '0.4rem' }}>Q{i + 1}.</span> {formatGeneratedText(q.prompt)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleBookmarkQuestion(q)}
                    title="Bookmark Question"
                  >
                    <Bookmark size={14} fill={bookmarkedMap[q.prompt] ? 'currentColor' : 'none'} />
                  </button>
                  <span className={`tag ${q.selectedIndex === q.correctIndex ? '' : 'tag-soft'}`} style={{ color: q.selectedIndex === q.correctIndex ? 'var(--good)' : 'var(--bad)' }}>
                    {q.selectedIndex === q.correctIndex ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>

              <div className="options-grid">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctIndex
                  const isPicked = Number.isInteger(q.selectedIndex) && oi === q.selectedIndex
                  return (
                    <div
                      key={oi}
                      className={`option-card ${isCorrect ? 'correct' : ''} ${isPicked && !isCorrect ? 'wrong' : ''}`}
                      style={{ cursor: 'default' }}
                    >
                      <span className="option-letter">{LETTERS[oi]}</span>
                      <span style={{ whiteSpace: 'pre-wrap', flex: 1 }}>{formatGeneratedText(opt)}</span>
                      {isPicked && (
                        <span className="tag-soft" style={{ fontSize: '0.72rem' }}>
                          Your Choice {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                      {isCorrect && <Check size={18} style={{ color: 'var(--good)' }} />}
                      {isPicked && !isCorrect && <X size={18} style={{ color: 'var(--bad)' }} />}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card" key={i} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.8rem' }}>
                <p className="question-text" style={{ margin: 0, fontSize: '1.1rem' }}>
                  <span className="muted mono" style={{ marginRight: '0.4rem' }}>Q{i + 1}.</span> {formatGeneratedText(q.prompt)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleBookmarkQuestion(q)}
                    title="Bookmark Question"
                  >
                    <Bookmark size={14} fill={bookmarkedMap[q.prompt] ? 'currentColor' : 'none'} />
                  </button>
                  <span className="score-chip" style={{ fontSize: '0.9rem' }}>{q.score} / 10</span>
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '0.8rem' }}>
                <span className="muted small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Your Submitted Answer:</span>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                  {q.answer || <em className="muted">No response submitted.</em>}
                </p>
              </div>

              <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.93rem', lineHeight: '1.6' }}>
                <strong style={{ color: 'var(--text)' }}>AI Evaluator Feedback: </strong>
                {q.feedback}
              </div>
            </div>
          ),
        )}
      </div>
    </main>
  )
}
