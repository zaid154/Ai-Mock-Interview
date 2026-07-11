import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MailCheck, ShieldCheck } from 'lucide-react'
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
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    refreshVerificationSetting().catch(() => {})
  }, [])

  async function verify(e) {
    e.preventDefault()
    if (!codeSent) {
      await sendCode()
      return
    }
    setBusy(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp })
      if (!data.token) {
        toast.success('Your email is already verified. Please sign in.')
        navigate('/login')
        return
      }
      establishSession(data)
      toast.success('Email verified successfully.')
      navigate('/dashboard')
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
      setCodeSent(true)
      toast.success(`Verification code sent to ${email}.`)
    } catch (err) {
      toast.error(apiError(err, 'Could not send the code'))
    } finally {
      setBusy(false)
    }
  }

  async function skipVerification() {
    const registrationToken = location.state?.registrationToken
    if (!registrationToken) {
      navigate('/login')
      return
    }
    setBusy(true)
    try {
      await completeRegistration(registrationToken)
      toast.success('Account created. You can verify your email later.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(apiError(err, 'Could not finish creating your account'))
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
            <p className="muted">We’ll email a 6-digit verification code to you.</p>
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
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (codeSent) {
                setCodeSent(false)
                setCooldown(0)
                setOtp('')
              }
            }}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>
        {!codeSent ? (
          <>
            <div className="verification-steps" aria-label="Email verification steps">
              <span className="verification-step is-active">1. Send code</span>
              <span className="verification-step">2. Check inbox</span>
              <span className="verification-step">3. Enter code</span>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={sendCode} disabled={busy || !email}>
              {busy ? 'Sending code...' : 'Send verification code'}
            </button>
            <p className="muted center">We’ll send the code to the email address above.</p>
          </>
        ) : (
          <>
            <div className="verification-notice" role="status" aria-live="polite">
              <MailCheck size={18} aria-hidden="true" />
              <span><strong>Code sent.</strong> Check the inbox for <strong>{email}</strong>, including Spam or Promotions.</span>
            </div>
            <label className="field">
              <span>6-digit verification code</span>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" autoFocus required />
            </label>
            <button className="btn btn-primary btn-block" disabled={busy || otp.length !== 6}>
              {busy ? 'Verifying...' : 'Verify email'}
            </button>
            <p className="muted center" aria-live="polite">
              {cooldown > 0 ? `Didn’t receive it? Resend available in ${cooldown}s.` : 'Didn’t receive it? '}
              <button type="button" className="link-btn" onClick={sendCode} disabled={busy || cooldown > 0}>
                Resend code
              </button>
            </p>
          </>
        )}
        {requireEmailVerification === false && (
          <p className="muted center"><button type="button" className="link-btn" onClick={skipVerification} disabled={busy}>Skip for now</button></p>
        )}
      </form>
    </main>
  )
}
