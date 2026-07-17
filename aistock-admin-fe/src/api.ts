import axios from 'axios';

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

export async function getDashboardOverview() {
  const { data } = await api.get<DashboardOverview>('/admin/dashboard/overview');
  return data;
}

