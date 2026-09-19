import { Trash2, Save, Plus, KeyRound } from 'lucide-react'

/**
 * AdminSettingsTab: Gemini keys, verification gate, signatory info, and key-value store.
 */
export default function AdminSettingsTab({
  geminiKeys, newGeminiKey, setNewGeminiKey, addGeminiKey, removeGeminiKey,
  verifyRequired, savingVerification, toggleVerifyRequired,
  certSignatoryName, setCertSignatoryName, certSignatoryTitle, setCertSignatoryTitle,
  certSignatureImage, setCertSignatureImage, saveSignatorySettings,
  newKey, setNewKey, newValue, setNewValue, addSetting,
  settings, valueToText, renameKey, editValue, deleteSetting,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Gemini Keys */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <KeyRound size={18} style={{ color: 'var(--accent-primary)' }} /> Gemini API Keys (Rotation &amp; Cooldown)
        </h3>
        <p className="muted small" style={{ marginBottom: '1rem' }}>
          Fallback keys rotated automatically with 60s cooldown if a key exhausts quota.
        </p>

        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input value={newGeminiKey} onChange={(e) => setNewGeminiKey(e.target.value)} placeholder="AIzaSy..." style={{ flex: 1, minWidth: '240px', fontFamily: 'var(--font-mono)' }} />
          <button type="button" className="btn btn-primary btn-sm" onClick={addGeminiKey}><Plus size={14} /> Add Key</button>
        </div>

        {geminiKeys.map((k, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.8rem', background: 'var(--surface-2)', borderRadius: '6px', marginBottom: '0.4rem' }}>
            <span className="mono small">{k.slice(0, 8)}••••••••{k.slice(-4)}</span>
            <button type="button" className="btn btn-ghost btn-xs text-bad" onClick={() => removeGeminiKey(i)} title="Remove"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

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
      </div>

      {/* 4. Platform Settings */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <h3 className="panel-title">System Settings Key-Value Store</h3>
        <form onSubmit={addSetting} style={{ display: 'flex', gap: '0.6rem', margin: '1rem 0 1.25rem', flexWrap: 'wrap' }}>
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Key (e.g. app_name)" style={{ flex: 1, minWidth: '150px' }} required />
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Value" style={{ flex: 2, minWidth: '200px' }} />
          <button type="submit" className="btn btn-primary btn-sm"><Plus size={14} /> Add</button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Key</th><th>Value</th><th>Action</th></tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s._id}>
                  <td className="mono small"><button type="button" className="link-btn" onClick={() => renameKey(s.key)}>{s.key}</button></td>
                  <td className="mono small" onClick={() => editValue(s)} style={{ cursor: 'pointer' }}>{valueToText(s.value)}</td>
                  <td><button type="button" className="btn btn-ghost btn-xs text-bad" onClick={() => deleteSetting(s.key)}><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
