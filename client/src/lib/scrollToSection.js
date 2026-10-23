export function scrollToSectionId(id, { smooth = true } = {}) {
  if (id === 'overview') {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' })
    return 0
  }

  const el = document.getElementById(id)
  if (!el) return null

  const nav = document.querySelector('.reflect-header')
  const navHeight = nav ? nav.getBoundingClientRect().height : 56
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navHeight - 16)

  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' })
  return top
}

export function goToSection(id, { pathname, navigate }) {
  if (pathname !== '/') {
    navigate('/')
    setTimeout(() => scrollToSectionId(id), 100)
    return
  }
  scrollToSectionId(id)
}
