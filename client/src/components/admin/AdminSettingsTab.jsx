import { Trash2, Save, Plus, KeyRound } from 'lucide-react'

/**
 * AdminSettingsTab Component
 * 
 * Manages dynamic runtime platform settings:
 * 1. Gemini AI multi-key array management
 * 2. Onboarding email verification enforcement toggle
 * 3. Official certificate signatory credentials & signature image
 * 4. Arbitrary dynamic system key-value storage
 */
export default function AdminSettingsTab({
  geminiKeys,
  newGeminiKey,
  setNewGeminiKey,
  addGeminiKey,
  removeGeminiKey,
  verifyRequired,
  savingVerification,
  toggleVerifyRequired,
  certSignatoryName,
  setCertSignatoryName,
  certSignatoryTitle,
  setCertSignatoryTitle,
  certSignatureImage,
  setCertSignatureImage,
  saveSignatorySettings,
  newKey,
  setNewKey,
  newValue,
  setNewValue,
  addSetting,
  settings,
  valueToText,
  renameKey,
  editValue,
  deleteSetting,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Gemini API Keys Multi-Key Rotation Manager */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <KeyRound size={18} style={{ color: 'var(--accent-primary)' }} />
          Gemini API Keys (Multi-Key Rotation &amp; Cooldown)
        </h3>
        <p className="muted small" style={{ marginBottom: '1.25rem' }}>
          Add fallback Gemini API keys. The engine rotates through them and triggers a 60s circuit breaker if a key exhausts quota (HTTP 429).
        </p>

        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <input
            value={newGeminiKey}
            onChange={(e) => setNewGeminiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{ flex: 1, minWidth: '240px', fontFamily: 'var(--font-mono)' }}
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={addGeminiKey}>
            <Plus size={14} /> Add Key
          </button>
        </div>

        {geminiKeys.length === 0 ? (
          <p className="subtle small">No extra keys stored. Using default GEMINI_API_KEY from .env.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {geminiKeys.map((k, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.55rem 0.9rem',
                  background: 'var(--surface-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <span className="mono small">{k.slice(0, 8)}••••••••{k.slice(-4)}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-bad"
                  onClick={() => removeGeminiKey(i)}
                  title="Remove key"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Verification Required Gate */}
      <div className="panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="panel-title">Require Email Verification on Signup</h3>
          <p className="muted small" style={{ margin: 0 }}>
            When active, candidates must verify via 6-digit email OTP before logging in.
          </p>
        </div>
        <button
          type="button"
          className={`btn ${verifyRequired ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={toggleVerifyRequired}
          disabled={savingVerification}
        >
          {verifyRequired ? 'Active (Required)' : 'Disabled (Optional)'}
        </button>
      </div>

      {/* 3. Certificate Signatory Configuration */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="panel-title">Certificate Signatory Settings</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Credentials printed on generated candidate milestone certificates.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={saveSignatorySettings}>
            <Save size={14} /> Save Signatory
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="field">
            <span className="field-label">Signatory Full Name</span>
            <input
              value={certSignatoryName}
              onChange={(e) => setCertSignatoryName(e.target.value)}
              placeholder="Mohd Zaid"
            />
          </div>

          <div className="field">
            <span className="field-label">Signatory Title</span>
            <input
              value={certSignatoryTitle}
              onChange={(e) => setCertSignatoryTitle(e.target.value)}
              placeholder="Global Director of Candidate Assessments"
            />
          </div>

          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <span className="field-label">Signature Image Data URL (Optional)</span>
            <input
              value={certSignatureImage}
              onChange={(e) => setCertSignatureImage(e.target.value)}
              placeholder="data:image/png;base64,..."
            />
          </div>
        </div>
      </div>

      {/* 4. Dynamic Platform Settings Table */}
      <div className="panel" style={{ padding: '1.5rem' }}>
        <h3 className="panel-title">System Settings Key-Value Store</h3>
        <p className="muted small" style={{ marginBottom: '1.25rem' }}>
          Dynamic platform settings stored in MongoDB without fixed schemas.
        </p>

        <form onSubmit={addSetting} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key (e.g. app_name)"
            style={{ flex: 1, minWidth: '160px' }}
            required
          />
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value (string, number, or JSON)"
            style={{ flex: 2, minWidth: '220px' }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <Plus size={14} /> Add Setting
          </button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s._id}>
                  <td className="mono small" style={{ fontWeight: 600 }}>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => renameKey(s.key)}
                      title="Click to rename key"
                    >
                      {s.key}
                    </button>
                  </td>
                  <td className="mono small" style={{ maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span onClick={() => editValue(s)} style={{ cursor: 'pointer' }} title="Click to edit value">
                      {valueToText(s.value)}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-bad"
                      onClick={() => deleteSetting(s.key)}
                      title="Delete setting"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
