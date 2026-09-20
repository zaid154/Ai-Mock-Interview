import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import api, { apiError } from '../lib/api'
import InterviewHUD from '../components/interview/InterviewHUD'
import QuestionWorkbench from '../components/interview/QuestionWorkbench'

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

  const total = interview?.questions?.length ?? 0
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
    if (bookmarkedMap[current]) {
      toast.success('Question already bookmarked!')
      return
    }

    try {
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
      <InterviewHUD
        interview={interview}
        current={current}
        total={total}
        answeredCount={answeredCount}
        answers={answers}
        onSelectQuestion={setCurrent}
        onTimeUp={handleTimeUp}
      />

      <QuestionWorkbench
        question={question}
        current={current}
        total={total}
        answer={answers[current] || ''}
        note={notes[current] || ''}
        wordCount={wordCount}
        isBookmarked={Boolean(bookmarkedMap[current])}
        copiedPrompt={copiedPrompt}
        onUpdateAnswer={updateAnswer}
        onUpdateNote={updateNote}
        onClearAnswer={clearCurrentAnswer}
        onCopyPrompt={copyQuestionPrompt}
        onBookmark={handleBookmark}
      />

      {/* ── Bottom Navigation Controls ── */}
      <div className="interview-bottom-nav">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
        >
          <ChevronLeft size={18} /> Previous Question
        </button>

        {isLast ? (
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'Scoring your answers…' : <>Finish &amp; Get Feedback <CheckCircle2 size={18} /></>}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCurrent((c) => c + 1)}
          >
            Next Question <ChevronRight size={18} />
          </button>
        )}
      </div>
    </main>
  )
}
