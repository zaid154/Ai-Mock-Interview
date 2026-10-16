import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useConfirm } from '../components/ConfirmDialog'
import AdminNav from '../components/admin/AdminNav'
import AdminSettingsTab from '../components/admin/AdminSettingsTab'

function valueToText(val) { return typeof val === 'string' ? val : JSON.stringify(val) }
function textToValue(txt) { try { return JSON.parse(txt) } catch { return txt } }

/**
 * AdminSettings: Dedicated platform administration sub-page for system and security settings.
 */
export default function AdminSettings() {
  const { confirm, promptText } = useConfirm()

  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifyRequired, setVerifyRequired] = useState(false)
  const [savingVerification, setSavingVerification] = useState(false)
  const [geminiKeys, setGeminiKeys] = useState([])
  const [envKeysCount, setEnvKeysCount] = useState(0)
  const [newKeyLabel, setNewKeyLabel] = useState('')
  const [newGeminiKey, setNewGeminiKey] = useState('')
  const [certSignatoryName, setCertSignatoryName] = useState('Mohd Zaid')
  const [certSignatoryTitle, setCertSignatoryTitle] = useState('Director of Candidate Assessments, MockMate AI')
  const [certSignatureImage, setCertSignatureImage] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  async function loadSettings() {
    try {
      const { data } = await api.get('/admin/settings')
      const s = data.settings || []
      setSettings(s)
      setEnvKeysCount(data.envKeysCount || 0)
      const vr = s.find((x) => x.key === 'verificationRequired')
      setVerifyRequired(vr?.value === true)
      const gk = s.find((x) => x.key === 'gemini_api_keys')
      setGeminiKeys(Array.isArray(gk?.value) ? gk.value : [])
      const cName = s.find((x) => x.key === 'cert_signatory_name')
      if (cName?.value) setCertSignatoryName(cName.value)
      const cTitle = s.find((x) => x.key === 'cert_signatory_title')
      if (cTitle?.value) setCertSignatoryTitle(cTitle.value)
      const cImg = s.find((x) => x.key === 'cert_signature_image')
      if (cImg?.value) setCertSignatureImage(cImg.value)
    } catch (err) {
      toast.error(apiError(err, 'Could not load platform settings'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  async function toggleVerifyRequired() {
    setSavingVerification(true)
    const next = !verifyRequired
    try {
      await api.put('/admin/settings', { key: 'verificationRequired', value: next })
      setVerifyRequired(next)
      toast.success(next ? 'Email verification mandatory' : 'Email verification optional')
    } catch (err) {
      toast.error(apiError(err, 'Could not update verification requirement'))
    } finally {
      setSavingVerification(false)
    }
  }

  async function addGeminiKey() {
    const k = newGeminiKey.trim()
    if (!k) return toast.error('Please enter an API key')
    const label = newKeyLabel.trim() || `Key #${geminiKeys.length + 1}`
    const keyExists = geminiKeys.some((item) => (typeof item === 'object' ? item.key : item) === k)
    if (keyExists) return toast.error('This key is already added')
    const updated = [...geminiKeys, { label, key: k }]
    try {
      await api.put('/admin/settings', { key: 'gemini_api_keys', value: updated })
      setGeminiKeys(updated)
      setNewGeminiKey('')
      setNewKeyLabel('')
      toast.success('Gemini API key added')
    } catch (err) {
      toast.error(apiError(err, 'Could not save Gemini key'))
    }
  }

  async function removeGeminiKey(idx) {
    const updated = geminiKeys.filter((_, i) => i !== idx)
    try {
      await api.put('/admin/settings', { key: 'gemini_api_keys', value: updated })
      setGeminiKeys(updated)
      toast.success('Gemini key removed')
    } catch (err) {
      toast.error(apiError(err, 'Could not remove Gemini key'))
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
      toast.error(apiError(err, 'Could not save signatory information'))
    }
  }

  function handleSignatureUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file (PNG/JPG)')
    const reader = new FileReader()
    reader.onload = () => {
      setCertSignatureImage(reader.result)
      toast.success('Signature loaded. Click "Save Signatory" to apply.')
    }
    reader.readAsDataURL(file)
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
    const newName = await promptText({ title: 'Rename setting key', message: 'New key name:', defaultValue: oldKey, confirmText: 'Rename' })
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

  if (loading) return <main className="page-center muted">Loading administrator settings…</main>

  return (
    <main className="container" style={{ paddingTop: '1.25rem', paddingBottom: '3.5rem' }}>
      <AdminNav />
      <AdminSettingsTab
        geminiKeys={geminiKeys} newGeminiKey={newGeminiKey} setNewGeminiKey={setNewGeminiKey}
        newKeyLabel={newKeyLabel} setNewKeyLabel={setNewKeyLabel} addGeminiKey={addGeminiKey} removeGeminiKey={removeGeminiKey}
        envKeysCount={envKeysCount} verifyRequired={verifyRequired} savingVerification={savingVerification} toggleVerifyRequired={toggleVerifyRequired}
        certSignatoryName={certSignatoryName} setCertSignatoryName={setCertSignatoryName} certSignatoryTitle={certSignatoryTitle} setCertSignatoryTitle={setCertSignatoryTitle}
        certSignatureImage={certSignatureImage} setCertSignatureImage={setCertSignatureImage} saveSignatorySettings={saveSignatorySettings} handleSignatureUpload={handleSignatureUpload}
        newKey={newKey} setNewKey={setNewKey} newValue={newValue} setNewValue={setNewValue} addSetting={addSetting}
        settings={settings} valueToText={valueToText} renameKey={renameKey} editValue={editValue} deleteSetting={deleteSetting}
      />
    </main>
  )
}
