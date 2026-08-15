import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MailCheck, ShieldCheck, Mail, KeyRound, ArrowRight } from 'lucide-react'
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
      if (data.alreadyVerified) {
        toast.success('Your email is already verified.')
        return
      }
      setCooldown(data.cooldownSeconds || 60)
      setCodeSent(true)
      toast.success(`Verification code sent to ${email}.`)
    } catch (err) {
      toast.error(apiError(err, 'Could not send code'))
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
      toast.error(apiError(err, 'Could not finish creating account'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-layout-page">
      <div
        className="glass-card"
        style={{
          width: 'min(420px, 100%)',
          padding: '2.2rem 2rem',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="brand-icon-box" style={{ width: '46px', height: '46px', margin: '0 auto 0.85rem' }}>
            <MailCheck size={22} />
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>Verify Email</h1>
          <p className="muted small" style={{ margin: 0 }}>We'll send a 6-digit verification code to your inbox.</p>
        </div>

        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {requireEmailVerification === true && (
            <div className="badge-glow" style={{ justifyContent: 'center', background: 'var(--warn-soft)', color: 'var(--warn)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <ShieldCheck size={16} /> Email verification is required before login
            </div>
          )}

          <div className="field">
            <span className="field-label">Email Address</span>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
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
                placeholder="candidate@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {!codeSent ? (
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={sendCode} disabled={busy || !email}>
              {busy ? 'Sending Code...' : <>Send Verification Code <ArrowRight size={18} /></>}
            </button>
          ) : (
            <>
              <div className="glass-card" style={{ padding: '0.85rem 1rem', background: 'var(--surface-2)', fontSize: '0.88rem' }}>
                <MailCheck size={16} style={{ color: 'var(--good)', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Code sent to <strong>{email}</strong>. Check inbox &amp; spam.
              </div>

              <div className="field">
                <span className="field-label">6-Digit Verification Code</span>
                <div className="input-icon-wrap">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    className="mono"
                    style={{ letterSpacing: '0.25em', fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy || otp.length !== 6}>
                {busy ? 'Verifying Code...' : 'Verify Code & Continue'}
              </button>

              <p className="muted small text-center" style={{ textAlign: 'center', margin: '0.5rem 0 0' }}>
                {cooldown > 0 ? `Resend available in ${cooldown}s` : (
                  <button type="button" className="link-btn" onClick={sendCode} disabled={busy || cooldown > 0}>
                    Resend Code
                  </button>
                )}
              </p>
            </>
          )}

          {requireEmailVerification === false && (
            <p className="muted small text-center" style={{ textAlign: 'center', margin: '0.5rem 0 0' }}>
              <button type="button" className="link-btn" onClick={skipVerification} disabled={busy}>
                Skip verification for now
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
