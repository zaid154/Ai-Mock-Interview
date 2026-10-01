import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await register(name, email, password)
      toast.success(data.otpSent ? 'Account created — security verification code sent' : 'Account created successfully')
      navigate('/verify', { state: { email, otpSent: data.otpSent, registrationToken: data.registrationToken } })
    } catch (err) {
      toast.error(apiError(err, 'Could not create candidate account'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="reflect-auth-page">
      <div className="reflect-auth-ambient" />

      <div className="reflect-auth-card">
        {/* Left Pane: Brand & Value Props */}
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
              Start practicing mock interviews today.
            </h2>
            <p style={{ color: 'rgba(239, 237, 253, 0.65)', fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '0.85rem' }}>
              Create your candidate profile and access AI-powered technical simulations across fullstack, frontend, and backend tracks.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                <span>Unlimited mock practice sessions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                <span>Revision bookmarks bank &amp; study notes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#c084fc', flexShrink: 0 }} />
                <span>Verified SHA-256 milestone diplomas</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', color: 'rgba(239, 237, 253, 0.6)', fontSize: '0.78rem' }}>
            <ShieldCheck size={16} style={{ color: '#c084fc' }} aria-hidden="true" />
            <span>Encrypted passwords &amp; secure session tokens</span>
          </div>
        </div>

        {/* Right Pane: Registration Form */}
        <div className="reflect-auth-right">
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.45rem', marginBottom: '0.3rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.025em' }}>
              Create Account
            </h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(239, 237, 253, 0.65)' }}>
              Join MockMate and start practicing for free.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label htmlFor="register-name" className="reflect-field-label">Full Name</label>
              <div className="reflect-input-wrap">
                <User size={16} className="reflect-input-icon" aria-hidden="true" />
                <input
                  id="register-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                  required
                  className="reflect-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="reflect-field-label">Email Address</label>
              <div className="reflect-input-wrap">
                <Mail size={16} className="reflect-input-icon" aria-hidden="true" />
                <input
                  id="register-email"
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

            <div>
              <label htmlFor="register-password" className="reflect-field-label">Password</label>
              <div className="reflect-input-wrap">
                <Lock size={16} className="reflect-input-icon" aria-hidden="true" />
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="reflect-input"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: 0, display: 'flex' }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="reflect-btn-primary"
              disabled={busy}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.4rem', fontSize: '0.9rem' }}
            >
              {busy ? 'Creating Account…' : <>Get Started Free <ArrowRight size={16} /></>}
            </button>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '0.4rem', paddingTop: '1rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.65)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: 600, color: '#c084fc' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
