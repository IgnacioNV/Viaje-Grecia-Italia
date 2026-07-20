import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/**', 'seed-docs/**', 'images/**', 'profile-photos/**', 'boarding-passes/**'],
      manifest: {
        name: 'Viaje Europa 2026 · Valcarce',
        short_name: 'Europa',
        description: 'Bari · Crucero · Grecia — Julio 2026',
        theme_color: '#1B3FA6',
        background_color: '#EFF2F7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2,avif,webp,jpg,jpeg,pdf}'],
        runtimeCaching: [
          {
            urlPattern: /\/seed-docs\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'seed-docs', expiration: { maxEntries: 100 } }
          },
          {
            urlPattern: /\/boarding-passes\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'boarding-passes', expiration: { maxEntries: 50 } }
          },
          {
            urlPattern: /\/profile-photos\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'profile-photos', expiration: { maxEntries: 50 } }
          }
        ]
      }
    })
  ]
})
