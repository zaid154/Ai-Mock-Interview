import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router keeps the window scroll offset across route changes, so clicking a
// navbar link while scrolled to the bottom of one page dropped you at the bottom
// of the next one. Reset on every pathname change.
//
// `behavior: 'instant'` is deliberate: html has `scroll-behavior: smooth`, so a
// plain window.scrollTo(0, 0) would animate the whole page back up on every
// navigation instead of the new page simply starting at the top.
//
// A hash is left alone — that is an in-page anchor (the landing sections), and
// the navbar/footer handlers scroll to it themselves.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
