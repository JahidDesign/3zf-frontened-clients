import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// ─── Token Helpers — Zustand localStorage এর সাথে sync ──────────────────────
const STORE_KEY = '3zf-auth';

export const getAccessToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw)?.state?.accessToken ?? null : null;
  } catch { return null; }
};

export const getRefreshToken = (): string | null => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw)?.state?.refreshToken ?? null : null;
  } catch { return null; }
};

// Zustand store এর localStorage directly update — store re-render হবে
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  try {
    const raw    = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state.accessToken  = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
  } catch {}
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

export const clearTokens = (): void => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state.accessToken     = null;
      parsed.state.refreshToken    = null;
      parsed.state.user            = null;
      parsed.state.isAuthenticated = false;
      localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
    }
  } catch {}
  delete api.defaults.headers.common['Authorization'];
};

const forceLogout = (): void => {
  clearTokens();
  toast.error('Session expired. Please log in again.');
  setTimeout(() => { window.location.href = '/login'; }, 800);
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const orig   = error.config;
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    // 401 ছাড়া অন্য error — pass through করুন
    if (status !== 401 || orig._retry) {
      return Promise.reject(error);
    }

    // Refresh endpoint নিজেই 401 দিলে — refresh token ও expired
    if (orig.url?.includes('/auth/refresh')) {
      forceLogout();
      return Promise.reject(error);
    }

    // TOKEN_EXPIRED code না থাকলে — এটা auth error, refresh করার দরকার নেই
    // যেমন: wrong password, banned user ইত্যাদি
    if (code !== 'TOKEN_EXPIRED') {
      return Promise.reject(error);
    }

    // Concurrent requests — queue করুন
    if (isRefreshing) {
      return new Promise((resolve, reject) =>
        failedQueue.push({ resolve, reject })
      ).then(token => {
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      }).catch(err => Promise.reject(err));
    }

    orig._retry  = true;
    isRefreshing = true;

    try {
      const rt = getRefreshToken();
      if (!rt) {
        forceLogout();
        return Promise.reject(error);
      }

      // ← সঠিক endpoint: /auth/refresh
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken: rt },
        { withCredentials: true },
      );

      // Backend থেকে আসে: { success, accessToken, refreshToken }
      saveTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig); // original request retry

    } catch (err: any) {
      processQueue(err, null);
      const errStatus = err?.response?.status;
      const errCode   = err?.response?.data?.code;

      // Refresh token ও expired বা invalid — এবার logout করুন
      if (errStatus === 401 || errStatus === 403 || errCode === 'TOKEN_EXPIRED') {
        forceLogout();
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;