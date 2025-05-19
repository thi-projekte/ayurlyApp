import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // diese config wird nur in dev version genutzt -> nginx kümmert sich um forwarding bei prod build
        changeOrigin: true, // Notwendig für virtuelle Hosts
        // rewrite: (path) => path.replace(/^\/api/, '/api') // Optional, falls der Pfad umgeschrieben werden muss
      }
    }
  }
})
