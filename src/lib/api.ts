// lib/api.ts — reads token from Zustand persist (localStorage '3zf-auth')

import axios, { AxiosInstance } from 'axios';

const BASE_URL    = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const STORAGE_KEY = '3zf-auth';

// ─── Read/write Zustand persisted state in localStorage ───────
function getToken(key: 'accessToken' | 'refreshToken'): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Zustand persist wraps everything under { state: { ... } }
    return JSON.parse(raw)?.state?.[key] ?? null;
  } catch {
    return null;
  }
}

function setTokenInStorage(key: 'accessToken' | 'refreshToken', value: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      parsed.state[key] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {}
}

function clearAuthInStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.state) {
      parsed.state.accessToken     = null;
      parsed.state.refreshToken    = null;
      parsed.state.isAuthenticated = false;
      parsed.state.user            = null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {}
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const authPages = ['/login', '/register', '/password'];
  const onAuthPage = authPages.some((p) => window.location.pathname.startsWith(p));
  if (!onAuthPage) window.location.href = '/login';
}

// ─── Axios instance ───────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request: attach token ────────────────────────────────────
// Priority: api.defaults (set by setAuth) → localStorage fallback
api.interceptors.request.use(
  (config) => {
    const defaultHeader = api.defaults.headers.common['Authorization'] as string | undefined;
    if (!defaultHeader) {
      const token = getToken('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response: auto-refresh on 401 ───────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: any)     => void;
}> = [];

function processQueue(error: any, token: string | null = null): void {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Skip: not 401, already retried, or is the refresh/logout endpoint itself
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original?.url?.includes('/auth/refresh-token') ||
      original?.url?.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while refresh is in-flight
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    try {
      const refreshToken = getToken('refreshToken');

      if (!refreshToken) {
        clearAuthInStorage();
        redirectToLogin();
        return Promise.reject(error);
      }

      const { data } = await axios.post<{
        accessToken:  string;
        refreshToken: string;
      }>(
        `${BASE_URL}/auth/refresh-token`,
        { refreshToken },
        { timeout: 10_000 }
      );

      // 1. localStorage আপডেট (Zustand re-hydrate করবে)
      setTokenInStorage('accessToken',  data.accessToken);
      setTokenInStorage('refreshToken', data.refreshToken);

      // 2. axios default header আপডেট
      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);

    } catch (refreshError: any) {
      processQueue(refreshError, null);

      const status = refreshError?.response?.status;
      if (status === 401 || status === 403) {
        clearAuthInStorage();
        delete api.defaults.headers.common['Authorization'];
        redirectToLogin();
      }

      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;