import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { Mail, KeyRound, Lock, ArrowRight, Zap, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function sendCode(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/auth/forgot-password', { email })
      toast.success('Security reset code generated! Check your email or server console.')
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
      await api.post('/auth/reset-password', { email, otp, newPassword })
      toast.success('Password updated successfully! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(apiError(err, 'Could not reset password'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-layout-page">
      <div className="auth-card-panel">
        {/* Left Pane: Brand Showcase */}
        <div
          className="auth-left-pane"
          style={{
            background: 'var(--surface-2)',
            padding: '1.8rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            borderRight: '1px solid var(--border-soft)',
          }}
        >
          <div>
            <Link to="/" className="brand" style={{ fontSize: '1.2rem', marginBottom: '1.2rem', display: 'inline-flex' }}>
              <div className="brand-icon-box" style={{ width: '30px', height: '30px' }}>
                <Zap size={16} />
              </div>
              <span>MockMate</span>
            </Link>

            <h2 style={{ fontSize: '1.45rem', lineHeight: '1.25', marginBottom: '0.6rem', fontWeight: 800 }}>
              Account Recovery &amp; Security Reset
            </h2>
            <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.4rem' }}>
              Verify your identity with a secure 6-digit one-time passkey to update your account password.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Instant 6-digit verification code</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Bcrypt encrypted password update</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Token invalidation for all active sessions</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>256-bit Secure Verification Protocol</span>
          </div>
        </div>

        {/* Right Pane: Reset Form */}
        <div style={{ padding: '1.8rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="step-badge" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                STEP 0{step} OF 02
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', fontWeight: 800 }}>
              {step === 1 ? 'Forgot Password?' : 'Enter 6-Digit Code'}
            </h1>
            <p className="muted small" style={{ margin: 0, fontSize: '0.84rem' }}>
              {step === 1
                ? 'Enter your registered email address to receive a security reset code.'
                : `Enter the code sent to ${email} along with your new password.`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label" style={{ fontSize: '0.8rem' }}>Email Address</span>
                <div className="input-icon-wrap">
                  <Mail size={15} className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    autoComplete="email"
                    required
                    style={{ padding: '0.55rem 0.8rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: '0.4rem', padding: '0.65rem 1rem' }}>
                {busy ? 'Generating Security Code…' : <>Send Reset Code <ArrowRight size={16} /></>}
              </button>

              <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: '0.4rem', paddingTop: '0.8rem', textAlign: 'center' }}>
                <Link to="/login" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label" style={{ fontSize: '0.8rem' }}>6-Digit Passkey</span>
                <div className="input-icon-wrap">
                  <KeyRound size={15} className="input-icon" />
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    className="mono"
                    style={{ padding: '0.55rem 0.8rem 0.55rem 2.5rem', letterSpacing: '0.25em', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <span className="field-label" style={{ fontSize: '0.8rem' }}>New Password</span>
                <div className="input-icon-wrap">
                  <Lock size={15} className="input-icon" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                    style={{ padding: '0.55rem 0.8rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: '0.4rem', padding: '0.65rem 1rem' }}>
                {busy ? 'Updating Password…' : <>Confirm &amp; Reset Password <ArrowRight size={16} /></>}
              </button>

              <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: '0.4rem', paddingTop: '0.8rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
