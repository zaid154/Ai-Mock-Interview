import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RotateCcw, Check, X, Bookmark, Award, Edit3, Save } from 'lucide-react'
import api, { apiError } from '../lib/api'
import ScoreChart from '../components/ScoreChart'
import { formatGeneratedText } from '../lib/text'

const LETTERS = ['A', 'B', 'C', 'D']

function verdict(score) {
  if (score >= 80) return { label: 'Strong', className: 'grade-good' }
  if (score >= 55) return { label: 'Solid, with gaps', className: 'grade-mid' }
  return { label: 'Needs work', className: 'grade-low' }
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

  if (loading) return <main className="page-center muted">Loading results…</main>
  if (!interview) return <main className="page-center muted">Results not found.</main>

  const v = verdict(interview.overallScore)
  const isQuiz = interview.mode === 'quiz'

  return (
    <main className="container results">
      <div className="results-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <p className="muted small" style={{ margin: 0 }}>
              {interview.role} · {interview.experience} · {interview.difficulty}
              {isQuiz && ' · Quiz'}
            </p>
            {interview.category && interview.category !== 'General' && (
              <span className="tag">{interview.category}</span>
            )}
          </div>
          <h2>Your results</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link to="/certificates" className="btn btn-ghost">
            <Award size={16} /> Certificates
          </Link>
          <Link to="/dashboard" className="btn btn-primary">
            <RotateCcw size={16} /> New session
          </Link>
        </div>
      </div>

      <div className="results-top">
        <div className="score-ring">
          <div className="score-donut" style={{ '--pct': interview.overallScore }}>
            <div className="score-donut-inner">
              <span className="score-value">{interview.overallScore}</span>
              <span className="muted small">/ 100</span>
            </div>
          </div>
          <span className={`grade-badge ${v.className}`}>{v.label}</span>
        </div>
        <div className="panel chart-panel">
          <h3>Score per question</h3>
          <ScoreChart scores={interview.questions.map((q) => q.score)} />
        </div>
      </div>

      {interview.summary && (
        <div className="panel summary-panel">
          <h3>Summary</h3>
          <p>{interview.summary}</p>
        </div>
      )}

      {/* Overall Session Notes Editor */}
      <div className="panel summary-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
            <Edit3 size={16} /> Session Takeaways & Notes
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={handleSaveSessionNotes} disabled={savingNotes}>
            <Save size={14} /> {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
        <textarea
          rows={3}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Jot down key learnings or areas to practice next time..."
        />
      </div>

      <div className="answers">
        <h3>Question breakdown</h3>
        {interview.questions.map((q, i) =>
          isQuiz ? (
            // Quiz: show every option, mark the correct one and the user's pick.
            <div className="answer-card" key={i}>
              <div className="answer-head">
                <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>
                  <span className="muted">Q{i + 1}.</span> {formatGeneratedText(q.prompt)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleBookmarkQuestion(q)}
                    title="Bookmark this question"
                  >
                    <Bookmark size={14} fill={bookmarkedMap[q.prompt] ? 'currentColor' : 'none'} />
                  </button>
                  <span className={`q-score ${q.selectedIndex === q.correctIndex ? 'good' : 'bad'}`}>
                    {q.selectedIndex === q.correctIndex ? 'Correct' : 'Wrong'}
                  </span>
                </div>
              </div>
              {!(Number.isInteger(q.selectedIndex) && q.selectedIndex >= 0) && (
                <p className="quiz-answer-note">You did not select an answer for this question.</p>
              )}
              <div className="options review">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctIndex
                  const isPicked = Number.isInteger(q.selectedIndex) && oi === q.selectedIndex
                  return (
                    <div
                      key={oi}
                      className={`option ${isCorrect ? 'correct' : ''} ${
                        isPicked && !isCorrect ? 'wrong' : ''
                      }`}
                    >
                      <span className="option-letter">{LETTERS[oi]}</span>
                      <span style={{ whiteSpace: 'pre-wrap' }}>{formatGeneratedText(opt)}</span>
                      {isPicked && (
                        <span className={`option-status ${isCorrect ? 'correct-status' : 'wrong-status'}`}>
                          Your answer{isCorrect ? ' · Correct' : ''}
                        </span>
                      )}
                      {isCorrect && !isPicked && <span className="option-status correct-status">Correct answer</span>}
                      {isCorrect && <Check size={16} className="opt-icon" />}
                      {isPicked && !isCorrect && <X size={16} className="opt-icon" />}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // Questions: show the answer and AI feedback.
            <div className="answer-card" key={i}>
              <div className="answer-head">
                <p className="question-text">
                  <span className="muted">Q{i + 1}.</span> {formatGeneratedText(q.prompt)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleBookmarkQuestion(q)}
                    title="Bookmark this question"
                  >
                    <Bookmark size={14} fill={bookmarkedMap[q.prompt] ? 'currentColor' : 'none'} />
                  </button>
                  <span className="q-score">{q.score}/10</span>
                </div>
              </div>
              <p className="your-answer">
                {q.answer || <em className="muted">No answer given.</em>}
              </p>
              <p className="feedback">{q.feedback}</p>
            </div>
          ),
        )}
      </div>
    </main>
  )
}
