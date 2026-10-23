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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col w-full">
      {/* ── Banner Card ── */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-8">
        <div className="h-16 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent border-b border-slate-100 flex items-center justify-between px-6">
          {user?.isEmailVerified ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck size={14} className="text-emerald-600" /> Verified Account
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Candidate Profile
            </span>
          )}
        </div>

        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 mb-1">
              <span>{user?.name}</span>
              {user?.isEmailVerified && <ShieldCheck size={18} className="text-emerald-600" />}
            </h1>
            <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 m-0">
              <Mail size={13} className="text-slate-400" /> {user?.email}
            </p>
          </div>

          <div>
            <Link
              to="/bookmarks"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Bookmark size={14} className="text-blue-600" /> Bookmarks ({stats.bookmarksCount})
            </Link>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="px-6 pb-4">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200" role="tablist">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Tab Content ── */}
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
