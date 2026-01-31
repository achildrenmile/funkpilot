import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { writeFileSync } from 'fs'

// Generate build version (timestamp + random suffix)
const buildVersion = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-version',
      closeBundle() {
        // Write version to dist folder after build
        writeFileSync(
          path.resolve(__dirname, 'dist', 'version.json'),
          JSON.stringify({ version: buildVersion, buildTime: new Date().toISOString() })
        )
        console.log(`Build version: ${buildVersion}`)
      },
    },
  ],
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
