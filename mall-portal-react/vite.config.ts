import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const target = env.VITE_API_TARGET || 'http://localhost:8080'
  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            antd: ['antd', '@ant-design/icons']
          }
        }
      }
    },
    server: {
      port: 5176,
      strictPort: true,
      proxy: {
        '/api': { target, changeOrigin: true },
        '/images': { target, changeOrigin: true }
      }
    }
  }
})
