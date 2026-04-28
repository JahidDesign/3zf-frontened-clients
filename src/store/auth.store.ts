import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { saveTokens, clearTokens } from '@/lib/api';

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
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // store update + axios header + localStorage sync একসাথে
        saveTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : s.user })),

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        window.location.href = '/';
      },

      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          // interceptor already handles 401 → refresh → retry
          // যদি তারপরও fail করে তাহলে authenticated না
          set({ isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: '3zf-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          // Hydration এর পরে axios header restore
          if (state.accessToken) {
            api.defaults.headers.common['Authorization'] =
              `Bearer ${state.accessToken}`;
          }
        }
      },
    }
  )
);

export default useAuthStore;