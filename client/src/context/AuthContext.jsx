import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

// Holds the signed-in user and the auth actions. `user` includes role and
// isVerified so the UI can show the admin link and verification prompts.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore the session on first load if a token is present.
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    // When verification is mandatory the server withholds the token until the
    // user verifies, so only log them in if a token actually came back.
    if (data.token) {
      localStorage.setItem('token', data.token)
      setUser(data.user)
    }
    return data
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore — clear locally regardless
    }
    localStorage.removeItem('token')
    setUser(null)
  }

  // Re-fetch the user (used after verifying email or uploading a resume).
  async function refreshUser() {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
