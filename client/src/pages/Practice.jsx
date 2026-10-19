import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft } from 'lucide-react'
import PracticeStudio from '../components/dashboard/PracticeStudio'

const DIFFICULTY_MAP = { Junior: 'easy', Intermediate: 'medium', Senior: 'hard' }

const CURATED_TRACKS = [
  {
    title: 'React & Frontend Core',
    desc: 'React 19 hooks, component lifecycle, bundle size & rendering optimization.',
    role: 'Frontend Engineer',
    topic: 'React & Modern Web Architecture',
    difficulty: 'Intermediate',
    mode: 'questions',
  },
  {
    title: 'Node.js & Microservices',
    desc: 'Event loop, RESTful APIs, async concurrency, auth & data streaming.',
    role: 'Backend Developer',
    topic: 'Node.js, Express & Microservices',
    difficulty: 'Senior',
    mode: 'questions',
  },
  {
    title: 'System Design & Scalability',
    desc: 'High-concurrency architectures, Redis caching, sharding & fault recovery.',
    role: 'System Design Architect',
    topic: 'System Design, Scalability & Caching',
    difficulty: 'Senior',
    mode: 'questions',
  },
  {
    title: 'Speed MCQ Tech Drill',
    desc: 'Rapid-fire multiple choice assessment covering JavaScript, SQL & Web APIs.',
    role: 'Fullstack Developer',
    topic: 'React & Modern Web Architecture',
    difficulty: 'Intermediate',
    mode: 'quiz',
  },
]

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
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.15rem', color: '#111827', letterSpacing: '-0.025em' }}>Practice Studio</h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>Configure parameters to simulate real technical hiring rounds.</p>
          </div>
          <Link to="/dashboard" style={{ fontSize: '0.82rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', fontWeight: 500 }}>
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

        {/* Curated Quick-Start Tracks */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', letterSpacing: '0.04em' }}>
              Curated Practice Tracks
            </span>
            <span style={{ fontSize: '0.74rem', color: '#6b7280' }}>Select a track to quickly configure your session</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.75rem' }}>
            {CURATED_TRACKS.map((trk) => {
              const isSelected = role === trk.role && topic === trk.topic && mode === trk.mode
              return (
                <button
                  key={trk.title}
                  type="button"
                  onClick={() => {
                    setRole(trk.role)
                    setTopic(trk.topic)
                    setDifficulty(trk.difficulty)
                    setMode(trk.mode)
                    toast.success(`Loaded "${trk.title}" track settings!`)
                  }}
                  className="panel"
                  style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    background: isSelected ? '#eff6ff' : 'var(--surface)',
                    border: isSelected ? '1.5px solid #2563eb' : '1px solid var(--border)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem', color: isSelected ? '#2563eb' : '#111827' }}>
                      {trk.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem', borderRadius: '4px', background: isSelected ? '#dbeafe' : 'var(--surface-2)', color: isSelected ? '#1d4ed8' : '#6b7280', fontWeight: 600 }}>
                      {trk.difficulty}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#6b7280', lineHeight: 1.45 }}>
                    {trk.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
