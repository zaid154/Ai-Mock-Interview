import { Lock } from 'lucide-react'

function getPasswordStrength(pwd) {
  if (!pwd) return { label: 'None', score: 0, color: 'var(--text-subtle)' }
  if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'var(--bad)' }
  if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Strong', score: 100, color: 'var(--good)' }
  return { label: 'Medium', score: 66, color: 'var(--warn)' }
}

export default function ProfileSecurity({
  currentPassword, setCurrentPassword, newPassword, setNewPassword,
  confirmPassword, setConfirmPassword, handleChangePassword, onChangePassword, savingPassword,
}) {
  const strength = getPasswordStrength(newPassword)
  const onSubmit = onChangePassword || handleChangePassword

  return (
    <div className="panel" style={{ maxWidth: '580px', margin: '0 auto' }}>
      <h2 className="panel-title" style={{ fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Change Password</h2>
      <p className="muted small panel-hint">
        Use at least 8 characters with an uppercase letter and a number.
      </p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="sec-current-password" className="field-label">Current password</label>
          <input
            id="sec-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="sec-new-password" className="field-label">New password</label>
          <input
            id="sec-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
          {newPassword && (
            <div className="pw-strength">
              <div
                className="pw-strength-track"
                role="progressbar"
                aria-valuenow={strength.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Password strength: ${strength.label}`}
              >
                <div className="pw-strength-fill" style={{ width: `${strength.score}%`, background: strength.color }} />
              </div>
              <span className="small" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="sec-confirm-password" className="field-label">Confirm new password</label>
          <input
            id="sec-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={savingPassword}>
          <Lock size={16} aria-hidden="true" /> {savingPassword ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
