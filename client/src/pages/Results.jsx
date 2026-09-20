import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RotateCcw, Award, Edit3, Save, Sparkles } from 'lucide-react'
import api, { apiError } from '../lib/api'
import ScoreChart from '../components/ScoreChart'
import QuestionEvaluationList from '../components/QuestionEvaluationList'
import { formatGeneratedText } from '../lib/text'

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
          <ScoreChart
            questions={interview.questions}
            scores={interview.questions.map((q) => q.score ?? 0)}
          />
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

      <QuestionEvaluationList
        questions={interview.questions}
        isQuiz={isQuiz}
        bookmarkedMap={bookmarkedMap}
        onBookmarkQuestion={handleBookmarkQuestion}
      />
    </main>
  )
}
