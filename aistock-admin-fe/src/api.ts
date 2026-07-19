import axios from 'axios';
import { useAuthStore } from './store/auth';

/** 登录后在管理端使用的管理员资料。 */
export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

/** 登录接口返回的单 Token 会话结构。 */
export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AdminUser;
}

/** 数据总览接口返回的全部指标和图表数据。 */
export interface DashboardOverview {
  companies: number;
  sectors: number;
  announcements: number;
  pendingReviews: number;
  chains: number;
  quizzes: number;
  databaseConnected: boolean;
  companyStatuses: Array<{ name: string; value: number }>;
  reviewStatuses: Array<{ name: string; value: number }>;
  sectorRanking: Array<{ name: string; value: number }>;
  completeness: { products: number; relations: number; aiReviews: number };
  recentLogs: Array<{ id: number; module: string; action: string; summary: string; createdAt: string; admin?: { displayName: string } | null }>;
  activityTrend: Array<{ date: string; value: number }>;
}

/** 管理端统一 Axios 实例，默认通过 Vite 代理访问后端 /api。 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
});

// 每次请求读取 Zustand 中的最新 Token，避免模块初始化时缓存旧会话。
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 非登录接口返回 401 时清空本地会话，由 App 自动回到登录页。
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/admin/auth/login') {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);

/** 调用管理员登录接口并取得 JWT 与账号资料。 */
export async function loginAdmin(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/admin/auth/login', { username, password });
  return data;
}

/** 使用当前 Token 获取管理员资料，用于启动时校验会话。 */
export async function getCurrentAdmin() {
  const { data } = await api.get<AdminUser>('/admin/auth/me');
  return data;
}

/** 获取管理后台首页的统计与图表数据。 */
export async function getDashboardOverview() {
  const { data } = await api.get<DashboardOverview>('/admin/dashboard/overview');
  return data;
}
