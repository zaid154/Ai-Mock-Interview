import { Link, useNavigate } from 'react-router-dom'
import { MessagesSquare, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.name?.trim().split(/\s+/)[0]

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="brand">
        <MessagesSquare size={20} />
        <span>MockMate<span className="brand-accent">AI</span></span>
      </Link>

      <nav className="nav-links">
        {user ? (
          <>
            {firstName && <span className="muted hide-sm">Hi, {firstName}</span>}
            <Link to="/dashboard" className="nav-link hide-sm">Dashboard</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link">
                <Shield size={14} /> Admin
              </Link>
            )}
            <button className="btn btn-ghost" onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Sign in</Link>
            <Link to="/register" className="btn btn-primary">Get started</Link>
          </>
        )}
      </nav>
    </header>
  )
}
