import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        // Remove direct API key exposure - now handled by backend
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api'),
        'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME || 'Simulador de Escritor IA'),
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION || '2.0.0')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        port: 5173,
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true
          }
        }
      }
    };
});