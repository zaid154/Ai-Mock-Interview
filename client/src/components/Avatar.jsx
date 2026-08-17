import { useState } from 'react'

// ONE avatar renderer for the whole app. Before this, three places each decided
// for themselves what `user.avatar` meant: the navbar treated any non-empty
// string as an image URL (so an emoji avatar rendered as a broken <img>), while
// Profile and Leaderboard sniffed for http/data: prefixes and had their own
// fallbacks. Same user, three different faces.
//
// `avatar` is a single String on the User document holding one of:
//   - an https URL            -> render the image
//   - a data:image/... URL    -> render the image
//   - a /uploads/... path     -> render the image
//   - a single emoji          -> render the glyph
//   - '' (never set)          -> render the first letter of the name

export function isImageAvatar(value) {
  if (typeof value !== 'string' || !value) return false
  return /^(https?:\/\/|data:image\/|\/uploads\/)/.test(value)
}

// Hosts whose CDN resizes from query params. Asking for a 300px file to paint a
// 42px circle was costing ~4x the bytes needed, so rewrite the width to twice
// the rendered size (enough for a 2x display) and let the CDN do the work.
const RESIZABLE_HOSTS = new Set(['images.unsplash.com', 'plus.unsplash.com'])

function sizedSrc(src, size) {
  if (typeof src !== 'string' || !src.startsWith('http')) return src
  try {
    const url = new URL(src)
    if (!RESIZABLE_HOSTS.has(url.host)) return src
    const target = Math.min(512, Math.max(64, Math.round(size * 2)))
    url.searchParams.set('w', String(target))
    url.searchParams.set('h', String(target))
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('q', '75')
    return url.toString()
  } catch {
    return src
  }
}

export default function Avatar({ src, name, size = 40, ring = false, title, lazy = false }) {
  const [broken, setBroken] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const showImage = isImageAvatar(src) && !broken
  const glyph = (!isImageAvatar(src) && src) || name?.trim()?.charAt(0)?.toUpperCase() || 'C'

  return (
    <span
      className="avatar"
      title={title || name}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        boxShadow: ring ? '0 0 0 3px var(--surface), 0 0 0 4px var(--border)' : undefined,
      }}
    >
      {/* Always painted, and it costs nothing. A remote photo cannot even be
          requested until the page has booted, authenticated and fetched the
          list it belongs to — about a second on a cold load — and until this
          was here the user stared at an empty coloured disc for all of it.
          The letter is there immediately; the photo fades in over it. */}
      <span className="avatar-glyph" aria-hidden={showImage ? 'true' : undefined}>
        {glyph}
      </span>

      {showImage && (
        <img
          src={sizedSrc(src, size)}
          alt={name || 'Avatar'}
          className={loaded ? 'is-loaded' : ''}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          // Avatars are small and nearly always already on screen. Marking them
          // lazy made the browser defer the request until after layout, which
          // showed up as visibly late faces on the leaderboard. Opt in with
          // `lazy` only for genuinely long, scrolled lists.
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          fetchPriority={lazy ? 'auto' : 'high'}
          // Intrinsic size so the box is reserved before the bytes arrive.
          width={size}
          height={size}
        />
      )}
    </span>
  )
}
