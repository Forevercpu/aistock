import axios from 'axios';
import { useAuthStore } from './store/auth';

export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AdminUser;
}

export interface DashboardOverview {
  companies: number;
  sectors: number;
  announcements: number;
  pendingReviews: number;
  databaseConnected: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/admin/auth/login') {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);

export async function loginAdmin(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/admin/auth/login', { username, password });
  return data;
}

export async function getCurrentAdmin() {
  const { data } = await api.get<AdminUser>('/admin/auth/me');
  return data;
}

export async function getDashboardOverview() {
  const { data } = await api.get<DashboardOverview>('/admin/dashboard/overview');
  return data;
}
