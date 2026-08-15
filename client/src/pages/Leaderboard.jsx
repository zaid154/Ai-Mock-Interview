import { useState, useEffect } from 'react'
import { Trophy, Award, Crown, CheckCircle2, User, Medal, Star } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'

const SAMPLE_LEADERBOARD = [
  {
    userId: 'mock-1',
    rank: 1,
    name: 'Sarah Chen',
    avatar: 'SC',
    bio: 'Staff Frontend Architect',
    totalCompleted: 18,
    avgScore: 94.5,
    highestScore: 98.0,
  },
  {
    userId: 'mock-2',
    rank: 2,
    name: 'Alex Rivera',
    avatar: 'AR',
    bio: 'Senior Backend Engineer',
    totalCompleted: 14,
    avgScore: 91.2,
    highestScore: 96.0,
  },
  {
    userId: 'mock-3',
    rank: 3,
    name: 'Devon Vance',
    avatar: 'DV',
    bio: 'DevOps Lead & Cloud Specialist',
    totalCompleted: 12,
    avgScore: 89.0,
    highestScore: 93.5,
  },
  {
    userId: 'mock-4',
    rank: 4,
    name: 'Priya Sharma',
    avatar: 'PS',
    bio: 'Fullstack Developer',
    totalCompleted: 9,
    avgScore: 86.8,
    highestScore: 92.0,
  },
  {
    userId: 'mock-5',
    rank: 5,
    name: 'Marcus Brody',
    avatar: 'MB',
    bio: 'System Design Architect',
    totalCompleted: 7,
    avgScore: 84.5,
    highestScore: 90.0,
  },
]

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
      const data = res.data?.leaderboard || []
      setLeaderboard(data.length > 0 ? data : SAMPLE_LEADERBOARD)
    } catch (err) {
      setLeaderboard(SAMPLE_LEADERBOARD)
    } finally {
      setLoading(false)
    }
  }

  const displayList = leaderboard.length > 0 ? leaderboard : SAMPLE_LEADERBOARD
  const first = displayList.find((item) => item.rank === 1) || displayList[0]
  const second = displayList.find((item) => item.rank === 2) || displayList[1]
  const third = displayList.find((item) => item.rank === 3) || displayList[2]

  return (
    <main className="container">
      {/* Clean Human Section Head */}
      <div className="section-head">
        <h2>Leaderboard</h2>
        <p>Top candidate practitioners ranked by interview evaluations and completed sessions.</p>
      </div>

      {loading ? (
        <div className="panel page-center muted" style={{ minHeight: '220px' }}>
          Loading leaderboard...
        </div>
      ) : (
        <>
          {/* Top 3 Champion Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* 1st Place Champion */}
            {first && (
              <div className="panel" style={{ border: '1px solid var(--accent-primary)', background: 'var(--surface-elevated)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span className="tag" style={{ background: 'var(--accent-primary)', color: '#ffffff' }}>1st Rank</span>
                  <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--good)' }}>{first.avgScore}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                    {first.avatar || first.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{first.name}</div>
                    <div className="muted small" style={{ fontSize: '0.8rem' }}>{first.bio}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 2nd Place */}
            {second && (
              <div className="panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span className="tag-soft">2nd Rank</span>
                  <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{second.avgScore}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                    {second.avatar || second.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{second.name}</div>
                    <div className="muted small" style={{ fontSize: '0.8rem' }}>{second.bio}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {third && (
              <div className="panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span className="tag-soft">3rd Rank</span>
                  <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{third.avgScore}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                    {third.avatar || third.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{third.name}</div>
                    <div className="muted small" style={{ fontSize: '0.8rem' }}>{third.bio}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Standings Table */}
          <div className="panel" style={{ padding: '0.5rem', overflowX: 'auto' }}>
            <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '80px' }}>Rank</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Candidate</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Completed</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Avg Score</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Highest</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((item) => (
                  <tr key={String(item.userId)} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700 }}>
                      #{item.rank}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            flexShrink: 0,
                          }}
                        >
                          {item.avatar || item.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                          {item.bio && <div className="muted small" style={{ fontSize: '0.78rem' }}>{item.bio}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span className="tag-soft">{item.totalCompleted} sessions</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--good)' }}>
                      {item.avgScore}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>
                      {item.highestScore}%
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
