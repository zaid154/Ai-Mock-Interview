import { Link, useLocation } from 'react-router-dom'
import { Users, Award, Settings } from 'lucide-react'

/**
 * AdminNav: Shared top navigation and tab links for platform administration sub-pages.
 */
export default function AdminNav({ userCount }) {
  const location = useLocation()
  const path = location.pathname

  const isUsers = path === '/admin' || path === '/admin/users'
  const isCerts = path === '/admin/certificates'
  const isSettings = path === '/admin/settings'

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Platform Administration
          </h1>
          <p className="muted small" style={{ margin: 0 }}>
            Manage candidate accounts, milestone templates, and system configuration.
          </p>
        </div>

        <div className="admin-nav-pill">
          <Link
            to="/admin/users"
            className={`admin-nav-btn ${isUsers ? 'active' : ''}`}
          >
            <Users size={14} />
            <span>Users {typeof userCount === 'number' ? `(${userCount})` : ''}</span>
          </Link>
          <Link
            to="/admin/certificates"
            className={`admin-nav-btn ${isCerts ? 'active' : ''}`}
          >
            <Award size={14} />
            <span>Milestone Templates</span>
          </Link>
          <Link
            to="/admin/settings"
            className={`admin-nav-btn ${isSettings ? 'active' : ''}`}
          >
            <Settings size={14} />
            <span>System Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
