import { Lock } from 'lucide-react'

function getPasswordStrength(pwd) {
  if (!pwd) return { label: 'None', score: 0, color: 'bg-slate-200' }
  if (pwd.length < 6) return { label: 'Weak', score: 33, color: 'bg-rose-500' }
  if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Strong', score: 100, color: 'bg-emerald-500' }
  return { label: 'Medium', score: 66, color: 'bg-amber-500' }
}

export default function ProfileSecurity({
  currentPassword, setCurrentPassword, newPassword, setNewPassword,
  confirmPassword, setConfirmPassword, handleChangePassword, onChangePassword, savingPassword,
}) {
  const strength = getPasswordStrength(newPassword)
  const onSubmit = onChangePassword || handleChangePassword

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Password &amp; Security
        </h2>
        <p className="text-xs text-slate-500 m-0">
          Ensure your account uses a secure password with uppercase letters, numbers, and symbols.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-xl">
        <div>
          <label htmlFor="sec-current-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Current Password
          </label>
          <input
            id="sec-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
          />
        </div>

        <div>
          <label htmlFor="sec-new-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            New Password
          </label>
          <input
            id="sec-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
          />
          {newPassword && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="sec-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm New Password
          </label>
          <input
            id="sec-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-start">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            <Lock size={14} />
            <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
