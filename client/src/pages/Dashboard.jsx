import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Plus,
  Clock,
  CheckCircle2,
  Upload,
  FileCheck2,
  ListChecks,
  MessageSquare,
  Trash2,
  LoaderCircle,
} from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'

const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'QA / Test Engineer',
  'UI/UX Designer',
  'Product Manager',
]

const EXPERIENCE_LEVELS = ['Fresher', '1-2 years', '3-5 years', '5+ years']
const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { confirm } = useConfirm()
  const fileRef = useRef(null)

  const [role, setRole] = useState('Frontend Developer')
  const [customRole, setCustomRole] = useState(false)
  const [experience, setExperience] = useState('Fresher')
  const [difficulty, setDifficulty] = useState('medium')
  const [mode, setMode] = useState('questions')
  const [count, setCount] = useState(5)
  const [starting, setStarting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const hasResume = Boolean(user?.hasResume)
  const resumeProfile = user?.resumeProfile || {}
  const busy = starting || uploading

  useEffect(() => {
    api
      .get('/interviews')
      .then((res) => setHistory(res.data.interviews))
      .catch((err) => toast.error(apiError(err, 'Could not load your history')))
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
      toast.error('Please choose or type a role')
      return
    }

    setStarting(true)
    try {
      const { data } = await api.post('/interviews', { role, experience, difficulty, mode, count })
      const interview = data.interview
      navigate(interview.mode === 'quiz' ? `/quiz/${interview._id}` : `/interview/${interview._id}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not start the interview'))
      setStarting(false)
    }
  }

  async function deleteSession(e, id) {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Delete session',
      message: 'This will permanently remove this session from your history.',
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/interviews/${id}`)
      setHistory((prev) => prev.filter((item) => item._id !== id))
      toast.success('Session deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete the session'))
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
      toast.success('Resume saved and profile detected')
    } catch (err) {
      toast.error(apiError(err, 'Could not upload the resume'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <main className="container dashboard">
      <section className="panel start-panel">
        <h2>Start a new mock interview</h2>
        <form onSubmit={startInterview} aria-busy={starting}>
          {hasResume ? (
            <div className="resume-profile" aria-label="Profile detected from resume">
              <span>Profile detected from your resume</span>
              <strong>{resumeProfile.role || 'Role detected from resume'}</strong>
              <p>Experience level: {resumeProfile.experience || 'Detected from resume'}</p>
            </div>
          ) : (
            <>
              <label className="field">
                <span>Role / Domain</span>
                <select value={customRole ? '__other__' : role} onChange={onRoleSelect} disabled={busy}>
                  {ROLE_OPTIONS.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                  <option value="__other__">Other (type your own)...</option>
                </select>
              </label>

              {customRole && (
                <label className="field">
                  <span>Your role</span>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Machine Learning Engineer"
                    autoFocus
                    required
                    disabled={busy}
                  />
                </label>
              )}
            </>
          )}

          <div className="field-row">
            {!hasResume && (
              <label className="field">
                <span>Experience level</span>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} disabled={busy}>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option value={level} key={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="field">
              <span>Difficulty</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={busy}>
                {DIFFICULTIES.map((level) => (
                  <option value={level} key={level}>
                    {level[0].toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Questions</span>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={busy}>
                {[3, 5, 7, 10].map((number) => (
                  <option value={number} key={number}>
                    {number}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field">
            <span>Mode</span>
            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-btn ${mode === 'questions' ? 'active' : ''}`}
                onClick={() => setMode('questions')}
                disabled={busy}
              >
                <MessageSquare size={16} /> Questions
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === 'quiz' ? 'active' : ''}`}
                onClick={() => setMode('quiz')}
                disabled={busy}
              >
                <ListChecks size={16} /> Quiz (MCQ)
              </button>
            </div>
          </div>

          <div className="field">
            <span>Resume</span>
            <p className="muted small hint-line">
              {hasResume
                ? 'Role and experience are read from your resume. You only need to choose difficulty, question count, and mode.'
                : 'Upload your CV (PDF) to detect your role and experience automatically.'}
            </p>
            {uploading && (
              <div className="generation-loader" role="status">
                <LoaderCircle size={17} className="spin" /> Reading your PDF and detecting your profile...
              </div>
            )}
            <div className="resume-row">
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
                className="btn btn-ghost"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                {uploading ? <LoaderCircle size={16} className="spin" /> : hasResume ? <FileCheck2 size={16} /> : <Upload size={16} />}
                {uploading ? 'Reading resume...' : hasResume ? 'Replace resume (PDF)' : 'Upload resume (PDF)'}
              </button>
            </div>
          </div>

          {starting && (
            <div className="generation-loader generation-loader-main" role="status">
              <LoaderCircle size={18} className="spin" />
              {hasResume ? 'Creating questions from your resume...' : 'Creating your interview...'}
            </div>
          )}
          <button className="btn btn-primary btn-block" disabled={busy} aria-busy={starting}>
            {starting ? <LoaderCircle size={18} className="spin" /> : <Plus size={18} />}
            {starting ? 'Generating...' : mode === 'quiz' ? 'Begin quiz' : 'Begin interview'}
          </button>
        </form>
      </section>

      <section className="history">
        <h2>Past sessions</h2>
        {loadingHistory ? (
          <p className="muted">Loading...</p>
        ) : history.length === 0 ? (
          <div className="empty">
            <p className="muted">No sessions yet. Your completed interviews will show up here.</p>
          </div>
        ) : (
          <ul className="history-list">
            {history.map((item) => {
              const open = () =>
                navigate(
                  item.status === 'completed'
                    ? `/results/${item._id}`
                    : item.mode === 'quiz'
                      ? `/quiz/${item._id}`
                      : `/interview/${item._id}`,
                )

              return (
                <li key={item._id}>
                  <div
                    className="history-item"
                    role="button"
                    tabIndex={0}
                    onClick={open}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        open()
                      }
                    }}
                  >
                    <div className="history-main">
                      <p className="history-role">
                        {item.role}
                        <span className="tag-soft">{item.difficulty}</span>
                        {item.mode === 'quiz' && <span className="tag">Quiz</span>}
                      </p>
                      <p className="muted small">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="history-right">
                      {item.status === 'completed' ? (
                        <span className="score-chip">
                          <CheckCircle2 size={14} /> {item.overallScore}
                        </span>
                      ) : (
                        <span className="chip-pending">
                          <Clock size={14} /> Resume
                        </span>
                      )}
                      <button
                        className="history-del"
                        onClick={(e) => deleteSession(e, item._id)}
                        title="Delete session"
                        aria-label="Delete session"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
