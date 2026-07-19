import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3718,
    // 用户端与管理端共用 3717 后端服务。
    proxy: {
      '/api': {
        target: 'http://localhost:3717',
        changeOrigin: true,
      },
    },
  },
});
