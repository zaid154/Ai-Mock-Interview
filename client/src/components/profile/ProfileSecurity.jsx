import { Lock } from 'lucide-react'

function getPasswordStrength(pwd) {
  if (!pwd) return { label: 'None', score: 0, color: 'var(--text-subtle)' }
  if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'var(--bad)' }
  if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Strong', score: 100, color: 'var(--good)' }
  return { label: 'Medium', score: 66, color: 'var(--warn)' }
}

/**
 * ProfileSecurity: Clean password update form with real-time strength meter.
 */
export default function ProfileSecurity({
  currentPassword, setCurrentPassword, newPassword, setNewPassword,
  confirmPassword, setConfirmPassword, handleChangePassword, savingPassword,
}) {
  const strength = getPasswordStrength(newPassword)

  return (
    <div className="panel" style={{ maxWidth: '580px', margin: '0 auto' }}>
      <h3 className="panel-title">Change Password</h3>
      <p className="muted small panel-hint">
        Use at least 8 characters with a capital letter and a number.
      </p>

      <form onSubmit={handleChangePassword}>
        <div className="field">
          <span className="field-label">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="field">
          <span className="field-label">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          {newPassword && (
            <div className="pw-strength">
              <div className="pw-strength-track">
                <div className="pw-strength-fill" style={{ width: `${strength.score}%`, background: strength.color }} />
              </div>
              <span className="small" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>

        <div className="field">
          <span className="field-label">Confirm new password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={savingPassword}>
          <Lock size={16} /> {savingPassword ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
