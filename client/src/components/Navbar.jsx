import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessagesSquare,
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
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'User'

  // Close user menu when clicking outside
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

  return (
    <header className="navbar">
      {/* Brand & Desktop Primary Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to={user ? '/dashboard' : '/'} className="brand">
          <MessagesSquare size={22} />
          <span>MockMate<span className="brand-accent">AI</span></span>
        </Link>

        {user && (
          <nav className="nav-links nav-links-desktop">
            <Link to="/dashboard" className="nav-link">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link to="/bookmarks" className="nav-link">
              <Bookmark size={15} /> Bookmarks
            </Link>
            <Link to="/leaderboard" className="nav-link">
              <Trophy size={15} /> Leaderboard
            </Link>
            <Link to="/certificates" className="nav-link">
              <Award size={15} /> Certificates
            </Link>
          </nav>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="nav-links-desktop" style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="user-menu-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                padding: '0.35rem 0.85rem 0.35rem 0.45rem',
                color: 'var(--text)',
                cursor: 'pointer',
                font: 'inherit',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.18s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.9rem',
                }}
              >
                {user.avatar || firstName.charAt(0)}
              </div>
              <span>{firstName}</span>
              <ChevronDown size={14} className="muted" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div
                className="user-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.6rem)',
                  right: 0,
                  width: '230px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow)',
                  padding: '0.6rem',
                  zIndex: 50,
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                {/* Header info */}
                <div style={{ padding: '0.6rem 0.75rem 0.8rem', borderBottom: '1px solid var(--border-soft)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{user.name}</div>
                  <div className="muted small" style={{ wordBreak: 'break-all', marginTop: '0.1rem' }}>{user.email}</div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <span className="tag" style={{ margin: 0 }}>{user.role}</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    <User size={16} className="muted" /> Candidate Profile
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    >
                      <Shield size={16} style={{ color: 'var(--accent)' }} /> Admin Dashboard
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-soft)', margin: '0.3rem 0' }} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="dropdown-item danger"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      color: 'var(--bad)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <nav className="nav-links nav-links-desktop">
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/register" className="btn btn-primary">Get started</Link>
          </nav>
        )}

        {/* Mobile menu hamburger toggle */}
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

      {/* Mobile Nav Drawer & Overlay */}
      {user && drawerOpen && (
        <>
          <div
            className="mobile-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          />
          <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
            <div className="mobile-drawer-header">
              <span className="brand" style={{ fontSize: '1rem' }}>
                <MessagesSquare size={18} /> MockMate<span className="brand-accent">AI</span>
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-soft)' }}>
                <div style={{ fontWeight: 700 }}>{user.name}</div>
                <div className="muted small">{user.email}</div>
              </div>

              <Link to="/dashboard" className="nav-link" onClick={() => setDrawerOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/bookmarks" className="nav-link" onClick={() => setDrawerOpen(false)}>
                <Bookmark size={16} /> Bookmarks
              </Link>
              <Link to="/leaderboard" className="nav-link" onClick={() => setDrawerOpen(false)}>
                <Trophy size={16} /> Leaderboard
              </Link>
              <Link to="/certificates" className="nav-link" onClick={() => setDrawerOpen(false)}>
                <Award size={16} /> Certificates
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setDrawerOpen(false)}>
                <User size={16} /> Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={() => setDrawerOpen(false)}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              <button className="btn btn-ghost btn-block" onClick={handleLogout} style={{ marginTop: '1rem', color: 'var(--bad)' }}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
