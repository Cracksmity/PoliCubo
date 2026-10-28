import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Versión de package.json disponible en la app (se muestra en el header y la ayuda)
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
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
