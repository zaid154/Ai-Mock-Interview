// Single implementation of the landing page's in-page anchor scrolling, shared by
// the navbar, the mobile drawer and the footer (each used to carry its own copy,
// with a different hardcoded offset).
//
// Anchoring on the section element itself lands on its BORDER box. The landing
// sections carry 4rem-4.5rem of top padding, so that left a large empty gap under
// the navbar and still showed a sliver of the previous section above it. Offset
// by the section's own padding-top instead, so the first thing you actually see
// is the section's content, sitting a comfortable gap below the sticky navbar.

const GAP = 16

function navHeight() {
  const nav = document.querySelector('.navbar')
  if (nav) return nav.getBoundingClientRect().height
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))
  return Number.isFinite(v) ? v : 56
}

// Returns the offset it scrolled to, or null if the section is not on the page.
// Callers use the returned value to detect whether a later correction pass would
// be fighting the user.
export function scrollToSectionId(id, { smooth = true } = {}) {
  if (id === 'overview') {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' })
    return 0
  }

  const el = document.getElementById(id)
  if (!el) return null

  const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY + padTop - navHeight() - GAP)

  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' })
  return top
}

// Sections only exist on the landing page, so a click from anywhere else has to
// navigate first and wait for the route to paint before it can measure anything.
export function goToSection(id, { pathname, navigate }) {
  if (pathname !== '/') {
    navigate('/')
    requestAnimationFrame(() => {
      // two frames + a tick: the route swap has to commit before getBoundingClientRect
      // returns the landing page's geometry rather than the outgoing page's.
      requestAnimationFrame(() => setTimeout(() => scrollToSectionId(id), 60))
    })
    return
  }
  scrollToSectionId(id)
}
