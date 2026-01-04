import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This allows the app to run on https://<user>.github.io/<repo>/
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});