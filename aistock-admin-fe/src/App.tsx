import { lazy, Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getCurrentAdmin } from './api';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './store/auth';

// 业务页面按路由懒加载，避免登录页一次性下载图表和流程图依赖。
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const CompanyListPage = lazy(() => import('./pages/companies/CompanyListPage').then((module) => ({ default: module.CompanyListPage })));
const CompanyDetailPage = lazy(() => import('./pages/companies/CompanyDetailPage').then((module) => ({ default: module.CompanyDetailPage })));
const CatalogPage = lazy(() => import('./pages/catalog/CatalogPage').then((module) => ({ default: module.CatalogPage })));
const ChainListPage = lazy(() => import('./pages/chains/ChainListPage').then((module) => ({ default: module.ChainListPage })));
const ChainEditorPage = lazy(() => import('./pages/chains/ChainEditorPage').then((module) => ({ default: module.ChainEditorPage })));
const AnnouncementPage = lazy(() => import('./pages/content/AnnouncementPage').then((module) => ({ default: module.AnnouncementPage })));
const AiReviewPage = lazy(() => import('./pages/content/AiReviewPage').then((module) => ({ default: module.AiReviewPage })));
const QuizPage = lazy(() => import('./pages/content/QuizPage').then((module) => ({ default: module.QuizPage })));
const SystemPage = lazy(() => import('./pages/system/SystemPage').then((module) => ({ default: module.SystemPage })));

export default function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  // 有本地 Token 时向后端复核会话，同时刷新管理员资料。
  const { data: currentAdmin, isLoading: isCheckingAuth } = useQuery({
    queryKey: ['admin-auth-me'],
    queryFn: getCurrentAdmin,
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (currentAdmin) setUser(currentAdmin);
  }, [currentAdmin, setUser]);

  if (!accessToken) return <LoginPage />;
  if (isCheckingAuth) return <div className="auth-loading"><Spin size="large" /><span>正在验证登录状态</span></div>;

  return <Suspense fallback={<div className="page-loading"><Spin size="large" /></div>}>
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="companies" element={<CompanyListPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="sectors" element={<CatalogPage kind="sector" />} />
        <Route path="tags" element={<CatalogPage kind="tag" />} />
        <Route path="chains" element={<ChainListPage />} />
        <Route path="chains/:id" element={<ChainEditorPage />} />
        <Route path="announcements" element={<AnnouncementPage />} />
        <Route path="ai-reviews" element={<AiReviewPage />} />
        <Route path="quizzes" element={<QuizPage />} />
        <Route path="system" element={<SystemPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  </Suspense>;
}
