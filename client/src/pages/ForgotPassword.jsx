import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'

// Two-step reset: (1) enter email → get an OTP, (2) enter the OTP + a new
// password. Uses the same OTP system as email verification.
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
      toast.error(apiError(err, 'Could not send the code'))
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
      toast.error(apiError(err, 'Could not reset your password'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      {step === 1 ? (
        <form className="auth-card" onSubmit={sendCode}>
          <h1>Reset your password</h1>
          <p className="muted">We’ll email you a code to reset it.</p>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset code'}
          </button>
          <p className="muted center">
            <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      ) : (
        <form className="auth-card" onSubmit={resetPassword}>
          <h1>Enter your code</h1>
          <p className="muted">Check your email for the 6-digit code.</p>

          <label className="field">
            <span>Reset code</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              required
            />
          </label>

          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
          <p className="muted center">
            <button type="button" className="link-btn" onClick={() => setStep(1)}>
              Use a different email
            </button>
          </p>
        </form>
      )}
    </main>
  )
}
