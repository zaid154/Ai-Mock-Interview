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
    const cleanEmail = email.trim().toLowerCase()
    setBusy(true)
    try {
      await api.post('/auth/forgot-password', { email: cleanEmail })
      toast.success('Security reset code dispatched! Check your email inbox.')
      setStep(2)
    } catch (err) {
      toast.error(apiError(err, 'Could not send reset code'))
    } finally {
      setBusy(false)
    }
  }

  async function resetPassword(e) {
    e.preventDefault()
    const cleanEmail = email.trim().toLowerCase()
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { email: cleanEmail, otp, newPassword })
      toast.success('Password updated successfully! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(apiError(err, 'Could not reset password'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="reflect-auth-page">
      <div className="reflect-auth-ambient" />

      <div className="reflect-auth-card">
        {/* Left Pane: Brand Showcase */}
        <div className="reflect-auth-left">
          <div>
            <Link to="/" className="reflect-brand" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
              <div className="reflect-brand-icon">
                <img src="/logo.png" alt="MockMate AI Logo" className="reflect-brand-img" />
              </div>
              <span className="reflect-brand-title">
                MockMate <span className="reflect-brand-badge">AI</span>
              </span>
            </Link>

            <h2 style={{ fontSize: '1.35rem', lineHeight: '1.25', marginBottom: '0.5rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.025em' }}>
              Account Recovery &amp; Security Reset
            </h2>
            <p style={{ color: 'rgba(239, 237, 253, 0.65)', fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '0.85rem' }}>
              Verify your identity with a secure 6-digit one-time passkey to update your account password.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                <span>Instant 6-digit verification code</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                <span>Bcrypt encrypted password update</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                <span>Token invalidation for old sessions</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', color: 'rgba(239, 237, 253, 0.6)', fontSize: '0.78rem' }}>
            <ShieldCheck size={16} style={{ color: '#c084fc' }} />
            <span>256-bit Secure Verification Protocol</span>
          </div>
        </div>

        {/* Right Pane: Reset Form */}
        <div className="reflect-auth-right">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="reflect-badge" style={{ margin: 0, fontSize: '0.72rem', padding: '2px 8px' }}>
                <span className="reflect-badge-text">STEP 0{step} OF 02</span>
              </div>
            </div>
            <h1 style={{ fontSize: '1.45rem', marginBottom: '0.3rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.025em' }}>
              {step === 1 ? 'Forgot Password?' : 'Enter 6-Digit Code'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(239, 237, 253, 0.65)' }}>
              {step === 1
                ? 'Enter your registered email address to receive a security reset code.'
                : `Enter the code sent to ${email} along with your new password.`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label className="reflect-field-label">Email Address</label>
                <div className="reflect-input-wrap">
                  <Mail size={16} className="reflect-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    autoComplete="email"
                    required
                    className="reflect-input"
                  />
                </div>
              </div>

              <button type="submit" className="reflect-btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                {busy ? 'Generating Security Code…' : <>Send Reset Code <ArrowRight size={16} /></>}
              </button>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '0.5rem', paddingTop: '1rem', textAlign: 'center' }}>
                <Link to="/login" style={{ fontSize: '0.84rem', fontWeight: 600, color: 'rgba(239, 237, 253, 0.7)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={resetPassword} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="reflect-field-label">6-Digit Passkey</label>
                <div className="reflect-input-wrap">
                  <KeyRound size={16} className="reflect-input-icon" />
                  <input
                    name="security_otp"
                    id="security_otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    className="reflect-input mono"
                    style={{ letterSpacing: '0.25em', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label className="reflect-field-label">New Password</label>
                <div className="reflect-input-wrap">
                  <Lock size={16} className="reflect-input-icon" />
                  <input
                    name="new_password"
                    id="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className="reflect-input"
                  />
                </div>
              </div>

              <button type="submit" className="reflect-btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                {busy ? 'Updating Password…' : <>Confirm &amp; Reset Password <ArrowRight size={16} /></>}
              </button>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '0.5rem', paddingTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#c084fc', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
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
