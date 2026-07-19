import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { Navigate, Route, Routes } from 'react-router-dom';
import { getCurrentAdmin } from './api';
import { AdminLayout } from './layouts/AdminLayout';
import { CompanyDetailPage } from './pages/companies/CompanyDetailPage';
import { CompanyListPage } from './pages/companies/CompanyListPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { useAuthStore } from './store/auth';

export default function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
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

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="companies" element={<CompanyListPage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="sectors" element={<PlaceholderPage />} />
        <Route path="tags" element={<PlaceholderPage />} />
        <Route path="chains" element={<PlaceholderPage />} />
        <Route path="announcements" element={<PlaceholderPage />} />
        <Route path="ai-reviews" element={<PlaceholderPage />} />
        <Route path="quizzes" element={<PlaceholderPage />} />
        <Route path="system" element={<PlaceholderPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
