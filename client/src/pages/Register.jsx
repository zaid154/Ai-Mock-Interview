import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'
import { Eye, EyeOff, User, Mail, Lock, Zap, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'

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
            justifyContent: 'space-between',
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
              Start practicing mock interviews today.
            </h2>
            <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.4rem' }}>
              Create your free candidate profile and access AI-powered technical interview simulations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Unlimited mock practice sessions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Revision bookmarks bank &amp; study notes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Verified ISO milestone credentials</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>256-bit Secure Candidate Encryption</span>
          </div>
        </div>

        {/* Right Pane: Registration Form */}
        <div style={{ padding: '1.8rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', fontWeight: 800 }}>Create Account</h1>
            <p className="muted small" style={{ margin: 0, fontSize: '0.84rem' }}>
              Join MockMate and start practicing for free.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <span className="field-label" style={{ fontSize: '0.8rem' }}>Full Name</span>
              <div className="input-icon-wrap">
                <User size={15} className="input-icon" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mohd Zaid"
                  autoComplete="name"
                  required
                  style={{ padding: '0.55rem 0.8rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

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

            <div className="field" style={{ marginBottom: 0 }}>
              <span className="field-label" style={{ fontSize: '0.8rem' }}>Password</span>
              <div className="input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  style={{ padding: '0.55rem 2.5rem 0.55rem 2.5rem', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: '0.4rem', padding: '0.65rem 1rem' }}>
              {busy ? 'Creating Account…' : <>Get Started Free <ArrowRight size={16} /></>}
            </button>

            <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: '0.4rem', paddingTop: '0.8rem', textAlign: 'center' }}>
              <p className="muted small" style={{ margin: 0, fontSize: '0.82rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
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
