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

// ✅ FIX 1: Singleton refresh promise — prevents race condition
// Agar do requests ek saath refresh karein, dono same promise share karein
let refreshPromise: Promise<boolean> | null = null;

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
        refreshPromise = null; // ✅ Reset on logout
      },

      refreshAccessToken: async () => {
        // ✅ FIX 2: Agar refresh chal raha hai, nayi promise mat banao
        if (refreshPromise) return refreshPromise;

        const { refreshToken } = get();
        if (!refreshToken) return false;

        refreshPromise = (async () => {
          try {
            const { data } = await api.post('/auth/refresh', { refreshToken });
            set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
            api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            return true;
          } catch (err: any) {
            // ✅ FIX 3: Sirf hard 401 par clear karo, network error (0, 503) par nahi
            if (err?.response?.status === 401) {
              set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
              delete api.defaults.headers.common['Authorization'];
            }
            return false;
          } finally {
            refreshPromise = null; // ✅ Done hone par reset
          }
        })();

        return refreshPromise;
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
          const status = err?.response?.status;

          if (status === 401) {
            // ✅ FIX 4: Silent refresh try karo
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              try {
                const { data } = await api.get('/auth/me');
                set({ user: data.user, isAuthenticated: true });
                return;
              } catch {}
            }
            // Refresh bhi fail hua — tab hi logout karo
            set({ isAuthenticated: false });

          }
          // ✅ FIX 5: Network error / timeout par STATE MAT CHHUO
          // status undefined = no response = network issue
          // User logged-in rahe, app retry karega baad mein

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

// ✅ FIX 6: Axios interceptor — automatically handle 401 globally
// Yeh file mein ek baar setup karo (e.g., main.tsx ya api.ts mein)
export function setupAuthInterceptor() {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Agar 401 aaya aur yeh already retry nahi hai
      if (error?.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const { refreshAccessToken } = useAuthStore.getState();
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          const { accessToken } = useAuthStore.getState();
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest); // ✅ Original request retry karo
        }
      }

      return Promise.reject(error);
    }
  );
}

export default useAuthStore;