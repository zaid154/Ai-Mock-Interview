import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
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

  function fillDemoAdmin() {
    setEmail('zaidm1323@gmail.com')
    setPassword('ChangeMe123!')
    toast.success('Demo admin credentials filled!')
  }

  return (
    <div className="auth-layout-page">
      <div className="auth-card-panel">
        {/* Left Pane: Brand Showcase */}
        <div
          className="auth-left-pane"
          style={{
            background: 'var(--surface-2)',
            padding: '1.6rem 1.8rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            borderRight: '1px solid var(--border-soft)',
          }}
        >
          <div>
            <Link to="/" className="brand" style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'inline-flex' }}>
              <div className="brand-icon-box" style={{ width: '30px', height: '30px' }}>
                <Zap size={16} />
              </div>
              <span>MockMate</span>
            </Link>

            <h2 style={{ fontSize: '1.4rem', lineHeight: '1.25', marginBottom: '0.6rem', fontWeight: 800 }}>
              Prepare for high-stakes technical interviews.
            </h2>
            <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.1rem' }}>
              Get real-time line-by-line evaluation, scoring breakdown charts, and official verified certificates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Role-specific technical questions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Instant PDF resume parsing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--good)', flexShrink: 0 }} />
                <span>Official verified milestone credentials</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Login Form */}
        <div style={{ padding: '1.6rem 1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.45rem', marginBottom: '0.2rem', fontWeight: 800 }}>Sign in</h1>
            <p className="muted small" style={{ margin: 0, fontSize: '0.84rem' }}>
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <span className="field-label" style={{ fontSize: '0.8rem' }}>Password</span>
                <Link to="/forgot-password" className="small muted" style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                  Forgot?
                </Link>
              </div>
              <div className="input-icon-wrap">
                <Lock size={15} className="input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
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

            <button type="submit" className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: '0.3rem', padding: '0.65rem 1rem' }}>
              {busy ? 'Signing in…' : <>Sign in to Account <ArrowRight size={16} /></>}
            </button>

            <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: '0.3rem', paddingTop: '0.75rem', textAlign: 'center' }}>
              <p className="muted small" style={{ margin: 0, fontSize: '0.82rem' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
