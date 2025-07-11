import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always use root path
const base = '/';

export default defineConfig({
  base,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.VERCEL ? 'production' : 'development'),
    global: 'globalThis',
    'process.env': {}
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the local Express server during development
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    emptyOutDir: true
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  envPrefix: 'VITE_'
});