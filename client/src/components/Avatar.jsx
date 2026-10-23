import { useState } from 'react'

export default function Avatar({ src, name, size = 40, className = '' }) {
  const [error, setError] = useState(false)
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U'

  return (
    <span
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: Math.round(size * 0.42),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'var(--surface-2, #f3f4f6)',
        color: 'var(--text, #111827)',
        fontWeight: 600,
        userSelect: 'none',
      }}
    >
      {src && !error ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          onError={() => setError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span className="avatar-glyph">{initial}</span>
      )}
    </span>
  )
}
