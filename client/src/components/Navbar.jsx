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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md overflow-hidden bg-white border border-slate-200 p-0.5 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-base">
              MockMate
            </span>
          </Link>

          {/* Clean Flat Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
              <Link
                to="/dashboard"
                className={`text-xs font-medium transition py-1 ${
                  isDashboardActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/practice"
                className={`text-xs font-medium transition py-1 ${
                  isPracticeActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Practice
              </Link>
              <Link
                to="/bookmarks"
                className={`text-xs font-medium transition py-1 ${
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
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 text-xs text-slate-700 transition cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="User account menu"
              >
                <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="font-medium text-slate-800 hidden sm:inline">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className="text-slate-400" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 divide-y divide-slate-100 animate-in fade-in duration-75" role="menu">
                  <div className="px-3 py-2">
                    <div className="font-semibold text-xs text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition"
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
                      className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut size={14} aria-hidden="true" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 transition">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition cursor-pointer"
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
