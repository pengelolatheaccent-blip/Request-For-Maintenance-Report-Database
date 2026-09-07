import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ganti '/nama-repo-github/' sesuai nama repository Anda saat deploy ke GitHub Pages.
// Untuk pengembangan lokal, ini tidak berpengaruh.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
