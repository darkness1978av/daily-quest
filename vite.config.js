import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the build work from any hosting path (Cloudflare Pages, GitHub Pages, Firebase Hosting).
export default defineConfig({
  base: './',
  plugins: [react()],
});
