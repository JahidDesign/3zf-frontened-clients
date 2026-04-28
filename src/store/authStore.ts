import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { saveTokens, clearTokens, getAccessToken } from '@/lib/api';

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
  user:            User | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  isHydrated:      boolean;
  setAuth:   (user: User, accessToken: string, refreshToken: string) => void;
  setUser:   (updates: Partial<User>) => void;
  logout:    () => Promise<void>;
  fetchMe:   () => Promise<void>;
}

// ─── IMPORTANT: this key must match STORAGE_KEY in axios.ts ──────────────────
const STORAGE_KEY = '3zf-auth';

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isLoading:       false,
      isAuthenticated: false,
      isHydrated:      false,

      setAuth: (user, accessToken, refreshToken) => {
        // saveTokens: writes cookies + patches localStorage + sets axios header
        saveTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (updates) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...updates } : s.user,
        })),

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}

        // clearTokens: removes cookies + clears localStorage + removes axios header
        clearTokens();

        // Reset Zustand state — this overwrites the persisted state on next write
        set({
          user:            null,
          accessToken:     null,
          refreshToken:    null,
          isAuthenticated: false,
        });

        window.location.href = '/';
      },

      fetchMe: async () => {
        const token = getAccessToken();
        if (!token) return;

        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          // Interceptor already tried refresh + retry — if still failing, clear auth
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          clearTokens();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: STORAGE_KEY, // matches axios.ts STORAGE_KEY — single source of truth
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          // Restore axios header on page reload
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