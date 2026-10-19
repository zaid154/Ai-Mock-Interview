import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'mockmate_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (!consent) {
        const timer = setTimeout(() => setVisible(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // Storage unavailable
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted')
    } catch {}
    setVisible(false)
  }

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      role="region"
      aria-label="Cookie and storage notice"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        maxWidth: '420px',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.15rem',
          borderRadius: '12px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(37, 99, 235, 0.08)',
              display: 'grid',
              placeItems: 'center',
              color: '#2563eb',
              flexShrink: 0,
            }}
          >
            <Cookie size={16} aria-hidden="true" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', marginBottom: '0.2rem' }}>
              Storage &amp; Session Notice
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.5, color: '#6b7280' }}>
              MockMate AI uses essential local storage and session tokens to preserve authentication and interview progress. We do not use third-party advertising cookies.{' '}
              <Link to="/privacy" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
            aria-label="Dismiss cookie notice"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={accept}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
          >
            Acknowledge &amp; Accept
          </button>
        </div>
      </div>
    </aside>
  )
}
