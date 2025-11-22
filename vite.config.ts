import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://learning-tutor-backend-ibvq.onrender.com',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'https://learning-tutor-backend-ibvq.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
