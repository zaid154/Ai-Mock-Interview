import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The whole project shares ONE .env at the root (one level above /client).
  envDir: '..',
  server: {
    port: 5173,
    // In dev, proxy /api to the backend so the client can call /api/... directly.
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
})
