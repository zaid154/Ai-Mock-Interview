import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import ScoreChart from '../components/ScoreChart'
import QuestionEvaluationList from '../components/QuestionEvaluationList'
import { RotateCcw, Bookmark, Check, Save } from 'lucide-react'

function verdict(score) {
  if (score >= 80) return { label: 'Strong Hire', className: 'badge-good' }
  if (score >= 60) return { label: 'Hire with Coaching', className: 'badge-warn' }
  return { label: 'Needs Practice', className: 'badge-bad' }
}

export default function Results() {
  const { id } = useParams()
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionNotes, setSessionNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [bookmarkedMap, setBookmarkedMap] = useState({})

  useEffect(() => {
    async function loadResults() {
      try {
        const { data } = await api.get(`/interviews/${id}`)
        setInterview(data.interview)
        setSessionNotes(data.interview.notes || '')
      } catch (err) {
        toast.error(apiError(err, 'Failed to load results'))
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [id])

  async function handleSaveNotes() {
    setSavingNotes(true)
    try {
      await api.patch(`/interviews/${id}/notes`, { notes: sessionNotes })
      toast.success('Notes saved successfully')
    } catch (err) {
      toast.error(apiError(err, 'Failed to save notes'))
    } finally {
      setSavingNotes(false)
    }
  }

  async function handleBookmarkQuestion(q) {
    const isBookmarked = !!bookmarkedMap[q._id || q.question]
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/by-question?question=${encodeURIComponent(q.question)}`)
        setBookmarkedMap((prev) => ({ ...prev, [q._id || q.question]: false }))
        toast.success('Question removed from bookmarks')
      } else {
        await api.post('/bookmarks', {
          question: q.question,
          idealAnswer: q.idealAnswer || q.feedback,
          role: interview.role,
          category: interview.category || 'General',
          interviewId: id,
        })
        setBookmarkedMap((prev) => ({ ...prev, [q._id || q.question]: true }))
        toast.success('Question saved to bookmarks')
      }
    } catch (err) {
      toast.error(apiError(err, 'Failed to update bookmark'))
    }
  }

  if (loading) {
    return (
      <div className="container page-center">
        <div className="muted small mono">Loading interview scorecard...</div>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="container page-center">
        <h2>Interview not found</h2>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const v = verdict(interview.overallScore)

  return (
    <main className="container">
      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="tag" style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: 600 }}>
              Completed
            </span>
            <span className="tag">{interview.role}</span>
            {interview.category && interview.category !== 'General' && <span className="tag-soft">{interview.category}</span>}
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, color: '#111827' }}>Interview Results &amp; Feedback</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <Link to="/bookmarks" className="btn btn-secondary">
            <Bookmark size={16} /> Saved Bookmarks
          </Link>
          <Link to="/practice" className="btn btn-primary">
            <RotateCcw size={16} /> Start New Session
          </Link>
        </div>
      </div>

      {/* Top 2-Column Analytics Overview */}
      <div className="results-overview-grid" style={{ marginBottom: '2rem' }}>
        {/* Overall Score */}
        <div className="panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="subtle small uppercase" style={{ letterSpacing: '0.06em', fontWeight: 700 }}>
              Overall Performance
            </span>
            <span className={v.className}>{v.label}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="mono" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>
              {interview.overallScore || 0}
            </span>
            <span className="subtle" style={{ fontSize: '1.25rem' }}>/ 100</span>
          </div>

          <div className="meter-track" style={{ height: '8px', marginBottom: '1.25rem' }}>
            <div className="meter-fill" style={{ width: `${interview.overallScore || 0}%`, background: '#2563eb' }} />
          </div>

          {interview.feedback && (
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#4b5563', lineHeight: 1.6 }}>
              {interview.feedback}
            </p>
          )}
        </div>

        {/* 4-Pillar Rubric Radar / Chart */}
        <div className="panel" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span className="subtle small uppercase" style={{ letterSpacing: '0.06em', fontWeight: 700 }}>
              4-Pillar Evaluation Rubric
            </span>
          </div>
          <ScoreChart
            rubricBreakdown={interview.rubricBreakdown}
            overallScore={interview.overallScore}
          />
        </div>
      </div>

      {/* Key Takeaways & Revision Notes */}
      <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.05rem', margin: 0, color: '#111827' }}>Personal Session Notes</h2>
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="btn btn-secondary btn-sm"
          >
            {savingNotes ? <Check size={14} /> : <Save size={14} />}
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
        <textarea
          rows={3}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Capture key concepts to revise, edge cases discussed, or patterns to practice..."
          style={{ width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
        />
      </div>

      {/* Question Breakdown List */}
      <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#111827' }}>Questions &amp; Feedback</h2>

      <QuestionEvaluationList
        questions={interview.questions}
        bookmarkedMap={bookmarkedMap}
        onBookmarkQuestion={handleBookmarkQuestion}
      />
    </main>
  )
}
