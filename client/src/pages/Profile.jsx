import { useState, useEffect } from 'react'
import { User as UserIcon, Bookmark, ShieldCheck, KeyRound, BarChart3, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { apiError } from '../lib/api'
import ProfileOverview from '../components/profile/ProfileOverview'
import ProfileEdit from '../components/profile/ProfileEdit'
import ProfileSecurity from '../components/profile/ProfileSecurity'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'edit', label: 'Edit Profile', icon: UserIcon },
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
      toast.success('Profile updated successfully')
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
      toast.success('Password updated successfully')
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col w-full">
      {/* ── Page Header ── */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {user?.name || 'Candidate Profile'}
              </h1>
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck size={13} className="text-emerald-600" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Candidate
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" />
              {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/bookmarks"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
            >
              <Bookmark size={13} className="text-blue-600" />
              <span>Bookmarks</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                {stats.bookmarksCount}
              </span>
            </Link>
          </div>
        </div>

        {/* ── Flat Horizontal Nav Tabs (Vercel / GitHub style) ── */}
        <nav className="flex items-center gap-6 mt-6 -mb-[1px]" aria-label="Settings Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 pb-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Tab Content Area ── */}
      <div className="pt-6">
        {activeTab === 'overview' && (
          <ProfileOverview
            stats={stats}
            bio={bio}
            user={user}
            onEditBio={() => setActiveTab('edit')}
          />
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
      </div>
    </main>
  )
}
