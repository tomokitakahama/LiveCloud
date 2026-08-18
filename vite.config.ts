import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'LiveCloud',
        short_name: 'LiveCloud',
        description: 'ライブの思い出を記録するアプリ',
        start_url: '/LiveCloud/',
        scope: '/LiveCloud/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#863bff',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}'],
      },
    }),
  ],
  base: "/LiveCloud/",
})
