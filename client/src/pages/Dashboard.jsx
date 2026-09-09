import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import Avatar from '../components/Avatar'
import {
  Upload,
  Clock,
  Trash2,
  HelpCircle,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck,
  Award,
  Briefcase,
  Code2,
  X,
  FileCheck,
  Sparkles,
} from 'lucide-react'

const ROLE_PRESETS = [
  'Fullstack Developer',
  'Frontend Engineer',
  'Backend Developer',
  'System Design Architect',
  'DevOps & Cloud Engineer',
]

const TOPIC_OPTIONS = [
  'React & Modern Web Architecture',
  'Node.js, Express & Microservices',
  'System Design, Scalability & Caching',
  'Data Structures & Algorithms',
  'DevOps, Docker, Kubernetes & CI/CD',
  'SQL, NoSQL & Database Optimization',
  'Full Stack Application Architecture',
  'Custom Topic',
]

const DIFFICULTY_MAP = {
  Junior: 'easy',
  Intermediate: 'medium',
  Senior: 'hard',
}

const QUESTION_COUNTS = [3, 5, 7, 10]

const TIMER_OPTIONS = [
  { label: 'Untimed', value: '0' },
  { label: '5m', value: '5' },
  { label: '10m', value: '10' },
  { label: '15m', value: '15' },
  { label: '20m', value: '20' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { confirm } = useConfirm()

  const [mode, setMode] = useState('questions')
  const [role, setRole] = useState(user?.targetRole || 'Fullstack Developer')
  const [topic, setTopic] = useState('React & Modern Web Architecture')
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
    const toastId = toast.loading('Parsing resume context…')
    try {
      const { data } = await api.post('/interviews/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeText(data.text || '')
      setResumeFileName(file.name)
      toast.success('Resume context attached', { id: toastId })
    } catch (err) {
      toast.error(apiError(err, 'Could not parse resume'), { id: toastId })
    }
  }

  function handleRemoveResume(e) {
    e.preventDefault()
    e.stopPropagation()
    setResumeFileName('')
    setResumeText('')
    toast.success('Resume context removed')
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
      toast.error(apiError(err, 'Could not initialize practice session'))
    } finally {
      setBusy(false)
    }
  }

  async function deleteSession(id, e) {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Delete Practice Session?',
      message: 'This session and its evaluation transcript will be permanently removed.',
      confirmText: 'Delete Session',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/interviews/${id}`)
      setSessions((prev) => prev.filter((s) => s._id !== id))
      toast.success('Session removed')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete session'))
    }
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length
    ? Math.round(
        completedSessions.reduce(
          (acc, s) => acc + (s.overallScore || s.totalScore || 0),
          0
        ) / completedSessions.length
      )
    : 0

  const qualifiedCerts = completedSessions.filter(
    (s) => (s.overallScore || 0) >= 70
  ).length

  const filteredSessions = sessions.filter((s) => {
    if (!searchFilter.trim()) return true
    const term = searchFilter.toLowerCase()
    return (
      s.role?.toLowerCase().includes(term) ||
      s.category?.toLowerCase().includes(term) ||
      s.topic?.toLowerCase().includes(term)
    )
  })

  // Circumference for the readiness progress ring (radius = 24 -> C = 2 * PI * 24 ≈ 150.8)
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (avgScore / 100) * circumference

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* ── Executive Candidate Status Bar ── */}
      <div className="candidate-hero-banner">
        <div className="candidate-profile-block">
          <Avatar src={user?.avatar} name={user?.name || 'Candidate'} size={46} />
          <div className="candidate-meta-cluster">
            <div className="candidate-name-row">
              <h1 className="candidate-name-title">
                {user?.name || 'Candidate'}
              </h1>
              {user?.isEmailVerified && (
                <span className="tag" style={{ fontSize: '0.72rem' }}>
                  <ShieldCheck size={13} /> Verified
                </span>
              )}
            </div>
            <div className="candidate-role-sub">
              <Briefcase size={14} className="muted" />
              <span>
                Target Track: <strong style={{ color: 'var(--text)' }}>{role || 'Fullstack Developer'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* High-density metrics cluster */}
        <div className="dashboard-metrics-cluster">
          <div className="dashboard-metric-item">
            <span className="dashboard-metric-label">Completed Drills</span>
            <span className="dashboard-metric-val">{completedSessions.length}</span>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
          <div className="dashboard-metric-item">
            <span className="dashboard-metric-label">Readiness Index</span>
            <span
              className="dashboard-metric-val"
              style={{
                color:
                  avgScore >= 80
                    ? 'var(--good)'
                    : avgScore >= 60
                    ? 'var(--accent-primary)'
                    : 'var(--text)',
              }}
            >
              {avgScore}%
            </span>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
          <Link
            to="/certificates"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.82rem', gap: '0.4rem' }}
          >
            <Award size={14} /> Certificates ({qualifiedCerts})
          </Link>
        </div>
      </div>

      {/* ── Balanced 62/38 Cockpit Grid ── */}
      <div className="dashboard-cockpit-grid">
        {/* Left Column: Practice Configuration Studio */}
        <div className="studio-card">
          <div className="studio-card-header">
            <div>
              <h2 className="studio-title">Practice Studio</h2>
              <p className="studio-subtitle">
                Set up evaluation parameters to simulate real technical hiring loops.
              </p>
            </div>
          </div>

          <form onSubmit={createSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Step 1: Format Selector Cards */}
            <div className="studio-section">
              <span className="studio-section-label">1. Practice Mode</span>
              <div className="mode-selection-grid">
                <button
                  type="button"
                  className={`mode-selector-card ${mode === 'questions' ? 'active' : ''}`}
                  onClick={() => setMode('questions')}
                >
                  <div className="mode-icon-box">
                    <HelpCircle size={18} />
                  </div>
                  <div className="mode-card-content">
                    <div className="mode-card-title">Q&amp;A Interview</div>
                    <div className="mode-card-desc">
                      Verbal &amp; technical scenario questions with AI evaluation.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`mode-selector-card ${mode === 'quiz' ? 'active' : ''}`}
                  onClick={() => setMode('quiz')}
                >
                  <div className="mode-icon-box">
                    <Layers size={18} />
                  </div>
                  <div className="mode-card-content">
                    <div className="mode-card-title">Speed MCQ Quiz</div>
                    <div className="mode-card-desc">
                      Rapid-fire technical multiple-choice assessments.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Target Role & Level */}
            <div className="studio-section">
              <span className="studio-section-label">2. Target Role &amp; Seniority</span>
              <div className="input-icon-wrap">
                <Briefcase size={15} className="input-icon" />
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>

              {/* Quick Preset Role Chips */}
              <div className="preset-pills-row">
                {ROLE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`preset-pill ${role === p ? 'active' : ''}`}
                    onClick={() => setRole(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Experience Level Segmented Pills */}
              <div style={{ marginTop: '0.45rem' }}>
                <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                  Seniority Level
                </span>
                <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {['Junior', 'Intermediate', 'Senior'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`pill-select-btn ${difficulty === lvl ? 'active' : ''}`}
                      onClick={() => setDifficulty(lvl)}
                    >
                      {lvl === 'Junior' && 'Junior (0-2 YOE)'}
                      {lvl === 'Intermediate' && 'Mid-Level (2-5 YOE)'}
                      {lvl === 'Senior' && 'Senior (5+ YOE)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Domain & Topic */}
            <div className="studio-section">
              <span className="studio-section-label">3. Technical Domain</span>
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

              {topic === 'Custom Topic' && (
                <div className="input-icon-wrap" style={{ marginTop: '0.35rem' }}>
                  <Code2 size={15} className="input-icon" />
                  <input
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter custom topic (e.g. Distributed Caching, GraphQL, WebSockets)"
                    required
                  />
                </div>
              )}
            </div>

            {/* Step 4: Session Scope & Duration */}
            <div className="studio-section">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                    Question Volume
                  </span>
                  <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {QUESTION_COUNTS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        className={`pill-select-btn ${numQuestions === cnt ? 'active' : ''}`}
                        onClick={() => setNumQuestions(cnt)}
                      >
                        {cnt} Qs
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                    Session Timer
                  </span>
                  <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {TIMER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`pill-select-btn ${timerMinutes === opt.value ? 'active' : ''}`}
                        onClick={() => setTimerMinutes(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Resume Intelligence Context */}
            <div className="studio-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="studio-section-label">4. Resume Intelligence</span>
                <span className="muted small" style={{ fontSize: '0.72rem' }}>Optional</span>
              </div>

              <label className={`resume-studio-zone ${resumeFileName ? 'attached' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                  {resumeFileName ? (
                    <FileCheck size={20} style={{ color: 'var(--good)', flexShrink: 0 }} />
                  ) : (
                    <Upload size={18} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: resumeFileName ? 'var(--good)' : 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {resumeFileName ? resumeFileName : 'Attach Resume PDF (Tailor Questions)'}
                    </div>
                    <div className="muted small" style={{ fontSize: '0.75rem' }}>
                      {resumeFileName
                        ? 'Questions will personalize to your project tech stack & experience'
                        : 'Upload your CV to generate questions matching your background'}
                    </div>
                  </div>
                </div>

                {resumeFileName ? (
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', height: 'auto', flexShrink: 0 }}
                    title="Remove attached resume"
                  >
                    <X size={13} /> Remove
                  </button>
                ) : (
                  <span className="tag-soft" style={{ fontSize: '0.74rem', flexShrink: 0 }}>
                    Browse PDF
                  </span>
                )}
                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="studio-launch-btn"
              disabled={busy}
            >
              {busy ? (
                'Preparing Assessment Environment…'
              ) : (
                <>
                  Start {mode === 'quiz' ? 'MCQ Drill' : 'Mock Interview'} ({numQuestions} Qs • {difficulty})
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Performance Hub & History */}
        <div className="hub-card">
          <div className="studio-card-header">
            <div>
              <h2 className="studio-title">Performance Hub</h2>
              <p className="studio-subtitle">
                Track candidate readiness, score trends, and transcripts.
              </p>
            </div>
            <span className="subtle small mono" style={{ fontWeight: 700 }}>
              {sessions.length} sessions
            </span>
          </div>

          {/* Performance Snapshot Widget */}
          <div className="readiness-snapshot-card">
            <div className="readiness-info-col">
              <span className="readiness-badge-label">
                {avgScore >= 80 ? '⭐ Elite Ready' : avgScore >= 60 ? '⚡ Strong Potential' : '🎯 Practice Phase'}
              </span>
              <div className="readiness-score-display">
                {avgScore}% <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Avg Score</span>
              </div>
              <div className="readiness-score-sub">
                {completedSessions.length > 0
                  ? `${completedSessions.length} completed session${completedSessions.length > 1 ? 's' : ''} evaluated`
                  : 'Complete your first drill to generate rating'}
              </div>
            </div>

            {/* Radial score progress meter */}
            <div className="readiness-ring-wrap">
              <svg className="readiness-ring-svg" viewBox="0 0 58 58">
                <circle cx="29" cy="29" r={radius} className="readiness-ring-bg" />
                <circle
                  cx="29"
                  cy="29"
                  r={radius}
                  className="readiness-ring-fill"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeOffset,
                    stroke:
                      avgScore >= 80
                        ? 'var(--good)'
                        : avgScore >= 60
                        ? 'var(--accent-primary)'
                        : 'var(--text-subtle)',
                  }}
                />
              </svg>
              <span className="readiness-ring-text">{avgScore}%</span>
            </div>
          </div>

          {/* Search bar when history exists */}
          {sessions.length > 0 && (
            <div className="input-icon-wrap">
              <Search size={15} className="input-icon" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search history by role or topic..."
                style={{ fontSize: '0.84rem' }}
              />
            </div>
          )}

          {/* History Feed List or Clean Roadmap */}
          {fetchingSessions ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 0' }} className="muted small mono">
              Loading past sessions...
            </div>
          ) : filteredSessions.length === 0 ? (
            sessions.length === 0 ? (
              <div className="hub-empty-roadmap">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>How Assessment Works</span>
                </div>

                <div className="roadmap-step-item">
                  <span className="roadmap-step-num">1</span>
                  <div className="roadmap-step-content">
                    <div className="roadmap-step-title">Select Format &amp; Role Track</div>
                    <div className="roadmap-step-desc">
                      Choose between verbal Q&amp;A mock or rapid MCQ drill tailored to your target position.
                    </div>
                  </div>
                </div>

                <div className="roadmap-step-item">
                  <span className="roadmap-step-num">2</span>
                  <div className="roadmap-step-content">
                    <div className="roadmap-step-title">Answer Technical Scenarios</div>
                    <div className="roadmap-step-desc">
                      Solve live coding &amp; architectural problems with instant AI response analysis.
                    </div>
                  </div>
                </div>

                <div className="roadmap-step-item">
                  <span className="roadmap-step-num">3</span>
                  <div className="roadmap-step-content">
                    <div className="roadmap-step-title">Earn Verified Certificate</div>
                    <div className="roadmap-step-desc">
                      Achieve 70%+ score to qualify for official downloadable credentials and public verification.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                <p className="muted small" style={{ margin: 0 }}>
                  No sessions match <strong>"{searchFilter}"</strong>
                </p>
              </div>
            )
          ) : (
            <div className="session-feed-list">
              {filteredSessions.map((session) => {
                const score = session.overallScore ?? session.totalScore
                const isPassed = score !== undefined && score >= 70
                return (
                  <div
                    key={session._id}
                    className="session-feed-card"
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
                    <div className="session-main-meta">
                      <div className="session-pill-cluster">
                        <span className="tag" style={{ fontSize: '0.66rem' }}>
                          {session.mode === 'quiz' ? 'Quiz' : 'Q&A'}
                        </span>
                        <span className="tag-soft" style={{ fontSize: '0.66rem' }}>
                          {session.difficulty}
                        </span>
                        {session.timerMinutes > 0 && (
                          <span
                            className="tag-soft"
                            style={{
                              fontSize: '0.66rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <Clock size={10} /> {session.timerMinutes}m
                          </span>
                        )}
                      </div>

                      <div className="session-title-text">{session.role}</div>

                      <div className="session-topic-sub">
                        {session.category || session.topic}
                        {session.createdAt && (
                          <span>
                            {' '}•{' '}
                            {new Date(session.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="session-actions-cluster">
                      {session.status === 'completed' ? (
                        <span
                          className="session-score-pill"
                          style={{
                            background: isPassed ? 'var(--good-soft)' : 'var(--surface-3)',
                            color: isPassed ? 'var(--good)' : 'var(--text)',
                            border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.25)' : 'var(--border)'}`,
                          }}
                        >
                          {score !== undefined ? `${score}%` : 'Done'}
                        </span>
                      ) : (
                        <span
                          className="session-score-pill"
                          style={{
                            background: 'var(--warn-soft)',
                            color: 'var(--warn)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                          }}
                        >
                          In Progress
                        </span>
                      )}

                      <button
                        type="button"
                        className="session-trash-btn"
                        onClick={(e) => deleteSession(session._id, e)}
                        title="Delete Session"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
