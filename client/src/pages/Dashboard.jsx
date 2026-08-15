import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import {
  Sparkles,
  Zap,
  Upload,
  FileText,
  Clock,
  Play,
  Trash2,
  CheckCircle2,
  Layers,
  HelpCircle,
  BarChart3,
  Search,
  Trophy,
  ArrowRight,
} from 'lucide-react'

const TOPIC_PRESETS = [
  'React & Web Performance',
  'Node.js & Distributed Systems',
  'System Design & Microservices',
  'Data Structures & Algorithms',
  'DevOps & CI/CD Pipelines',
  'SQL Database & Query Optimization',
]

const DIFFICULTY_MAP = {
  Junior: 'easy',
  Intermediate: 'medium',
  Senior: 'hard',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { confirm } = useConfirm()

  const [mode, setMode] = useState('questions')
  const [role, setRole] = useState(user?.targetRole || 'Fullstack Engineer')
  const [topic, setTopic] = useState('React & Web Performance')
  const [customTopic, setCustomTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [timerMinutes, setTimerMinutes] = useState('0')
  const [resumeText, setResumeText] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')

  const [sessions, setSessions] = useState([])
  const [busy, setBusy] = useState(false)
  const [fetchingSessions, setFetchingSessions] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const { data } = await api.get('/interviews')
      setSessions(data.interviews || data.sessions || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load past sessions'))
    } finally {
      setFetchingSessions(false)
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file')
      return
    }
    const formData = new FormData()
    formData.append('resume', file)
    const toastId = toast.loading('Parsing resume PDF…')
    try {
      const { data } = await api.post('/interviews/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeText(data.text || '')
      setResumeFileName(file.name)
      toast.success(`Resume parsed (${(data.text || '').length} characters extracted)`, { id: toastId })
    } catch (err) {
      toast.error(apiError(err, 'Resume parsing failed'), { id: toastId })
    }
  }

  async function createSession(e) {
    e.preventDefault()
    setBusy(true)
    const finalTopic = topic === 'custom' ? customTopic.trim() : topic
    if (!finalTopic) {
      toast.error('Please specify a topic')
      setBusy(false)
      return
    }

    try {
      const payload = {
        mode: mode === 'quiz' ? 'quiz' : 'questions',
        role: role.trim() || 'Software Engineer',
        category: finalTopic,
        experience: difficulty,
        difficulty: DIFFICULTY_MAP[difficulty] || 'medium',
        count: Number(numQuestions),
        timerMinutes: Number(timerMinutes),
      }
      const { data } = await api.post('/interviews', payload)
      const session = data.interview || data.session
      toast.success(mode === 'quiz' ? 'Quiz generated!' : 'Interview session created!')
      if (session.mode === 'quiz') {
        navigate(`/quiz/${session._id}`)
      } else {
        navigate(`/interview/${session._id}`)
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not generate session'))
    } finally {
      setBusy(false)
    }
  }

  async function deleteSession(id, e) {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Delete Session?',
      message: 'This session and its evaluation score will be permanently removed.',
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/interviews/${id}`)
      setSessions((prev) => prev.filter((s) => s._id !== id))
      toast.success('Session deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete session'))
    }
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length
    ? (completedSessions.reduce((acc, s) => acc + (s.overallScore || s.totalScore || 0), 0) / completedSessions.length).toFixed(1)
    : '0.0'

  const filteredSessions = sessions.filter((s) => {
    if (!searchFilter.trim()) return true
    const term = searchFilter.toLowerCase()
    return (
      s.role?.toLowerCase().includes(term) ||
      s.category?.toLowerCase().includes(term) ||
      s.topic?.toLowerCase().includes(term)
    )
  })

  return (
    <main className="container">
      {/* Vercel-Style Clean Minimal Header */}
      <div
        style={{
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}
            </h1>
            <span className="tag" style={{ fontSize: '0.68rem' }}>Verified</span>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: '0.92rem' }}>
            Target Role: <strong style={{ color: 'var(--text)' }}>{user?.targetRole || 'Software Engineer'}</strong>
          </p>
        </div>

        {/* Clean Minimal Inline Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div className="subtle small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{completedSessions.length} Sessions</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
          <div>
            <div className="subtle small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Rating</div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--good)' }}>{avgScore} / 100</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* Left Column: Form */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Configure Practice Session</h2>
          </div>

          <form onSubmit={createSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="field">
              <span className="field-label">Practice Format</span>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${mode === 'questions' ? 'active' : ''}`}
                  onClick={() => setMode('questions')}
                >
                  <HelpCircle size={15} /> Q&amp;A Interview
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${mode === 'quiz' ? 'active' : ''}`}
                  onClick={() => setMode('quiz')}
                >
                  <Layers size={15} /> MCQ Quiz
                </button>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <span className="field-label">Target Role</span>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  required
                />
              </div>

              <div className="field">
                <span className="field-label">Difficulty</span>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Junior">Junior (0-2 YOE)</option>
                  <option value="Intermediate">Mid-Level (2-5 YOE)</option>
                  <option value="Senior">Senior (5+ YOE)</option>
                </select>
              </div>
            </div>

            <div className="field">
              <span className="field-label">Topic</span>
              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value)
                  if (e.target.value !== 'custom') setCustomTopic('')
                }}
              >
                {TOPIC_PRESETS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="custom">+ Custom Topic...</option>
              </select>
            </div>

            {topic === 'custom' && (
              <div className="field">
                <span className="field-label">Custom Topic Name</span>
                <input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. System Design, Distributed Cache"
                  required
                />
              </div>
            )}

            <div className="field-row">
              <div className="field">
                <span className="field-label">Questions</span>
                <select value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)}>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div className="field">
                <span className="field-label">Timer</span>
                <select value={timerMinutes} onChange={(e) => setTimerMinutes(e.target.value)}>
                  <option value="0">Untimed</option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="20">20 Minutes</option>
                </select>
              </div>
            </div>

            <div className="field">
              <span className="field-label">Resume PDF (Optional)</span>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--surface-2)',
                  border: '1px dashed var(--border-strong)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
              >
                <Upload size={16} className="muted" />
                <span className="small" style={{ flex: 1 }}>
                  {resumeFileName ? resumeFileName : 'Upload Resume PDF to extract context'}
                </span>
                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy} style={{ marginTop: '0.4rem' }}>
              {busy ? 'Generating Session…' : <>Start Mock Practice <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        {/* Right Column: History */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Practice History</h2>
            <span className="subtle small mono">{sessions.length} sessions</span>
          </div>

          {sessions.length > 0 && (
            <div className="input-icon-wrap" style={{ marginBottom: '1rem' }}>
              <Search size={15} className="input-icon" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search history..."
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          )}

          {fetchingSessions ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }} className="muted small mono">
              Loading past sessions...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <FileText size={36} className="muted" style={{ margin: '0 auto 0.8rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>No Sessions Yet</h3>
              <p className="muted small" style={{ margin: 0 }}>
                Configure and launch your first mock session on the left!
              </p>
            </div>
          ) : (
            <div className="history-list">
              {filteredSessions.map((session) => (
                <div
                  key={session._id}
                  className="history-item"
                  onClick={() => {
                    if (session.status === 'completed') {
                      navigate(`/results/${session._id}`)
                    } else if (session.mode === 'quiz') {
                      navigate(`/quiz/${session._id}`)
                    } else {
                      navigate(`/interview/${session._id}`)
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span className="tag" style={{ fontSize: '0.65rem' }}>
                        {session.mode === 'quiz' ? 'MCQ Quiz' : 'Q&A'}
                      </span>
                      <span className="tag-soft" style={{ fontSize: '0.65rem' }}>
                        {session.difficulty}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{session.role}</div>
                    <div className="muted small" style={{ fontSize: '0.8rem' }}>{session.category || session.topic}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {session.status === 'completed' ? (
                      <span className="score-chip">
                        {session.overallScore !== undefined ? `${session.overallScore} / 100` : 'Evaluated'}
                      </span>
                    ) : (
                      <span className="score-chip chip-pending">
                        In Progress
                      </span>
                    )}

                    <button
                      type="button"
                      className="history-del"
                      onClick={(e) => deleteSession(session._id, e)}
                      title="Delete Session"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
