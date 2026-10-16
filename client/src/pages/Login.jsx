import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

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
        toast('Please verify your email to continue. Verification code sent.')
        navigate('/verify', { state: { email, otpSent: Boolean(err.response.data.otpSent) } })
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
    setPassword('123456')
    toast.success('Demo credentials loaded!')
  }

  return (
    <div className="reflect-auth-page">
      <div className="reflect-auth-card">
        {/* Left Pane: Product Highlights */}
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
              Prepare for your next technical interview.
            </h2>
            <p style={{ color: 'rgba(239, 237, 253, 0.65)', fontSize: '0.84rem', lineHeight: '1.5', marginBottom: '0.85rem' }}>
              Practice realistic coding and system design questions with instant AI feedback and shareable milestone certificates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>Role-specific technical questions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>Questions tailored to your resume</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.85)' }}>
                <CheckCircle2 size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>Shareable verified certificates</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={fillDemoAdmin}
              style={{ background: 'none', border: 'none', color: '#c084fc', fontSize: '0.78rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Right Pane: Login Form */}
        <div className="reflect-auth-right">
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.45rem', marginBottom: '0.3rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.025em' }}>
              Sign in
            </h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(239, 237, 253, 0.65)' }}>
              Welcome back! Enter your details to continue.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label htmlFor="login-email" className="reflect-field-label">Email Address</label>
              <div className="reflect-input-wrap">
                <Mail size={16} className="reflect-input-icon" aria-hidden="true" />
                <input
                  id="login-email"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label htmlFor="login-password" className="reflect-field-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: '#c084fc', textDecoration: 'none' }}>
                  Forgot?
                </Link>
              </div>
              <div className="reflect-input-wrap">
                <Lock size={16} className="reflect-input-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
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
              {busy ? 'Signing in…' : <>Sign in to Account <ArrowRight size={16} /></>}
            </button>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '0.5rem', paddingTop: '1rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(239, 237, 253, 0.65)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ fontWeight: 600, color: '#c084fc' }}>
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
