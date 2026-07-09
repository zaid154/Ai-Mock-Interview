import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import api from '../lib/api'
import type { User } from '../lib/types'

interface AuthValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
