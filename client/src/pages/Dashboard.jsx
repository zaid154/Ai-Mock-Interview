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
  Bot,
  BrainCircuit,
  Award,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  Target,
  Flame,
  Activity,
  History,
  RotateCcw,
} from 'lucide-react'

const TOPIC_PRESETS = [
  { id: 'react', label: 'React & Web Performance', icon: '⚛️' },
  { id: 'node', label: 'Node.js & Microservices', icon: '🟢' },
  { id: 'sysdesign', label: 'System Design & Distributed Systems', icon: '🏗️' },
  { id: 'dsa', label: 'Data Structures & Algorithms', icon: '🧠' },
  { id: 'devops', label: 'DevOps & CI/CD Pipelines', icon: '☁️' },
  { id: 'sql', label: 'SQL & Database Optimization', icon: '🗄️' },
]

const ROLE_SUGGESTIONS = [
  'Fullstack Engineer',
  'Frontend Developer',
  'Backend Architect',
  'System Design Specialist',
  'DevOps Engineer',
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

  const [activeTab, setActiveTab] = useState('studio') // 'studio' | 'history'
  const [mode, setMode] = useState('questions') // 'questions' | 'quiz'
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
  const [modeFilter, setModeFilter] = useState('all')

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
    const toastId = toast.loading('AI parsing resume PDF…')
    try {
      const { data } = await api.post('/interviews/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeText(data.text || '')
      setResumeFileName(file.name)
      toast.success(`Resume parsed successfully! AI tailored questions active.`, { id: toastId })
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
      toast.success(mode === 'quiz' ? 'AI Quiz generated!' : 'AI Interview session generated!')
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
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overallScore || s.totalScore || 0), 0) / completedSessions.length)
    : 0

  const highestScore = completedSessions.length
    ? Math.max(...completedSessions.map((s) => s.overallScore || s.totalScore || 0))
    : 0

  const filteredSessions = sessions.filter((s) => {
    if (modeFilter === 'questions' && s.mode === 'quiz') return false
    if (modeFilter === 'quiz' && s.mode !== 'quiz') return false
    if (modeFilter === 'completed' && s.status !== 'completed') return false
    if (!searchFilter.trim()) return true
    const term = searchFilter.toLowerCase()
    return (
      s.role?.toLowerCase().includes(term) ||
      s.category?.toLowerCase().includes(term) ||
      s.topic?.toLowerCase().includes(term)
    )
  })

  return (
    <main className="container" style={{ paddingBottom: '3.5rem' }}>
      {/* ── 1. Modern AI Studio Hero Banner ── */}
      <section className="ai-dashboard-hero">
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge-glow" style={{ fontSize: '0.74rem' }}>
              <Bot size={14} style={{ color: 'var(--accent-primary)' }} /> AI Assessment Engine Active
            </span>
            {user?.isEmailVerified && (
              <span className="tag" style={{ fontSize: '0.7rem' }}>
                <ShieldCheck size={13} /> Verified Candidate
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: '0 0 0.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name || 'Candidate'}
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: '0.92rem' }}>
            Target Stack:{' '}
            <strong style={{ color: 'var(--text)', fontWeight: 700 }}>
              {role || user?.targetRole || 'Fullstack Engineer'}
            </strong>{' '}
            • Real-time Gemini 2.5 AI grading &amp; feedback
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1, flexWrap: 'wrap' }}>
          <Link to="/leaderboard" className="btn btn-secondary btn-sm">
            <Trophy size={15} style={{ color: 'var(--warn)' }} /> Leaderboard
          </Link>
          <Link to="/certificates" className="btn btn-secondary btn-sm">
            <Award size={15} style={{ color: 'var(--good)' }} /> Certificates
          </Link>
        </div>
      </section>

      {/* ── 2. Metric Cards Strip ── */}
      <section className="ai-stat-grid">
        <div className="ai-stat-card">
          <div className="ai-stat-icon-wrap" style={{ background: 'var(--accent-grad-subtle)', color: 'var(--accent-primary)' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="subtle small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed Sessions
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {completedSessions.length}
            </div>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon-wrap" style={{ background: 'var(--good-soft)', color: 'var(--good)' }}>
            <Target size={22} />
          </div>
          <div>
            <div className="subtle small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Average Rating
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: avgScore >= 70 ? 'var(--good)' : 'var(--text)' }}>
              {avgScore}%
            </div>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warn)' }}>
            <Flame size={22} />
          </div>
          <div>
            <div className="subtle small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Highest Score
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--warn)' }}>
              {highestScore}%
            </div>
          </div>
        </div>

        <div className="ai-stat-card">
          <div className="ai-stat-icon-wrap" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
            <History size={22} />
          </div>
          <div>
            <div className="subtle small" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Bank
            </div>
            <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {sessions.length} Sessions
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Modern Tab Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="segmented-control" style={{ maxWidth: '440px' }}>
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            <Sparkles size={16} /> AI Practice Studio
          </button>
          <button
            type="button"
            className={`segmented-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} /> History &amp; Results ({sessions.length})
          </button>
        </div>

        {activeTab === 'studio' && sessions.length > 0 && (
          <button
            type="button"
            className="link-btn small"
            onClick={() => setActiveTab('history')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
          >
            View past session evaluations <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── TAB 1: AI Practice Studio ── */}
      {activeTab === 'studio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Main Studio Panel */}
          <div className="panel" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '20px' }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.3rem' }}>
                <Zap size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800 }}>Configure AI Practice Session</h2>
              </div>
              <p className="muted small" style={{ margin: 0 }}>
                Select format, topic, and difficulty to generate custom scenario-based evaluations powered by Gemini AI.
              </p>
            </div>

            <form onSubmit={createSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {/* Practice Mode Cards */}
              <div>
                <span className="field-label" style={{ marginBottom: '0.6rem' }}>Select Practice Format</span>
                <div className="ai-mode-cards">
                  <button
                    type="button"
                    className={`ai-mode-card ${mode === 'questions' ? 'selected' : ''}`}
                    onClick={() => setMode('questions')}
                  >
                    <div style={{ padding: '0.6rem', borderRadius: '10px', background: mode === 'questions' ? 'var(--accent-grad-subtle)' : 'var(--surface)', color: 'var(--accent-primary)' }}>
                      <HelpCircle size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.2rem' }}>
                        Q&amp;A Interview Simulation
                      </div>
                      <div className="muted small" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                        Open-ended conversational questions with in-depth line-by-line grading and AI feedback.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`ai-mode-card ${mode === 'quiz' ? 'selected' : ''}`}
                    onClick={() => setMode('quiz')}
                  >
                    <div style={{ padding: '0.6rem', borderRadius: '10px', background: mode === 'quiz' ? 'var(--accent-grad-subtle)' : 'var(--surface)', color: 'var(--accent-primary)' }}>
                      <Layers size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.2rem' }}>
                        Rapid MCQ Quiz Battle
                      </div>
                      <div className="muted small" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                        Fast-paced multiple-choice challenges with instant rationale and conceptual breakdown.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Role & Experience */}
              <div className="field-row">
                <div className="field" style={{ marginBottom: 0 }}>
                  <span className="field-label">Target Role / Specialization</span>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {ROLE_SUGGESTIONS.map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`tag-soft ${role === r ? 'active' : ''}`}
                        style={{ cursor: 'pointer', border: 'none', background: role === r ? 'var(--accent-primary)' : 'var(--surface-2)', color: role === r ? '#fff' : 'var(--text-muted)' }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ marginBottom: 0 }}>
                  <span className="field-label">Difficulty / Experience Level</span>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Junior">Junior (0-2 YOE) - Core Foundations</option>
                    <option value="Intermediate">Mid-Level (2-5 YOE) - Real-world Tradeoffs</option>
                    <option value="Senior">Senior (5+ YOE) - Scalability &amp; Architecture</option>
                  </select>
                </div>
              </div>

              {/* Topic Presets */}
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Topic Area</span>
                <div className="ai-preset-grid">
                  {TOPIC_PRESETS.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`ai-preset-btn ${topic === t.label ? 'selected' : ''}`}
                      onClick={() => {
                        setTopic(t.label)
                        setCustomTopic('')
                      }}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`ai-preset-btn ${topic === 'custom' ? 'selected' : ''}`}
                    onClick={() => setTopic('custom')}
                  >
                    ✏️ + Custom Topic...
                  </button>
                </div>

                {topic === 'custom' && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g. Micro-Frontends, WebSockets, Kafka Streaming"
                      autoFocus
                      required
                    />
                  </div>
                )}
              </div>

              {/* Fine-Tuning Question Count & Timer */}
              <div className="field-row">
                <div className="field" style={{ marginBottom: 0 }}>
                  <span className="field-label">Question Volume</span>
                  <select value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)}>
                    <option value={3}>⚡ Quick Practice (3 Questions)</option>
                    <option value={5}>🎯 Standard Mock (5 Questions)</option>
                    <option value={7}>📊 Comprehensive (7 Questions)</option>
                    <option value={10}>🏆 Deep-Dive Assessment (10 Questions)</option>
                  </select>
                </div>

                <div className="field" style={{ marginBottom: 0 }}>
                  <span className="field-label">Session Timer</span>
                  <select value={timerMinutes} onChange={(e) => setTimerMinutes(e.target.value)}>
                    <option value="0">Untimed (Self-paced study)</option>
                    <option value="5">5 Minutes (Sprint)</option>
                    <option value="10">10 Minutes (Standard)</option>
                    <option value="15">15 Minutes (Realistic)</option>
                    <option value="20">20 Minutes (Full Length)</option>
                  </select>
                </div>
              </div>

              {/* Resume Context Bar */}
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label">Resume Context (Optional AI Personalization)</span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    padding: '0.85rem 1.1rem',
                    background: resumeFileName ? 'var(--good-soft)' : 'var(--surface-2)',
                    border: resumeFileName ? '1px solid var(--good)' : '1px dashed var(--border-strong)',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Upload size={18} style={{ color: resumeFileName ? 'var(--good)' : 'var(--text-muted)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: resumeFileName ? 'var(--good)' : 'var(--text)' }}>
                      {resumeFileName ? `Attached: ${resumeFileName}` : 'Upload Resume PDF'}
                    </div>
                    <div className="muted small" style={{ fontSize: '0.78rem' }}>
                      {resumeFileName
                        ? 'AI will automatically tailor questions to your project history and stack.'
                        : 'Upload your CV to let AI generate personalized interview questions matching your background.'}
                    </div>
                  </div>
                  <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                    {resumeFileName ? 'Change PDF' : 'Browse File'}
                  </span>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Glowing CTA Button */}
              <button
                type="submit"
                className="ai-launch-cta"
                disabled={busy}
                style={{ marginTop: '0.5rem' }}
              >
                {busy ? (
                  <>
                    <BrainCircuit size={20} className="spin" /> Generating AI Assessment…
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" /> Launch AI Practice Session <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Recent Activity Strip (Under Studio) */}
          {sessions.length > 0 && (
            <div className="panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={16} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>Jump Back In (Recent Sessions)</h3>
                </div>
                <button
                  type="button"
                  className="link-btn small"
                  onClick={() => setActiveTab('history')}
                >
                  See all {sessions.length} sessions
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {sessions.slice(0, 3).map((session) => (
                  <div
                    key={session._id}
                    className="ai-session-item"
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          display: 'grid',
                          placeItems: 'center',
                          background: session.mode === 'quiz' ? 'var(--accent-grad-subtle)' : 'var(--good-soft)',
                          color: session.mode === 'quiz' ? 'var(--accent-primary)' : 'var(--good)',
                        }}
                      >
                        {session.mode === 'quiz' ? <Layers size={18} /> : <HelpCircle size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{session.role}</div>
                        <div className="muted small" style={{ fontSize: '0.78rem' }}>
                          {session.category || session.topic} • {session.difficulty}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {session.status === 'completed' ? (
                        <span className="score-chip" style={{ fontWeight: 800 }}>
                          {session.overallScore !== undefined ? `${session.overallScore} / 100` : 'Evaluated'}
                        </span>
                      ) : (
                        <span className="score-chip chip-pending">In Progress</span>
                      )}
                      <ChevronRight size={16} className="muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Full Practice History & Analytics ── */}
      {activeTab === 'history' && (
        <div className="panel" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.2rem', fontWeight: 800 }}>
                Practice History &amp; AI Evaluations
              </h2>
              <p className="muted small" style={{ margin: 0 }}>
                Review past transcripts, AI feedback, performance breakdowns, and certificates.
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['all', 'questions', 'quiz', 'completed'].map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setModeFilter(f)}
                  className={`tag-soft ${modeFilter === f ? 'active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    border: 'none',
                    background: modeFilter === f ? 'var(--accent-primary)' : 'var(--surface-2)',
                    color: modeFilter === f ? '#fff' : 'var(--text-muted)',
                    textTransform: 'capitalize',
                    padding: '0.4rem 0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {f === 'questions' ? 'Q&A' : f === 'quiz' ? 'MCQ Quiz' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          {sessions.length > 0 && (
            <div className="input-icon-wrap" style={{ marginBottom: '1.25rem' }}>
              <Search size={16} className="input-icon" />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search by role, topic, or technology..."
                style={{ padding: '0.65rem 0.8rem 0.65rem 2.5rem' }}
              />
            </div>
          )}

          {fetchingSessions ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }} className="muted small mono">
              Loading past evaluations...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <FileText size={42} className="muted" style={{ margin: '0 auto 0.8rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.3rem', fontWeight: 700 }}>
                {sessions.length === 0 ? 'No Practice Sessions Yet' : 'No Matching Sessions Found'}
              </h3>
              <p className="muted small" style={{ margin: '0 0 1.25rem' }}>
                {sessions.length === 0
                  ? 'Launch your first AI mock session to start tracking your performance and earning certificates!'
                  : 'Try changing your search term or mode filter.'}
              </p>
              {sessions.length === 0 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTab('studio')}
                >
                  <Sparkles size={16} /> Open AI Practice Studio
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredSessions.map((session) => (
                <div
                  key={session._id}
                  className="ai-session-item"
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        display: 'grid',
                        placeItems: 'center',
                        background: session.mode === 'quiz' ? 'var(--accent-grad-subtle)' : 'var(--good-soft)',
                        color: session.mode === 'quiz' ? 'var(--accent-primary)' : 'var(--good)',
                        flexShrink: 0,
                      }}
                    >
                      {session.mode === 'quiz' ? <Layers size={20} /> : <HelpCircle size={20} />}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                        <span className="tag" style={{ fontSize: '0.68rem' }}>
                          {session.mode === 'quiz' ? 'MCQ Quiz' : 'Q&A Interview'}
                        </span>
                        <span className="tag-soft" style={{ fontSize: '0.68rem' }}>
                          {session.difficulty}
                        </span>
                        {session.timerMinutes > 0 && (
                          <span className="tag-soft" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={11} /> {session.timerMinutes}m
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.98rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session.role}
                      </div>
                      <div className="muted small" style={{ fontSize: '0.82rem' }}>
                        Topic: <strong>{session.category || session.topic || 'General'}</strong>
                        {session.createdAt && (
                          <span> • {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
                    {session.status === 'completed' ? (
                      <span
                        className="score-chip"
                        style={{
                          background: (session.overallScore || 0) >= 70 ? 'var(--good-soft)' : 'var(--surface-2)',
                          color: (session.overallScore || 0) >= 70 ? 'var(--good)' : 'var(--text)',
                          fontWeight: 800,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                        }}
                      >
                        {session.overallScore !== undefined ? `${session.overallScore} / 100` : 'Evaluated'}
                      </span>
                    ) : (
                      <span className="score-chip chip-pending" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                        In Progress
                      </span>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.45rem 0.85rem' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (session.status === 'completed') {
                          navigate(`/results/${session._id}`)
                        } else if (session.mode === 'quiz') {
                          navigate(`/quiz/${session._id}`)
                        } else {
                          navigate(`/interview/${session._id}`)
                        }
                      }}
                    >
                      {session.status === 'completed' ? 'Review AI Report' : 'Continue'}
                    </button>

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
      )}
    </main>
  )
}
