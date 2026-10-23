import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requireEmailVerification, setRequireEmailVerification] = useState(null)

  async function refreshVerificationSetting() {
    try {
      const { data } = await api.get('/auth/verification-settings')
      setRequireEmailVerification(data.requireEmailVerification === true)
      return data.requireEmailVerification === true
    } catch {
      return false
    }
  }

  useEffect(() => {
    Promise.all([api.get('/auth/me').catch(() => null), refreshVerificationSetting().catch(() => false)])
      .then(([res]) => {
        if (res?.data?.user) {
          setUser(res.data.user)
        }
      })
      .catch((err) => {
        if (err.response?.data?.needsVerification) {
          setUser({ email: err.response.data.email, isEmailVerified: false, isVerified: false })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('mockmate_token', data.token)
    }
    setUser(data.user)
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    return data
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {}
    localStorage.removeItem('mockmate_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        requireEmailVerification,
        refreshVerificationSetting,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
