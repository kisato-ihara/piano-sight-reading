import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/piano-sight-reading/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '譜読み練習',
        short_name: '譜読み',
        description: 'ピアノの譜読み練習アプリ',
        theme_color: '#1e293b',
        background_color: '#f5f5f5',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff,woff2}'],
      },
    }),
  ],
})
