import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import license from 'rollup-plugin-license'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import svg from 'vite-plugin-svgo'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = process.env.VITE_BASE_PATH || '/'
export default defineConfig({
  plugins: [
    tailwindcss(),
    svg(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        sourcemap: false,
      },
      manifest: {
        name: "Ace-WebUI",
        short_name: "acewebui",
        start_url: basePath,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        
        icons: [
          {src: 'custom-icon-16.png', sizes: '16x16', type: 'image/png' },
          { src: 'custom-icon-32.png', sizes: '32x32', type: 'image/png' },
          { src: 'custom-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'custom-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'custom-icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'custom-icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),

    license({
      thirdParty: {
        output: {
          file: path.join(__dirname, 'dist/licenses/3rdparty-licenses.txt'),
          encoding: 'utf-8',
        },
      },
    }),
  ],
  base: basePath,
  build: {
    sourcemap: false,
    assetsInlineLimit: 4096,
  }
})
