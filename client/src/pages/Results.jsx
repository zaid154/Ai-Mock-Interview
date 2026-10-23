import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import ScoreChart from '../components/ScoreChart'
import QuestionEvaluationList from '../components/QuestionEvaluationList'
import { RotateCcw, LayoutDashboard, Save, CheckCircle2, Award, FileText } from 'lucide-react'

function verdict(score) {
  if (score >= 80) return { label: 'Strong Hire', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' }
  if (score >= 60) return { label: 'Hire with Coaching', badge: 'bg-amber-50 text-amber-800 border-amber-300' }
  return { label: 'Needs Practice', badge: 'bg-rose-50 text-rose-800 border-rose-300' }
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
    const isBookmarked = !!bookmarkedMap[q._id || q.question || q.prompt]
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/by-question?question=${encodeURIComponent(q.question || q.prompt)}`)
        setBookmarkedMap((prev) => ({ ...prev, [q._id || q.question || q.prompt]: false }))
        toast.success('Question removed from bookmarks')
      } else {
        await api.post('/bookmarks', {
          question: q.question || q.prompt,
          idealAnswer: q.idealAnswer || q.feedback,
          role: interview.role,
          category: interview.category || 'General',
          interviewId: id,
        })
        setBookmarkedMap((prev) => ({ ...prev, [q._id || q.question || q.prompt]: true }))
        toast.success('Question saved to bookmarks')
      }
    } catch (err) {
      toast.error(apiError(err, 'Failed to update bookmark'))
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-slate-400">
        Loading interview scorecard…
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs my-auto">
        <h2 className="text-base font-bold text-slate-900 mb-2">Interview Session Not Found</h2>
        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const v = verdict(interview.overallScore || 0)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col w-full">
      {/* ── Results Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              Assessment Scorecard
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${v.badge}`}>
              {v.label}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            {interview.role}
          </h1>
          <p className="text-xs text-slate-500 m-0">
            {interview.category || interview.topic || 'General Technical Screen'} &bull; Completed {new Date(interview.updatedAt || interview.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/practice"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw size={14} /> Retake
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <LayoutDashboard size={14} /> Dashboard
          </Link>
        </div>
      </div>

      {/* ── Scorecard Highlight Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Overall Readiness Score
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {interview.overallScore || 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Calibrated against engineering rubric benchmarks
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Questions Assessed
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {interview.questions?.length || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Technical depth &amp; code structure evaluated
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Target Seniority
          </span>
          <div className="text-xl font-bold text-slate-900 capitalize">
            {interview.difficulty || 'Intermediate'}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Level-calibrated evaluation criteria
          </div>
        </div>
      </div>

      {/* ── Visual Bar Chart ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
          Per-Question Score Breakdown (0 - 10 Scale)
        </h3>
        <ScoreChart questions={interview.questions} />
      </div>

      {/* ── Candidate Notes ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="session-notes" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText size={14} className="text-blue-600" />
            <span>Personal Debrief Notes</span>
          </label>
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save size={12} /> {savingNotes ? 'Saving…' : 'Save Notes'}
          </button>
        </div>
        <textarea
          id="session-notes"
          rows={3}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Reflect on this interview: What technical gaps did you notice? Which algorithms or architecture patterns will you review next?"
          className="w-full p-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
        />
      </div>

      {/* ── Question-by-Question Deep Dive ── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Detailed Question Rubrics &amp; Model Solutions
        </h2>
        <QuestionEvaluationList
          questions={interview.questions}
          bookmarkedMap={bookmarkedMap}
          onBookmarkQuestion={handleBookmarkQuestion}
        />
      </div>
    </main>
  )
}
