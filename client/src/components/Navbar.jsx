import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { goToSection } from '../lib/scrollToSection'
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

  function scrollToSection(id) {
    goToSection(id, { pathname: location.pathname, navigate })
  }

  return (
    <header className="reflect-header">
      <div className="container reflect-header-inner">
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className="reflect-brand">
          <div className="reflect-brand-icon">
            <img src="/logo.png" alt="MockMate AI Logo" className="reflect-brand-img" />
          </div>
          <span className="reflect-brand-title">
            MockMate <span className="reflect-brand-badge">AI</span>
          </span>
        </Link>

        {/* Floating Pill Navigation */}
        <nav className="reflect-nav-pill" aria-label="Main Navigation">
          {user ? (
            <>
              <Link to="/dashboard" className={`reflect-nav-link ${isDashboardActive ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/practice" className={`reflect-nav-link ${isPracticeActive ? 'active' : ''}`}>
                Practice
              </Link>
              <Link to="/bookmarks" className={`reflect-nav-link ${isBookmarksActive ? 'active' : ''}`}>
                Bookmarks
              </Link>
            </>
          ) : (
            <Link to="/" className={`reflect-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="reflect-header-actions">
          {user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="reflect-user-btn"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="User account menu"
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'inline-grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="reflect-user-name">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className="reflect-user-chevron" style={{ opacity: 0.6 }} aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className="reflect-dropdown" role="menu">
                  <div className="reflect-dropdown-header">
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#111827' }}>{user.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Link to="/profile" role="menuitem" className="reflect-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={14} aria-hidden="true" /> Profile &amp; Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="reflect-dropdown-item"
                      style={{ color: '#dc2626' }}
                    >
                      <LogOut size={14} aria-hidden="true" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="reflect-auth-desktop">
              <Link to="/login" className="reflect-login-link">
                Sign in
              </Link>
              <Link to="/register" className="reflect-btn-primary" style={{ padding: '0.45rem 1.15rem', fontSize: '0.84rem' }}>
                Get Started
              </Link>
            </div>
          )}

          <button
            className="reflect-mobile-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <NavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        onLogout={handleLogout}
        onSectionClick={(id) => {
          setDrawerOpen(false)
          scrollToSection(id)
        }}
      />
    </header>
  )
}
