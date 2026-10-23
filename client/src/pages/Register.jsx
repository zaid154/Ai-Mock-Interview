import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'

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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50 py-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Platform Value */}
        <div className="p-8 sm:p-10 bg-slate-900 text-white flex flex-col justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 p-1 bg-slate-800">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                MockMate <span className="text-blue-400 font-extrabold text-xs">AI</span>
              </span>
            </Link>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 text-white">
              Start practicing mock interviews today.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Create your candidate profile and access AI-powered technical simulations across fullstack, frontend, and backend tracks.
            </p>

            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                <span>Unlimited mock interview sessions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                <span>Custom resume tailoring</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                <span>Instant rubric &amp; architectural feedback</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] text-slate-400">
              Zero credit card required. Free tier includes full access to all standard technical tracks.
            </p>
          </div>
        </div>

        {/* Right Column: Register Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Create Account
            </h1>
            <p className="text-xs text-slate-500">
              Set up your profile to start practicing.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mohd Zaid"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Creating Account…' : <>Get Started <ArrowRight size={14} /></>}
            </button>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
