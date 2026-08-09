import { useState, useEffect } from 'react'
import {
  User as UserIcon,
  Lock,
  Save,
  Award,
  Bookmark,
  MessagesSquare,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Sparkles,
  KeyRound,
  TrendingUp,
  ExternalLink,
  Mail,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const PRESET_AVATARS = ['🎯', '💻', '⚡', '🚀', '🧠', '💼', '🎓', '🤖', '🔥', '🛡️', '🌟', '👨‍💻']

export default function Profile() {
  const { user, refreshUser } = useAuth()

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview')

  // Profile Form state
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0])
  const [savingProfile, setSavingProfile] = useState(false)

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // User stats
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalQuizzes: 0,
    avgScore: 0,
    bookmarksCount: 0,
    highestScore: 0,
  })

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setAvatar(user.avatar || PRESET_AVATARS[0])
    }
  }, [user])

  useEffect(() => {
    let mounted = true
    async function loadStats() {
      try {
        const [intRes, bmRes] = await Promise.all([
          api.get('/interviews'),
          api.get('/bookmarks'),
        ])
        if (!mounted) return
        const list = intRes.data?.interviews || []
        const completed = list.filter((i) => i.status === 'completed')
        const totalInt = completed.filter((i) => i.mode !== 'quiz').length
        const totalQuiz = completed.filter((i) => i.mode === 'quiz').length
        const scores = completed.map((i) => i.overallScore || 0)
        const avg = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0
        const top = scores.length ? Math.max(...scores) : 0

        setStats({
          totalInterviews: totalInt,
          totalQuizzes: totalQuiz,
          avgScore: avg,
          highestScore: top,
          bookmarksCount: bmRes.data?.bookmarks?.length || 0,
        })
      } catch (err) {
        console.warn('Error loading stats:', err)
      }
    }
    loadStats()
    return () => { mounted = false }
  }, [])

  async function handleSaveProfile(e) {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required')
    setSavingProfile(true)
    try {
      await api.patch('/auth/profile', { name, bio, avatar })
      toast.success('Profile updated successfully!')
      if (refreshUser) await refreshUser()
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (!currentPassword) return toast.error('Current password is required')
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters')
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match')

    setSavingPassword(true)
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setSavingPassword(false)
    }
  }

  // Password strength gauge
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', score: 0, color: 'var(--muted)' }
    if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'var(--bad)' }
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { label: 'Strong', score: 100, color: 'var(--good)' }
    }
    return { label: 'Medium', score: 66, color: 'var(--warn)' }
  }

  const pwdStrength = getPasswordStrength(newPassword)

  return (
    <main className="container">
      {/* Cover Header Banner */}
      <div
        className="panel"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: '2rem',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '1.5rem 2rem',
          }}
        >
          <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', display: 'flex', gap: '0.6rem' }}>
            <span
              className="tag"
              style={{
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: '0.4rem 0.8rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
              MockMate Candidate
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '0 2rem 1.8rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginTop: '-40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flexWrap: 'wrap' }}>
            <div className="avatar-circle" style={{ width: '88px', height: '88px', fontSize: '2.2rem', boxShadow: 'var(--shadow)' }}>
              {avatar || user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.7rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user?.name}
                {user?.isEmailVerified && (
                  <ShieldCheck size={20} style={{ color: 'var(--good)' }} title="Verified Candidate" />
                )}
              </h1>
              <p className="muted small" style={{ margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <Link to="/certificates" className="btn btn-ghost btn-sm">
              <Award size={15} /> Milestone Certificates
            </Link>
            <Link to="/bookmarks" className="btn btn-ghost btn-sm">
              <Bookmark size={15} /> Bookmarked Qs ({stats.bookmarksCount})
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-soft)', padding: '0 1.5rem', gap: '1rem', background: 'var(--surface-2)' }}>
          <button
            type="button"
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.8rem 0.5rem',
              borderBottom: activeTab === 'overview' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'overview' ? 'var(--text)' : 'var(--muted)',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <Briefcase size={16} /> Candidate Stats & Bio
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
            style={{
              padding: '0.8rem 0.5rem',
              borderBottom: activeTab === 'edit' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'edit' ? 'var(--text)' : 'var(--muted)',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <UserIcon size={16} /> Edit Profile
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            style={{
              padding: '0.8rem 0.5rem',
              borderBottom: activeTab === 'security' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'security' ? 'var(--text)' : 'var(--muted)',
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <Lock size={16} /> Security & Password
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          {/* Performance Stat Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div className="feature-ic" style={{ margin: 0, width: '3rem', height: '3rem' }}>
                <MessagesSquare size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.6rem' }}>{stats.totalInterviews}</h3>
                <span className="muted small">Mock Interviews</span>
              </div>
            </div>

            <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div className="feature-ic" style={{ margin: 0, width: '3rem', height: '3rem' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--good)' }}>{stats.avgScore}%</h3>
                <span className="muted small">Average Score</span>
              </div>
            </div>

            <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div className="feature-ic" style={{ margin: 0, width: '3rem', height: '3rem' }}>
                <Award size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--accent-strong)' }}>{stats.highestScore}%</h3>
                <span className="muted small">Highest Score</span>
              </div>
            </div>

            <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <div className="feature-ic" style={{ margin: 0, width: '3rem', height: '3rem' }}>
                <Bookmark size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.6rem' }}>{stats.bookmarksCount}</h3>
                <span className="muted small">Saved Bookmarks</span>
              </div>
            </div>
          </div>

          {/* Profile Bio Card */}
          <div className="panel">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.8rem' }}>Candidate Bio / Target Headline</h3>
            <p style={{ margin: 0, color: bio ? 'var(--text)' : 'var(--muted)', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
              {bio || 'No bio headline set yet. Click "Edit Profile" to add your targeted role, tech stack, or experience summary!'}
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Ready for your next AI practice interview?</h3>
              <p className="muted small" style={{ margin: '0.2rem 0 0' }}>Practice role-specific questions and track your performance gains.</p>
            </div>
            <Link to="/dashboard" className="btn btn-primary">
              Start Mock Interview <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Edit Profile Tab */}
      {activeTab === 'edit' && (
        <div className="panel" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1.4rem' }}>
            <UserIcon size={20} /> Edit Candidate Details
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="field">
              <span>Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                required
              />
            </div>

            <div className="field">
              <span>Candidate Bio / Professional Summary</span>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your target role, experience, or tech stack (e.g. Senior Frontend Engineer specializing in React, Node.js & MERN architecture)"
              />
            </div>

            <div className="field" style={{ marginTop: '1rem' }}>
              <span>Choose Avatar Emoji</span>
              <div className="avatar-selection">
                {PRESET_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-option ${avatar === emoji ? 'selected' : ''}`}
                    onClick={() => setAvatar(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={savingProfile} style={{ marginTop: '1.2rem' }}>
              <Save size={16} /> {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security & Password Tab */}
      {activeTab === 'security' && (
        <div className="panel" style={{ maxWidth: '580px', margin: '0 auto' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1.4rem' }}>
            <KeyRound size={20} /> Change Security Password
          </h3>

          <form onSubmit={handleChangePassword}>
            <div className="field">
              <span>Current Password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="field-row" style={{ marginTop: '0.5rem' }}>
              <div className="field">
                <span>New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="field">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Password Strength Meter */}
            {newPassword && (
              <div style={{ margin: '0.8rem 0 1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                  <span className="muted">Password Strength</span>
                  <strong style={{ color: pwdStrength.color }}>{pwdStrength.label}</strong>
                </div>
                <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pwdStrength.score}%`, height: '100%', background: pwdStrength.color, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={savingPassword} style={{ marginTop: '1rem' }}>
              <CheckCircle2 size={16} /> {savingPassword ? 'Updating Password...' : 'Update Password Credentials'}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
