import { useState, useEffect } from 'react'
import { Trophy, Award, Crown, CheckCircle2, User } from 'lucide-react'
import api, { apiError } from '../lib/api'
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
      toast.error(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="rank-badge rank-1" title="1st Place Gold"><Crown size={16} /></span>
    if (rank === 2) return <span className="rank-badge rank-2" title="2nd Place Silver">2</span>
    if (rank === 3) return <span className="rank-badge rank-3" title="3rd Place Bronze">3</span>
    return <span className="rank-badge rank-other">{rank}</span>
  }

  return (
    <main className="container">
      <div className="section-head">
        <h2>Candidate Leaderboard</h2>
        <p>Top interview practitioners ranked by average performance score and total completed interviews.</p>
      </div>

      {loading ? (
        <div className="panel center muted" style={{ padding: '3rem 1rem' }}>
          Loading community standings...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty panel center">
          <Trophy size={36} className="muted" style={{ marginBottom: '0.8rem' }} />
          <h3>No leaderboard entries yet</h3>
          <p className="muted small">Complete mock interviews or quizzes to rank on the community leaderboard!</p>
        </div>
      ) : (
        <div className="panel" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table className="leaderboard-table">
            <thead>
              <tr style={{ color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'center', width: '60px' }}>Rank</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left' }}>Candidate</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>Interviews</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>Avg Score</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'center' }}>Top Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item) => (
                <tr key={String(item.userId)} className="leaderboard-row">
                  <td className="leaderboard-cell" style={{ textAlign: 'center' }}>
                    {getRankBadge(item.rank)}
                  </td>
                  <td className="leaderboard-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--accent-soft)',
                          border: '1px solid var(--accent)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: '700',
                          fontSize: '1rem',
                          color: 'var(--accent-strong)',
                          flexShrink: 0,
                        }}
                      >
                        {item.avatar || item.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        {item.bio && <div className="muted small" style={{ fontSize: '0.78rem' }}>{item.bio}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="leaderboard-cell" style={{ textAlign: 'center' }}>
                    <span className="tag-soft">{item.totalCompleted} Completed</span>
                  </td>
                  <td className="leaderboard-cell" style={{ textAlign: 'center' }}>
                    <span className="score-chip" style={{ fontSize: '0.9rem' }}>
                      {item.avgScore}%
                    </span>
                  </td>
                  <td className="leaderboard-cell" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>
                    {item.highestScore}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
