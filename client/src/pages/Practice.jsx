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
    title: 'React & Frontend Architecture',
    desc: 'React 18 hooks, rendering performance, state management & bundle optimization.',
    role: 'Frontend Engineer',
    topic: 'React & Modern Web Architecture',
    difficulty: 'Intermediate',
  },
  {
    title: 'Node.js & Microservices',
    desc: 'Event loop, asynchronous concurrency, API design, auth & streaming.',
    role: 'Backend Developer',
    topic: 'Node.js, Express & Microservices',
    difficulty: 'Senior',
  },
  {
    title: 'System Design & Scalability',
    desc: 'Distributed systems, Redis caching, sharding, and resilience strategies.',
    role: 'System Design Architect',
    topic: 'System Design, Scalability & Caching',
    difficulty: 'Senior',
  },
  {
    title: 'MERN Fullstack Engineering',
    desc: 'End-to-end full stack development, MongoDB aggregations & React patterns.',
    role: 'Fullstack Developer',
    topic: 'React & Modern Web Architecture',
    difficulty: 'Intermediate',
  },
]

export default function Practice() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

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
    const track = searchParams.get('track')
    if (track) {
      const match = CURATED_TRACKS.find((t) => t.title.toLowerCase().includes(track.toLowerCase()))
      if (match) applyTrack(match)
    }
    if (user?.resumeFileName) {
      setResumeFileName(user.resumeFileName)
    }
  }, [searchParams, user])

  function applyTrack(track) {
    setRole(track.role)
    setTopic(track.topic)
    setDifficulty(track.difficulty)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      return toast.error('Only PDF resumes are supported')
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size must be under 5 MB')
    }

    const form = new FormData()
    form.append('resume', file)

    const loadingToast = toast.loading('Parsing resume...')
    try {
      const { data } = await api.post('/auth/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeFileName(data.fileName || file.name)
      toast.success('Resume attached for tailoring', { id: loadingToast })
    } catch (err) {
      toast.error(apiError(err, 'Failed to parse resume'), { id: loadingToast })
    }
  }

  async function handleRemoveResume() {
    try {
      await api.delete('/auth/resume')
      setResumeFileName('')
      toast.success('Resume detached')
    } catch (err) {
      toast.error(apiError(err, 'Failed to remove resume'))
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
        mode: 'questions',
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
      navigate(`/interview/${session._id}`)
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

        {/* Curated Pre-Configured Tracks */}
        <section aria-label="Curated tracks" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.65rem' }}>
            {CURATED_TRACKS.map((track) => (
              <button
                key={track.title}
                type="button"
                onClick={() => applyTrack(track)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#111827', marginBottom: '0.2rem' }}>
                  {track.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#6b7280', lineHeight: 1.45, marginBottom: '0.45rem', flex: 1 }}>
                  {track.desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: 600 }}>
                    {track.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Studio Setup Form */}
        <PracticeStudio
          role={role}
          setRole={setRole}
          topic={topic}
          setTopic={setTopic}
          customTopic={customTopic}
          setCustomTopic={setCustomTopic}
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          timerMinutes={timerMinutes}
          setTimerMinutes={setTimerMinutes}
          resumeFileName={resumeFileName}
          handleFileUpload={handleFileUpload}
          handleRemoveResume={handleRemoveResume}
          createSession={createSession}
          busy={busy}
          progress={progress}
        />
      </div>
    </main>
  )
}
