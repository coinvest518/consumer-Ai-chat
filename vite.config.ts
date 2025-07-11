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
      "@": path.resolve(__dirname, './src'),
      // Map all use-sync-external-store imports to React's built-in implementation
      "use-sync-external-store/shim": "react",
      "use-sync-external-store/shim/with-selector": "react",
      "use-sync-external-store": "react",
      // Ensure radix-ui components use the same React instance
      "react": path.resolve(__dirname, './node_modules/react'),
      "react-dom": path.resolve(__dirname, './node_modules/react-dom')
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
    // Ensure assets are properly handled with the correct base path
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            return 'vendor';
          }
          
          // Only chunk specific file patterns, avoid directories
          if (id.includes('/src/components/') && id.endsWith('.tsx') && !id.includes('/src/components/ui/')) {
            return 'components';
          }
          
          // Explicitly avoid chunking UI components
          if (id.includes('/src/components/ui/')) {
            return undefined;
          }
          
          return undefined;
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-accordion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toast'
    ],
    esbuildOptions: {
      target: 'es2020',
      supported: { 
        'top-level-await': true 
      },
    }
  },
  envPrefix: 'VITE_'
});