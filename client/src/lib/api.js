import axios from 'axios'

// Base URL: use VITE_API_URL if set, otherwise relative '/api'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

// Automatically attach Bearer token header if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mockmate_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Pull a readable message out of an axios error.
export function apiError(err, fallback = 'Something went wrong') {
  if (axios.isAxiosError(err)) return err.response?.data?.error || fallback
  return fallback
}

export default api
