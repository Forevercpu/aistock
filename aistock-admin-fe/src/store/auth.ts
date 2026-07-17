import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../api';

interface AuthState {
  accessToken: string | null;
  user: AdminUser | null;
  setSession: (accessToken: string, user: AdminUser) => void;
  setUser: (user: AdminUser) => void;
  clearSession: () => void;
}

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
      partialize: ({ accessToken, user }) => ({ accessToken, user }),
    },
  ),
);

