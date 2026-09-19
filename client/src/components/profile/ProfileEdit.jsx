import { Upload, Trash2, Link as LinkIcon, Save, Eye, Image as ImageIcon } from 'lucide-react'
import Avatar from '../Avatar'
import { approxDataUrlKb } from '../../lib/image'

const PRESET_AVATARS = ['🎯', '💻', '⚡', '🚀', '🧠', '💼', '🎓', '🤖', '🔥', '🛡️', '🌟', '👨‍💻']

/**
 * ProfileEdit Component
 * 
 * Manages photo upload / custom URL / emoji picker,
 * candidate first and last name, bio, and live avatar preview rail.
 */
export default function ProfileEdit({
  avatar,
  user,
  uploading,
  fileInputRef,
  hasPhoto,
  commitAvatar,
  customUrl,
  setCustomUrl,
  handleApplyCustomUrl,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  bio,
  setBio,
  handleSaveProfile,
  savingProfile,
  userRank,
  stats,
}) {
  return (
    <div className="profile-panes">
      <div className="panel">
        <h3 className="panel-title">Profile picture</h3>
        <p className="muted small panel-hint">
          Uploads are cropped square and resized to 256px, staying lightweight across the app.
        </p>

        <div className="photo-editor">
          <Avatar src={avatar} name={user?.name} size={84} ring />

          <div className="photo-editor-controls">
            <div className="photo-editor-buttons">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={14} /> {uploading ? 'Processing…' : 'Upload photo'}
              </button>
              {hasPhoto && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm profile-remove"
                  onClick={() => commitAvatar('', 'Picture removed')}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
            <span className="subtle small">JPG, PNG or WEBP</span>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Or paste an image URL</span>
          <div className="input-with-action">
            <div className="input-icon-wrap">
              <LinkIcon size={14} className="input-icon" />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleApplyCustomUrl}>
              Apply
            </button>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Or pick an avatar</span>
          <div className="emoji-picker">
            {PRESET_AVATARS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                className={`emoji-option ${avatar === emoji ? 'selected' : ''}`}
                onClick={() => commitAvatar(emoji, 'Avatar updated')}
                aria-label={`Use ${emoji} as avatar`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <hr className="panel-rule" />

        <h3 className="panel-title">Details</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="field-row">
            <div className="field">
              <span className="field-label">First name</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Mohd" required />
            </div>
            <div className="field">
              <span className="field-label">Last name</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Zaid" />
            </div>
          </div>

          <div className="field">
            <span className="field-label">Bio</span>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Target roles, stack, and what you are preparing for."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            <Save size={16} /> {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Right Rail: Avatar Appearance Previews */}
      <aside className="panel profile-aside">
        <h3 className="panel-title">
          <Eye size={16} /> Live preview
        </h3>
        <p className="muted small panel-hint">How your picture appears across the app.</p>

        <div className="preview-stack">
          <div className="preview-row">
            <span className="preview-label">Navigation</span>
            <span className="preview-chip">
              <Avatar src={avatar} name={firstName || user?.name} size={28} />
              <span>{firstName || user?.name?.split(' ')[0] || 'User'}</span>
            </span>
          </div>

          <div className="preview-row">
            <span className="preview-label">Leaderboard</span>
            <span className="preview-lb">
              <span className="preview-rank mono">
                {userRank ? `#${userRank}` : stats.avgScore > 0 ? '#—' : '—'}
              </span>
              <Avatar src={avatar} name={`${firstName} ${lastName}`.trim() || user?.name} size={38} />
              <span className="preview-lb-text">
                <strong>{`${firstName} ${lastName}`.trim() || user?.name}</strong>
                <span className="subtle small">{stats.avgScore}% average</span>
              </span>
            </span>
          </div>

          <div className="preview-row">
            <span className="preview-label">Profile</span>
            <Avatar src={avatar} name={user?.name} size={64} />
          </div>
        </div>

        <div className="preview-note">
          <ImageIcon size={14} />
          <span className="small">
            {hasPhoto
              ? `Stored as a 256px square, about ${approxDataUrlKb(avatar) || '—'} KB.`
              : 'No photo set — your initial is shown instead.'}
          </span>
        </div>
      </aside>
    </div>
  )
}
