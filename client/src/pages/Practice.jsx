import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Briefcase, CheckCircle2 } from 'lucide-react'
import PracticeStudio from '../components/dashboard/PracticeStudio'

const DIFFICULTY_MAP = { Junior: 'easy', Intermediate: 'medium', Senior: 'hard' }

const CURATED_TRACKS = [
  {
    title: 'Frontend & Web Architecture',
    desc: 'Rendering performance, state management, bundle optimization, and asynchronous synchronization.',
    role: 'Frontend Engineer',
    topic: 'React & Modern Web Architecture',
    difficulty: 'Intermediate',
  },
  {
    title: 'Backend & Microservices',
    desc: 'Event-driven I/O, API idempotency, database connection pooling, and worker concurrency.',
    role: 'Backend Developer',
    topic: 'Node.js, Express & Microservices',
    difficulty: 'Senior',
  },
  {
    title: 'Product & Technical Strategy',
    desc: 'Product roadmap prioritization, KPI metrics analysis, stakeholder trade-offs, and feature scoping.',
    role: 'Technical Product Manager',
    topic: 'Product Strategy, Metrics & Trade-offs',
    difficulty: 'Intermediate',
  },
  {
    title: 'Data & Business Intelligence',
    desc: 'Complex SQL queries, telemetry diagnosis, metric anomaly investigation, and reporting pipeline design.',
    role: 'Data Analyst',
    topic: 'SQL, Data Analysis & Business Intelligence',
    difficulty: 'Intermediate',
  },
  {
    title: 'System Design & Scalability',
    desc: 'Distributed systems, cache invalidation, sharding strategies, and high-availability architecture.',
    role: 'System Design Architect',
    topic: 'System Design, Scalability & Caching',
    difficulty: 'Senior',
  },
  {
    title: 'MERN Fullstack Engineering',
    desc: 'End-to-end full stack architecture, database schema design, and secure authentication flows.',
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
      const match = CURATED_TRACKS.find((t) => t.title.toLowerCase().includes(track.toLowerCase()) || t.role.toLowerCase().includes(track.toLowerCase()))
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
      toast.success('Resume removed')
    } catch (err) {
      toast.error(apiError(err, 'Failed to remove resume'))
    }
  }

  async function createSession(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!role.trim()) return toast.error('Target role is required')
    const finalTopic = topic === 'Custom Topic' ? customTopic.trim() : topic
    if (!finalTopic) return toast.error('Please specify a topic')

    setBusy(true)
    cancelRef.current = false
    setProgress({
      active: true,
      percent: 10,
      statusText: 'Connecting to AI Interview Engine...',
      onCancel: () => {
        cancelRef.current = true
        setBusy(false)
        setProgress({ active: false, percent: 0, statusText: '' })
        toast('Generation cancelled')
      },
    })

    const timer = setInterval(() => {
      setProgress((p) => {
        if (!p.active || p.percent >= 90) return p
        const next = Math.min(90, p.percent + 15)
        return {
          ...p,
          percent: next,
          statusText: next > 60 ? 'Calibrating rubrics & follow-ups...' : 'Synthesizing technical prompts...',
        }
      })
    }, 450)

    try {
      const { data } = await api.post('/interviews', {
        role: role.trim(),
        topic: finalTopic,
        difficulty: DIFFICULTY_MAP[difficulty] || 'medium',
        numQuestions: Number(numQuestions) || 5,
        timerMinutes: Number(timerMinutes) || 0,
        mode: 'text',
      })

      clearInterval(timer)
      if (cancelRef.current) return

      setProgress({ active: true, percent: 100, statusText: 'Assessment ready!' })
      const session = data.interview || data
      toast.success('Interview session created!')
      navigate(`/interview/${session._id}`)
    } catch (err) {
      clearInterval(timer)
      setBusy(false)
      setProgress((p) => ({ ...p, errorMessage: 'Unable to start assessment.', onRetry: () => createSession() }))
      toast.error(apiError(err, 'Could not start session'))
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            Practice Studio
          </h1>
          <p className="text-xs text-slate-500">
            Configure parameters to simulate authentic technical hiring rounds.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition self-start sm:self-auto"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Curated Pre-Configured Tracks */}
      <section aria-label="Curated tracks" className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Briefcase size={13} className="text-blue-600" />
            <span>Fast Track Presets</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any track to quick-load parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CURATED_TRACKS.map((track) => {
            const isSelected = role === track.role && topic === track.topic
            return (
              <button
                key={track.title}
                type="button"
                onClick={() => applyTrack(track)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {track.title}
                    </span>
                    {isSelected && <CheckCircle2 size={14} className="text-blue-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    {track.desc}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-700">
                    {track.difficulty}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Main Studio Setup Form */}
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
    </main>
  )
}
