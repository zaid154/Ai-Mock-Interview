import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import api, { apiError } from '../lib/api'
import Avatar from '../components/Avatar'
import toast from 'react-hot-toast'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    try {
      setLoading(true)
      const res = await api.get('/interviews/leaderboard')
      setLeaderboard(res.data?.leaderboard || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load leaderboard'))
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const top3 = leaderboard.slice(0, 3)

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* Section Header */}
      <div className="section-head" style={{ marginBottom: '1.75rem' }}>
        <div className="reflect-badge" style={{ marginBottom: '0.4rem' }}>
          <Trophy size={12} style={{ color: '#2563eb' }} aria-hidden="true" />
          <span className="reflect-badge-text">Candidate Rankings</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#111827' }}>
          Leaderboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', maxWidth: '60ch', margin: 0 }}>
          Candidate practitioners ranked by completed interview sessions and average evaluation scores.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="panel" style={{ padding: '1.5rem', minHeight: '110px', background: 'var(--surface-2)', opacity: 0.6 }}>
                <div style={{ width: '40%', height: '12px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', marginBottom: '0.8rem' }} />
                <div style={{ width: '70%', height: '16px', background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="panel page-center" style={{ minHeight: '260px', textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Trophy size={36} style={{ color: 'var(--text-subtle)', marginBottom: '0.85rem', opacity: 0.6 }} aria-hidden="true" />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#111827' }}>No rankings recorded yet</h2>
          <p className="muted small" style={{ maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Complete your first technical practice session or quiz to establish your standing on the leaderboard.
          </p>
          <Link to="/practice" className="reflect-btn-primary" style={{ padding: '0.55rem 1.4rem', fontSize: '0.85rem' }}>
            Start a Session
          </Link>
        </div>
      ) : (
        <>
          {/* Top 3 Champion Cards */}
          {top3.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {top3.map((item, idx) => (
                <div
                  key={item.userId || idx}
                  className="panel"
                  style={{
                    padding: '1.4rem',
                    border: idx === 0 ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid var(--border)',
                    background: idx === 0 ? 'rgba(37, 99, 235, 0.04)' : 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <span className={idx === 0 ? 'tag' : 'tag-soft'} style={{ fontSize: '0.72rem' }}>
                      {idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : '3rd Place'}
                    </span>
                    <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: idx === 0 ? '#16a34a' : 'var(--text)' }}>
                      {item.avgScore}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <Avatar src={item.avatar} name={item.name} size={idx === 0 ? 44 : 38} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.96rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div className="muted small" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.bio || `${item.totalCompleted} sessions completed`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Standings Table */}
          <div className="panel" style={{ padding: '0.5rem', overflowX: 'auto' }} tabIndex={0} role="region" aria-label="Candidate standings table">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th scope="col" style={{ padding: '0.75rem 1rem', width: '70px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Score</th>
                  <th scope="col" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, i) => (
                  <tr key={item.userId || i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }} className="mono">
                      #{item.rank || i + 1}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar src={item.avatar} name={item.name} size={30} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{item.name}</div>
                          {item.bio && <div className="muted small" style={{ fontSize: '0.75rem' }}>{item.bio}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {item.totalCompleted}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }} className="mono bold">
                      {item.avgScore}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-primary)' }} className="mono bold">
                      {item.highestScore ? `${item.highestScore}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
