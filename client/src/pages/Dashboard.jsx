import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Plus,
  Clock,
  CheckCircle2,
  Upload,
  FileCheck2,
  Trash2,
  LoaderCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
  SlidersHorizontal,
} from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'

const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'Data Engineer',
  'DevOps Engineer',
  'QA Automation Engineer',
  'UI/UX Architect',
  'Product Manager',
]

const CATEGORY_OPTIONS = [
  'General',
  'Frontend',
  'Backend',
  'React',
  'Node.js',
  'Java',
  'Python',
  'SQL',
  'HR & Behavioral',
  'System Design',
]

const TIMER_OPTIONS = [
  { value: 0, label: 'No Timer' },
  { value: 1, label: '1 min / question' },
  { value: 2, label: '2 mins / question' },
  { value: 5, label: '5 mins total' },
  { value: 10, label: '10 mins total' },
  { value: 15, label: '15 mins total' },
]

const EXPERIENCE_LEVELS = ['Fresher / Junior', '1-2 years', '3-5 years', '5+ years (Senior)']
const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { confirm } = useConfirm()
  const fileRef = useRef(null)

  const [role, setRole] = useState('Frontend Developer')
  const [customRole, setCustomRole] = useState(false)
  const [category, setCategory] = useState('General')
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [experience, setExperience] = useState('Fresher / Junior')
  const [difficulty, setDifficulty] = useState('medium')
  const [mode, setMode] = useState('questions')
  const [count, setCount] = useState(5)
  const [starting, setStarting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterMode, setFilterMode] = useState('All')

  const hasResume = Boolean(user?.hasResume)
  const resumeProfile = user?.resumeProfile || {}
  const busy = starting || uploading

  useEffect(() => {
    api
      .get('/interviews')
      .then((res) => setHistory(res.data.interviews || []))
      .catch((err) => toast.error(apiError(err, 'Could not load history')))
      .finally(() => setLoadingHistory(false))
  }, [])

  function onRoleSelect(e) {
    const value = e.target.value
    if (value === '__other__') {
      setCustomRole(true)
      setRole('')
    } else {
      setCustomRole(false)
      setRole(value)
    }
  }

  async function startInterview(e) {
    e.preventDefault()
    if (!hasResume && !role.trim()) {
      toast.error('Please specify a role')
      return
    }

    setStarting(true)
    try {
      const { data } = await api.post('/interviews', {
        role,
        category,
        timerMinutes,
        experience,
        difficulty,
        mode,
        count,
      })
      const interview = data.interview
      navigate(interview.mode === 'quiz' ? `/quiz/${interview._id}` : `/interview/${interview._id}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not start session'))
      setStarting(false)
    }
  }

  async function deleteSession(e, id) {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session?',
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/interviews/${id}`)
      setHistory((prev) => prev.filter((item) => item._id !== id))
      toast.success('Session deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete session'))
    }
  }

  async function uploadResume(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const form = new FormData()
      form.append('resume', file)
      await api.post('/interviews/resume', form)
      await refreshUser()
      toast.success('Resume parsed successfully')
    } catch (err) {
      toast.error(apiError(err, 'Resume parsing failed'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function beginEmailVerification() {
    if (!user?.email) return
    setSendingVerification(true)
    try {
      const { data } = await api.post('/auth/resend-otp', { email: user.email })
      if (data.alreadyVerified) {
        toast.success('Email is verified.')
        await refreshUser()
        return
      }
      toast.success('Verification code sent.')
      navigate('/verify', { state: { email: user.email, otpSent: true } })
    } catch (err) {
      if (err.response?.status === 429) {
        navigate('/verify', { state: { email: user.email, otpSent: true } })
      }
      toast.error(apiError(err, 'Could not send code'))
    } finally {
      setSendingVerification(false)
    }
  }

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchCategory = filterCategory === 'All' || item.category === filterCategory
    const matchMode = filterMode === 'All' || item.mode === filterMode
    const matchSearch =
      !searchQuery.trim() ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCategory && matchMode && matchSearch
  })

  return (
    <main className="container" style={{ padding: '2rem 1rem 4rem' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, tracking: '-0.02em' }}>
            Interview Dashboard
          </h1>
          <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.925rem' }}>
            Configure and launch mock sessions tailored to your target engineering role.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user?.isEmailVerified || user?.isVerified ? (
            <span className="tag" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={14} style={{ color: 'var(--good)', marginRight: '0.3rem' }} /> Verified Account
            </span>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={beginEmailVerification}
              disabled={sendingVerification}
            >
              Verify Email
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* Left Column: Create Session Workbench */}
        <div className="panel" style={{ padding: '1.75rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Create New Session</h2>
          </div>

          <form onSubmit={startInterview} aria-busy={starting} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Session Type Segmented Switch */}
            <div className="field">
              <span className="field-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
                Session Format
              </span>
              <div style={{ display: 'flex', background: 'var(--surface-2)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setMode('questions')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: mode === 'questions' ? 'var(--surface)' : 'transparent',
                    color: mode === 'questions' ? 'var(--text)' : 'var(--muted)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: mode === 'questions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Technical Q&A
                </button>
                <button
                  type="button"
                  onClick={() => setMode('quiz')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    border: 'none',
                    borderRadius: '6px',
                    background: mode === 'quiz' ? 'var(--surface)' : 'transparent',
                    color: mode === 'quiz' ? 'var(--text)' : 'var(--muted)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    boxShadow: mode === 'quiz' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Multiple Choice Quiz
                </button>
              </div>
            </div>

            {/* Resume Profile Banner or Role Selection */}
            {hasResume ? (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
                  Profile Parsed from Resume
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: '0.2rem' }}>
                  {resumeProfile.role || 'Software Engineer'}
                </div>
                <div className="muted small" style={{ marginTop: '0.1rem' }}>
                  Experience: {resumeProfile.experience || 'Detected from PDF'}
                </div>
              </div>
            ) : (
              <div className="field">
                <span className="field-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Target Engineering Role
                </span>
                <select value={customRole ? '__other__' : role} onChange={onRoleSelect} disabled={busy}>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="__other__">Other / Custom Role...</option>
                </select>

                {customRole && (
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Enter custom role title..."
                    style={{ marginTop: '0.5rem' }}
                    required
                  />
                )}
              </div>
            )}

            {/* Form Control Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <span className="field-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Category
                </span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={busy}>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span className="field-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Difficulty
                </span>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={busy}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span className="field-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Questions
                </span>
                <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={busy}>
                  {[3, 5, 7, 10].map((n) => (
                    <option key={n} value={n}>{n} Questions</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span className="field-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Timer Limit
                </span>
                <select value={timerMinutes} onChange={(e) => setTimerMinutes(Number(e.target.value))} disabled={busy}>
                  {TIMER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {!hasResume && (
              <div className="field">
                <span className="field-label" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Experience Level
                </span>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} disabled={busy}>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Launch Primary Action Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy}
              style={{
                padding: '0.8rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.4rem',
              }}
            >
              {starting ? (
                <>
                  <LoaderCircle size={18} className="spin" /> Initializing Session...
                </>
              ) : (
                <>
                  Start Session <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Resume Upload Dropzone */}
            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '1rem', marginTop: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Resume Parsing</div>
                  <div className="muted small">Upload CV (PDF) to tailor questions to your profile</div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={uploadResume}
                  disabled={busy}
                  hidden
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                >
                  {uploading ? <LoaderCircle size={14} className="spin" /> : hasResume ? <FileCheck2 size={14} /> : <Upload size={14} />}
                  {uploading ? 'Reading...' : hasResume ? 'Replace Resume' : 'Upload Resume'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Recent Sessions History */}
        <div className="panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Past Sessions</h2>
            <span className="muted small">{filteredHistory.length} total</span>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.2rem', fontSize: '0.875rem' }}
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: 'auto', minWidth: '110px', fontSize: '0.85rem' }}
            >
              <option value="All">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Session List */}
          {loadingHistory ? (
            <div className="muted small" style={{ textAlign: 'center', padding: '2rem 0' }}>
              Loading sessions...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <FileText size={28} className="muted" style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No Sessions Found</div>
              <div className="muted small" style={{ marginTop: '0.2rem' }}>
                {history.length === 0 ? 'Completed sessions will appear here.' : 'No sessions match your search filters.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredHistory.map((item) => {
                const open = () =>
                  navigate(
                    item.status === 'completed'
                      ? `/results/${item._id}`
                      : item.mode === 'quiz'
                        ? `/quiz/${item._id}`
                        : `/interview/${item._id}`,
                  )

                return (
                  <div
                    key={item._id}
                    onClick={open}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                    className="session-row"
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.role === 'Resume-based interview' ? 'Resume Interview' : item.role}
                        {item.category && item.category !== 'General' && (
                          <span className="tag" style={{ fontSize: '0.725rem', padding: '0.1rem 0.4rem' }}>{item.category}</span>
                        )}
                      </div>
                      <div className="muted small" style={{ marginTop: '0.15rem', fontSize: '0.775rem' }}>
                        {new Date(item.createdAt).toLocaleDateString()} • {item.difficulty} • {item.questionCount || 5} Qs
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.status === 'completed' ? (
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--good)' }}>
                          {item.overallScore}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.775rem', color: 'var(--accent)', fontWeight: 600 }}>
                          In Progress
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => deleteSession(e, item._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0.2rem' }}
                        title="Delete session"
                      >
                        <Trash2 size={15} />
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
