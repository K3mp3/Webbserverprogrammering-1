// Lektion-01/klient/vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      // proxya alla anrop till /messages till din lokala backend på port 3000
      '/messages': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,      // om backend körs med självsignerat cert; annars true/ta bort
        // rewrite: (path) => path.replace(/^\/messages/, '/messages'), // ej nödv.
      },

      // Exempel: om du vill proxya allt under /api
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // tar bort "/api" innan vidarebefordran
      }
    }
  }
})
