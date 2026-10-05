import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { routePreload, socialMeta } from './scripts/vite-plugins.ts';

// Keep local development on a fixed port so screenshots and audit scripts stay repeatable.
export default defineConfig(({ mode }) => {
  // VITE_SITE_URL (optional, from the shell or a .env file): the deployed origin, for absolute link-preview tags.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), tailwindcss(), routePreload(), socialMeta(env.VITE_SITE_URL)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    assetsInclude: ['**/*.glb'],
    server: { port: 5199, strictPort: true },
    preview: { port: 5198, strictPort: true }
  };
});
