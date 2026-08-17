import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Light is the shipped design: the theme switcher was deliberately removed from
  // both the navbar and the admin panel, so a visitor has no way to change this.
  // Following prefers-color-scheme here handed dark-mode users a dark UI they
  // could not switch out of. A stored preference is still honoured.
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mockmate_theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mockmate_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
