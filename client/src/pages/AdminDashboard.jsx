import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Settings, Award } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import CertificateManager from '../components/CertificateManager'
import AdminUsersTable from '../components/admin/AdminUsersTable'
import AdminSettingsTab from '../components/admin/AdminSettingsTab'

function valueToText(value) {
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function textToValue(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * AdminDashboard Page
 * 
 * Modular Administration Cockpit:
 * - Tab 1 (Users): Candidate accounts, verification status, RBAC toggle, deletion
 * - Tab 2 (Certificates): Template milestone criteria, designs, scoring thresholds
 * - Tab 3 (Settings): Multi-key Gemini rotation, email verification gate, signatory info, key-value store
 */
export default function AdminDashboard() {
  const { user: me } = useAuth()
  const { confirm, promptText } = useConfirm()

  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)

  // Settings states
  const [verifyRequired, setVerifyRequired] = useState(false)
  const [savingVerification, setSavingVerification] = useState(false)
  const [geminiKeys, setGeminiKeys] = useState([])
  const [newGeminiKey, setNewGeminiKey] = useState('')
  const [certSignatoryName, setCertSignatoryName] = useState('Mohd Zaid')
  const [certSignatoryTitle, setCertSignatoryTitle] = useState('Global Director of Candidate Assessments, MockMate AI')
  const [certSignatureImage, setCertSignatureImage] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  async function load() {
    try {
      const [u, s] = await Promise.all([api.get('/admin/users'), api.get('/admin/settings')])
      setUsers(u.data.users)
      setSettings(s.data.settings)

      const vr = s.data.settings.find((x) => x.key === 'verificationRequired')
      setVerifyRequired(vr?.value === true)

      const gk = s.data.settings.find((x) => x.key === 'gemini_api_keys')
      setGeminiKeys(Array.isArray(gk?.value) ? gk.value : [])

      const cName = s.data.settings.find((x) => x.key === 'cert_signatory_name')
      if (cName?.value) setCertSignatoryName(cName.value)

      const cTitle = s.data.settings.find((x) => x.key === 'cert_signatory_title')
      if (cTitle?.value) setCertSignatoryTitle(cTitle.value)

      const cImg = s.data.settings.find((x) => x.key === 'cert_signature_image')
      if (cImg?.value) setCertSignatureImage(cImg.value)
    } catch (err) {
      toast.error(apiError(err, 'Could not load admin data'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleVerified(user) {
    try {
      await api.patch(`/admin/users/${user._id}/verified`, { isVerified: !user.isVerified })
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isVerified: !u.isVerified } : u)),
      )
    } catch (err) {
      toast.error(apiError(err, 'Could not update the user'))
    }
  }

  async function toggleRole(user) {
    const nextRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      await api.patch(`/admin/users/${user._id}/role`, { role: nextRole })
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u)))
      toast.success(`${user.email} is now ${nextRole}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not change the role'))
    }
  }

  async function deleteUser(user) {
    const ok = await confirm({
      title: 'Delete user?',
      message: `Permanently delete ${user.email}? Their interviews, quiz attempts, and bookmarks will also be deleted.`,
      confirmText: 'Delete permanently',
      danger: true,
    })
    if (!ok) return

    try {
      await api.delete(`/admin/users/${user._id}`)
      setUsers((prev) => prev.filter((u) => u._id !== user._id))
      toast.success('User deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete user'))
    }
  }

  async function toggleVerifyRequired() {
    setSavingVerification(true)
    const next = !verifyRequired
    try {
      await api.put('/admin/settings', { key: 'verificationRequired', value: next })
      setVerifyRequired(next)
      toast.success(next ? 'Email verification now mandatory' : 'Email verification now optional')
    } catch (err) {
      toast.error(apiError(err, 'Could not update setting'))
    } finally {
      setSavingVerification(false)
    }
  }

  async function saveGeminiKeys(updatedKeys) {
    try {
      await api.put('/admin/settings', { key: 'gemini_api_keys', value: updatedKeys })
      setGeminiKeys(updatedKeys)
      toast.success('Gemini API keys updated')
    } catch (err) {
      toast.error(apiError(err, 'Could not save Gemini keys'))
    }
  }

  function addGeminiKey() {
    const k = newGeminiKey.trim()
    if (!k) return
    if (geminiKeys.includes(k)) return toast.error('Key already in rotation')
    const updated = [...geminiKeys, k]
    setNewGeminiKey('')
    saveGeminiKeys(updated)
  }

  function removeGeminiKey(index) {
    const updated = geminiKeys.filter((_, i) => i !== index)
    saveGeminiKeys(updated)
  }

  async function saveSignatorySettings() {
    try {
      await Promise.all([
        api.put('/admin/settings', { key: 'cert_signatory_name', value: certSignatoryName }),
        api.put('/admin/settings', { key: 'cert_signatory_title', value: certSignatoryTitle }),
        api.put('/admin/settings', { key: 'cert_signature_image', value: certSignatureImage }),
      ])
      toast.success('Signatory credentials saved')
    } catch (err) {
      toast.error(apiError(err, 'Could not save signatory info'))
    }
  }

  async function addSetting(e) {
    e.preventDefault()
    if (!newKey.trim()) return
    try {
      const parsed = textToValue(newValue)
      const res = await api.put('/admin/settings', { key: newKey.trim(), value: parsed })
      setSettings((prev) => {
        const without = prev.filter((s) => s.key !== res.data.setting.key)
        return [...without, res.data.setting].sort((a, b) => a.key.localeCompare(b.key))
      })
      setNewKey('')
      setNewValue('')
      toast.success('Setting saved')
    } catch (err) {
      toast.error(apiError(err, 'Could not save setting'))
    }
  }

  async function renameKey(oldKey) {
    const newName = await promptText({
      title: 'Rename setting key',
      message: `Enter the new name for "${oldKey}":`,
      defaultValue: oldKey,
      confirmText: 'Rename',
    })
    if (!newName || newName === oldKey) return
    try {
      await api.patch(`/admin/settings/${encodeURIComponent(oldKey)}/rename`, { newKey: newName })
      setSettings((prev) =>
        prev.map((s) => (s.key === oldKey ? { ...s, key: newName } : s)),
      )
      toast.success('Key renamed')
    } catch (err) {
      toast.error(apiError(err, 'Could not rename key'))
    }
  }

  async function editValue(s) {
    const current = valueToText(s.value)
    const next = await promptText({
      title: `Edit "${s.key}"`,
      message: 'Enter the new value (valid JSON will be parsed, otherwise saved as text):',
      defaultValue: current,
      confirmText: 'Save value',
    })
    if (next === null || next === current) return
    try {
      const parsed = textToValue(next)
      await api.put('/admin/settings', { key: s.key, value: parsed })
      setSettings((prev) => prev.map((x) => (x.key === s.key ? { ...x, value: parsed } : x)))
      toast.success('Value updated')
    } catch (err) {
      toast.error(apiError(err, 'Could not update value'))
    }
  }

  async function deleteSetting(key) {
    const ok = await confirm({
      title: `Delete "${key}"?`,
      message: 'This cannot be undone. Any feature reading this setting will revert to its default.',
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/admin/settings/${encodeURIComponent(key)}`)
      setSettings((prev) => prev.filter((s) => s.key !== key))
      toast.success('Setting deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete setting'))
    }
  }

  if (loading) return <main className="page-center muted">Loading administrator console…</main>

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Platform Administration</h1>
          <p className="muted small" style={{ margin: '0.25rem 0 0' }}>Manage users, credentials, and configurations.</p>
        </div>

        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-btn ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            <Users size={15} /> Users ({users.length})
          </button>
          <button
            type="button"
            className={`segmented-btn ${tab === 'certs' ? 'active' : ''}`}
            onClick={() => setTab('certs')}
          >
            <Award size={15} /> Milestone Templates
          </button>
          <button
            type="button"
            className={`segmented-btn ${tab === 'settings' ? 'active' : ''}`}
            onClick={() => setTab('settings')}
          >
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>

      {tab === 'users' && (
        <AdminUsersTable
          users={users}
          me={me}
          toggleVerified={toggleVerified}
          toggleRole={toggleRole}
          deleteUser={deleteUser}
        />
      )}

      {tab === 'certs' && <CertificateManager />}

      {tab === 'settings' && (
        <AdminSettingsTab
          geminiKeys={geminiKeys}
          newGeminiKey={newGeminiKey}
          setNewGeminiKey={setNewGeminiKey}
          addGeminiKey={addGeminiKey}
          removeGeminiKey={removeGeminiKey}
          verifyRequired={verifyRequired}
          savingVerification={savingVerification}
          toggleVerifyRequired={toggleVerifyRequired}
          certSignatoryName={certSignatoryName}
          setCertSignatoryName={setCertSignatoryName}
          certSignatoryTitle={certSignatoryTitle}
          setCertSignatoryTitle={setCertSignatoryTitle}
          certSignatureImage={certSignatureImage}
          setCertSignatureImage={setCertSignatureImage}
          saveSignatorySettings={saveSignatorySettings}
          newKey={newKey}
          setNewKey={setNewKey}
          newValue={newValue}
          setNewValue={setNewValue}
          addSetting={addSetting}
          settings={settings}
          valueToText={valueToText}
          renameKey={renameKey}
          editValue={editValue}
          deleteSetting={deleteSetting}
        />
      )}
    </main>
  )
}
