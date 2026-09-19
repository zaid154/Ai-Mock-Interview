import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import Avatar from '../components/Avatar'
import { ShieldCheck, Award, Briefcase } from 'lucide-react'
import PracticeStudio from '../components/dashboard/PracticeStudio'
import PerformanceHub from '../components/dashboard/PerformanceHub'

const DIFFICULTY_MAP = { Junior: 'easy', Intermediate: 'medium', Senior: 'hard' }

/**
 * Dashboard Page: Candidate hub coordinating PracticeStudio and PerformanceHub.
 */
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { confirm } = useConfirm()

  // Setup Form States
  const [mode, setMode] = useState('questions')
  const [role, setRole] = useState(user?.targetRole || 'Fullstack Developer')
  const [topic, setTopic] = useState('React & Modern Web Architecture')
  const [customTopic, setCustomTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [timerMinutes, setTimerMinutes] = useState('0')
  const [resumeText, setResumeText] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')

  // Past Sessions States
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
    if (!file.name.toLowerCase().endsWith('.pdf')) return toast.error('Please upload a PDF file')

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
      navigate(session.mode === 'quiz' ? `/quiz/${session._id}` : `/interview/${session._id}`)
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

  // Aggregate Metrics
  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overallScore || s.totalScore || 0), 0) / completedSessions.length)
    : 0
  const qualifiedCerts = completedSessions.filter((s) => (s.overallScore || 0) >= 70).length

  const filteredSessions = sessions.filter((s) => {
    if (!searchFilter.trim()) return true
    const term = searchFilter.toLowerCase()
    return s.role?.toLowerCase().includes(term) || s.category?.toLowerCase().includes(term) || s.topic?.toLowerCase().includes(term)
  })

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* Candidate Status Banner */}
      <div className="candidate-hero-banner">
        <div className="candidate-profile-block">
          <Avatar src={user?.avatar} name={user?.name || 'Candidate'} size={46} />
          <div className="candidate-meta-cluster">
            <div className="candidate-name-row">
              <h1 className="candidate-name-title">{user?.name || 'Candidate'}</h1>
              {user?.isEmailVerified && <span className="tag" style={{ fontSize: '0.72rem' }}><ShieldCheck size={13} /> Verified</span>}
            </div>
            <div className="candidate-role-sub">
              <Briefcase size={14} className="muted" />
              <span>Target Track: <strong style={{ color: 'var(--text)' }}>{role || 'Fullstack Developer'}</strong></span>
            </div>
          </div>
        </div>

        <div className="dashboard-metrics-cluster">
          <div className="dashboard-metric-item">
            <span className="dashboard-metric-label">Completed Drills</span>
            <span className="dashboard-metric-val">{completedSessions.length}</span>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
          <div className="dashboard-metric-item">
            <span className="dashboard-metric-label">Readiness Index</span>
            <span className="dashboard-metric-val" style={{ color: avgScore >= 80 ? 'var(--good)' : avgScore >= 60 ? 'var(--accent-primary)' : 'var(--text)' }}>
              {avgScore}%
            </span>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
          <Link to="/certificates" className="btn btn-secondary btn-sm" style={{ fontSize: '0.82rem', gap: '0.4rem' }}>
            <Award size={14} /> Certificates ({qualifiedCerts})
          </Link>
        </div>
      </div>

      {/* Grid: Setup Form + Performance Hub */}
      <div className="dashboard-cockpit-grid">
        <PracticeStudio
          mode={mode} setMode={setMode} role={role} setRole={setRole}
          topic={topic} setTopic={setTopic} customTopic={customTopic} setCustomTopic={setCustomTopic}
          numQuestions={numQuestions} setNumQuestions={setNumQuestions}
          difficulty={difficulty} setDifficulty={setDifficulty}
          timerMinutes={timerMinutes} setTimerMinutes={setTimerMinutes}
          resumeFileName={resumeFileName} handleFileUpload={handleFileUpload}
          handleRemoveResume={handleRemoveResume} createSession={createSession} busy={busy}
        />
        <PerformanceHub
          sessions={sessions} completedSessions={completedSessions} avgScore={avgScore}
          searchFilter={searchFilter} setSearchFilter={setSearchFilter}
          filteredSessions={filteredSessions} fetchingSessions={fetchingSessions}
          deleteSession={deleteSession} navigate={navigate}
        />
      </div>
    </main>
  )
}
