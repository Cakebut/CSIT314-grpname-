import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const codespaceUrl = process.env.VITE_API_URL_CODESPACE;
const localUrl = 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: codespaceUrl || localUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});