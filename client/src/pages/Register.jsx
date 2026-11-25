import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const data = await register(name, email, password)
      toast.success(data.otpSent ? 'Account created - verification code sent' : 'Account created successfully')
      navigate('/verify', { state: { email, otpSent: data.otpSent, registrationToken: data.registrationToken } })
    } catch (err) {
      toast.error(apiError(err, 'Could not create candidate account'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-50">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Hero Visual */}
        <div className="relative hidden md:flex flex-col justify-between p-6 sm:p-8 text-white bg-slate-950">
          <img src="/register-dev.jpg" alt="MockMate AI" className="absolute inset-0 w-full h-full object-cover object-top opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

          {/* Top Logo */}
          <Link to="/" className="relative z-10 inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 p-1 bg-white/10 backdrop-blur-md shadow-md">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-white drop-shadow-sm">
              MockMate <span className="text-blue-400 font-extrabold text-xs">AI</span>
            </span>
          </Link>

          {/* Bottom Headline & Highlights */}
          <div className="relative z-10 space-y-2">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight drop-shadow-sm">
                Start your mock interview journey.
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed drop-shadow-sm">
                AI-powered technical simulations, instant rubric evaluations, and resume-tailored rounds.
              </p>
            </div>
            <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-300">
              <span>✓ Free Tier Included</span>
              <span>•</span>
              <span>✓ Voice &amp; Code Practice</span>
              <span>•</span>
              <span>✓ Industry Rubrics</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-6 sm:p-7 md:p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide">New Candidate</span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">Create Account</h1>
            <p className="text-xs text-slate-500 mt-0.5">Set up your profile to start practicing immediately.</p>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mohd Zaid"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 pr-14 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer mt-1"
              >
                {busy ? 'Creating Account...' : 'Get Started →'}
              </button>
            </form>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Already registered?</span>
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Sign in instead →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
