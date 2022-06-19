import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: { port: 8080 },
  plugins: [react()],
  define: {
    // By default, Vite doesn't include shims for NodeJS, so include global and process.env here
    global: {},
    'process.env': process.env,
  },
})
