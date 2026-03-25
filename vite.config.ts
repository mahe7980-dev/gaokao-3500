import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: '高考英语3500词消消乐',
        short_name: '高考单词',
        description: '通过消消乐玩法轻松记忆高考英语3500词',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icons.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
