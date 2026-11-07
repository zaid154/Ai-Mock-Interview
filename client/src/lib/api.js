import axios from 'axios'

// Base URL: use VITE_API_URL if set, otherwise relative '/api'
const baseURL =
  (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) || '/api'

const api = axios.create({
  baseURL,
  withCredentials: true,
})

// Automatically attach Bearer token header if present in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('mockmate_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Pull a readable message string out of an axios error or generic error.
// Guarantees a safe string is always returned (never returns an object, preventing React error #31).
export function apiError(err, fallback = 'Something went wrong') {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    // 1. Raw string response
    if (typeof data === 'string' && data.trim()) return data.trim()
    // 2. Standard backend error property (e.g. { error: "User not found" })
    if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim()
    // 3. Nested error object from Vercel / edge proxies (e.g. { error: { code: '404', message: 'The page could not be found' } })
    if (typeof data?.error?.message === 'string' && data.error.message.trim()) {
      return data.error.message.trim()
    }
    // 4. Standard message property (e.g. { message: "Internal server error" })
    if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim()
    // 5. Friendly status-based message if response has no text
    if (err.response?.status === 404) {
      return 'API endpoint not found (404). Please ensure the backend server is running and VITE_API_URL is configured.'
    }
    if (err.response?.status === 502 || err.response?.status === 503) {
      return 'Backend service is temporarily unavailable. Please try again shortly.'
    }
    if (err.message && typeof err.message === 'string') return err.message
  }
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string' && err.trim()) return err.trim()
  return fallback
}

export default api
