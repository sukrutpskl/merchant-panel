import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://losing-longitude-consequently-based.trycloudflare.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
