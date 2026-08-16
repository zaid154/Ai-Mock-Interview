import { useState, useEffect } from 'react'
import { Trophy, Award, Crown, CheckCircle2, User, Medal, Star } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'

function CandidateAvatar({ avatar, name, size = 42 }) {
  const isImg = Boolean(avatar && (avatar.startsWith('http') || avatar.startsWith('data:image')))

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'var(--accent-grad)',
        border: '1.5px solid var(--border)',
        display: 'grid',
        placeItems: 'center',
        fontWeight: '700',
        fontSize: `${size * 0.42}px`,
        color: '#ffffff',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {isImg ? (
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        avatar || name?.charAt(0).toUpperCase() || 'C'
      )}
    </div>
  )
}

const SAMPLE_LEADERBOARD = [
  {
    userId: 'mock-1',
    rank: 1,
    name: 'Mohd Zaid',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Staff Frontend Architect',
    totalCompleted: 18,
    avgScore: 95.0,
    highestScore: 98.0,
  },
  {
    userId: 'mock-2',
    rank: 2,
    name: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Senior Backend Engineer',
    totalCompleted: 14,
    avgScore: 91.2,
    highestScore: 94.0,
  },
  {
    userId: 'mock-3',
    rank: 3,
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    bio: 'Frontend UI/UX Specialist',
    totalCompleted: 12,
    avgScore: 89.0,
    highestScore: 92.0,
  },
  {
    userId: 'mock-4',
    rank: 4,
    name: 'Rohan Verma',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Fullstack Developer',
    totalCompleted: 9,
    avgScore: 82.0,
    highestScore: 84.0,
  },
  {
    userId: 'mock-5',
    rank: 5,
    name: 'Ananya Gupta',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80',
    bio: 'DevOps & Kubernetes Lead',
    totalCompleted: 7,
    avgScore: 78.0,
    highestScore: 82.0,
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
      {/* Clean Section Head */}
      <div className="section-head">
        <h2>Global Leaderboard</h2>
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
                  <CandidateAvatar avatar={first.avatar} name={first.name} size={46} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{first.name}</div>
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
                  <CandidateAvatar avatar={second.avatar} name={second.name} size={42} />
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
                  <CandidateAvatar avatar={third.avatar} name={third.name} size={42} />
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
                        <CandidateAvatar avatar={item.avatar} name={item.name} size={38} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.name}</div>
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
