import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface AuthState {
  user:         any | null;
  accessToken:  string | null;
  isLoading:    boolean;
  setUser:      (user: any) => void;
  setToken:     (token: string) => void;
  logout:       () => Promise<void>;
  fetchMe:      () => Promise<void>;
  updateUser:   (partial: Partial<any>) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,

      setUser:  (user)  => set({ user }),
      setToken: (token) => {
        if (typeof window !== 'undefined') localStorage.setItem('accessToken', token);
        set({ accessToken: token });
      },

      updateUser: (partial) =>
        set(s => ({ user: s.user ? { ...s.user, ...partial } : null })),

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null });
        window.location.href = '/auth/login';
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          set({ user: null, accessToken: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name:    'auth-store',
      partialize: s => ({ user: s.user, accessToken: s.accessToken }),
    }
  )
);

export default useAuthStore;