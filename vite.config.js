import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  envPrefix: 'API_',
  server: {
    proxy: {
      '/api': {
        target: 'https://api.pharmacy.cmu.ac.th/smart_pharmacy/EventCheck-in/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/pdf': {
        target: 'https://api.pharmacy.cmu.ac.th/smart_pharmacy/EventCheck-in/pdf',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf/, ''),
      },
    },
  },
})
