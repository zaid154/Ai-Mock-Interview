import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Like ProtectedRoute but also requires the admin role. Non-admins are bounced
// to the dashboard.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="page-center muted">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}
