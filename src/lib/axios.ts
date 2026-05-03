import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

const ACCESS_TOKEN_EXPIRES_DAYS  = 365;
const REFRESH_TOKEN_EXPIRES_DAYS = 365;

// MUST match the `name` field in useAuthStore's persist config.
const STORAGE_KEY = '3zf-auth';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const saveTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken',  accessToken,  { expires: ACCESS_TOKEN_EXPIRES_DAYS,  sameSite: 'lax' });
  Cookies.set('refreshToken', refreshToken, { expires: REFRESH_TOKEN_EXPIRES_DAYS, sameSite: 'lax' });

  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state.accessToken  = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {}

  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

export const clearTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed                 = JSON.parse(raw);
      parsed.state.accessToken     = null;
      parsed.state.refreshToken    = null;
      parsed.state.user            = null;
      parsed.state.isAuthenticated = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {}

  delete api.defaults.headers.common['Authorization'];
};

const forceLogout = () => {
  clearTokens();
  toast.error('Session expired. Please log in again.');
  window.location.href = '/login';
};

export const getAccessToken = (): string | null => {
  const cookie = Cookies.get('accessToken');
  if (cookie) return cookie;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw)?.state?.accessToken ?? null;
  } catch {}
  return null;
};

export const getRefreshToken = (): string | null => {
  const cookie = Cookies.get('refreshToken');
  if (cookie) return cookie;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw)?.state?.refreshToken ?? null;
  } catch {}
  return null;
};

// ─── Proactive token refresh on app start ────────────────────────────────────

let _refreshPromise: Promise<void> | null = null;

export const ensureFreshToken = (): Promise<void> => {
  if (_refreshPromise) return _refreshPromise;

  const accessToken  = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken)   return Promise.resolve();
  if (!refreshToken) return Promise.resolve();

  // ✅ Fixed: /auth/refresh-token → /auth/refresh
  _refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
    .then(({ data }) => { saveTokens(data.accessToken, data.refreshToken); })
    .catch((err) => {
      if ([401, 403].includes(err?.response?.status)) forceLogout();
    })
    .finally(() => { _refreshPromise = null; });

  return _refreshPromise;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const orig   = error.config;
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    const isTokenProblem = status === 401 && (code === 'TOKEN_EXPIRED' || code === 'NO_TOKEN');

    // ✅ Fixed: /auth/refresh-token → /auth/refresh
    if (!isTokenProblem || orig._retry || orig.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then(token => { orig.headers.Authorization = `Bearer ${token}`; return api(orig); })
        .catch(err  => Promise.reject(err));
    }

    orig._retry  = true;
    isRefreshing = true;

    try {
      const rt = getRefreshToken();
      if (!rt) { forceLogout(); return Promise.reject(error); }

      // ✅ Fixed: /auth/refresh-token → /auth/refresh
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken: rt },
        { withCredentials: true },
      );

      saveTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);

    } catch (err: any) {
      processQueue(err, null);
      if ([401, 403].includes(err?.response?.status)) forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;