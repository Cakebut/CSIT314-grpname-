import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// Resolve proxy targets from environment (allow overriding in CI / Codespaces)
const codespaceUrl = process.env.CODESPACE_URL || process.env.VITE_CODESPACE_URL;
const localUrl = process.env.LOCAL_URL || process.env.VITE_LOCAL_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
