import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Settings, Award } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import CertificateManager from '../components/CertificateManager'
import AdminUsersTable from '../components/admin/AdminUsersTable'
import AdminSettingsTab from '../components/admin/AdminSettingsTab'

function valueToText(val) { return typeof val === 'string' ? val : JSON.stringify(val) }
function textToValue(txt) { try { return JSON.parse(txt) } catch { return txt } }

/**
 * AdminDashboard: Central admin control panel for users, certificates, and system settings.
 */
export default function AdminDashboard() {
  const { user: me } = useAuth()
  const { confirm, promptText } = useConfirm()

  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)

  // Settings
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

  useEffect(() => { load() }, [])

  async function toggleVerified(u) {
    try {
      await api.patch(`/admin/users/${u._id}/verified`, { isVerified: !u.isVerified })
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isVerified: !x.isVerified } : x)))
    } catch (err) {
      toast.error(apiError(err, 'Could not update user'))
    }
  }

  async function toggleRole(u) {
    const nextRole = u.role === 'admin' ? 'user' : 'admin'
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role: nextRole })
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role: nextRole } : x)))
      toast.success(`${u.email} is now ${nextRole}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not change role'))
    }
  }

  async function deleteUser(u) {
    const ok = await confirm({
      title: 'Delete user?',
      message: `Permanently delete ${u.email}? All past interviews will be deleted.`,
      confirmText: 'Delete permanently',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/admin/users/${u._id}`)
      setUsers((prev) => prev.filter((x) => x._id !== u._id))
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
      toast.success(next ? 'Email verification mandatory' : 'Email verification optional')
    } catch (err) {
      toast.error(apiError(err, 'Could not update setting'))
    } finally {
      setSavingVerification(false)
    }
  }

  async function addGeminiKey() {
    const k = newGeminiKey.trim()
    if (!k || geminiKeys.includes(k)) return
    const updated = [...geminiKeys, k]
    try {
      await api.put('/admin/settings', { key: 'gemini_api_keys', value: updated })
      setGeminiKeys(updated)
      setNewGeminiKey('')
      toast.success('Gemini key added')
    } catch (err) {
      toast.error(apiError(err, 'Could not save key'))
    }
  }

  async function removeGeminiKey(idx) {
    const updated = geminiKeys.filter((_, i) => i !== idx)
    try {
      await api.put('/admin/settings', { key: 'gemini_api_keys', value: updated })
      setGeminiKeys(updated)
      toast.success('Gemini key removed')
    } catch (err) {
      toast.error(apiError(err, 'Could not remove key'))
    }
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
      toast.error(apiError(err, 'Could not save signatory'))
    }
  }

  async function addSetting(e) {
    e.preventDefault()
    if (!newKey.trim()) return
    try {
      const res = await api.put('/admin/settings', { key: newKey.trim(), value: textToValue(newValue) })
      setSettings((prev) => [...prev.filter((s) => s.key !== res.data.setting.key), res.data.setting])
      setNewKey('')
      setNewValue('')
      toast.success('Setting saved')
    } catch (err) {
      toast.error(apiError(err, 'Could not save setting'))
    }
  }

  async function renameKey(oldKey) {
    const newName = await promptText({ title: 'Rename setting key', message: `New key name:`, defaultValue: oldKey, confirmText: 'Rename' })
    if (!newName || newName === oldKey) return
    try {
      await api.patch(`/admin/settings/${encodeURIComponent(oldKey)}/rename`, { newKey: newName })
      setSettings((prev) => prev.map((s) => (s.key === oldKey ? { ...s, key: newName } : s)))
      toast.success('Key renamed')
    } catch (err) {
      toast.error(apiError(err, 'Could not rename key'))
    }
  }

  async function editValue(s) {
    const next = await promptText({ title: `Edit "${s.key}"`, message: 'Enter new value:', defaultValue: valueToText(s.value), confirmText: 'Save' })
    if (next === null) return
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
    const ok = await confirm({ title: `Delete "${key}"?`, message: 'Reverts to default value.', confirmText: 'Delete', danger: true })
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
          <p className="muted small" style={{ margin: '0.25rem 0 0' }}>Manage users, credentials, and system settings.</p>
        </div>

        <div className="segmented-control">
          <button type="button" className={`segmented-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <Users size={15} /> Users ({users.length})
          </button>
          <button type="button" className={`segmented-btn ${tab === 'certs' ? 'active' : ''}`} onClick={() => setTab('certs')}>
            <Award size={15} /> Milestone Templates
          </button>
          <button type="button" className={`segmented-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>

      {tab === 'users' && <AdminUsersTable users={users} me={me} toggleVerified={toggleVerified} toggleRole={toggleRole} deleteUser={deleteUser} />}
      {tab === 'certs' && <CertificateManager />}
      {tab === 'settings' && (
        <AdminSettingsTab
          geminiKeys={geminiKeys} newGeminiKey={newGeminiKey} setNewGeminiKey={setNewGeminiKey} addGeminiKey={addGeminiKey} removeGeminiKey={removeGeminiKey}
          verifyRequired={verifyRequired} savingVerification={savingVerification} toggleVerifyRequired={toggleVerifyRequired}
          certSignatoryName={certSignatoryName} setCertSignatoryName={setCertSignatoryName} certSignatoryTitle={certSignatoryTitle} setCertSignatoryTitle={setCertSignatoryTitle}
          certSignatureImage={certSignatureImage} setCertSignatureImage={setCertSignatureImage} saveSignatorySettings={saveSignatorySettings}
          newKey={newKey} setNewKey={setNewKey} newValue={newValue} setNewValue={setNewValue} addSetting={addSetting}
          settings={settings} valueToText={valueToText} renameKey={renameKey} editValue={editValue} deleteSetting={deleteSetting}
        />
      )}
    </main>
  )
}
