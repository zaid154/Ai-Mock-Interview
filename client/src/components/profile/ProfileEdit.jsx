import { Upload, Trash2, Link as LinkIcon, Save } from 'lucide-react'
import Avatar from '../Avatar'

const PRESET_AVATARS = ['🎯', '💻', '⚡', '🚀', '🧠', '💼', '🎓', '🤖', '🔥', '🛡️', '🌟', '👨‍💻']

/**
 * ProfileEdit: Photo upload, custom URL, emoji picker, name and bio form.
 */
export default function ProfileEdit({
  avatar, user, uploading, fileInputRef, hasPhoto, commitAvatar,
  customUrl, setCustomUrl, handleApplyCustomUrl,
  firstName, setFirstName, lastName, setLastName, bio, setBio,
  handleSaveProfile, savingProfile,
}) {
  return (
    <div className="panel" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h3 className="panel-title">Profile Picture</h3>
      <p className="muted small panel-hint">
        Upload a photo (cropped to 256px square), paste an image URL, or pick an avatar.
      </p>

      {/* Photo Picker */}
      <div className="photo-editor" style={{ marginBottom: '1.25rem' }}>
        <Avatar src={avatar} name={user?.name} size={84} ring />
        <div className="photo-editor-controls">
          <div className="photo-editor-buttons">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload size={14} /> {uploading ? 'Processing…' : 'Upload photo'}
            </button>
            {hasPhoto && (
              <button type="button" className="btn btn-ghost btn-sm profile-remove" onClick={() => commitAvatar('', 'Picture removed')}>
                <Trash2 size={14} /> Remove
              </button>
            )}
          </div>
          <span className="subtle small">JPG, PNG or WEBP</span>
        </div>
      </div>

      {/* URL or Emoji Selection */}
      <div className="field">
        <span className="field-label">Or paste image URL</span>
        <div className="input-with-action">
          <div className="input-icon-wrap">
            <LinkIcon size={14} className="input-icon" />
            <input type="url" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleApplyCustomUrl}>Apply</button>
        </div>
      </div>

      <div className="field">
        <span className="field-label">Or pick an avatar</span>
        <div className="emoji-picker">
          {PRESET_AVATARS.map((emoji) => (
            <button key={emoji} type="button" className={`emoji-option ${avatar === emoji ? 'selected' : ''}`} onClick={() => commitAvatar(emoji, 'Avatar updated')}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <hr className="panel-rule" style={{ margin: '1.5rem 0' }} />

      {/* Name & Bio Details Form */}
      <h3 className="panel-title">Account Details</h3>
      <form onSubmit={handleSaveProfile}>
        <div className="field-row">
          <div className="field">
            <span className="field-label">First name</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required />
          </div>
          <div className="field">
            <span className="field-label">Last name</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          </div>
        </div>

        <div className="field">
          <span className="field-label">Bio</span>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Target roles, tech stack, and what you are preparing for." />
        </div>

        <button type="submit" className="btn btn-primary" disabled={savingProfile}>
          <Save size={16} /> {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
