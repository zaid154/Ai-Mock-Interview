import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.needsVerification) {
        toast('Please verify your email to continue.')
        navigate('/verify', { state: { email } })
        return
      }
      if (axios.isAxiosError(err) && err.response?.data?.needsRegistrationCompletion) {
        toast('Finish creating your account to continue.')
        navigate('/verify', { state: { email, registrationToken: err.response.data.registrationToken } })
        return
      }
      toast.error(apiError(err, 'Could not sign in'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-card-head">
          <h1>Welcome back</h1>
          <p className="muted">Sign in to continue your prep.</p>
        </div>

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
              placeholder="Enter your password"
              autoComplete="current-password"
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

        <div className="auth-forgot">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-switch muted">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </main>
  )
}
