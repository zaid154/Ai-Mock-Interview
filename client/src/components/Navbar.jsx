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
    location.pathname.startsWith('/interview') ||
    location.pathname.startsWith('/results')

  const isPracticeActive = location.pathname === '/practice'
  const isBookmarksActive = location.pathname === '/bookmarks'

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1 shadow-xs group-hover:border-blue-500/40 transition">
            <img src="/logo.png" alt="MockMate AI Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg flex items-center gap-1.5">
            MockMate <span className="bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm">AI</span>
          </span>
        </Link>

        {/* Floating Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/80 shadow-xs" aria-label="Main Navigation">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                  isDashboardActive
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/practice"
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                  isPracticeActive
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Practice
              </Link>
              <Link
                to="/bookmarks"
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                  isBookmarksActive
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bookmarks
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                location.pathname === '/'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 bg-white hover:border-slate-300 text-xs font-medium shadow-xs transition cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="User account menu"
              >
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-100">
                  {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="max-w-[90px] truncate text-slate-800">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className="text-slate-400" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 divide-y divide-slate-100 animate-in fade-in duration-100" role="menu">
                  <div className="px-3.5 py-2">
                    <div className="font-semibold text-xs text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      role="menuitem"
                      className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={14} className="text-slate-400" aria-hidden="true" /> Profile &amp; Settings
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut size={14} aria-hidden="true" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-xs shadow-blue-500/20 transition cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
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
