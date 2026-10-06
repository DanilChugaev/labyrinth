import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json';

export default defineConfig({
  base: '/labyrinth/',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Labyrinth',
        short_name: 'Labyrinth',
        description: 'Процедурно генерируемые лабиринты с масштабированием и автосохранением',
        theme_color: '#1a1e28',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'labyrinth.webp',
            sizes: '1200x687',
            type: 'image/webp',
            form_factor: 'wide',
            label: 'Игровое поле Labyrinth',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webp}'],
      },
    }),
  ],
});
