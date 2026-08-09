import axios from 'axios'

// Base URL: use VITE_API_URL if set, otherwise the relative '/api' (works both
// with the Vite dev proxy and when the client is served same-origin in prod).
// withCredentials: true ensures HttpOnly cookies are automatically attached to requests
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

// Pull a readable message out of an axios error.
export function apiError(err, fallback = 'Something went wrong') {
  if (axios.isAxiosError(err)) return err.response?.data?.error || fallback
  return fallback
}

export default api
