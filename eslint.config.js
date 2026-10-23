import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // catalog_*.js are the pipeline's reader kit, copied verbatim and replaced on re-export, so they are not linted here
  globalIgnores(['dist', 'node_modules', 'cloudflare-data', 'cloudflare-data.prev', '.wrangler', 'src/data/catalog_*.js']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { ecmaVersion: 'latest', globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' } },
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }] },
  },
  { files: ['vite/**/*.js', 'src/**/*.test.js', '*.config.js'], languageOptions: { globals: globals.node } },
]);
