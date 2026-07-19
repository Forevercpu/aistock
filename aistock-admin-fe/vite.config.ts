import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3719,
    // 开发环境把 /api 转发到本地 Nest 后端，前端无需处理跨域地址。
    proxy: {
      '/api': {
        target: 'http://localhost:3717',
        changeOrigin: true,
      },
    },
  },
});
