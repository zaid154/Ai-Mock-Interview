import { Trash2, Save, Plus, KeyRound, Upload } from 'lucide-react'
import ApiKeyManager from './ApiKeyManager'
import EmailManager from './EmailManager'

function formatDisplay(val, valueToText) {
  const txt = valueToText(val)
  if (typeof txt === 'string' && txt.startsWith('data:image/')) return '[Base64 Image Attached]'
  if (typeof txt === 'string' && txt.length > 60) return txt.slice(0, 60) + '…'
  return txt
}

const MANAGED_KEYS = ['gemini_api_keys', 'verificationRequired', 'cert_signatory_name', 'cert_signatory_title', 'cert_signature_image']

/**
 * AdminSettingsTab: AI Load Balancer, verification gate, signatory info, and custom key-value store.
 */
export default function AdminSettingsTab({
  geminiKeys, newGeminiKey, setNewGeminiKey, newKeyLabel, setNewKeyLabel, addGeminiKey, removeGeminiKey,
  envKeysCount = 0, verifyRequired, savingVerification, toggleVerifyRequired,
  certSignatoryName, setCertSignatoryName, certSignatoryTitle, setCertSignatoryTitle,
  certSignatureImage, setCertSignatureImage, saveSignatorySettings, handleSignatureUpload,
  newKey, setNewKey, newValue, setNewValue, addSetting,
  settings, valueToText, renameKey, editValue, deleteSetting,
}) {
  const customSettings = settings.filter((s) => !MANAGED_KEYS.includes(s.key))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. AI API Load Balancer & Live Health Monitor */}
      <ApiKeyManager
        geminiKeys={geminiKeys}
        newGeminiKey={newGeminiKey}
        setNewGeminiKey={setNewGeminiKey}
        newKeyLabel={newKeyLabel}
        setNewKeyLabel={setNewKeyLabel}
        addGeminiKey={addGeminiKey}
        removeGeminiKey={removeGeminiKey}
        envKeysCount={envKeysCount}
      />

      {/* 2. Email Delivery Channels & Live Diagnostic Testing */}
      <EmailManager />

      {/* 2. Verification Gate */}
      <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="panel-title" style={{ margin: 0 }}>Require Email Verification on Signup</h3>
          <p className="muted small" style={{ margin: 0 }}>Forces candidates to verify via 6-digit OTP before logging in.</p>
        </div>
        <button type="button" className={`btn ${verifyRequired ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={toggleVerifyRequired} disabled={savingVerification}>
          {verifyRequired ? 'Active (Required)' : 'Disabled (Optional)'}
        </button>
      </div>

      {/* 3. Certificate Signatory */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="panel-title" style={{ margin: 0 }}>Certificate Signatory Settings</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={saveSignatorySettings}><Save size={14} /> Save Signatory</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="field">
            <span className="field-label">Signatory Name</span>
            <input value={certSignatoryName} onChange={(e) => setCertSignatoryName(e.target.value)} placeholder="Mohd Zaid" />
          </div>
          <div className="field">
            <span className="field-label">Signatory Title</span>
            <input value={certSignatoryTitle} onChange={(e) => setCertSignatoryTitle(e.target.value)} placeholder="Director of Assessments" />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <span className="field-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Official Signature (Used on Certificates)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {certSignatureImage ? (
              <div style={{ padding: '0.35rem 0.85rem', background: '#ffffff', borderRadius: '8px', display: 'inline-flex', alignItems: 'center' }}>
                <img src={certSignatureImage} alt="Signature Preview" style={{ maxHeight: '38px', maxWidth: '160px', objectFit: 'contain' }} />
              </div>
            ) : <span className="muted small">No signature image uploaded</span>}
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={13} /> Upload Signature (PNG)
              <input type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleSignatureUpload} />
            </label>
            {certSignatureImage && (
              <button type="button" className="btn btn-ghost btn-xs text-bad" onClick={() => setCertSignatureImage('')}>
                Remove Signature
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Custom Platform Configuration Store */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <h3 className="panel-title">Custom Platform Configuration</h3>
        <p className="muted small" style={{ margin: '0 0 1rem' }}>Store optional custom key-value parameters across the application.</p>
        <form onSubmit={addSetting} style={{ display: 'flex', gap: '0.6rem', margin: '0 0 1.25rem', flexWrap: 'wrap' }}>
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Key (e.g. app_announcement)" style={{ flex: 1, minWidth: '160px' }} required />
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Value" style={{ flex: 2, minWidth: '200px' }} />
          <button type="submit" className="btn btn-primary btn-sm"><Plus size={14} /> Add</button>
        </form>

        {customSettings.length === 0 ? (
          <p className="muted small" style={{ margin: 0, fontStyle: 'italic' }}>No custom parameters defined yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '32%', whiteSpace: 'nowrap' }}>Key</th>
                  <th style={{ width: '54%' }}>Value</th>
                  <th style={{ width: '14%', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {customSettings.map((s) => (
                  <tr key={s._id}>
                    <td className="mono small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <button type="button" className="link-btn" onClick={() => renameKey(s.key)} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>{s.key}</button>
                    </td>
                    <td className="mono small" onClick={() => editValue(s)} style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }} title={typeof s.value === 'string' ? s.value : JSON.stringify(s.value)}>
                      {formatDisplay(s.value, valueToText)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="admin-delete-btn" onClick={() => deleteSetting(s.key)} title="Delete setting"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
