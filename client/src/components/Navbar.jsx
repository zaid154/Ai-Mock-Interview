import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { goToSection } from '../lib/scrollToSection'
import Avatar from './Avatar'
import NavDrawer from './NavDrawer'
import { Zap, User, LogOut, Shield, Menu, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleLogout() {
    setUserMenuOpen(false)
    setDrawerOpen(false)
    logout()
    navigate('/login')
  }

  const isDashboardActive =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/interview') ||
    location.pathname.startsWith('/quiz') ||
    location.pathname.startsWith('/results')

  const isPracticeActive = location.pathname === '/practice'
  const isBookmarksActive = location.pathname === '/bookmarks'
  const isLeaderboardActive = location.pathname === '/leaderboard'
  const isCertificatesActive =
    location.pathname === '/certificates' ||
    location.pathname.startsWith('/verify-certificate')

  function scrollToSection(id) {
    goToSection(id, { pathname: location.pathname, navigate })
  }

  return (
    <header className="reflect-header">
      <div className="reflect-header-inner">
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className="reflect-brand">
          <div className="reflect-brand-icon">
            <img src="/logo.png" alt="MockMate AI Logo" className="reflect-brand-img" />
          </div>
          <span className="reflect-brand-title">
            MockMate <span className="reflect-brand-badge">AI</span>
          </span>
        </Link>

        {/* Floating Glass Pill Navigation */}
        <nav className="reflect-nav-pill">
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
              <Link to="/leaderboard" className={`reflect-nav-link ${isLeaderboardActive ? 'active' : ''}`}>
                Leaderboard
              </Link>
              <Link to="/certificates" className={`reflect-nav-link ${isCertificatesActive ? 'active' : ''}`}>
                Certificates
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => scrollToSection('overview')}
                className={`reflect-nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('benefits')}
                className="reflect-nav-link"
              >
                Benefits
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('specifications')}
                className="reflect-nav-link"
              >
                Specifications
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="reflect-nav-link"
              >
                How-to
              </button>
              <Link to="/leaderboard" className={`reflect-nav-link ${isLeaderboardActive ? 'active' : ''}`}>
                Leaderboard
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="reflect-header-actions">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="reflect-user-btn"
              >
                <Avatar src={user.avatar} name={user.name} size={26} />
                <span className="reflect-user-name">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className="reflect-user-chevron" style={{ opacity: 0.6 }} />
              </button>

              {userMenuOpen && (
                <div className="reflect-dropdown">
                  <div className="reflect-dropdown-header">
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#f8fafc' }}>{user.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'rgba(239, 237, 253, 0.55)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Link to="/profile" className="reflect-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={14} /> Profile &amp; Settings
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="reflect-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <Shield size={14} /> Admin Settings
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="reflect-dropdown-item"
                      style={{ color: '#fb7185' }}
                    >
                      <LogOut size={14} /> Sign out
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
            aria-label="Open menu"
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
