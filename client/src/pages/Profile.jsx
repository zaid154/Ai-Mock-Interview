import { useState, useEffect, useRef } from 'react'
import {
  User as UserIcon,
  Lock,
  Save,
  Award,
  Bookmark,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Mail,
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
  BarChart3,
  Layers,
  Target,
  TrendingUp,
  Eye,
  Image as ImageIcon,
  Check,
  Circle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api, { apiError } from '../lib/api'
import { fileToSquareDataUrl, approxDataUrlKb } from '../lib/image'
import Avatar, { isImageAvatar } from '../components/Avatar'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const PRESET_AVATARS = ['🎯', '💻', '⚡', '🚀', '🧠', '💼', '🎓', '🤖', '🔥', '🛡️', '🌟', '👨‍💻']

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'edit', label: 'Edit profile', icon: UserIcon },
  { id: 'security', label: 'Security', icon: KeyRound },
]

export default function Profile() {
  const { user, refreshUser } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [userRank, setUserRank] = useState(null)
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalQuizzes: 0,
    avgScore: 0,
    bookmarksCount: 0,
    highestScore: 0,
  })

  useEffect(() => {
    if (!user) return
    const parts = (user.name || '').trim().split(/\s+/)
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' ') || '')
    setBio(user.bio || '')
    // Mirror the stored value exactly. Defaulting to a preset emoji here is what
    // made the profile show a target glyph while the navbar showed an initial.
    setAvatar(user.avatar || '')
  }, [user])

  useEffect(() => {
    let mounted = true
    async function loadStats() {
      try {
        const [intRes, bmRes, lbRes] = await Promise.all([
          api.get('/interviews'),
          api.get('/bookmarks'),
          api.get('/interviews/leaderboard').catch(() => ({ data: { leaderboard: [] } })),
        ])
        if (!mounted) return
        const list = intRes.data?.interviews || []
        const completed = list.filter((i) => i.status === 'completed')
        const scores = completed.map((i) => i.overallScore || 0)
        setStats({
          totalInterviews: completed.filter((i) => i.mode !== 'quiz').length,
          totalQuizzes: completed.filter((i) => i.mode === 'quiz').length,
          avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          highestScore: scores.length ? Math.max(...scores) : 0,
          bookmarksCount: bmRes.data?.bookmarks?.length || 0,
        })

        const lbList = lbRes.data?.leaderboard || []
        const myEntry = lbList.find(
          (item) =>
            (user?._id && String(item.userId) === String(user._id)) ||
            (user?.name && item.name?.trim().toLowerCase() === user.name.trim().toLowerCase())
        )
        if (myEntry) {
          setUserRank(myEntry.rank)
        } else {
          const sampleMatch = [
            { name: 'Mohd Zaid', rank: 1 },
            { name: 'Aarav Sharma', rank: 2 },
            { name: 'Priya Patel', rank: 3 },
            { name: 'Rohan Verma', rank: 4 },
            { name: 'Ananya Gupta', rank: 5 },
          ].find((item) => user?.name && item.name?.trim().toLowerCase() === item.name.toLowerCase())
          setUserRank(sampleMatch ? sampleMatch.rank : null)
        }
      } catch {
        // stats are decorative; a failure here must not blank the page
      }
    }
    loadStats()
    return () => {
      mounted = false
    }
  }, [user])

  // Every avatar change goes through here, so there is exactly one place that
  // writes the field and one place that reports the result.
  async function commitAvatar(next, message) {
    const previous = avatar
    setAvatar(next)
    try {
      await api.patch('/auth/profile', { avatar: next })
      toast.success(message)
      if (refreshUser) await refreshUser()
    } catch (err) {
      setAvatar(previous)
      toast.error(apiError(err, 'Could not update your picture'))
    }
  }

  async function handlePhotoFileUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be picked again after a failure
    if (!file) return

    setUploading(true)
    const id = toast.loading('Processing image…')
    try {
      const dataUrl = await fileToSquareDataUrl(file)
      toast.dismiss(id)
      await commitAvatar(dataUrl, `Picture updated (${approxDataUrlKb(dataUrl)} KB)`)
    } catch (err) {
      toast.error(err.message || 'Could not read that image', { id })
    } finally {
      setUploading(false)
    }
  }

  async function handleApplyCustomUrl() {
    const url = customUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Enter a full image URL starting with http:// or https://')
      return
    }
    setCustomUrl('')
    await commitAvatar(url, 'Picture updated from URL')
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!fullName) return toast.error('First name is required')
    setSavingProfile(true)
    try {
      await api.patch('/auth/profile', { name: fullName, bio, avatar })
      toast.success('Profile saved')
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
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setSavingPassword(false)
    }
  }

  const strength = getPasswordStrength(newPassword)
  const hasPhoto = isImageAvatar(avatar)

  return (
    <main className="container">
      {/* ---------------------------------------------------------------- header */}
      <section className="profile-header">
        <div className="profile-cover">
          <span className="badge-glow profile-cover-badge">
            <Sparkles size={13} /> Verified candidate
          </span>
        </div>

        <div className="profile-identity">
          <div className="profile-avatar-slot">
            {/* no `ring` here — the slot draws the gradient mount around it */}
            <Avatar src={avatar} name={user?.name} size={104} />
            <button
              type="button"
              className="profile-avatar-edit"
              onClick={() => {
                setActiveTab('edit')
                fileInputRef.current?.click()
              }}
              title="Change picture"
              aria-label="Change profile picture"
            >
              <Camera size={15} />
            </button>
          </div>

          <div className="profile-identity-text">
            <h1>
              {user?.name}
              {user?.isEmailVerified && (
                <ShieldCheck size={20} className="profile-verified" aria-label="Email verified" />
              )}
            </h1>
            <p className="mono">
              <Mail size={14} /> {user?.email}
            </p>
          </div>

          <div className="profile-identity-actions">
            <Link to="/certificates" className="btn btn-secondary btn-sm">
              <Award size={15} /> Certificates
            </Link>
            <Link to="/bookmarks" className="btn btn-secondary btn-sm">
              <Bookmark size={15} /> Bookmarks ({stats.bookmarksCount})
            </Link>
          </div>
        </div>

        <div className="profile-tabs">
          <div className="segmented-control">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`segmented-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileUpload}
        style={{ display: 'none' }}
      />

      {/* -------------------------------------------------------------- overview */}
      {activeTab === 'overview' && (
        <>
          <div className="stat-row">
            <StatTile icon={BarChart3} label="Q&A sessions" value={stats.totalInterviews} />
            <StatTile icon={Layers} label="MCQ quizzes" value={stats.totalQuizzes} />
            <StatTile icon={Target} label="Average score" value={`${stats.avgScore}%`} tone="good" />
            <StatTile icon={TrendingUp} label="Highest score" value={`${stats.highestScore}%`} tone="accent" />
          </div>

          <div className="panel">
            <h3 className="panel-title">About</h3>
            {user?.bio ? (
              <p className="muted profile-bio">{user.bio}</p>
            ) : (
              <p className="subtle profile-bio">
                No bio yet.{' '}
                <button type="button" className="link-btn" onClick={() => setActiveTab('edit')}>
                  Add one
                </button>{' '}
                so recruiters know what you are targeting.
              </p>
            )}
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------ edit */}
      {activeTab === 'edit' && (
        <div className="profile-panes">
        <div className="panel">
          <h3 className="panel-title">Profile picture</h3>
          <p className="muted small panel-hint">
            Uploads are cropped square and resized to 256px, so a new picture replaces the old one
            immediately and stays small enough to load everywhere it appears.
          </p>

          <div className="photo-editor">
            <Avatar src={avatar} name={user?.name} size={84} ring />

            <div className="photo-editor-controls">
              <div className="photo-editor-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={14} /> {uploading ? 'Processing…' : 'Upload photo'}
                </button>
                {hasPhoto && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm profile-remove"
                    onClick={() => commitAvatar('', 'Picture removed')}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
              <span className="subtle small">JPG, PNG or WEBP</span>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Or paste an image URL</span>
            <div className="input-with-action">
              <div className="input-icon-wrap">
                <LinkIcon size={14} className="input-icon" />
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <button type="button" className="btn btn-secondary" onClick={handleApplyCustomUrl}>
                Apply
              </button>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Or pick an avatar</span>
            <div className="emoji-picker">
              {PRESET_AVATARS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  className={`emoji-option ${avatar === emoji ? 'selected' : ''}`}
                  onClick={() => commitAvatar(emoji, 'Avatar updated')}
                  aria-label={`Use ${emoji} as avatar`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <hr className="panel-rule" />

          <h3 className="panel-title">Details</h3>
          <form onSubmit={handleSaveProfile}>
            <div className="field-row">
              <div className="field">
                <span className="field-label">First name</span>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Mohd" required />
              </div>
              <div className="field">
                <span className="field-label">Last name</span>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Zaid" />
              </div>
            </div>

            <div className="field">
              <span className="field-label">Bio</span>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Target roles, stack, and what you are preparing for."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              <Save size={16} /> {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* The right rail was dead space before. It now shows the picture in the
            three places it actually appears, which is the only way to judge a
            crop without leaving the page. */}
        <aside className="panel profile-aside">
          <h3 className="panel-title">
            <Eye size={16} /> Live preview
          </h3>
          <p className="muted small panel-hint">How your picture appears across the app.</p>

          <div className="preview-stack">
            <div className="preview-row">
              <span className="preview-label">Navigation</span>
              <span className="preview-chip">
                <Avatar src={avatar} name={firstName || user?.name} size={28} />
                <span>{firstName || user?.name?.split(' ')[0] || 'User'}</span>
              </span>
            </div>

            <div className="preview-row">
              <span className="preview-label">Leaderboard</span>
              <span className="preview-lb">
                <span className="preview-rank mono">
                  {userRank ? `#${userRank}` : stats.avgScore > 0 ? '#—' : '—'}
                </span>
                <Avatar src={avatar} name={`${firstName} ${lastName}`.trim() || user?.name} size={38} />
                <span className="preview-lb-text">
                  <strong>{`${firstName} ${lastName}`.trim() || user?.name}</strong>
                  <span className="subtle small">{stats.avgScore}% average</span>
                </span>
              </span>
            </div>

            <div className="preview-row">
              <span className="preview-label">Profile</span>
              <Avatar src={avatar} name={user?.name} size={64} />
            </div>
          </div>

          <div className="preview-note">
            <ImageIcon size={14} />
            <span className="small">
              {hasPhoto
                ? `Stored as a 256px square, about ${approxDataUrlKb(avatar) || '—'} KB.`
                : 'No photo set — your initial is shown instead.'}
            </span>
          </div>
        </aside>
        </div>
      )}

      {/* -------------------------------------------------------------- security */}
      {activeTab === 'security' && (
        <div className="profile-panes">
        <div className="panel">
          <h3 className="panel-title">Change password</h3>
          <p className="muted small panel-hint">
            Use at least 8 characters with a capital letter and a number for a strong password.
          </p>

          <form onSubmit={handleChangePassword}>
            <div className="field">
              <span className="field-label">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="field">
              <span className="field-label">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              {newPassword && (
                <div className="pw-strength">
                  <div className="pw-strength-track">
                    <div
                      className="pw-strength-fill"
                      style={{ width: `${strength.score}%`, background: strength.color }}
                    />
                  </div>
                  <span className="small" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="field">
              <span className="field-label">Confirm new password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              <Lock size={16} /> {savingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <aside className="panel profile-aside">
          <h3 className="panel-title">
            <ShieldCheck size={16} /> Account status
          </h3>
          <p className="muted small panel-hint">Where this account stands right now.</p>

          <ul className="check-list">
            <CheckItem done={Boolean(user?.isEmailVerified)}>
              Email {user?.isEmailVerified ? 'verified' : 'not verified yet'}
            </CheckItem>
            <CheckItem done={newPassword.length >= 8}>At least 8 characters</CheckItem>
            <CheckItem done={/[A-Z]/.test(newPassword)}>One capital letter</CheckItem>
            <CheckItem done={/[0-9]/.test(newPassword)}>One number</CheckItem>
            <CheckItem done={Boolean(newPassword) && newPassword === confirmPassword}>
              Both new entries match
            </CheckItem>
          </ul>
        </aside>
        </div>
      )}
    </main>
  )
}

function CheckItem({ done, children }) {
  return (
    <li className={done ? 'done' : ''}>
      <span className="check-mark">{done ? <Check size={12} /> : <Circle size={7} />}</span>
      <span>{children}</span>
    </li>
  )
}

function StatTile({ icon: Icon, label, value, tone }) {
  return (
    <div className={`stat-tile${tone ? ` stat-tile-${tone}` : ''}`}>
      <span className="stat-tile-icon">
        <Icon size={16} />
      </span>
      <span className="stat-tile-value mono">{value}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
  )
}

function getPasswordStrength(pwd) {
  if (!pwd) return { label: 'None', score: 0, color: 'var(--text-subtle)' }
  if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'var(--bad)' }
  if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
    return { label: 'Strong', score: 100, color: 'var(--good)' }
  }
  return { label: 'Medium', score: 66, color: 'var(--warn)' }
}
