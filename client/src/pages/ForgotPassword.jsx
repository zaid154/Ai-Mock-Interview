import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = request OTP, 2 = verify & reset
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
  })

  function set(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (step === 1) {
        const { data } = await api.post('/auth/forgot-password', { email: form.email })
        if (data.devOtp) {
          toast.success(`Reset code: ${data.devOtp}`, { duration: 10000 })
        } else {
          toast.success('Reset code sent to your email!')
        }
        setStep(2)
      } else {
        await api.post('/auth/reset-password', {
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        })
        toast.success('Password reset successfully! You can now sign in.')
        navigate('/login')
      }
    } catch (err) {
      toast.error(apiError(err, 'Failed to process request'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-50">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Hero */}
        <div className="relative hidden md:flex flex-col justify-between p-6 sm:p-8 text-white bg-slate-950">
          <img src="/forgot-hero.jpg" alt="MockMate AI" className="absolute inset-0 w-full h-full object-cover object-top opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <Link to="/" className="relative z-10 inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 p-1 bg-white/10 backdrop-blur-md shadow-md">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-white drop-shadow-sm">MockMate <span className="text-blue-400 text-xs">AI</span></span>
          </Link>
          <div className="relative z-10">
            <h3 className="font-semibold text-sm drop-shadow-sm">Prepare for your next technical round</h3>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed drop-shadow-sm">Realistic coding simulations with real-time AI feedback.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-6 sm:p-7 md:p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-wide">STEP 0{step} OF 02</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{step === 1 ? 'Forgot Password?' : 'Enter 6-Digit Code'}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1 ? 'Enter your registered email address to receive a reset code.' : `Enter the 6-digit code sent to ${form.email}.`}
            </p>

            <form onSubmit={submit} className="mt-4 space-y-3">
              {step === 1 ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={form.otp}
                      onChange={e => set('otp', e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      minLength={6}
                      required
                      value={form.newPassword}
                      onChange={e => set('newPassword', e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer mt-1"
              >
                {busy ? 'Please wait...' : step === 1 ? 'Send Reset Code →' : 'Reset Password →'}
              </button>
            </form>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
                ← Change email
              </button>
            ) : (
              <Link to="/login" className="text-slate-500 hover:text-blue-600">
                ← Back to Sign in
              </Link>
            )}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
