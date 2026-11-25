import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavDrawer from './NavDrawer'
import { Menu, ChevronDown, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    setUserMenuOpen(false)
    logout()
    navigate('/login')
  }

  const isDashboardActive =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/results')

  const isPracticeActive = location.pathname === '/practice' || location.pathname.startsWith('/interview')
  const isBookmarksActive = location.pathname === '/bookmarks'

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shadow-2xs group-hover:border-blue-300 transition">
              <img src="/logo.png" alt="MockMate AI Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
              MockMate <span className="text-blue-600 font-extrabold text-[10px] px-1.5 py-0.5 bg-blue-50 border border-blue-200/60 rounded leading-none">AI</span>
            </span>
          </Link>

          {/* Navigation */}
          {!user ? (
            <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
              <a href="/#tracks" className="text-xs font-medium text-slate-600 hover:text-slate-900 transition">
                Role Tracks
              </a>
              <Link to="/practice" className="text-xs font-medium text-slate-600 hover:text-slate-900 transition">
                Practice Studio
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
              <Link
                to="/dashboard"
                className={`text-xs font-medium transition py-1 focus:outline-none outline-none ${
                  isDashboardActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/practice"
                className={`text-xs font-medium transition py-1 focus:outline-none outline-none ${
                  isPracticeActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Practice
              </Link>
              <Link
                to="/bookmarks"
                className={`text-xs font-medium transition py-1 focus:outline-none outline-none ${
                  isBookmarksActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bookmarks
              </Link>
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-slate-300 transition cursor-pointer text-xs"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate text-slate-700 font-medium hidden sm:inline">
                  {user.name || 'Candidate'}
                </span>
                <ChevronDown size={14} className="text-slate-400 mr-1" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-1"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                      role="menuitem"
                    >
                      <User size={14} className="text-slate-400" aria-hidden="true" /> Profile
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut size={14} aria-hidden="true" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login" className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 transition">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs hover:shadow-sm transition cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <NavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        logout={logout}
      />
    </header>
  )
}
