import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import AdminNav from '../components/admin/AdminNav'
import AdminUsersTable from '../components/admin/AdminUsersTable'

/**
 * AdminUsers: Dedicated platform administration sub-page for user management.
 */
export default function AdminUsers() {
  const { user: me } = useAuth()
  const { confirm } = useConfirm()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadUsers() {
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.users || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load users'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function toggleVerified(u) {
    try {
      await api.patch(`/admin/users/${u._id}/verified`, { isVerified: !u.isVerified })
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isVerified: !x.isVerified } : x)))
      toast.success(`${u.email} verification updated`)
    } catch (err) {
      toast.error(apiError(err, 'Could not update user verification'))
    }
  }

  async function toggleRole(u) {
    const nextRole = u.role === 'admin' ? 'user' : 'admin'
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role: nextRole })
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role: nextRole } : x)))
      toast.success(`${u.email} is now ${nextRole}`)
    } catch (err) {
      toast.error(apiError(err, 'Could not change role'))
    }
  }

  async function deleteUser(u) {
    const ok = await confirm({
      title: 'Delete user?',
      message: `Permanently delete ${u.email}? All past interviews and evaluations will be removed.`,
      confirmText: 'Delete permanently',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/admin/users/${u._id}`)
      setUsers((prev) => prev.filter((x) => x._id !== u._id))
      toast.success('User removed')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete user'))
    }
  }

  if (loading) return <main className="page-center muted">Loading user directory…</main>

  return (
    <main className="container" style={{ paddingTop: '1.25rem', paddingBottom: '3.5rem' }}>
      <AdminNav userCount={users.length} />
      <AdminUsersTable
        users={users}
        me={me}
        toggleVerified={toggleVerified}
        toggleRole={toggleRole}
        deleteUser={deleteUser}
      />
    </main>
  )
}
