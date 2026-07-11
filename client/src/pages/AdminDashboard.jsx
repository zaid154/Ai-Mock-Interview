import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2, Save, Plus, KeyRound, ShieldPlus, ShieldMinus } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'

// Turn a setting value into text for an input, and back again. We try JSON first
// (so booleans/arrays round-trip), and fall back to a plain string.
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

  // dedicated controls
  const [verifyRequired, setVerifyRequired] = useState(false)
  const [savingVerification, setSavingVerification] = useState(false)
  const [geminiKeys, setGeminiKeys] = useState([]) // array of API keys
  const [newGeminiKey, setNewGeminiKey] = useState('')

  // new-setting row
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
    } catch (err) {
      toast.error(apiError(err, 'Could not load admin data'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ── Users ──
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
      title: 'Delete user',
      message: `Permanently delete ${user.email}? This can't be undone.`,
      confirmText: 'Delete',
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

  // ── Settings helpers ──
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
      toast.error(apiError(err, 'Could not save the setting'))
    } finally {
      setSavingVerification(false)
    }
  }

  // Save the full key list to the DB, updating local state on success.
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
      toast.error(apiError(err, 'Could not add the key'))
    }
  }

  async function removeGeminiKey(index) {
    const ok = await confirm({
      title: 'Delete API key',
      message: 'Remove this Gemini API key?',
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await persistGeminiKeys(geminiKeys.filter((_, i) => i !== index))
      toast.success('API key deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete the key'))
    }
  }

  // Show only the ends of a key so it's identifiable but not fully exposed.
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
      toast.error(apiError(err, 'Could not save the setting'))
    }
  }

  async function renameSetting(setting) {
    const newName = await promptText({
      title: 'Rename setting',
      message: `Rename "${setting.key}" to:`,
      defaultValue: setting.key,
      confirmText: 'Rename',
    })
    if (!newName || newName === setting.key) return
    try {
      await api.patch(`/admin/settings/${encodeURIComponent(setting.key)}/rename`, { newKey: newName })
      toast.success('Renamed')
      load()
    } catch (err) {
      toast.error(apiError(err, 'Could not rename'))
    }
  }

  async function deleteSetting(key) {
    const ok = await confirm({
      title: 'Delete setting',
      message: `Delete the "${key}" setting?`,
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/admin/settings/${encodeURIComponent(key)}`)
      toast.success('Deleted')
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
      toast.success('Added')
      load()
    } catch (err) {
      toast.error(apiError(err, 'Could not add the setting'))
    }
  }

  if (loading) return <main className="page-center muted">Loading admin…</main>

  // Keys that have dedicated controls above — hidden from the free-form list.
  const MANAGED_KEYS = ['gemini_api_keys', 'verificationRequired']
  const customSettings = settings.filter((s) => !MANAGED_KEYS.includes(s.key))

  return (
    <main className="container admin">
      <h2>Admin panel</h2>

      {/* Verification requirement toggle */}
      <section className="panel">
        <h3>Email verification</h3>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={verifyRequired}
            onChange={(e) => onToggleVerifyRequired(e.target.checked)}
            disabled={savingVerification}
          />
          <span>
            Require email verification before login
            <br />
            <span className="muted small">
              Off: unverified users can still sign in. On: they must verify first.
            </span>
          </span>
        </label>
      </section>

      {/* Gemini API keys — add/remove individual keys. Auto-fallback tries them
          in order and skips a rate-limited key for a minute. */}
      <section className="panel">
        <h3>
          <KeyRound size={16} /> Gemini API keys
        </h3>
        <p className="muted small">
          Add one or more keys. Generation tries them in order and skips a rate-limited key for a
          minute. Get a free key at{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>
          .
        </p>

        {geminiKeys.length === 0 ? (
          <p className="muted small empty-hint">No keys yet — add one below to enable AI questions & quizzes.</p>
        ) : (
          <div className="key-list">
            {geminiKeys.map((k, i) => (
              <div className="key-row" key={i}>
                <span className="key-badge">#{i + 1}</span>
                <code className="key-val">{maskKey(k)}</code>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeGeminiKey(i)}
                  title="Delete key"
                  aria-label="Delete key"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form className="key-add" onSubmit={addGeminiKey}>
          <input
            value={newGeminiKey}
            onChange={(e) => setNewGeminiKey(e.target.value)}
            placeholder="Paste a Gemini API key (AIza…)"
          />
          <button className="btn btn-primary">
            <Plus size={16} /> Add key
          </button>
        </form>
      </section>

      {/* Users — a responsive card list (usable on mobile; the actions never
          scroll off-screen the way a wide table would). */}
      <section className="panel">
        <h3>Users ({users.length})</h3>
        <div className="user-list">
          {users.map((u) => (
            <div className="user-card" key={u._id}>
              <div className="user-info">
                <strong>{u.name}</strong>
                <span className="muted small">{u.email}</span>
              </div>
              <div className="user-meta">
                <span className="pill">{u.role}</span>
                <span className={u.isVerified ? 'pill good' : 'pill bad'}>
                  {u.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="row-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => toggleVerified(u)}>
                  {u.isVerified ? 'Unverify' : 'Verify'}
                </button>
                {u._id === me?.id ? (
                  <span className="muted small">you</span>
                ) : (
                  <>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleRole(u)}
                      title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                    >
                      {u.role === 'admin' ? <ShieldMinus size={15} /> : <ShieldPlus size={15} />}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteUser(u)} title="Delete user">
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom settings — anything except the two managed above (API keys /
          verification), which have their own controls. */}
      <section className="panel">
        <h3>Custom settings</h3>
        <p className="muted small">
          Extra key/value config for your own use (e.g. a site name or feature flag). API keys and
          email verification are managed in their own sections above.
        </p>

        {customSettings.length === 0 ? (
          <p className="muted small empty-hint">No custom settings yet. Add one below.</p>
        ) : (
          <div className="settings-list">
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

        <form className="setting-add" onSubmit={addSetting}>
          <input
            placeholder="key (e.g. siteName)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            placeholder="value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button className="btn btn-primary">
            <Plus size={16} /> Add
          </button>
        </form>
      </section>
    </main>
  )
}

// One editable settings row (its own draft state so typing doesn't refetch).
function SettingRow({ setting, onSave, onRename, onDelete }) {
  const [text, setText] = useState(valueToText(setting.value))

  return (
    <div className="setting-row">
      <span className="setting-key">{setting.key}</span>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="value" />
      <button className="btn btn-ghost btn-sm" onClick={() => onSave(setting, text)}>
        <Save size={15} /> Save
      </button>
      <button className="btn btn-ghost btn-sm" onClick={() => onRename(setting, text)}>
        Rename
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onDelete(setting.key)}
        title="Delete setting"
        aria-label="Delete setting"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
