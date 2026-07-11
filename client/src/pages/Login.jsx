import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      // If verification is mandatory and this account isn't verified, the API
      // returns needsVerification — send them to the verify screen instead.
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
        <h1>Welcome back</h1>
        <p className="muted">Sign in to keep practising.</p>

        <label className="field">
          <span>Email</span>
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="muted center">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="muted center">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  )
}
