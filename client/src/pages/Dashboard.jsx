import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Clock, CheckCircle2, Upload, FileCheck2, ListChecks, MessageSquare, Trash2 } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'

// Common roles for the dropdown. Users who want something else pick "Other".
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
  const [customRole, setCustomRole] = useState(false) // true when "Other" is picked
  const [experience, setExperience] = useState('Fresher')
  const [difficulty, setDifficulty] = useState('medium')
  const [mode, setMode] = useState('questions')
  const [count, setCount] = useState(5)
  const [useResume, setUseResume] = useState(false)
  const [starting, setStarting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    api
      .get('/interviews')
      .then((res) => setHistory(res.data.interviews))
      .catch((err) => toast.error(apiError(err, 'Could not load your history')))
      .finally(() => setLoadingHistory(false))
  }, [])

  // Role dropdown: picking "Other" reveals a free-text field for a custom role.
  function onRoleSelect(e) {
    const v = e.target.value
    if (v === '__other__') {
      setCustomRole(true)
      setRole('')
    } else {
      setCustomRole(false)
      setRole(v)
    }
  }

  async function startInterview(e) {
    e.preventDefault()
    if (!role.trim()) {
      toast.error('Please choose or type a role')
      return
    }
    setStarting(true)
    try {
      const { data } = await api.post('/interviews', {
        role,
        experience,
        difficulty,
        mode,
        count,
        useResume,
      })
      const iv = data.interview
      // Quiz and questions have different screens.
      navigate(iv.mode === 'quiz' ? `/quiz/${iv._id}` : `/interview/${iv._id}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not start the interview'))
      setStarting(false)
    }
  }

  // Delete a past session from history.
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
      setHistory((prev) => prev.filter((it) => it._id !== id))
      toast.success('Session deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete the session'))
    }
  }

  // Upload a resume PDF; the server extracts the text and remembers it.
  async function uploadResume(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('resume', file)
      await api.post('/interviews/resume', form)
      await refreshUser()
      setUseResume(true)
      toast.success('Resume saved — questions can now be tailored to it')
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
        <form onSubmit={startInterview}>
          <label className="field">
            <span>Role / Domain</span>
            <select value={customRole ? '__other__' : role} onChange={onRoleSelect}>
              {ROLE_OPTIONS.map((r) => (
                <option value={r} key={r}>
                  {r}
                </option>
              ))}
              <option value="__other__">Other (type your own)…</option>
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
              />
            </label>
          )}

          <div className="field-row">
            <label className="field">
              <span>Experience level</span>
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                {EXPERIENCE_LEVELS.map((x) => (
                  <option value={x} key={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Difficulty</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map((d) => (
                  <option value={d} key={d}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Questions</span>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[3, 5, 7, 10].map((n) => (
                  <option value={n} key={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Mode toggle: open-ended questions vs multiple-choice quiz */}
          <div className="field">
            <span>Mode</span>
            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-btn ${mode === 'questions' ? 'active' : ''}`}
                onClick={() => setMode('questions')}
              >
                <MessageSquare size={16} /> Questions
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === 'quiz' ? 'active' : ''}`}
                onClick={() => setMode('quiz')}
              >
                <ListChecks size={16} /> Quiz (MCQ)
              </button>
            </div>
          </div>

          {/* Resume upload + "use it" toggle */}
          <div className="field">
            <span>Resume (optional)</span>
            <p className="muted small hint-line">
              {user?.hasResume
                ? 'Resume saved ✓ — tick below to tailor questions to it.'
                : 'Upload your CV (PDF) and we’ll tailor the questions to your real experience.'}
            </p>
            <div className="resume-row">
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                onChange={uploadResume}
                hidden
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {user?.hasResume ? <FileCheck2 size={16} /> : <Upload size={16} />}{' '}
                {uploading ? 'Uploading…' : user?.hasResume ? 'Replace resume (PDF)' : 'Upload resume (PDF)'}
              </button>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={useResume}
                  onChange={(e) => setUseResume(e.target.checked)}
                  disabled={!user?.hasResume}
                />
                <span>Tailor to my resume</span>
              </label>
            </div>
          </div>

          <button className="btn btn-primary btn-block" disabled={starting}>
            <Plus size={18} /> {starting ? 'Preparing…' : mode === 'quiz' ? 'Begin quiz' : 'Begin interview'}
          </button>
        </form>
      </section>

      <section className="history">
        <h2>Past sessions</h2>
        {loadingHistory ? (
          <p className="muted">Loading…</p>
        ) : history.length === 0 ? (
          <div className="empty">
            <p className="muted">No sessions yet. Your completed interviews will show up here.</p>
          </div>
        ) : (
          <ul className="history-list">
            {history.map((it) => {
              const open = () =>
                navigate(
                  it.status === 'completed'
                    ? `/results/${it._id}`
                    : it.mode === 'quiz'
                      ? `/quiz/${it._id}`
                      : `/interview/${it._id}`,
                )
              return (
                <li key={it._id}>
                  {/* The card is a div (not a button) so the delete button can
                      live inside it — buttons can't be nested. */}
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
                        {it.role}
                        <span className="tag-soft">{it.difficulty}</span>
                        {it.mode === 'quiz' && <span className="tag">Quiz</span>}
                      </p>
                      <p className="muted small">{new Date(it.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="history-right">
                      {it.status === 'completed' ? (
                        <span className="score-chip">
                          <CheckCircle2 size={14} /> {it.overallScore}
                        </span>
                      ) : (
                        <span className="chip-pending">
                          <Clock size={14} /> Resume
                        </span>
                      )}
                      <button
                        className="history-del"
                        onClick={(e) => deleteSession(e, it._id)}
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
