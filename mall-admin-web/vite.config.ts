import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// 与其余三个前端保持一致：后端地址可用 VITE_API_TARGET 覆盖，默认 8080
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const target = env.VITE_API_TARGET || 'http://localhost:8080'
  return {
    plugins: [vue()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target, changeOrigin: true },
        '/images': { target, changeOrigin: true }
      }
    }
  }
})
