import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ayurly-data-service.winfprojekt.de',  // diese config wird nur in dev version genutzt -> nginx kümmert sich um forwarding bei prod build
        changeOrigin: true, // Notwendig für virtuelle Hosts
      },
      '/uploads': {
        target: 'https://ayurly.winfprojekt.de',  // diese config wird nur in dev version genutzt -> nginx kümmert sich um forwarding bei prod build
        changeOrigin: true, // Notwendig für virtuelle Hosts
      }
    }
  }
})
