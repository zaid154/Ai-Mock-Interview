import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'

// Email verification screen. Reached after register, or after login when
// verification is mandatory. The user can verify now, resend the code, or skip
// (their account already exists — they can verify later).
export default function OtpVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()

  const [email, setEmail] = useState(location.state?.email || user?.email || '')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)

  async function verify(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      await refreshUser()
      toast.success('Email verified!')
      navigate(user ? '/dashboard' : '/login')
    } catch (err) {
      toast.error(apiError(err, 'Could not verify the code'))
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('A new code is on its way')
    } catch (err) {
      toast.error(apiError(err, 'Could not resend the code'))
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={verify}>
        <h1>Verify your email</h1>
        <p className="muted">Enter the 6-digit code we emailed to you.</p>

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

        <label className="field">
          <span>Verification code</span>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            inputMode="numeric"
            required
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Verifying…' : 'Verify email'}
        </button>

        <p className="muted center">
          Didn’t get it?{' '}
          <button type="button" className="link-btn" onClick={resend}>
            Resend code
          </button>
        </p>
        <p className="muted center">
          {/* Skipping is allowed — the account is already created. */}
          <Link to={user ? '/dashboard' : '/login'}>Skip for now</Link>
        </p>
      </form>
    </main>
  )
}
