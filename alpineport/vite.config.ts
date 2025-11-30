import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import license from 'rollup-plugin-license'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import svg from 'vite-plugin-svgo'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    tailwindcss(),
  //  svg(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: "Ace-WebUI",
        short_name: "acewebui",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",

        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
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
  base: './ace-WebUI/',
  build: {
    sourcemap: false,
    assetsInlineLimit: 4096,
  }
})
