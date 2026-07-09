import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await register(name, email, password)
      toast.success('Account created — let’s get started')
      navigate('/dashboard')
    } catch (err) {
      toast.error(apiError(err, 'Could not create account'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create your account</h1>
        <p className="muted">Free, and takes about ten seconds.</p>

        <label className="field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Doe"
            autoComplete="name"
            required
          />
        </label>

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <p className="muted center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  )
}
