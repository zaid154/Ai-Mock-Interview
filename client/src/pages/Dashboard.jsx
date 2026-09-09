import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import {
  Upload,
  FileText,
  Clock,
  Play,
  Trash2,
  Layers,
  HelpCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

const TOPIC_OPTIONS = [
  'React & Web Performance',
  'Node.js & Microservices',
  'System Design & Architecture',
  'Data Structures & Algorithms',
  'DevOps & Cloud Infrastructure',
  'SQL & Database Optimization',
  'Full Stack Application Architecture',
  'Custom Topic',
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
  const [role, setRole] = useState(user?.targetRole || 'Fullstack Developer')
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
    const toastId = toast.loading('Reading resume PDF…')
    try {
      const { data } = await api.post('/interviews/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeText(data.text || '')
      setResumeFileName(file.name)
      toast.success('Resume attached successfully', { id: toastId })
    } catch (err) {
      toast.error(apiError(err, 'Could not process resume'), { id: toastId })
    }
  }

  async function createSession(e) {
    e.preventDefault()
    setBusy(true)
    const finalTopic = topic === 'Custom Topic' ? customTopic.trim() : topic
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
      if (session.mode === 'quiz') {
        navigate(`/quiz/${session._id}`)
      } else {
        navigate(`/interview/${session._id}`)
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not create session'))
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
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overallScore || s.totalScore || 0), 0) / completedSessions.length)
    : 0

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
    <main className="container" style={{ paddingBottom: '3rem' }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.65rem', margin: 0, fontWeight: 700 }}>
              Welcome, {user?.name?.split(' ')[0] || 'Candidate'}
            </h1>
            {user?.isEmailVerified && (
              <span className="tag" style={{ fontSize: '0.7rem' }}>
                <ShieldCheck size={13} /> Verified
              </span>
            )}
          </div>
          <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
            Configure and launch mock interview sessions or review previous performance evaluations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div className="subtle small" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed
            </div>
            <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {completedSessions.length} sessions
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
          <div>
            <div className="subtle small" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Average Score
            </div>
            <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: avgScore >= 70 ? 'var(--good)' : 'var(--text)' }}>
              {avgScore}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        {/* Left Column: Configure Session */}
        <div className="panel" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.4rem' }}>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem', fontWeight: 700 }}>
              Configure Practice Session
            </h2>
            <p className="muted small" style={{ margin: 0 }}>
              Select session parameters to begin your practice assessment.
            </p>
          </div>

          <form onSubmit={createSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Practice Format */}
            <div className="field" style={{ marginBottom: 0 }}>
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
                  <Layers size={15} /> Multiple Choice Quiz
                </button>
              </div>
            </div>

            {/* Target Role & Difficulty */}
            <div className="field-row">
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Target Role</span>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Experience Level</span>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Junior">Junior (0-2 YOE)</option>
                  <option value="Intermediate">Mid-Level (2-5 YOE)</option>
                  <option value="Senior">Senior (5+ YOE)</option>
                </select>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="field" style={{ marginBottom: 0 }}>
              <span className="field-label">Topic</span>
              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value)
                  if (e.target.value !== 'Custom Topic') setCustomTopic('')
                }}
              >
                {TOPIC_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {topic === 'Custom Topic' && (
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Custom Topic Name</span>
                <input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Distributed Caching, GraphQL, WebSockets"
                  required
                />
              </div>
            )}

            {/* Questions & Timer */}
            <div className="field-row">
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Questions</span>
                <select value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)}>
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
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

            {/* Resume Upload */}
            <div className="field" style={{ marginBottom: 0 }}>
              <span className="field-label">Resume PDF (Optional)</span>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--surface-2)',
                  border: '1px dashed var(--border-strong)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <Upload size={16} className="muted" />
                <span className="small" style={{ flex: 1 }}>
                  {resumeFileName ? resumeFileName : 'Upload CV / Resume to personalize questions'}
                </span>
                <span className="tag-soft" style={{ fontSize: '0.72rem' }}>
                  {resumeFileName ? 'Attached' : 'Browse'}
                </span>
                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={busy}
              style={{ marginTop: '0.4rem' }}
            >
              {busy ? 'Preparing Session…' : <>Start Practice Session <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        {/* Right Column: Recent Practice History */}
        <div className="panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.2rem', fontWeight: 700 }}>
                Recent Practice History
              </h2>
              <span className="subtle small mono">{sessions.length} total sessions</span>
            </div>
            {sessions.length > 0 && (
              <Link to="/certificates" className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
                Certificates
              </Link>
            )}
          </div>

          {sessions.length > 0 && (
            <div className="input-icon-wrap" style={{ marginBottom: '1rem' }}>
              <Search size={15} className="input-icon" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search history..."
                style={{ fontSize: '0.84rem' }}
              />
            </div>
          )}

          {fetchingSessions ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 0' }} className="muted small mono">
              Loading sessions...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <FileText size={36} className="muted" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                No Sessions Yet
              </h3>
              <p className="muted small" style={{ margin: 0 }}>
                Configure and start your first practice session on the left.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '560px', overflowY: 'auto' }}>
              {filteredSessions.map((session) => (
                <div
                  key={session._id}
                  className="history-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, transform 0.15s ease',
                  }}
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span className="tag" style={{ fontSize: '0.65rem' }}>
                        {session.mode === 'quiz' ? 'Quiz' : 'Q&A'}
                      </span>
                      <span className="tag-soft" style={{ fontSize: '0.65rem' }}>
                        {session.difficulty}
                      </span>
                      {session.timerMinutes > 0 && (
                        <span className="tag-soft" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={10} /> {session.timerMinutes}m
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session.role}
                    </div>
                    <div className="muted small" style={{ fontSize: '0.78rem' }}>
                      {session.category || session.topic}
                      {session.createdAt && (
                        <span> • {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                    {session.status === 'completed' ? (
                      <span className="score-chip" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        {session.overallScore !== undefined ? `${session.overallScore}%` : 'Done'}
                      </span>
                    ) : (
                      <span className="score-chip chip-pending" style={{ fontSize: '0.75rem' }}>
                        In Progress
                      </span>
                    )}

                    <button
                      type="button"
                      className="history-del"
                      onClick={(e) => deleteSession(session._id, e)}
                      title="Delete Session"
                    >
                      <Trash2 size={14} />
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
