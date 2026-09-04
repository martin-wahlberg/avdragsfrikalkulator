import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works on GitHub Pages under any
// repo name (user.github.io/<repo>/) without extra configuration.
export default defineConfig({
  base: './',
  plugins: [react()],
})
