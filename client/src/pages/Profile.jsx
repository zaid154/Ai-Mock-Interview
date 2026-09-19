import { useState, useEffect, useRef } from 'react'
import { User as UserIcon, Award, Bookmark, ShieldCheck, Sparkles, KeyRound, Mail, Camera, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { apiError } from '../lib/api'
import { fileToSquareDataUrl, approxDataUrlKb } from '../lib/image'
import Avatar, { isImageAvatar } from '../components/Avatar'
import ProfileOverview from '../components/profile/ProfileOverview'
import ProfileEdit from '../components/profile/ProfileEdit'
import ProfileSecurity from '../components/profile/ProfileSecurity'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'edit', label: 'Edit profile', icon: UserIcon },
  { id: 'security', label: 'Security', icon: KeyRound },
]

/**
 * Profile Page: Candidate account settings, analytics overview, and security.
 */
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

  const [stats, setStats] = useState({ totalInterviews: 0, totalQuizzes: 0, avgScore: 0, highestScore: 0, bookmarksCount: 0 })

  useEffect(() => {
    if (!user) return
    const parts = (user.name || '').trim().split(/\s+/)
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' ') || '')
    setBio(user.bio || '')
    setAvatar(user.avatar || '')
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
      } catch {
        // silent fail
      }
    }
    loadStats()
    return () => { mounted = false }
  }, [user])

  async function commitAvatar(next, message) {
    const previous = avatar
    setAvatar(next)
    try {
      await api.patch('/auth/profile', { avatar: next })
      toast.success(message)
      if (refreshUser) await refreshUser()
    } catch (err) {
      setAvatar(previous)
      toast.error(apiError(err, 'Could not update picture'))
    }
  }

  async function handlePhotoFileUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    const id = toast.loading('Processing image…')
    try {
      const dataUrl = await fileToSquareDataUrl(file)
      toast.dismiss(id)
      await commitAvatar(dataUrl, `Picture updated (${approxDataUrlKb(dataUrl)} KB)`)
    } catch (err) {
      toast.error(err.message || 'Could not read image', { id })
    } finally {
      setUploading(false)
    }
  }

  async function handleApplyCustomUrl() {
    const url = customUrl.trim()
    if (!url || !/^https?:\/\//i.test(url)) return toast.error('Enter a valid image URL')
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

  const hasPhoto = isImageAvatar(avatar)

  return (
    <main className="container">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="profile-cover">
          <span className="badge-glow profile-cover-badge"><Sparkles size={13} /> Verified candidate</span>
        </div>

        <div className="profile-identity">
          <div className="profile-avatar-slot">
            <Avatar src={avatar} name={user?.name} size={104} />
            <button type="button" className="profile-avatar-edit" onClick={() => { setActiveTab('edit'); fileInputRef.current?.click() }} title="Change picture">
              <Camera size={15} />
            </button>
          </div>

          <div className="profile-identity-text">
            <h1>
              {user?.name}
              {user?.isEmailVerified && <ShieldCheck size={20} className="profile-verified" aria-label="Verified" />}
            </h1>
            <p className="mono"><Mail size={14} /> {user?.email}</p>
          </div>

          <div className="profile-identity-actions">
            <Link to="/certificates" className="btn btn-secondary btn-sm"><Award size={15} /> Certificates</Link>
            <Link to="/bookmarks" className="btn btn-secondary btn-sm"><Bookmark size={15} /> Bookmarks ({stats.bookmarksCount})</Link>
          </div>
        </div>

        <div className="profile-tabs">
          <div className="segmented-control">
            {TABS.map((t) => (
              <button key={t.id} type="button" className={`segmented-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoFileUpload} style={{ display: 'none' }} />

      {activeTab === 'overview' && <ProfileOverview stats={stats} bio={user?.bio} setActiveTab={setActiveTab} />}
      {activeTab === 'edit' && (
        <ProfileEdit
          avatar={avatar} user={user} uploading={uploading} fileInputRef={fileInputRef} hasPhoto={hasPhoto} commitAvatar={commitAvatar}
          customUrl={customUrl} setCustomUrl={setCustomUrl} handleApplyCustomUrl={handleApplyCustomUrl}
          firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} bio={bio} setBio={setBio}
          handleSaveProfile={handleSaveProfile} savingProfile={savingProfile}
        />
      )}
      {activeTab === 'security' && (
        <ProfileSecurity
          currentPassword={currentPassword} setCurrentPassword={setCurrentPassword} newPassword={newPassword} setNewPassword={setNewPassword}
          confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} handleChangePassword={handleChangePassword} savingPassword={savingPassword}
        />
      )}
    </main>
  )
}
