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
      toast.success(`Verification code sent to ${email}.`)
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
    <div className="reflect-auth-page">
      <div className="reflect-card" style={{ width: 'min(440px, 100%)', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="reflect-brand-icon" style={{ width: '46px', height: '46px', margin: '0 auto 0.85rem' }}>
            <MailCheck size={22} />
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.025em' }}>
            Verify Email
          </h1>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(239, 237, 253, 0.65)' }}>
            We'll send a 6-digit verification code to your inbox.
          </p>
        </div>

        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {requireEmailVerification === true && (
            <div className="reflect-badge" style={{ justifyContent: 'center', margin: 0, background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <ShieldCheck size={14} style={{ color: '#fbbf24' }} />
              <span style={{ color: '#fbbf24' }}>Email verification required before login</span>
            </div>
          )}

          <div>
            <label className="reflect-field-label">Email Address</label>
            <div className="reflect-input-wrap">
              <Mail size={16} className="reflect-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (codeSent) { setCodeSent(false); setCooldown(0); setOtp('') }
                }}
                placeholder="candidate@example.com"
                autoComplete="email"
                required
                className="reflect-input"
              />
            </div>
          </div>

          {!codeSent ? (
            <button type="button" className="reflect-btn-primary" onClick={sendCode} disabled={busy || !email} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {busy ? 'Sending Code...' : <>Send Verification Code <ArrowRight size={16} /></>}
            </button>
          ) : (
            <>
              <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.86rem', color: 'rgba(239, 237, 253, 0.75)' }}>
                <MailCheck size={16} style={{ color: '#34d399', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Code sent to <strong style={{ color: '#f8fafc' }}>{email}</strong>. Check inbox.
              </div>

              <div>
                <label className="reflect-field-label">6-Digit Verification Code</label>
                <div className="reflect-input-wrap">
                  <KeyRound size={16} className="reflect-input-icon" />
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
                    className="reflect-input mono"
                    style={{ letterSpacing: '0.25em', fontSize: '1.1rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <button type="submit" className="reflect-btn-primary" disabled={busy || otp.length !== 6} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                {busy ? 'Verifying Code...' : 'Verify Code & Continue'}
              </button>

              <div style={{ textAlign: 'center', margin: '0.4rem 0 0' }}>
                {cooldown > 0 ? (
                  <span style={{ fontSize: '0.82rem', color: 'rgba(239, 237, 253, 0.5)' }}>Resend available in {cooldown}s</span>
                ) : (
                  <button type="button" onClick={sendCode} disabled={busy || cooldown > 0} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 500 }}>
                    Resend Code
                  </button>
                )}
              </div>
            </>
          )}

          {requireEmailVerification === false && (
            <div style={{ textAlign: 'center', marginTop: '0.4rem' }}>
              <button type="button" onClick={skipVerification} disabled={busy} style={{ background: 'none', border: 'none', color: 'rgba(239, 237, 253, 0.55)', fontSize: '0.82rem', cursor: 'pointer' }}>
                Skip verification for now
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
