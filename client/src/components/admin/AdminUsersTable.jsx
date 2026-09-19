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
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isMe = u._id === me?._id
            return (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Avatar src={u.avatar} name={u.name} size={30} />
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td className="mono small">{u.email}</td>
                <td>
                  <span className={`tag ${u.role === 'admin' ? 'tag-primary' : 'tag-soft'}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={`btn btn-ghost btn-xs ${u.isVerified ? 'text-good' : 'text-warn'}`}
                    onClick={() => toggleVerified(u)}
                    title={u.isVerified ? 'Click to unverify' : 'Click to verify'}
                  >
                    <ShieldCheck size={14} />
                    {u.isVerified ? 'Verified' : 'Unverified'}
                  </button>
                </td>
                <td className="muted small">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => toggleRole(u)}
                      disabled={isMe}
                      title={u.role === 'admin' ? 'Demote to candidate' : 'Promote to admin'}
                    >
                      {u.role === 'admin' ? <ShieldMinus size={13} /> : <ShieldPlus size={13} />}
                      {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-bad"
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
  )
}
