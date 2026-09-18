import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Das Backend setzt keine CORS-Header. Im Dev-Betrieb laeuft deshalb alles
// ueber denselben Origin: Vite nimmt /api entgegen und leitet an Quarkus weiter.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
