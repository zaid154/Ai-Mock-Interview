import { Link } from 'react-router-dom'
import { Github, Globe, Linkedin, ArrowUpRight, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { user } = useAuth()

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Bio */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 p-0.5 bg-white">
                <img src="/logo.png" alt="MockMate AI Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-900 text-sm">
                MockMate <span className="text-blue-600 font-extrabold text-[11px]">AI</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Simulate technical engineering interviews with real-time feedback and structured rubric scoring.
            </p>

            <div className="flex items-center gap-2 mt-1">
              <a
                href="https://zaid-pro.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium hover:border-blue-400 hover:text-blue-600 transition"
              >
                <span>Built by <strong className="font-semibold text-blue-600">Mohd Zaid</strong></span>
                <ArrowUpRight size={11} className="text-slate-400" />
              </a>
              <div className="flex items-center gap-1.5 text-slate-400">
                <a
                  href="https://github.com/zaid154"
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  className="p-1 rounded-md hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <Github size={14} />
                </a>
                <a
                  href="https://zaid-pro.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  title="Portfolio"
                  className="p-1 rounded-md hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <Globe size={14} />
                </a>
                <a
                  href="https://www.linkedin.com/in/mohd-zaid-794090231/"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="p-1 rounded-md hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <Linkedin size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Platform</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              {user ? (
                <>
                  <Link to="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
                  <Link to="/practice" className="hover:text-blue-600 transition">Practice Studio</Link>
                  <Link to="/bookmarks" className="hover:text-blue-600 transition">Saved Questions</Link>
                  <Link to="/profile" className="hover:text-blue-600 transition">Profile &amp; Settings</Link>
                </>
              ) : (
                <>
                  <Link to="/" className="hover:text-blue-600 transition">Home</Link>
                  <Link to="/login" className="hover:text-blue-600 transition">Sign In</Link>
                  <Link to="/register" className="hover:text-blue-600 transition">Create Account</Link>
                </>
              )}
            </div>
          </div>

          {/* Tracks */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Tracks</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <Link to={user ? "/practice" : "/login"} className="hover:text-blue-600 transition">Frontend Engineering</Link>
              <Link to={user ? "/practice" : "/login"} className="hover:text-blue-600 transition">Backend Architecture</Link>
              <Link to={user ? "/practice" : "/login"} className="hover:text-blue-600 transition">Fullstack &amp; MERN</Link>
              <Link to={user ? "/practice" : "/login"} className="hover:text-blue-600 transition">System Design</Link>
            </div>
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Connect</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <a href="mailto:zaidm1323@gmail.com" className="hover:text-blue-600 transition inline-flex items-center gap-1.5">
                <Mail size={12} /> zaidm1323@gmail.com
              </a>
              <a href="https://zaid-pro.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">
                Portfolio Site
              </a>
              <a href="https://github.com/zaid154" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">
                GitHub Profile
              </a>
              <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>&copy; {year} MockMate AI. Built by Mohd Zaid.</div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>MERN Stack</span>
            <span>&bull;</span>
            <span>Generative API Engine</span>
            <span>&bull;</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
