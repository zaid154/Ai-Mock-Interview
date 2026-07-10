import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Guards signed-in-only pages. Waits for auth to resolve, then redirects to
// /login if there's no user.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="page-center muted">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}
