import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { apiError } from '../lib/api'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50 py-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Hero Visual */}
        <div className="relative hidden md:flex flex-col justify-between p-8 sm:p-10 text-white bg-slate-950">
          <img src="/login-hero.jpg" alt="MockMate AI" className="absolute inset-0 w-full h-full object-cover object-top opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />

          {/* Top Logo */}
          <Link to="/" className="relative z-10 inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 p-1 bg-white/10 backdrop-blur-md shadow-md">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-base text-white drop-shadow-sm">
              MockMate <span className="text-blue-400 font-extrabold text-xs">AI</span>
            </span>
          </Link>

          {/* Bottom Headline & Demo Button */}
          <div className="relative z-10 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight drop-shadow-sm">
                Master your next technical round.
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed drop-shadow-sm">
                AI-driven coding simulations, rubric evaluation, and resume-tailored rounds.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="text-[11px] text-slate-400">Recruiter quick test:</span>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 transition cursor-pointer"
              >
                Fill Demo Credentials
              </button>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Candidate Portal</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Sign in</h1>
            <p className="text-xs text-slate-500 mt-1">Welcome back! Enter your details to continue.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-medium text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3.5 pr-14 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer mt-2"
              >
                {busy ? 'Signing in...' : 'Sign in to Account →'}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Don&apos;t have an account?</span>
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
