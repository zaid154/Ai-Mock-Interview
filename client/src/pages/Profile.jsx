import { useState, useEffect } from 'react'
import { User as UserIcon, Bookmark, ShieldCheck, KeyRound, Mail, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { apiError } from '../lib/api'
import ProfileOverview from '../components/profile/ProfileOverview'
import ProfileEdit from '../components/profile/ProfileEdit'
import ProfileSecurity from '../components/profile/ProfileSecurity'

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
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [stats, setStats] = useState({ totalInterviews: 0, totalQuizzes: 0, avgScore: 0, highestScore: 0, bookmarksCount: 0 })

  useEffect(() => {
    if (!user) return
    const parts = (user.name || '').trim().split(/\s+/)
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' ') || '')
    setBio(user.bio || '')
  }, [user])

  useEffect(() => {
    let mounted = true
    async function loadStats() {
      try {
        const [intRes, bmRes] = await Promise.all([api.get('/interviews'), api.get('/bookmarks')])
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
      } catch {}
    }
    loadStats()
    return () => { mounted = false }
  }, [user])

  async function handleSaveProfile(e) {
    e.preventDefault()
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    if (!fullName) return toast.error('First name is required')
    setSavingProfile(true)
    try {
      await api.patch('/auth/profile', { name: fullName, bio })
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

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      <section className="profile-header">
        <div className="profile-cover">
          {user?.isEmailVerified ? (
            <span className="tag-soft profile-cover-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={13} style={{ color: '#16a34a' }} aria-hidden="true" /> Verified Account
            </span>
          ) : (
            <span className="tag-soft profile-cover-badge">Candidate Profile</span>
          )}
        </div>

        <div className="profile-identity">
          <div className="profile-identity-text">
            <h1>
              {user?.name}
              {user?.isEmailVerified && <ShieldCheck size={20} className="profile-verified" aria-label="Email verified" />}
            </h1>
            <p className="mono"><Mail size={14} aria-hidden="true" /> {user?.email}</p>
          </div>

          <div className="profile-identity-actions">
            <Link to="/bookmarks" className="btn btn-secondary btn-sm">
              <Bookmark size={15} aria-hidden="true" /> Bookmarks ({stats.bookmarksCount})
            </Link>
          </div>
        </div>

        <div className="segmented-control profile-tabs" role="tablist" aria-label="Profile sections">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`segmented-btn ${active ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} aria-hidden="true" /> {tab.label}
              </button>
            )
          })}
        </div>
      </section>

      {activeTab === 'overview' && (
        <ProfileOverview stats={stats} bio={bio} onEditBio={() => setActiveTab('edit')} />
      )}
      {activeTab === 'edit' && (
        <ProfileEdit
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          bio={bio}
          setBio={setBio}
          savingProfile={savingProfile}
          onSaveProfile={handleSaveProfile}
        />
      )}
      {activeTab === 'security' && (
        <ProfileSecurity
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          savingPassword={savingPassword}
          onChangePassword={handleChangePassword}
        />
      )}
    </main>
  )
}
