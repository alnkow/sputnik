import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  // Относительные пути: сборка работает из любой подпапки,
  // например на GitHub Pages по адресу https://<user>.github.io/sputnik/.
  base: './',
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});
