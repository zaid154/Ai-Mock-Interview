import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft } from 'lucide-react'
import PracticeStudio from '../components/dashboard/PracticeStudio'

const DIFFICULTY_MAP = { Junior: 'easy', Intermediate: 'medium', Senior: 'hard' }

export default function Practice() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [mode, setMode] = useState(searchParams.get('mode') === 'quiz' ? 'quiz' : 'questions')
  const [role, setRole] = useState(user?.targetRole || 'Fullstack Developer')
  const [topic, setTopic] = useState('React & Modern Web Architecture')
  const [customTopic, setCustomTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [timerMinutes, setTimerMinutes] = useState('0')
  const [resumeFileName, setResumeFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState({ active: false, percent: 0, statusText: '' })
  const cancelRef = useRef(false)

  useEffect(() => {
    const qMode = searchParams.get('mode')
    if (qMode === 'quiz' || qMode === 'questions') setMode(qMode)
  }, [searchParams])

  useEffect(() => {
    api.get('/interviews/resume/active').then(({ data }) => {
      if (data?.active && data?.fileName) setResumeFileName(data.fileName)
    }).catch(() => {})
  }, [])

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) return toast.error('Please upload a PDF file')
    const formData = new FormData()
    formData.append('resume', file)
    const toastId = toast.loading('Analyzing resume context…')
    try {
      const { data } = await api.post('/interviews/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResumeFileName(data.fileName || file.name)
      toast.success(data.cached ? '✓ Existing resume found! Loaded saved context.' : 'Resume context structured and saved', { id: toastId })
    } catch (err) {
      toast.error(apiError(err, 'Could not parse resume'), { id: toastId })
    }
  }

  async function handleRemoveResume(e) {
    e.preventDefault(); e.stopPropagation()
    try {
      await api.delete('/interviews/resume/active')
      setResumeFileName('')
      toast.success('Resume context detached')
    } catch (err) {
      toast.error(apiError(err, 'Could not remove resume'))
    }
  }

  async function createSession(e) {
    if (e) e.preventDefault()
    const finalTopic = topic === 'Custom Topic' ? customTopic.trim() : topic
    if (!finalTopic) return toast.error('Please specify a topic')

    cancelRef.current = false
    setBusy(true)
    const total = Number(numQuestions)

    setProgress({
      active: true,
      percent: 45,
      statusText: 'Connecting studio & curating questions…',
      isRetrying: false,
      errorMessage: null,
      onCancel: () => { cancelRef.current = true; setBusy(false); setProgress({ active: false }) },
    })

    try {
      const payload = {
        mode,
        role: role.trim() || 'Software Engineer',
        category: finalTopic,
        experience: difficulty,
        difficulty: DIFFICULTY_MAP[difficulty] || 'medium',
        count: total,
        timerMinutes: Number(timerMinutes),
      }

      setProgress((p) => ({ ...p, percent: 85, statusText: 'Curating targeted interview scenario…' }))
      const { data } = await api.post('/interviews', payload)

      if (cancelRef.current) {
        setBusy(false)
        setProgress({ active: false })
        return
      }

      setProgress({ active: true, percent: 100, statusText: 'Assessment ready ✓' })
      const session = data.interview || data.session
      navigate(session.mode === 'quiz' ? `/quiz/${session._id}` : `/interview/${session._id}`)
    } catch (err) {
      setBusy(false)
      setProgress((p) => ({ ...p, errorMessage: 'Unable to start assessment.', onRetry: () => createSession() }))
      toast.error(apiError(err, 'Could not start session'))
    }
  }

  return (
    <main className="container" style={{ paddingTop: '0.65rem', paddingBottom: '1.25rem' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.15rem', color: '#f8fafc', letterSpacing: '-0.025em' }}>Practice Studio</h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(239, 237, 253, 0.6)' }}>Configure parameters to simulate real technical hiring rounds.</p>
          </div>
          <Link to="/dashboard" style={{ fontSize: '0.82rem', color: '#c084fc', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', fontWeight: 500 }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        <PracticeStudio
          mode={mode} setMode={setMode} role={role} setRole={setRole}
          topic={topic} setTopic={setTopic} customTopic={customTopic} setCustomTopic={setCustomTopic}
          numQuestions={numQuestions} setNumQuestions={setNumQuestions} difficulty={difficulty} setDifficulty={setDifficulty}
          timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes} resumeFileName={resumeFileName}
          handleFileUpload={handleFileUpload} handleRemoveResume={handleRemoveResume} createSession={createSession} busy={busy} progress={progress}
        />
      </div>
    </main>
  )
}
