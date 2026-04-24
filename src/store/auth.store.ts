import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/axios';

export interface User {
  _id: string; name: string; email: string; phone: string;
  avatar?: string; coverPhoto?: string;
  role: 'user' | 'admin' | 'superadmin';
  isVerified: boolean; bio?: string;
  language: 'en' | 'bn'; theme: 'light' | 'dark';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // 7 day cookies — prevents auto-logout
        Cookies.set('accessToken',  accessToken,  { expires: 7, sameSite: 'lax' });
        Cookies.set('refreshToken', refreshToken, { expires: 30, sameSite: 'lax' });
      },

      setUser: (user) => set({ user }),

      updateUser: (partial) => set(s => ({ user: s.user ? { ...s.user, ...partial } : null })),

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      },

      fetchMe: async () => {
        const token = Cookies.get('accessToken') || get().accessToken;
        if (!token) return;
        try {
          set({ isLoading: true });
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch (e: any) {
          // Only logout on explicit 401, not on network errors
          if (e?.response?.status === 401) {
            // Try refresh first
            const rt = Cookies.get('refreshToken') || get().refreshToken;
            if (rt) {
              try {
                const res = await api.post('/auth/refresh', { refreshToken: rt });
                Cookies.set('accessToken', res.data.accessToken, { expires: 7, sameSite: 'lax' });
                set({ accessToken: res.data.accessToken });
                const { data } = await api.get('/auth/me');
                set({ user: data.user });
                return;
              } catch {}
            }
            get().logout();
          }
          // Network errors — don't logout
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: '3zf-auth-v2',
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }),
    }
  )
);
