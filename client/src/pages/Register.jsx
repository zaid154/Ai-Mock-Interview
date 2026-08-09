import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await register(name, email, password)
      toast.success(data.otpSent ? 'Account created — verification code sent' : 'Account created')
      navigate('/verify', { state: { email, otpSent: data.otpSent, registrationToken: data.registrationToken } })
    } catch (err) {
      toast.error(apiError(err, 'Could not create account'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-card-head">
          <h1>Create your account</h1>
          <p className="muted">Free. Takes about ten seconds.</p>
        </div>

        <label className="field">
          <span>Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Doe"
            autoComplete="name"
            required
          />
        </label>

        <label className="field">
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <div className="input-pw-wrap">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
              required
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw(!showPw)}
              tabIndex={-1}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <p className="auth-switch muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  )
}
