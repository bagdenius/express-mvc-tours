import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public/ts',
  envDir: path.resolve(import.meta.dirname, '.'),
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, 'public/ts/main.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_API_URL!,
    },
  },
});
