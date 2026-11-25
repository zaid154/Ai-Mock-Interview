import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  Code2,
  Database,
  Layers,
  Network,
  BarChart3,
  Users,
} from 'lucide-react'
import PracticeStudio from '../components/dashboard/PracticeStudio'

const DIFFICULTY_MAP = { Junior: 'easy', Intermediate: 'medium', Senior: 'hard' }

const CURATED_TRACKS = [
  {
    id: 'frontend',
    title: 'Frontend & Web Architecture',
    role: 'Frontend Engineer',
    topic: 'React & Modern Web Architecture',
    difficulty: 'Intermediate',
    count: 5,
    timer: '0',
    icon: Code2,
    desc: 'Component architecture, Virtual DOM reconciliation, useMemo trade-offs, and state management.',
  },
  {
    id: 'backend',
    title: 'Backend & Microservices',
    role: 'Backend Developer',
    topic: 'Node.js, Express & Microservices',
    difficulty: 'Senior',
    count: 5,
    timer: '0',
    icon: Database,
    desc: 'JWT authentication & refresh tokens, connection pooling, rate limiting, and RESTful API architecture.',
  },
  {
    id: 'fullstack',
    title: 'MERN Fullstack Engineering',
    role: 'Fullstack Developer',
    topic: 'MERN Architecture & Performance',
    difficulty: 'Intermediate',
    count: 5,
    timer: '0',
    icon: Layers,
    desc: 'End-to-end full stack architecture, query optimization, database indexing, and async API integration.',
  },
  {
    id: 'system-design',
    title: 'System Design & Scalability',
    role: 'System Design Architect',
    topic: 'System Design, Scalability & Caching',
    difficulty: 'Senior',
    count: 5,
    timer: '0',
    icon: Network,
    desc: 'Distributed systems, Redis cache-aside patterns, database sharding, and high-availability architecture.',
  },
  {
    id: 'data',
    title: 'Data & Business Intelligence',
    role: 'Data Analyst',
    topic: 'SQL, Data Analysis & Business Intelligence',
    difficulty: 'Intermediate',
    count: 5,
    timer: '0',
    icon: BarChart3,
    desc: 'Complex SQL queries, retention cohorts, metric anomaly investigation, and reporting pipeline design.',
  },
  {
    id: 'behavioral',
    title: 'Behavioral & Leadership',
    role: 'Engineering Lead / Team Member',
    topic: 'STAR Framework & Conflict Resolution',
    difficulty: 'Senior',
    count: 5,
    timer: '0',
    icon: Users,
    desc: 'STAR method responses, handling technical disagreements, team leadership, and executive communication.',
  },
]

export default function Practice() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [role, setRole] = useState(user?.targetRole || 'Fullstack Developer')
  const [topic, setTopic] = useState('React & Modern Web Architecture')
  const [customTopic, setCustomTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [timerMinutes, setTimerMinutes] = useState('0')
  const [resumeFileName, setResumeFileName] = useState(user?.resumeFileName || '')
  const [busy, setBusy] = useState(false)
  const cancelRef = useRef(false)

  useEffect(() => {
    const track = searchParams.get('track')
    if (track) {
      const match = CURATED_TRACKS.find(
        (t) =>
          t.title.toLowerCase().includes(track.toLowerCase()) ||
          t.role.toLowerCase().includes(track.toLowerCase())
      )
      if (match) applyTrack(match)
    }

    if (user?.resumeFileName) {
      setResumeFileName(user.resumeFileName)
    }

    let mounted = true
    api
      .get('/interviews/resume/active')
      .then(({ data }) => {
        if (mounted && data?.active && data?.fileName) {
          setResumeFileName(data.fileName)
          if (typeof setUser === 'function') {
            setUser((prev) => (prev ? { ...prev, resumeFileName: data.fileName, hasResume: true } : prev))
          }
        }
      })
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [searchParams])

  function applyTrack(track) {
    setRole(track.role)
    setTopic(track.topic)
    setDifficulty(track.difficulty)
    setNumQuestions(track.count || 5)
    setTimerMinutes(track.timer || '0')
    toast.success(`Loaded "${track.title}"!`)
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
      const { data } = await api.post('/interviews/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const finalFileName = data.fileName || file.name
      setResumeFileName(finalFileName)
      if (typeof setUser === 'function') {
        setUser((prev) => (prev ? { ...prev, resumeFileName: finalFileName, hasResume: true } : prev))
      }
      toast.success('Resume attached for tailoring', { id: loadingToast })
    } catch (err) {
      toast.error(apiError(err, 'Failed to parse resume'), { id: loadingToast })
    } finally {
      if (e.target) e.target.value = ''
    }
  }

  async function handleRemoveResume() {
    try {
      await api.delete('/interviews/resume/active')
      setResumeFileName('')
      if (typeof setUser === 'function') {
        setUser((prev) => (prev ? { ...prev, resumeFileName: '', hasResume: false } : prev))
      }
      toast.success('Resume removed')
    } catch (err) {
      toast.error(apiError(err, 'Failed to remove resume'))
    }
  }

  async function createSession(e, overrideParams = null) {
    if (e && e.preventDefault) e.preventDefault()

    const targetRole = (overrideParams?.role || role).trim()
    const rawTopic = overrideParams?.topic || topic
    const finalTopic = rawTopic === 'Custom Topic' ? (overrideParams?.customTopic || customTopic).trim() : rawTopic
    const targetDiff = overrideParams?.difficulty || difficulty
    const targetCount = Number(overrideParams?.count || overrideParams?.numQuestions || numQuestions) || 5
    const targetTimer = Number(overrideParams?.timer || overrideParams?.timerMinutes || timerMinutes) || 0

    if (!targetRole) return toast.error('Target role is required')
    if (!finalTopic) return toast.error('Please specify a topic')

    setBusy(true)
    cancelRef.current = false

    try {
      // FIXED PAYLOAD: matches backend schema (role, category, difficulty, count, timerMinutes, mode)
      const { data } = await api.post('/interviews', {
        role: targetRole,
        category: finalTopic,
        experience: targetDiff,
        difficulty: DIFFICULTY_MAP[targetDiff] || 'medium',
        count: targetCount,
        timerMinutes: targetTimer,
        mode: 'questions',
      })

      if (cancelRef.current) return

      const session = data.interview || data
      toast.success('Interview session ready!')
      navigate(`/interview/${session._id}`)
    } catch (err) {
      if (!cancelRef.current) {
        setBusy(false)
        toast.error(apiError(err, 'Could not start session'))
      }
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col w-full">
      {/* Clean Page Title */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Practice Studio
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your target role, focus topic, and interview parameters.
        </p>
      </div>

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
        onCancel={() => {
          cancelRef.current = true
          setBusy(false)
          toast('Generation cancelled')
        }}
      />
    </main>
  )
}
