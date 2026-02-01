import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy only works in development
    // In production, VITE_API_URL will be the full Render URL
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path // Keep the path as-is
      }
    }
  },
  // Build configuration for SPA routing on Vercel
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
