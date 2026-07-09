import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Clock, CheckCircle2 } from 'lucide-react'
import api, { apiError } from '../lib/api'
import type { Difficulty, InterviewSummary } from '../lib/types'

const ROLE_SUGGESTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Product Manager',
]

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export default function Dashboard() {
  const navigate = useNavigate()
  const [role, setRole] = useState('Frontend Developer')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [count, setCount] = useState(5)
  const [starting, setStarting] = useState(false)

  const [history, setHistory] = useState<InterviewSummary[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    api
      .get('/interviews')
      .then((res) => setHistory(res.data.interviews))
      .catch((err) => toast.error(apiError(err, 'Could not load your history')))
      .finally(() => setLoadingHistory(false))
  }, [])

  async function startInterview(e: FormEvent) {
    e.preventDefault()
    setStarting(true)
    try {
      const { data } = await api.post('/interviews', { role, difficulty, count })
      navigate(`/interview/${data.interview._id}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not start the interview'))
      setStarting(false)
    }
  }

  return (
    <main className="container dashboard">
      <section className="panel start-panel">
        <h2>Start a new mock interview</h2>
        <form onSubmit={startInterview}>
          <label className="field">
            <span>Role</span>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              list="role-suggestions"
              placeholder="e.g. Backend Developer"
              required
            />
            <datalist id="role-suggestions">
              {ROLE_SUGGESTIONS.map((r) => (
                <option value={r} key={r} />
              ))}
            </datalist>
          </label>

          <div className="field-row">
            <label className="field">
              <span>Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
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

          <button className="btn btn-primary btn-block" disabled={starting}>
            <Plus size={18} /> {starting ? 'Preparing questions…' : 'Begin interview'}
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
            {history.map((it) => (
              <li key={it._id}>
                <button
                  className="history-item"
                  onClick={() =>
                    navigate(it.status === 'completed' ? `/results/${it._id}` : `/interview/${it._id}`)
                  }
                >
                  <div>
                    <p className="history-role">{it.role}</p>
                    <p className="muted small">
                      {it.difficulty} · {new Date(it.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {it.status === 'completed' ? (
                    <span className="score-chip">
                      <CheckCircle2 size={14} /> {it.overallScore}
                    </span>
                  ) : (
                    <span className="chip-pending">
                      <Clock size={14} /> Resume
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
