import { Save } from 'lucide-react'

export default function ProfileEdit({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  bio,
  setBio,
  savingProfile,
  onSaveProfile,
  handleSaveProfile,
}) {
  const saveProfile = onSaveProfile || handleSaveProfile

  return (
    <div className="panel" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h2 className="panel-title" style={{ fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Account Details</h2>
      <p className="muted small panel-hint" style={{ marginBottom: '1.25rem' }}>
        Update your personal details, target roles, and career preferences.
      </p>

      <form onSubmit={saveProfile}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="profile-first-name" className="field-label">First name</label>
            <input
              id="profile-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="profile-last-name" className="field-label">Last name</label>
            <input
              id="profile-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="profile-bio" className="field-label">Bio &amp; Target Roles</label>
          <textarea
            id="profile-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Target roles, tech stack, and what you are preparing for."
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={savingProfile}>
          <Save size={16} aria-hidden="true" /> {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
