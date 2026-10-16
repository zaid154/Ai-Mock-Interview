import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'

export default function NavDrawer({
  isOpen,
  onClose,
  user,
  onLogout,
  onSectionClick
}) {
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div
        className="mobile-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 0, 20, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 998
        }}
      />
      <div
        className="mobile-drawer open"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(320px, 85vw)',
          height: '100dvh',
          background: 'rgba(5, 2, 28, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
          padding: '1.25rem',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#f4f0ff' }}>
              <div className="reflect-brand-icon" style={{ width: '26px', height: '26px' }}>
                <img src="/logo.png" alt="MockMate AI Logo" className="reflect-brand-img" />
              </div>
              <span>MockMate <span style={{ color: '#c084fc', fontSize: '0.85rem' }}>AI</span></span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', padding: '4px' }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1.25rem' }}>
            {user ? (
              <>
                <Link to="/dashboard" className="reflect-nav-link-mobile" onClick={onClose}>Dashboard</Link>
                <Link to="/practice" className="reflect-nav-link-mobile" onClick={onClose}>Practice</Link>
                <Link to="/bookmarks" className="reflect-nav-link-mobile" onClick={onClose}>Bookmarks</Link>
                <Link to="/leaderboard" className="reflect-nav-link-mobile" onClick={onClose}>Leaderboard</Link>
                <Link to="/certificates" className="reflect-nav-link-mobile" onClick={onClose}>Certificates</Link>
                <Link to="/profile" className="reflect-nav-link-mobile" onClick={onClose}>Profile &amp; Settings</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="reflect-nav-link-mobile" onClick={onClose}>Admin Settings</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/" className="reflect-nav-link-mobile" onClick={onClose}>Home</Link>
                <Link to="/leaderboard" className="reflect-nav-link-mobile" onClick={onClose}>Leaderboard</Link>
              </>
            )}
          </nav>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {user ? (
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                background: 'rgba(244, 63, 94, 0.1)',
                color: '#fb7185',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.88rem'
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <>
              <Link to="/login" onClick={onClose} className="reflect-btn-secondary" style={{ width: '100%', textAlign: 'center', padding: '0.65rem' }}>
                Sign in
              </Link>
              <Link to="/register" onClick={onClose} className="reflect-btn-primary" style={{ width: '100%', textAlign: 'center', padding: '0.65rem' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
