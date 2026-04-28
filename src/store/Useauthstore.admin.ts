import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  role: 'user' | 'admin' | 'superadmin' | 'moderator';
  isVerified: boolean;
  friends: any[];
  friendRequests: any[];
  language: 'en' | 'bn';
  theme: 'light' | 'dark' | 'system';
  [key: string]: any;
}

interface AuthState {
  user:               User | null;
  accessToken:        string | null;
  refreshToken:       string | null;
  isLoading:          boolean;
  isAuthenticated:    boolean;
  setAuth:            (user: User, accessToken: string, refreshToken: string) => void;
  setUser:            (user: User) => void;
  logout:             () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  fetchMe:            () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isLoading:       false,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      setUser: (user) => set({ user }),

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        delete api.defaults.headers.common['Authorization'];
        // No auto-redirect — let the calling component handle navigation
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });

          // Rotate both tokens — resets the 365d window
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          return true;
        } catch (err: any) {
          // Only clear on hard auth failure, not network errors
          if (err?.response?.status === 401) {
            set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            delete api.defaults.headers.common['Authorization'];
          }
          return false;
        }
      },

      fetchMe: async () => {
        const { accessToken, refreshAccessToken } = get();
        if (!accessToken) return;

        set({ isLoading: true });
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch (err: any) {
          if (err?.response?.status === 401) {
            // Try silent refresh before giving up
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              try {
                const { data } = await api.get('/auth/me');
                set({ user: data.user, isAuthenticated: true });
                return;
              } catch {}
            }
            set({ isAuthenticated: false });
          }
          // Network errors — keep user logged in, don't clear state
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: '3zf-auth',
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;