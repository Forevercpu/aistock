import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import '@xyflow/react/dist/style.css';

/** 全局请求缓存配置：普通查询 30 秒内复用，网络错误自动重试一次。 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// 应用入口统一装配主题、请求缓存与前端路由。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#56d6ff',
          colorBgBase: '#07111f',
          borderRadius: 10,
          fontFamily: 'Inter, PingFang SC, Microsoft YaHei, sans-serif',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter><App /></BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
);
