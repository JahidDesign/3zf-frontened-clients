import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveTokens, clearTokens } from '@/lib/axios';
import api from '@/lib/axios';

export interface User {
  _id: string; name: string; email: string; phone: string;
  username?: string;
  avatar?: string; coverPhoto?: string;
  role: 'user' | 'admin' | 'superadmin';
  isVerified: boolean; bio?: string;
  language: 'en' | 'bn'; theme: 'light' | 'dark';
  friends?: any[]; friendRequests?: any[];
  [key: string]: any;
}

interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  setTokens:       (access: string, refresh: string) => void;
  setAuth:         (user: User, access: string, refresh: string) => void;
  setUser:         (user: User) => void;
  updateUser:      (partial: Partial<User>) => void;
  logout:          () => Promise<void>;
  fetchMe:         () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isLoading:       false,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        saveTokens(accessToken, refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setAuth: (user, accessToken, refreshToken) => {
        saveTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setUser:    (user)    => set({ user }),
      updateUser: (partial) => set(s => ({ user: s.user ? { ...s.user, ...partial } : null })),

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          set({ isLoading: true });
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          set({ isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: '3zf-auth-v2',
      partialize: (s) => ({
        user:            s.user,
        accessToken:     s.accessToken,
        refreshToken:    s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);