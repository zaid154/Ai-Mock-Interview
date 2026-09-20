import { Trash2, ShieldPlus, ShieldMinus, ShieldCheck } from 'lucide-react'
import Avatar from '../Avatar'

/**
 * AdminUsersTable Component
 * 
 * Displays candidate accounts table with:
 * 1. Verification toggle
 * 2. Role promotion/demotion (admin vs user)
 * 3. Cascade deletion with protection preventing self-deletion
 */
export default function AdminUsersTable({
  users,
  me,
  toggleVerified,
  toggleRole,
  deleteUser,
}) {
  return (
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verification</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isMe = u._id === me?._id
              return (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Avatar src={u.avatar} name={u.name} size={30} />
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="mono small" style={{ color: 'rgba(239, 237, 253, 0.7)' }}>{u.email}</td>
                  <td>
                    <span className={`admin-role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`admin-status-btn ${u.isVerified ? 'verified' : 'unverified'}`}
                      onClick={() => toggleVerified(u)}
                      title={u.isVerified ? 'Click to unverify' : 'Click to verify'}
                    >
                      <ShieldCheck size={13} />
                      {u.isVerified ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td style={{ color: 'rgba(239, 237, 253, 0.55)', fontSize: '0.8rem' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => toggleRole(u)}
                        disabled={isMe}
                        title={u.role === 'admin' ? 'Demote to candidate' : 'Promote to admin'}
                      >
                        {u.role === 'admin' ? <ShieldMinus size={13} /> : <ShieldPlus size={13} />}
                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </button>

                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => deleteUser(u)}
                        disabled={isMe}
                        title={isMe ? 'Cannot delete yourself' : 'Delete user'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
