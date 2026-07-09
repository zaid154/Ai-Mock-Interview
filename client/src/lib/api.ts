import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function apiError(err: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(err)) return err.response?.data?.error || fallback
  return fallback
}

export default api
