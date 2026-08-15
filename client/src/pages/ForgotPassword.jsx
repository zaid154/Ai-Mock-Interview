import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { Mail, KeyRound, Lock, ArrowRight } from 'lucide-react'

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
      toast.success('If that email exists, a reset code is on its way')
      setStep(2)
    } catch (err) {
      toast.error(apiError(err, 'Could not send code'))
    } finally {
      setBusy(false)
    }
  }

  async function resetPassword(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      toast.success('Password updated — please sign in')
      navigate('/login')
    } catch (err) {
      toast.error(apiError(err, 'Could not reset password'))
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
            <KeyRound size={22} />
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>{step === 1 ? 'Reset Password' : 'Enter Reset Code'}</h1>
          <p className="muted small" style={{ margin: 0 }}>
            {step === 1 ? "We'll email you a 6-digit code to reset your password." : `Code sent to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="field">
              <span className="field-label">Email Address</span>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? 'Sending Code…' : <>Send Reset Code <ArrowRight size={18} /></>}
            </button>
            <p className="muted small text-center" style={{ textAlign: 'center', margin: '0.8rem 0 0' }}>
              <Link to="/login">Back to Sign In</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="field">
              <span className="field-label">Reset Code</span>
              <div className="input-icon-wrap">
                <KeyRound size={16} className="input-icon" />
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  className="mono"
                  style={{ letterSpacing: '0.2em', fontSize: '1.05rem' }}
                />
              </div>
            </div>

            <div className="field">
              <span className="field-label">New Password</span>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? 'Updating Password…' : 'Update Password & Sign In'}
            </button>
            <p className="muted small text-center" style={{ textAlign: 'center', margin: '0.8rem 0 0' }}>
              <button type="button" className="link-btn" onClick={() => setStep(1)}>
                Use a different email address
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
