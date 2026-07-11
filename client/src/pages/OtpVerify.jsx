import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MailCheck, ShieldCheck } from 'lucide-react'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function OtpVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, refreshUser, requireEmailVerification, refreshVerificationSetting } = useAuth()
  const [email, setEmail] = useState(location.state?.email || user?.email || '')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(location.state?.otpSent ? 60 : 0)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    refreshVerificationSetting().catch(() => {})
  }, [])

  async function verify(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      await refreshUser()
      toast.success('Email verified successfully.')
      navigate(user ? '/dashboard' : '/login')
    } catch (err) {
      toast.error(apiError(err, 'Could not verify the code'))
    } finally {
      setBusy(false)
    }
  }

  async function sendCode() {
    if (!email || cooldown > 0) return
    setBusy(true)
    try {
      const { data } = await api.post('/auth/resend-otp', { email })
      if (data.alreadyVerified) {
        toast.success('Your email is already verified.')
        return
      }
      setCooldown(data.cooldownSeconds || 60)
      toast.success('Verification code sent.')
    } catch (err) {
      toast.error(apiError(err, 'Could not send the code'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={verify}>
        <div className="auth-heading">
          <span className="auth-icon" aria-hidden="true"><MailCheck size={22} /></span>
          <div>
            <h1>Verify your email</h1>
            <p className="muted">Request a 6-digit code, then enter the code delivered to your inbox.</p>
          </div>
        </div>

        {requireEmailVerification === true && (
          <div className="verification-notice" role="status">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>Email verification is required before you can sign in.</span>
          </div>
        )}

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </label>
        <label className="field">
          <span>Verification code</span>
          <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" autoFocus required />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy || otp.length !== 6}>
          {busy ? 'Verifying...' : 'Verify email'}
        </button>
        <p className="muted center" aria-live="polite">
          {cooldown > 0 ? `Resend available in ${cooldown}s.` : 'Need a code? '}
          <button type="button" className="link-btn" onClick={sendCode} disabled={busy || cooldown > 0}>
            {cooldown > 0 ? 'Resend code' : 'Send code'}
          </button>
        </p>
        {requireEmailVerification === false && (
          <p className="muted center"><Link to={user ? '/dashboard' : '/login'}>Skip for now</Link></p>
        )}
      </form>
    </main>
  )
}
