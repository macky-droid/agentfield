import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Environment variables with defaults
  const devPort = parseInt(process.env.VITE_DEV_PORT || '5173')
  const basePath = '/'

  return {
    plugins: [react()],
    base: basePath,
    server: {
      port: devPort,
      host: process.env.VITE_DEV_HOST || 'localhost',
    },
    build: {
      outDir: process.env.VITE_BUILD_OUT_DIR || 'dist',
      sourcemap: process.env.VITE_BUILD_SOURCEMAP === 'true',
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
