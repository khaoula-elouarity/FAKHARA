import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { reactCompilerPreset } from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_API_URL is the single source of truth for the backend URL.
  // The dev/preview proxy strips the trailing "/api" to get the server origin.
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = (env.VITE_API_URL || '').trim()
  const apiTarget =
    process.env.API_PROXY_TARGET ||
    (apiUrl ? apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '') : '') ||
    'http://localhost:5000'

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
      watch: {
        ignored: ['**/server/data/**'],
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
