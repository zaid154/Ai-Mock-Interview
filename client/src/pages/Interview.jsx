import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { normalizePrompt } from '../lib/text'
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
  const [probing, setProbing] = useState(false)
  const [followUpMap, setFollowUpMap] = useState({})

  useEffect(() => {
    api
      .get(`/interviews/${id}`)
      .then((res) => {
        const data = res.data.interview
        if (data.status === 'completed') {
          navigate(`/results/${data._id}`, { replace: true })
          return
        }
        setInterview(data)
        setAnswers(data.questions.map((q) => q.answer || ''))
        setNotes(data.questions.map((q) => q.notes || ''))
        const existingProbes = {}
        data.questions.forEach((q, idx) => {
          if (q.followUpPrompt) existingProbes[idx] = q.followUpPrompt
        })
        setFollowUpMap(existingProbes)
      })
      .catch((err) => {
        toast.error(apiError(err, 'Could not load the interview'))
        navigate('/dashboard')
      })
      .finally(() => setLoading(false))

    api
      .get('/bookmarks')
      .then((res) => {
        const map = {}
        ;(res.data.bookmarks || []).forEach((b) => {
          map[normalizePrompt(b.prompt)] = true
        })
        setBookmarkedMap(map)
      })
      .catch(() => {})
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
    setAnswers((prev) => prev.map((a, i) => (i === current ? (typeof value === 'function' ? value(a) : value) : a)))
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
    const key = normalizePrompt(prompt)
    const currentStatus = Boolean(bookmarkedMap[key])
    setBookmarkedMap((prev) => ({ ...prev, [key]: !currentStatus }))

    try {
      const { data } = await api.post('/bookmarks/toggle', {
        prompt,
        role: interview.role,
        category: interview.category || 'General',
        interviewId: interview._id,
      })
      toast.success(data.action === 'bookmarked' ? 'Question saved to bookmarks' : 'Question removed from bookmarks')
    } catch {
      setBookmarkedMap((prev) => ({ ...prev, [key]: currentStatus }))
      toast.error('Could not update bookmark')
    }
  }

  async function handleProbeFollowUp() {
    if (!currentAnswer.trim()) return toast.error('Enter an answer before asking for a follow-up probe.')
    setProbing(true)
    try {
      const { data } = await api.post(`/interviews/${id}/probe`, {
        questionIndex: current,
        candidateAnswer: currentAnswer,
      })
      if (data.followUpPrompt) {
        setFollowUpMap((prev) => ({ ...prev, [current]: data.followUpPrompt }))
        toast.success('Interviewer follow-up generated!')
      }
    } catch (err) {
      toast.error(apiError(err, 'Failed to generate follow-up question'))
    } finally {
      setProbing(false)
    }
  }

  function handleTimeUp() {
    toast.error('Time is up! Submitting your interview…')
    submit()
  }

  async function submit() {
    if (answeredCount === 0) {
      return toast.error('Please answer at least one question before finishing.')
    }
    setSubmitting(true)
    const payload = answers.map((answer, i) => ({
      answer,
      notes: notes[i] || '',
      followUpPrompt: followUpMap[i] || '',
    }))

    try {
      await api.post(`/interviews/${id}/submit`, { answers: payload })
      toast.success('Interview submitted! Generating comprehensive rubric evaluation…')
      navigate(`/results/${id}`)
    } catch (err) {
      toast.error(apiError(err, 'Failed to submit interview'))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-xs font-mono text-slate-400">
        Loading interview workbench…
      </div>
    )
  }

  if (!interview) return null

  const question = interview.questions[current]
  if (!question) return null

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col w-full">
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
        isBookmarked={Boolean(bookmarkedMap[normalizePrompt(question?.prompt)])}
        copiedPrompt={copiedPrompt}
        onUpdateAnswer={updateAnswer}
        onUpdateNote={updateNote}
        onClearAnswer={clearCurrentAnswer}
        onCopyPrompt={copyQuestionPrompt}
        onBookmark={handleBookmark}
        onProbeFollowUp={handleProbeFollowUp}
        probing={probing}
        followUpPrompt={followUpMap[current] || ''}
      />

      {/* ── Bottom Navigation Controls ── */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-200 mt-6">
        <button
          type="button"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Previous Question
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Submitting & Evaluating…' : <>Finish &amp; Get Rubric Score <CheckCircle2 size={16} /></>}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrent((c) => c + 1)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <span>Next Question</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </main>
  )
}
