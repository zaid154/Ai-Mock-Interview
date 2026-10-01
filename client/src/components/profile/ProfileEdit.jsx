import { Upload, Trash2, Link as LinkIcon, Save } from 'lucide-react'
import Avatar from '../Avatar'

const PRESET_AVATARS = [
  { char: '🎯', label: 'Target' },
  { char: '💻', label: 'Laptop' },
  { char: '⚡', label: 'Bolt' },
  { char: '🚀', label: 'Rocket' },
  { char: '🧠', label: 'Brain' },
  { char: '💼', label: 'Briefcase' },
  { char: '🎓', label: 'Graduation' },
  { char: '🤖', label: 'Robot' },
  { char: '🔥', label: 'Fire' },
  { char: '🛡️', label: 'Shield' },
  { char: '🌟', label: 'Star' },
  { char: '👨‍💻', label: 'Developer' }
]

export default function ProfileEdit({
  avatar, user, uploading, fileInputRef, hasPhoto, commitAvatar, onCommitAvatar,
  customUrl, setCustomUrl, handleApplyCustomUrl, onApplyCustomUrl,
  firstName, setFirstName, lastName, setLastName, bio, setBio,
  handleSaveProfile, onSaveProfile, savingProfile, onPhotoFileUpload,
}) {
  const saveProfile = onSaveProfile || handleSaveProfile
  const applyUrl = onApplyCustomUrl || handleApplyCustomUrl
  const doCommit = onCommitAvatar || commitAvatar

  return (
    <div className="panel" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onPhotoFileUpload}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <h2 className="panel-title" style={{ fontSize: '1.15rem', margin: '0 0 0.35rem' }}>Profile Picture</h2>
      <p className="muted small panel-hint">
        Upload a photo, paste an image URL, or pick an avatar icon.
      </p>

      {/* Photo Picker */}
      <div className="photo-editor" style={{ marginBottom: '1.25rem' }}>
        <Avatar src={avatar} name={user?.name} size={84} ring />
        <div className="photo-editor-controls">
          <div className="photo-editor-buttons">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={14} aria-hidden="true" /> {uploading ? 'Processing…' : 'Upload photo'}
            </button>
            {hasPhoto && (
              <button
                type="button"
                className="btn btn-ghost btn-sm profile-remove"
                onClick={() => doCommit('', 'Picture removed')}
              >
                <Trash2 size={14} aria-hidden="true" /> Remove
              </button>
            )}
          </div>
          <span className="subtle small">JPG, PNG or WEBP (max 2MB)</span>
        </div>
      </div>

      {/* URL or Emoji Selection */}
      <div className="field">
        <label htmlFor="profile-image-url" className="field-label">Or paste image URL</label>
        <div className="input-with-action">
          <div className="input-icon-wrap">
            <LinkIcon size={14} className="input-icon" aria-hidden="true" />
            <input
              id="profile-image-url"
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={applyUrl}>Apply</button>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Or pick an avatar icon</label>
        <div className="emoji-picker" role="radiogroup" aria-label="Preset avatars">
          {PRESET_AVATARS.map(({ char, label }) => (
            <button
              key={char}
              type="button"
              role="radio"
              aria-checked={avatar === char}
              aria-label={`Select avatar ${label}`}
              className={`emoji-option ${avatar === char ? 'selected' : ''}`}
              onClick={() => doCommit(char, 'Avatar updated')}
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      <hr className="panel-rule" style={{ margin: '1.5rem 0' }} />

      {/* Name & Bio Details Form */}
      <h2 className="panel-title" style={{ fontSize: '1.15rem', margin: '0 0 0.75rem' }}>Account Details</h2>
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
