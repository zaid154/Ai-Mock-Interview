import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MailCheck, ShieldCheck, Mail, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function OtpVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, establishSession, completeRegistration, requireEmailVerification, refreshVerificationSetting } = useAuth()
  const [email, setEmail] = useState(location.state?.email || user?.email || '')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(location.state?.otpSent ? 60 : 0)
  const [codeSent, setCodeSent] = useState(Boolean(location.state?.otpSent))

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  useEffect(() => { refreshVerificationSetting().catch(() => {}) }, [])

  async function verify(e) {
    e.preventDefault()
    if (!codeSent) return sendCode()
    setBusy(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp })
      if (!data.token && !data.user) {
        toast.success('Your email is already verified. Please sign in.')
        navigate('/login')
        return
      }
      establishSession(data)
      toast.success('Email verified successfully.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(apiError(err, 'Could not verify code'))
    } finally {
      setBusy(false)
    }
  }

  async function sendCode() {
    if (!email || cooldown > 0) return
    setBusy(true)
    try {
      const { data } = await api.post('/auth/resend-otp', { email })
      if (data.alreadyVerified) return toast.success('Your email is already verified.')
      setCooldown(data.cooldownSeconds || 60)
      setCodeSent(true)
      if (data.devCode) {
        toast.success(`Verification code: ${data.devCode}`, { duration: 10000 })
      } else {
        toast.success(`Verification code sent to ${email}.`)
      }
    } catch (err) {
      toast.error(apiError(err, 'Could not send code'))
    } finally {
      setBusy(false)
    }
  }

  async function skipVerification() {
    const token = location.state?.registrationToken
    if (!token) return navigate('/login')
    setBusy(true)
    try {
      await completeRegistration(token)
      toast.success('Account created. You can verify your email later.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(apiError(err, 'Could not finish creating account'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3 shadow-xs">
            <MailCheck size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
            Verify Email
          </h1>
          <p className="text-xs text-slate-500">
            We will send a 6-digit verification code to your inbox.
          </p>
        </div>

        {requireEmailVerification === true && (
          <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-5">
            <ShieldCheck size={15} className="text-amber-600 shrink-0" />
            <span>Email verification required before login</span>
          </div>
        )}

        <form onSubmit={verify} className="flex flex-col gap-4">
          <div>
            <label htmlFor="otp-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="otp-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (codeSent) { setCodeSent(false); setCooldown(0); setOtp('') }
                }}
                placeholder="candidate@example.com"
                autoComplete="email"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              />
            </div>
          </div>

          {!codeSent ? (
            <button
              type="button"
              onClick={sendCode}
              disabled={busy || !email}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Sending Code...' : <>Send Verification Code <ArrowRight size={14} /></>}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <MailCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Code sent to <strong className="font-semibold text-slate-900">{email}</strong>. Check inbox.</span>
              </div>

              <div>
                <label htmlFor="otp-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="otp-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-base font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {busy ? 'Verifying Code...' : 'Verify Code & Continue'}
              </button>

              <div className="text-center pt-1">
                {cooldown > 0 ? (
                  <span className="text-xs text-slate-400">Resend available in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={busy || cooldown > 0}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </>
          )}

          {requireEmailVerification === false && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={skipVerification}
                disabled={busy}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Skip verification for now
              </button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600">
              <ArrowLeft size={13} /> Back to Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
