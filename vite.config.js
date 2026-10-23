import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import themePlugin from './vite/themePlugin.js';
import localData from './vite/localData.js';
import dataBaseCheck from './vite/dataBaseCheck.js';

export default defineConfig({
  plugins: [react(), themePlugin(), localData(), dataBaseCheck()],
  worker: { format: 'es' },
  server: {
    // the 2.2 GB export lives inside the project root: keep the watcher out of it
    watch: { ignored: ['**/cloudflare-data*/**', '**/.wrangler/**'] },
  },
  test: { environment: 'node', include: ['src/**/*.test.js', 'vite/**/*.test.js'] },
});
