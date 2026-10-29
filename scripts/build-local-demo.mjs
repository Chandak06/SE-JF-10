import { fileURLToPath } from 'node:url';
import { build } from '../frontend/node_modules/vite/dist/node/index.js';

// A dedicated same-origin build. Existing Atlas/frontend .env settings are not selected.
await build({
  root: fileURLToPath(new URL('../frontend/', import.meta.url)),
  configFile: fileURLToPath(new URL('../frontend/vite.config.ts', import.meta.url)),
  define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') },
  build: { outDir: 'dist-local-demo' }
});
