import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3718,
    proxy: {
      '/api': {
        target: 'http://localhost:3717',
        changeOrigin: true,
      },
    },
  },
});
