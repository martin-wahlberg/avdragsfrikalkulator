import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages serverer bare filer som finnes. Uten dette gir /advanced 404,
 * fordi det ikke er en fil. En kopi av index.html som 404.html lar Pages
 * svare med appen, som så leser stien selv.
 */
function serveAppOnUnknownPaths() {
  return {
    name: 'serve-app-on-unknown-paths',
    closeBundle() {
      copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'))
    },
  }
}

// Absolutt base, ikke relativ: med ruter som /advanced ville relative
// asset-stier blitt tolket ulikt avhengig av dybden i stien.
export default defineConfig({
  base: '/avdragsfrikalkulator/',
  plugins: [react(), serveAppOnUnknownPaths()],
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        advanced: resolve('advanced/index.html'),
      },
    },
  },
})
