import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LogOut,
  Shield,
  Sun,
  Moon,
  Bookmark,
  Trophy,
  Award,
  User,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Candidate'

  const [hideThemeToggle, setHideThemeToggle] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get('/auth/verification-settings')
        if (res.data?.hideThemeToggle !== undefined) {
          const val = res.data.hideThemeToggle
          setHideThemeToggle(val === true || val === 'true')
        }
      } catch (err) {
        // silent fallback
      }
    }

    fetchSettings()

    function handleSettingsUpdate(e) {
      if (e?.detail?.hideThemeToggle !== undefined) {
        const val = e.detail.hideThemeToggle
        setHideThemeToggle(val === true || val === 'true')
      } else {
        fetchSettings()
      }
    }

    window.addEventListener('settings-updated', handleSettingsUpdate)
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    setUserMenuOpen(false)
    setDrawerOpen(false)
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  function scrollToSection(id) {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="navbar">
      {/* Brand Logo & Desktop Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link to={user ? '/dashboard' : '/'} className="brand">
          <div className="brand-icon-box">
            <Zap size={18} />
          </div>
          <span>MockMate</span>
        </Link>

        {user ? (
          <nav className="nav-links nav-links-desktop">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link to="/bookmarks" className={`nav-link ${isActive('/bookmarks') ? 'active' : ''}`}>
              Bookmarks
            </Link>
            <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>
              Leaderboard
            </Link>
            <Link to="/certificates" className={`nav-link ${isActive('/certificates') ? 'active' : ''}`}>
              Certificates
            </Link>
          </nav>
        ) : (
          <nav className="nav-links nav-links-desktop">
            <button type="button" onClick={() => scrollToSection('overview')} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Overview
            </button>
            <button type="button" onClick={() => scrollToSection('benefits')} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Benefits
            </button>
            <button type="button" onClick={() => scrollToSection('specifications')} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Specifications
            </button>
            <button type="button" onClick={() => scrollToSection('how-it-works')} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              How-to
            </button>
          </nav>
        )}
      </div>

      {/* Right User Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {!hideThemeToggle && (
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        )}

        {user ? (
          <div className="nav-links-desktop" style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: '8px',
                padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image')) ? (
                  <img src={user.avatar} alt={firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.avatar || firstName.charAt(0).toUpperCase()
                )}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{firstName}</span>
              <ChevronDown
                size={14}
                className="muted"
                style={{
                  transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s',
                }}
              />
            </button>

            {userMenuOpen && (
              <div
                className="panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  width: '220px',
                  padding: '0.6rem',
                  zIndex: 150,
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{ padding: '0.4rem 0.5rem 0.6rem', borderBottom: '1px solid var(--border-soft)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{user.name}</div>
                  <div className="muted mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all', marginTop: '0.1rem' }}>
                    {user.email}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                  <Link
                    to="/profile"
                    className="nav-link"
                    onClick={() => setUserMenuOpen(false)}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <User size={15} /> Profile &amp; Settings
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="nav-link"
                      onClick={() => setUserMenuOpen(false)}
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      <Shield size={15} /> Admin Settings
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-soft)', margin: '0.3rem 0' }} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="nav-link"
                    style={{
                      width: '100%',
                      justify: 'flex-start',
                      color: 'var(--bad)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <nav className="nav-links nav-links-desktop">
            <Link to="/login" className="nav-link">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </nav>
        )}

        {user && (
          <button
            className="mobile-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      {user && drawerOpen && (
        <>
          <div className="mobile-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.8rem' }}>
              <span className="brand" style={{ fontSize: '1.1rem' }}>
                MockMate
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
              <Link to="/dashboard" className="nav-link" onClick={() => setDrawerOpen(false)}>
                Dashboard
              </Link>
              <Link to="/bookmarks" className="nav-link" onClick={() => setDrawerOpen(false)}>
                Bookmarks
              </Link>
              <Link to="/leaderboard" className="nav-link" onClick={() => setDrawerOpen(false)}>
                Leaderboard
              </Link>
              <Link to="/certificates" className="nav-link" onClick={() => setDrawerOpen(false)}>
                Certificates
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setDrawerOpen(false)}>
                Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={() => setDrawerOpen(false)}>
                  Admin
                </Link>
              )}
              <button className="btn btn-danger btn-block" onClick={handleLogout} style={{ marginTop: '1rem' }}>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
