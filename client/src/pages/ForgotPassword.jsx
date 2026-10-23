import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function sendCode(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
      toast.success('Security code sent! Check your inbox.')
      setStep(2)
    } catch (err) {
      toast.error(apiError(err, 'Could not send reset code'))
    } finally {
      setBusy(false)
    }
  }

  async function resetPassword(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { email: email.trim().toLowerCase(), otp, newPassword })
      toast.success('Password updated successfully! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(apiError(err, 'Could not reset password'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50 py-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column */}
        <div className="p-8 sm:p-10 bg-slate-900 text-white flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 p-1 bg-slate-800">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                MockMate <span className="text-blue-400 font-extrabold text-xs">AI</span>
              </span>
            </Link>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 text-white">
              Account Recovery
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Verify your identity with a 6-digit one-time code to update your account password.
            </p>

            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                <span>6-digit email verification code</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                <span>Encrypted password update</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                <span>Automatic session security</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-blue-400" />
            <span>Secure candidate identity verification</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm uppercase tracking-wider mb-2">
              Step 0{step} of 02
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              {step === 1 ? 'Forgot Password?' : 'Enter 6-Digit Code'}
            </h1>
            <p className="text-xs text-slate-500">
              {step === 1 ? 'Enter your registered email address to receive a security reset code.' : `Enter the code sent to ${email} along with your new password.`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={sendCode} className="flex flex-col gap-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {busy ? 'Sending code…' : <>Send Reset Code <ArrowRight size={14} /></>}
              </button>

              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600">
                  <ArrowLeft size={13} /> Back to Sign in
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="flex flex-col gap-4">
              <div>
                <label htmlFor="reset-otp" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reset-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reset-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reset-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {busy ? 'Updating password…' : <>Reset Password <ArrowRight size={14} /></>}
              </button>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Change email
                </button>
                <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
