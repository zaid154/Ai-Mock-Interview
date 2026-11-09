import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft,
  Sparkles,
  Sliders,
  Code2,
  Database,
  Layers,
  Network,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Settings2,
} from 'lucide-react'
import PracticeStudio from '../components/dashboard/PracticeStudio'
import PracticeProgress from '../components/dashboard/PracticeProgress'

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
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState('presets') // 'presets' | 'custom'
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
      const match = CURATED_TRACKS.find(
        (t) =>
          t.title.toLowerCase().includes(track.toLowerCase()) ||
          t.role.toLowerCase().includes(track.toLowerCase())
      )
      if (match) {
        applyTrack(match)
        setActiveTab('custom')
      }
    }
    if (user?.resumeFileName) {
      setResumeFileName(user.resumeFileName)
    }
  }, [searchParams, user])

  function applyTrack(track) {
    setRole(track.role)
    setTopic(track.topic)
    setDifficulty(track.difficulty)
    setNumQuestions(track.count || 5)
    setTimerMinutes(track.timer || '0')
  }

  function handleCustomizeTrack(track) {
    applyTrack(track)
    setActiveTab('custom')
    toast.success(`Loaded "${track.title}" into Custom Studio!`)
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
    setProgress({
      active: true,
      percent: 15,
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
          statusText: next > 60 ? 'Calibrating rubrics & questions...' : 'Synthesizing technical prompts...',
        }
      })
    }, 450)

    try {
      // FIXED PAYLOAD: exactly matches server startSchema (role, category, difficulty, count, timerMinutes, mode)
      const { data } = await api.post('/interviews', {
        role: targetRole,
        category: finalTopic,
        experience: targetDiff,
        difficulty: DIFFICULTY_MAP[targetDiff] || 'medium',
        count: targetCount,
        timerMinutes: targetTimer,
        mode: 'questions',
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
      setProgress((p) => ({ ...p, errorMessage: 'Unable to start assessment.', onRetry: () => createSession(null, overrideParams) }))
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
            Choose a curated fast track or customize your role, topic, and interview parameters.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition self-start sm:self-auto"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'presets' ? 'text-blue-600' : 'text-slate-400'} />
            <span>Fast Track Presets (1-Click)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders size={14} className={activeTab === 'custom' ? 'text-blue-600' : 'text-slate-400'} />
            <span>Custom Studio (Configure)</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          {activeTab === 'presets' ? '⚡ Select any track to start immediately' : '🛠️ Tailor questions to your exact target role'}
        </span>
      </div>

      {/* Progress Notification (if creating) */}
      {progress && progress.active && (
        <div className="mb-6">
          <PracticeProgress {...progress} />
        </div>
      )}

      {/* TAB 1: Fast Track Presets */}
      {activeTab === 'presets' && (
        <section aria-label="Curated tracks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURATED_TRACKS.map((track) => {
              const Icon = track.icon
              return (
                <div
                  key={track.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Icon + Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Icon size={18} />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                          {track.difficulty}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {track.count} Qs
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-2.5">
                      {track.role}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {track.desc}
                    </p>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCustomizeTrack(track)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer"
                      title="Adjust parameters before starting"
                    >
                      <Settings2 size={13} />
                      <span>Customize</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => createSession(null, track)}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <span>Start Round</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Custom Callout */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-blue-600 shrink-0" />
              <span>Need custom questions, specific frameworks, or want to attach your PDF resume?</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline shrink-0 text-left sm:text-right cursor-pointer"
            >
              Open Custom Studio &rarr;
            </button>
          </div>
        </section>
      )}

      {/* TAB 2: Custom Studio Configurator */}
      {activeTab === 'custom' && (
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
          onSwitchToPresets={() => setActiveTab('presets')}
        />
      )}
    </main>
  )
}
