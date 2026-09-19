import { Lock, ShieldCheck, Check, Circle } from 'lucide-react'

function CheckItem({ done, children }) {
  return (
    <li className={done ? 'done' : ''}>
      <span className="check-mark">{done ? <Check size={12} /> : <Circle size={7} />}</span>
      <span>{children}</span>
    </li>
  )
}

function getPasswordStrength(pwd) {
  if (!pwd) return { label: 'None', score: 0, color: 'var(--text-subtle)' }
  if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'var(--bad)' }
  if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
    return { label: 'Strong', score: 100, color: 'var(--good)' }
  }
  return { label: 'Medium', score: 66, color: 'var(--warn)' }
}

/**
 * ProfileSecurity Component
 * 
 * Handles password updates and account security checklists.
 */
export default function ProfileSecurity({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangePassword,
  savingPassword,
  user,
}) {
  const strength = getPasswordStrength(newPassword)

  return (
    <div className="profile-panes">
      <div className="panel">
        <h3 className="panel-title">Change password</h3>
        <p className="muted small panel-hint">
          Use at least 8 characters with a capital letter and a number for a strong password.
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
                <span className="small" style={{ color: strength.color }}>
                  {strength.label}
                </span>
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

      <aside className="panel profile-aside">
        <h3 className="panel-title">
          <ShieldCheck size={16} /> Account status
        </h3>
        <p className="muted small panel-hint">Where this account stands right now.</p>

        <ul className="check-list">
          <CheckItem done={Boolean(user?.isEmailVerified)}>
            Email {user?.isEmailVerified ? 'verified' : 'not verified yet'}
          </CheckItem>
          <CheckItem done={newPassword.length >= 8}>At least 8 characters</CheckItem>
          <CheckItem done={/[A-Z]/.test(newPassword)}>One capital letter</CheckItem>
          <CheckItem done={/[0-9]/.test(newPassword)}>One number</CheckItem>
          <CheckItem done={Boolean(newPassword) && newPassword === confirmPassword}>
            Both new entries match
          </CheckItem>
        </ul>
      </aside>
    </div>
  )
}
