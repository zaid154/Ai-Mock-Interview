import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Zap,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  function handleLogout() {
    setUserMenuOpen(false)
    setDrawerOpen(false)
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  function scrollToSection(id) {
    if (id === 'overview') {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 80
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className="brand">
          <div className="brand-icon-box">
            <Zap size={18} />
          </div>
          <span>
            MockMate <span className="brand-accent">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links nav-links-desktop">
          {user ? (
            <>
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
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => scrollToSection('overview')}
                className="nav-link"
                style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('benefits')}
                className="nav-link"
                style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
              >
                Benefits
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('specifications')}
                className="nav-link"
                style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
              >
                Specifications
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="nav-link"
                style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
              >
                How-to
              </button>
              <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>
                Leaderboard
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>


          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="user-menu-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3rem 0.6rem 0.3rem 0.3rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--accent-grad)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    overflow: 'hidden',
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span style={{ fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="muted" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '210px',
                    padding: '0.6rem',
                    zIndex: 110,
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-soft)', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{user.name}</div>
                    <div className="muted small" style={{ fontSize: '0.76rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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

          <button
            className="mobile-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Rendered via React Portal onto document.body */}
      {drawerOpen &&
        createPortal(
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.8rem' }}>
                {user ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setDrawerOpen(false); scrollToSection('overview'); }} className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', font: 'inherit', color: 'var(--text)' }}>
                      Overview
                    </button>
                    <button type="button" onClick={() => { setDrawerOpen(false); scrollToSection('benefits'); }} className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', font: 'inherit', color: 'var(--text)' }}>
                      Benefits
                    </button>
                    <button type="button" onClick={() => { setDrawerOpen(false); scrollToSection('specifications'); }} className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', font: 'inherit', color: 'var(--text)' }}>
                      Specifications
                    </button>
                    <button type="button" onClick={() => { setDrawerOpen(false); scrollToSection('how-it-works'); }} className="nav-link" style={{ background: 'none', border: 'none', textAlign: 'left', font: 'inherit', color: 'var(--text)' }}>
                      How-to
                    </button>
                    <Link to="/leaderboard" className="nav-link" onClick={() => setDrawerOpen(false)}>
                      Leaderboard
                    </Link>
                    <div style={{ borderTop: '1px solid var(--border-soft)', margin: '0.4rem 0' }} />
                    <Link to="/login" className="btn btn-secondary btn-block" onClick={() => setDrawerOpen(false)}>
                      Sign in
                    </Link>
                    <Link to="/register" className="btn btn-primary btn-block" onClick={() => setDrawerOpen(false)}>
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  )
}
