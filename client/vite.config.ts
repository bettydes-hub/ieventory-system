import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import { fileURLToPath, URL } from 'node:url'
=======
import path from 'path'
>>>>>>> 35e97bf7a8598053700e0d128c9fb0f86e0022ea

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
<<<<<<< HEAD
      '@': fileURLToPath(new URL('./src', import.meta.url)),
=======
      '@': path.resolve(__dirname, './src'),
>>>>>>> 35e97bf7a8598053700e0d128c9fb0f86e0022ea
    },
  },
  server: {
    port: 5501,
<<<<<<< HEAD
=======
    host: true,
>>>>>>> 35e97bf7a8598053700e0d128c9fb0f86e0022ea
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
