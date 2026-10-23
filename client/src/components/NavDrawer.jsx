import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'

export default function NavDrawer({ isOpen, onClose, user, onLogout }) {
  if (!isOpen) return null

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 998
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '280px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderLeft: '1px solid #e5e7eb',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.1)',
          padding: '1.25rem',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#111827' }}>
              <div className="reflect-brand-icon" style={{ width: '26px', height: '26px' }}>
                <img src="/logo.png" alt="MockMate AI Logo" className="reflect-brand-img" />
              </div>
              <span>MockMate <span style={{ color: '#2563eb', fontSize: '0.85rem' }}>AI</span></span>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}
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
                <Link to="/profile" className="reflect-nav-link-mobile" onClick={onClose}>Profile &amp; Settings</Link>
              </>
            ) : (
              <Link to="/" className="reflect-nav-link-mobile" onClick={onClose}>Home</Link>
            )}
          </nav>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                border: '1px solid rgba(220, 38, 38, 0.3)',
                background: 'rgba(220, 38, 38, 0.08)',
                color: '#dc2626',
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
