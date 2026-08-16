import { useState, useEffect, useRef } from 'react'
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
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const PRESET_AVATARS = ['🎯', '💻', '⚡', '🚀', '🧠', '💼', '🎓', '🤖', '🔥', '🛡️', '🌟', '👨‍💻']

export default function Profile() {
  const { user, refreshUser } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0])
  const [customUrl, setCustomUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const fileInputRef = useRef(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalQuizzes: 0,
    avgScore: 0,
    bookmarksCount: 0,
    highestScore: 0,
  })

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(/\s+/)
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
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

  function handlePhotoFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Please choose an image file under 3 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatar(event.target.result)
      toast.success('Photo loaded! Click Save Profile to apply.')
    }
    reader.readAsDataURL(file)
  }

  function handleApplyCustomUrl() {
    if (!customUrl.trim()) return
    setAvatar(customUrl.trim())
    setCustomUrl('')
    toast.success('Custom photo URL applied! Click Save Profile to save.')
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!fullName) return toast.error('First name is required')
    setSavingProfile(true)
    try {
      await api.patch('/auth/profile', { name: fullName, bio, avatar })
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

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', score: 0, color: 'var(--text-subtle)' }
    if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'var(--bad)' }
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { label: 'Strong', score: 100, color: 'var(--good)' }
    }
    return { label: 'Medium', score: 66, color: 'var(--warn)' }
  }

  const pwdStrength = getPasswordStrength(newPassword)
  const isImageAvatar = Boolean(avatar && (avatar.startsWith('http') || avatar.startsWith('data:image')))

  return (
    <main className="container">
      {/* Cover Banner Header */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div
          style={{
            height: '160px',
            background: 'var(--accent-grad-subtle)',
            borderBottom: '1px solid var(--border)',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '1.5rem 2rem',
          }}
        >
          <div style={{ position: 'absolute', right: '1.5rem', top: '1.5rem' }}>
            <span className="badge-glow">
              <Sparkles size={14} /> MockMate Verified Candidate
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '0 2rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justify: 'space-between',
            gap: '1.5rem',
            marginTop: '-45px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Profile Picture Avatar Box */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  background: 'var(--accent-grad)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '2.5rem',
                  boxShadow: 'var(--shadow-md)',
                  color: '#ffffff',
                  border: '4px solid var(--surface)',
                  overflow: 'hidden',
                }}
              >
                {isImageAvatar ? (
                  <img src={avatar} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  avatar || user?.name?.charAt(0).toUpperCase() || 'C'
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('edit')
                  fileInputRef.current?.click()
                }}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  border: '2px solid var(--surface)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
                title="Upload Profile Picture"
              >
                <Camera size={14} />
              </button>
            </div>

            <div>
              <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {user?.name}
                {user?.isEmailVerified && (
                  <ShieldCheck size={22} style={{ color: 'var(--good)' }} title="Verified Candidate" />
                )}
              </h1>
              <p className="muted small mono" style={{ margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <Link to="/certificates" className="btn btn-secondary btn-sm">
              <Award size={16} /> Certificates
            </Link>
            <Link to="/bookmarks" className="btn btn-secondary btn-sm">
              <Bookmark size={16} /> Bookmarks ({stats.bookmarksCount})
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid var(--border-soft)', background: 'var(--surface-2)', padding: '0.6rem 1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setActiveTab('overview')}
            style={{ borderRadius: '8px', padding: '0.55rem 1rem' }}
          >
            <Briefcase size={15} /> Candidate Stats &amp; Bio
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'edit' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setActiveTab('edit')}
            style={{ borderRadius: '8px', padding: '0.55rem 1rem' }}
          >
            <UserIcon size={15} /> Edit Profile &amp; Photo
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setActiveTab('security')}
            style={{ borderRadius: '8px', padding: '0.55rem 1rem' }}
          >
            <KeyRound size={15} /> Security &amp; Password
          </button>
        </div>
      </div>

      {/* Hidden File Input for Custom Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileUpload}
        style={{ display: 'none' }}
      />

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Practice Performance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">Total Q&amp;A Sessions</span>
                <strong style={{ fontSize: '1.1rem' }}>{stats.totalInterviews}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">Total MCQ Quizzes</span>
                <strong style={{ fontSize: '1.1rem' }}>{stats.totalQuizzes}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">Average Performance</span>
                <span className="score-chip">{stats.avgScore}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted">Highest Score Achieved</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{stats.highestScore}%</strong>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Candidate Bio</h3>
            <p className="muted" style={{ margin: 0, lineHeight: '1.65' }}>
              {user?.bio || 'No bio specified. Update your candidate bio in the Edit Profile tab.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <div className="panel" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Edit Candidate Profile &amp; Photo</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Custom Profile Photo Upload Section */}
            <div className="field">
              <span className="field-label">Profile Picture</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--accent-grad)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.8rem',
                    color: '#ffffff',
                    border: '2px solid var(--border)',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {isImageAvatar ? (
                    <img src={avatar} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    avatar || 'C'
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Upload Custom Photo
                    </button>

                    {isImageAvatar && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setAvatar(PRESET_AVATARS[0])}
                        style={{ color: 'var(--bad)' }}
                      >
                        <Trash2 size={14} /> Remove Photo
                      </button>
                    )}
                  </div>
                  <span className="muted small" style={{ fontSize: '0.78rem' }}>PNG, JPG, WEBP formats supported (max 3MB)</span>
                </div>
              </div>
            </div>

            {/* Paste Custom Image URL */}
            <div className="field" style={{ marginTop: '-0.4rem' }}>
              <span className="field-label" style={{ fontSize: '0.8rem' }}>Or Paste Image URL</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="input-icon-wrap" style={{ flex: 1 }}>
                  <LinkIcon size={14} className="input-icon" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleApplyCustomUrl}>
                  Apply URL
                </button>
              </div>
            </div>

            {/* Emoji Presets fallback */}
            <div className="field">
              <span className="field-label" style={{ fontSize: '0.8rem' }}>Or Choose Preset Avatar Emoji</span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                {PRESET_AVATARS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: avatar === emoji ? '2px solid var(--accent-primary)' : '1px solid var(--border)',
                      background: avatar === emoji ? 'var(--accent-grad-subtle)' : 'var(--surface-2)',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* First & Last Name Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="field">
                <span className="field-label">First Name</span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Mohd"
                  required
                />
              </div>

              <div className="field">
                <span className="field-label">Last Name</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Zaid"
                />
              </div>
            </div>

            <div className="field">
              <span className="field-label">Candidate Bio / Background</span>
              <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short summary of your target roles and experience..." />
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              <Save size={16} /> {savingProfile ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="panel" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Change Security Password</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="field">
              <span className="field-label">Current Password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>

            <div className="field">
              <span className="field-label">New Password</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              {newPassword && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.3rem' }}>
                    <div style={{ width: `${pwdStrength.score}%`, height: '100%', background: pwdStrength.color }} />
                  </div>
                  <span className="small muted" style={{ fontSize: '0.8rem' }}>Strength: <strong style={{ color: pwdStrength.color }}>{pwdStrength.label}</strong></span>
                </div>
              )}
            </div>

            <div className="field">
              <span className="field-label">Confirm New Password</span>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              <Lock size={16} /> {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
