import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Optimizar imports de Three.js y R3F
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    // La escena 3D (Three.js) va en su propio chunk de ~1,2 MB que se carga en diferido;
    // la interfaz inicial pesa ~250 KB
    chunkSizeWarningLimit: 1300,
  },
});
