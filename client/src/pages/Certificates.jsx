import { useState, useEffect } from 'react'
import { Award, CheckCircle2, Download, Printer, Shield, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const MILESTONES = [
  { id: 'm1', title: 'Interview Pioneer Certificate', reqCount: 1, desc: 'Awarded upon completing your 1st AI mock interview.' },
  { id: 'm3', title: 'Interview Specialist Certificate', reqCount: 3, desc: 'Awarded upon completing 3 mock interview sessions.' },
  { id: 'm5', title: 'MockMate AI Master Certificate', reqCount: 5, desc: 'Awarded upon completing 5 mock interview sessions.' },
  { id: 'm_score', title: 'High Performance Excellence Certificate', reqCount: 1, reqScore: 80, desc: 'Awarded for scoring 80% or higher on an interview.' },
]

export default function Certificates() {
  const { user } = useAuth()
  const [completedInterviews, setCompletedInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const res = await api.get('/interviews')
        const list = (res.data?.interviews || []).filter((i) => i.status === 'completed')
        setCompletedInterviews(list)

        // Select the highest unlocked milestone by default
        const unlocked = MILESTONES.filter((m) => {
          if (m.reqScore) {
            return list.some((i) => (i.overallScore || 0) >= m.reqScore)
          }
          return list.length >= m.reqCount
        })
        if (unlocked.length > 0) {
          setSelectedCert(unlocked[unlocked.length - 1])
        } else {
          setSelectedCert(MILESTONES[0])
        }
      } catch (err) {
        console.warn('Error loading certificates data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  function isUnlocked(cert) {
    if (cert.reqScore) {
      return completedInterviews.some((i) => (i.overallScore || 0) >= cert.reqScore)
    }
    return completedInterviews.length >= cert.reqCount
  }

  function handlePrint() {
    window.print()
  }

  const topScore = completedInterviews.length
    ? Math.max(...completedInterviews.map((i) => i.overallScore || 0))
    : 0

  return (
    <main className="container">
      <div className="section-head">
        <h2>Milestone Certificates</h2>
        <p>Earn official verified certificates as you complete mock interviews and improve your scores.</p>
      </div>

      {loading ? (
        <div className="panel center muted" style={{ padding: '3rem 1rem' }}>
          Loading certificates...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '1.5rem' }}>
          {/* Milestone Selection List */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Available Certificates</h3>
            {MILESTONES.map((m) => {
              const unlocked = isUnlocked(m)
              const selected = selectedCert?.id === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedCert(m)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    padding: '0.8rem 1rem',
                    borderRadius: '10px',
                    border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: selected ? 'var(--accent-soft)' : 'var(--surface-2)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    font: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</div>
                    <div className="muted small">{m.desc}</div>
                  </div>
                  <div>
                    {unlocked ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--good)' }} />
                    ) : (
                      <Lock size={16} className="muted" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Certificate Display Card */}
          <div>
            {selectedCert && isUnlocked(selectedCert) ? (
              <div className="certificate-card">
                <div className="certificate-seal">
                  <Award size={32} />
                </div>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 700 }}>
                  Certificate of Achievement
                </div>
                <h1 className="certificate-title" style={{ marginTop: '0.4rem' }}>{selectedCert.title}</h1>
                <p className="muted">This certificate is proudly presented to</p>
                <div className="certificate-name">{user?.name}</div>

                <p style={{ maxWidth: '44ch', margin: '1rem auto', fontSize: '0.95rem', color: 'var(--muted)' }}>
                  For successfully demonstrating professional technical interview proficiency and completing key practice milestones on <strong>MockMate AI</strong>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem 0 1rem', borderTop: '1px solid var(--border-soft)', paddingTop: '1.2rem' }}>
                  <div>
                    <span className="muted small" style={{ display: 'block' }}>Date Earned</span>
                    <strong style={{ fontSize: '0.9rem' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                  </div>
                  <div>
                    <span className="muted small" style={{ display: 'block' }}>Highest Score</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--good)' }}>{topScore}%</strong>
                  </div>
                  <div>
                    <span className="muted small" style={{ display: 'block' }}>Verification ID</span>
                    <strong style={{ fontSize: '0.85rem', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                      MM-CERT-{user?.id?.slice(-6).toUpperCase()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={handlePrint}>
                    <Printer size={16} /> Print / Save PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="panel center" style={{ padding: '3.5rem 1.5rem' }}>
                <Lock size={40} className="muted" style={{ marginBottom: '0.8rem' }} />
                <h3>Certificate Locked</h3>
                <p className="muted small" style={{ maxWidth: '40ch', margin: '0.5rem auto 1.5rem' }}>
                  {selectedCert?.desc} Complete more mock interviews to unlock this official certificate!
                </p>
                <a href="/dashboard" className="btn btn-primary">Start Practice Interview</a>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
