import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2, Save, Plus, KeyRound, ShieldPlus, ShieldMinus, ShieldCheck, Users, Settings, Award } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'

import { useConfirm } from '../components/ConfirmDialog'
import Avatar from '../components/Avatar'
import CertificateManager from '../components/CertificateManager'

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

export default function AdminDashboard() {
  const { user: me } = useAuth()

  const { confirm, promptText } = useConfirm()
  const [users, setUsers] = useState([])
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)

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
      title: 'Delete User Account',
      message: `Permanently delete ${user.email}? This cannot be undone.`,
      confirmText: 'Delete User',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/admin/users/${user._id}`)
      setUsers((prev) => prev.filter((u) => u._id !== user._id))
      toast.success('User deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete the user'))
    }
  }

  async function saveSetting(key, value) {
    await api.put('/admin/settings', { key, value })
  }

  async function onToggleVerifyRequired(next) {
    const previous = verifyRequired
    setVerifyRequired(next)
    setSavingVerification(true)
    try {
      await saveSetting('verificationRequired', next)
      toast.success(`Email verification is now ${next ? 'required' : 'optional'}`)
      load()
    } catch (err) {
      setVerifyRequired(previous)
      toast.error(apiError(err, 'Could not save setting'))
    } finally {
      setSavingVerification(false)
    }
  }



  async function saveCertSignatureSettings(e) {
    e.preventDefault()
    try {
      await Promise.all([
        saveSetting('cert_signatory_name', certSignatoryName.trim()),
        saveSetting('cert_signatory_title', certSignatoryTitle.trim()),
        saveSetting('cert_signature_image', certSignatureImage.trim()),
      ])
      toast.success('Certificate signature settings saved successfully!')
      load()
    } catch (err) {
      toast.error(apiError(err, 'Could not save signature settings'))
    }
  }

  function handleSignatureFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Signature file must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setCertSignatureImage(reader.result)
      toast.success('Signature image loaded!')
    }
    reader.readAsDataURL(file)
  }

  async function persistGeminiKeys(keys) {
    await saveSetting('gemini_api_keys', keys)
    setGeminiKeys(keys)
  }

  async function addGeminiKey(e) {
    e.preventDefault()
    const key = newGeminiKey.trim()
    if (!key) return
    if (geminiKeys.includes(key)) {
      toast.error('That key is already added')
      return
    }
    try {
      await persistGeminiKeys([...geminiKeys, key])
      setNewGeminiKey('')
      toast.success('API key added')
    } catch (err) {
      toast.error(apiError(err, 'Could not add key'))
    }
  }

  async function removeGeminiKey(index) {
    const ok = await confirm({
      title: 'Delete Gemini Key',
      message: 'Remove this API key from rotation?',
      confirmText: 'Remove Key',
      danger: true,
    })
    if (!ok) return
    try {
      await persistGeminiKeys(geminiKeys.filter((_, i) => i !== index))
      toast.success('API key deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete key'))
    }
  }

  function maskKey(k) {
    if (k.length <= 10) return k
    return `${k.slice(0, 6)}…${k.slice(-4)}`
  }

  async function updateSettingValue(setting, text) {
    try {
      await saveSetting(setting.key, textToValue(text))
      toast.success(`Saved "${setting.key}"`)
      load()
    } catch (err) {
      toast.error(apiError(err, 'Could not save setting'))
    }
  }

  async function renameSetting(setting) {
    const newName = await promptText({
      title: 'Rename Setting',
      message: `Rename "${setting.key}" to:`,
      defaultValue: setting.key,
      confirmText: 'Rename',
    })
    if (!newName || newName === setting.key) return
    try {
      await api.patch(`/admin/settings/${encodeURIComponent(setting.key)}/rename`, { newKey: newName })
      toast.success('Renamed setting')
      load()
    } catch (err) {
      toast.error(apiError(err, 'Could not rename'))
    }
  }

  async function deleteSetting(key) {
    const ok = await confirm({
      title: 'Delete Setting',
      message: `Delete the "${key}" setting?`,
      confirmText: 'Delete Setting',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/admin/settings/${encodeURIComponent(key)}`)
      toast.success('Deleted setting')
      load()
    } catch (err) {
      toast.error(apiError(err, 'Could not delete'))
    }
  }

  async function addSetting(e) {
    e.preventDefault()
    if (!newKey.trim()) return
    try {
      await saveSetting(newKey.trim(), textToValue(newValue))
      setNewKey('')
      setNewValue('')
      toast.success('Setting added')
      load()
    } catch (err) {
      toast.error(apiError(err, 'Could not add setting'))
    }
  }

  if (loading) return <main className="page-center muted">Loading admin panel…</main>

  const MANAGED_KEYS = ['gemini_api_keys', 'verificationRequired', 'hide_theme_toggle', 'cert_signatory_name', 'cert_signatory_title', 'cert_signature_image']
  const customSettings = settings.filter((s) => !MANAGED_KEYS.includes(s.key))

  return (
    <main className="container" style={{ maxWidth: '1000px' }}>
      {/* Section Head with Theme Switcher Control for Admin */}
      <div className="section-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="badge-glow" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={13} /> Administrative Operations
            </span>
          </div>
          <h2>Admin Command Control</h2>
          <p>Manage system credentials, user accounts, and platform configurations.</p>
        </div>


      </div>

      {/* Security & Interface Controls */}
      <section className="panel" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={18} style={{ color: 'var(--accent-primary)' }} /> Platform &amp; Interface Controls
        </h3>

        <label className="switch-row">
          <span className="switch">
            <input
              type="checkbox"
              checked={verifyRequired}
              onChange={(e) => onToggleVerifyRequired(e.target.checked)}
              disabled={savingVerification}
            />
            <span className="switch-track" />
          </span>
          <span className="switch-copy">
            <strong>Require email verification before login</strong>
            <span className="muted small">
              New candidates must confirm their email with an OTP before they can reach the dashboard.
            </span>
          </span>
        </label>
      </section>

      {/* Milestone credentials: create, edit, retire, and choose each layout. */}
      <CertificateManager />

      {/* Certificate Signature Control */}
      <section className="panel" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={18} style={{ color: 'var(--accent-primary)' }} /> Certificate Authority Signature Control
        </h3>
        <p className="muted small" style={{ marginBottom: '1.2rem' }}>
          Upload or edit the official signature image, signatory name, and title rendered on all milestone certificates.
        </p>

        <form onSubmit={saveCertSignatureSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <span className="field-label" style={{ fontSize: '0.8rem' }}>Signatory Name</span>
              <input
                value={certSignatoryName}
                onChange={(e) => setCertSignatoryName(e.target.value)}
                placeholder="Mohd Zaid"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <span className="field-label" style={{ fontSize: '0.8rem' }}>Signatory Title</span>
              <input
                value={certSignatoryTitle}
                onChange={(e) => setCertSignatoryTitle(e.target.value)}
                placeholder="Global Director of Candidate Assessments, MockMate AI"
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <span className="field-label" style={{ fontSize: '0.8rem' }}>Signature Image (PNG / SVG Data URL or Image Link)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <input
                value={certSignatureImage}
                onChange={(e) => setCertSignatureImage(e.target.value)}
                placeholder="Paste Image URL or click Upload button"
                style={{ flex: 1 }}
              />
              <label className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {certSignatureImage && (
            <div style={{ padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="muted small">Signature Preview:</span>
              <img src={certSignatureImage} alt="Signature Preview" style={{ maxHeight: '42px', objectFit: 'contain' }} />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save size={16} /> Save Signature Settings
          </button>
        </form>
      </section>

      {/* Gemini Keys Pool */}
      <section className="panel" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <KeyRound size={18} style={{ color: 'var(--accent-primary)' }} /> Gemini API Key Pool ({geminiKeys.length})
        </h3>
        <p className="muted small" style={{ marginBottom: '1.2rem' }}>
          API keys are rotated automatically. Get free keys at{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>.
        </p>

        {geminiKeys.length === 0 ? (
          <p className="muted small" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>No keys configured. Add a key below.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.2rem' }}>
            {geminiKeys.map((k, i) => (
              <div key={i} className="admin-row key-row">
                <div className="admin-row-main">
                  <span className="tag-soft mono">#{i + 1}</span>
                  <code className="mono" style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{maskKey(k)}</code>
                </div>
                <button
                  className="icon-btn icon-btn-danger"
                  onClick={() => removeGeminiKey(i)}
                  title="Delete key"
                  aria-label={`Delete key ${i + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={addGeminiKey} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <input
            value={newGeminiKey}
            onChange={(e) => setNewGeminiKey(e.target.value)}
            placeholder="Paste a Gemini API key (AIza…)"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Add Key
          </button>
        </form>
      </section>

      {/* User Management */}
      <section className="panel" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={18} style={{ color: 'var(--accent-primary)' }} /> Registered Candidates ({users.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {users.map((u) => {
            const isMe = u._id === me?.id
            return (
              <div key={u._id} className="admin-row">
                <div className="admin-row-main">
                  <Avatar src={u.avatar} name={u.name} size={38} />
                  <div className="admin-row-name">
                    <strong>
                      {u.name}
                      {isMe && <span className="pill">You</span>}
                    </strong>
                    <span className="mono admin-row-email">{u.email}</span>
                  </div>
                </div>

                <div className="admin-row-actions">
                  <span className={`pill ${u.role === 'admin' ? 'pill-admin' : ''}`}>{u.role}</span>
                  <span className={`pill ${u.isVerified ? 'pill-good' : 'pill-bad'}`}>
                    {u.isVerified ? 'Verified' : 'Unverified'}
                  </span>

                  <button className="btn btn-secondary btn-sm" onClick={() => toggleVerified(u)}>
                    {u.isVerified ? 'Unverify' : 'Verify'}
                  </button>

                  {!isMe && (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => toggleRole(u)}
                        title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                        aria-label={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                      >
                        {u.role === 'admin' ? <ShieldMinus size={15} /> : <ShieldPlus size={15} />}
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        onClick={() => deleteUser(u)}
                        title="Delete user"
                        aria-label={`Delete ${u.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Custom Settings */}
      <section className="panel">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Settings size={18} style={{ color: 'var(--accent-primary)' }} /> System Settings &amp; Flags
        </h3>

        {customSettings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.2rem' }}>
            {customSettings.map((s) => (
              <SettingRow
                key={s.key}
                setting={s}
                onSave={updateSettingValue}
                onRename={renameSetting}
                onDelete={deleteSetting}
              />
            ))}
          </div>
        )}

        <form onSubmit={addSetting} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Setting key (e.g. siteName)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            style={{ flex: 1, minWidth: '150px' }}
          />
          <input
            placeholder="Setting value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            style={{ flex: 1, minWidth: '150px' }}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Add Setting
          </button>
        </form>
      </section>
    </main>
  )
}

function SettingRow({ setting, onSave, onRename, onDelete }) {
  const [text, setText] = useState(valueToText(setting.value))

  return (
    <div className="admin-row">
      <span className="mono" style={{ fontWeight: 700, fontSize: '0.88rem', minWidth: '120px' }}>{setting.key}</span>
      <input value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1, minWidth: '160px' }} />
      <div className="admin-row-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onSave(setting, text)}>
          <Save size={14} /> Save
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onRename(setting)}>
          Rename
        </button>
        <button
          className="icon-btn icon-btn-danger"
          onClick={() => onDelete(setting.key)}
          title="Delete setting"
          aria-label={`Delete ${setting.key}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
