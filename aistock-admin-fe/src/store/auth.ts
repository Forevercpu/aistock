import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../api';

/** 管理员会话状态及其更新动作。 */
interface AuthState {
  accessToken: string | null;
  user: AdminUser | null;
  setSession: (accessToken: string, user: AdminUser) => void;
  setUser: (user: AdminUser) => void;
  clearSession: () => void;
}

/** 持久化管理员 Token 和基础资料，刷新页面后可恢复登录态。 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => set({ accessToken, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'aistock-admin-auth',
      // 只保存恢复会话必要的字段，不持久化任何临时 UI 状态。
      partialize: ({ accessToken, user }) => ({ accessToken, user }),
    },
  ),
);
