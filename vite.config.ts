import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { writeFileSync } from 'fs'

// Generate build version (timestamp + random suffix)
const buildVersion = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'FunkPilot - Amateurfunk Assistent',
        short_name: 'FunkPilot',
        description: 'KI-gestützter Amateurfunk-Assistent',
        theme_color: '#1e3a5f',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Skip waiting ensures new service worker activates immediately
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.hamqth\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hamqth-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 }
            }
          },
          {
            urlPattern: /^https:\/\/funkpilot\.oeradio\.at\/api/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 }
            }
          }
        ]
      }
    }),
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
