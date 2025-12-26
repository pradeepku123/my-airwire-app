import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
// https://vitejs.dev/config/
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  define: {
    global: 'window',
  },
  server: {
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
    host: '0.0.0.0',
    port: 443,
    proxy: {
      '/socket.io': {
        target: 'http://backend:5000',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true
      }
    }
  }
})
