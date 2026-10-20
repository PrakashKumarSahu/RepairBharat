import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/accounts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Raise the warning threshold — the modular split reduces chunk size significantly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual code-splitting: vendor libs in a separate chunk
        manualChunks: (id) => {
          if (id.includes('react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('react-router-dom') || id.includes('@remix-run')) return 'vendor-router';
          if (id.includes('node_modules/axios/')) return 'vendor-axios';
          if (id.includes('react-hot-toast')) return 'vendor-toast';
        },
      },
    },
  },
})
