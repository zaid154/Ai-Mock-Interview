import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The whole project shares ONE .env at the root (one level above /client).
  envDir: '..',
  server: {
    port: 5174,
    // In dev, proxy /api to the backend so the client can call /api/... directly.
    // (Ports 5050/5174 avoid clashing with the sibling "mockmate" project on 5000/5173.)
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
})
