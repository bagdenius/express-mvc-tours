import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public/ts',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'public/ts/main.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_API_URL,
    },
  },
});
