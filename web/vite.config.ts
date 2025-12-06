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
