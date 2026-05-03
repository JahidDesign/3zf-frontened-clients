import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// ─── Storage ──────────────────────────────────────────────────────────────────

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
      const parsed                 = JSON.parse(raw);
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

// ─── JWT expiry check (no library needed) ────────────────────────────────────

const TOKEN_BUFFER_SECONDS = 30;

const isTokenExpiredOrExpiring = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const padded  = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4), '=',
    );
    const { exp } = JSON.parse(atob(padded));
    if (!exp) return false; // no expiry claim → treat as valid
    return exp - TOKEN_BUFFER_SECONDS < Date.now() / 1000;
  } catch {
    return true;
  }
};

// ─── Proactive refresh on app start ──────────────────────────────────────────

let _refreshPromise: Promise<void> | null = null;

export const ensureFreshToken = (): Promise<void> => {
  if (_refreshPromise) return _refreshPromise;

  const accessToken  = getAccessToken();
  const refreshToken = getRefreshToken();

  // No refresh token → nothing to do
  if (!refreshToken) return Promise.resolve();

  // Access token still valid → skip
  if (!isTokenExpiredOrExpiring(accessToken)) return Promise.resolve();

  // Refresh token itself expired → logout immediately
  if (isTokenExpiredOrExpiring(refreshToken)) {
    forceLogout();
    return Promise.resolve();
  }

  _refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
    .then(({ data }) => {
      saveTokens(data.accessToken, data.refreshToken);
    })
    .catch(() => {
      forceLogout();
    })
    .finally(() => {
      _refreshPromise = null;
    });

  return _refreshPromise;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  // Skip for the refresh endpoint itself to avoid loops
  if (config.url?.includes('/auth/refresh')) return config;

  // Proactively refresh if token is expiring soon
  if (isTokenExpiredOrExpiring(getAccessToken())) {
    await ensureFreshToken();
  }

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (v: any) => void;
  reject:  (e: any) => void;
}> = [];

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

    // Never retry 5xx — stops request loops on server errors
    if (status >= 500) return Promise.reject(error);

    // Only handle 401s
    if (status !== 401) return Promise.reject(error);

    // Already retried → give up
    if (orig._retry) return Promise.reject(error);

    // Refresh endpoint itself returned 401 → logout
    if (orig.url?.includes('/auth/refresh')) {
      forceLogout();
      return Promise.reject(error);
    }

    // Only refresh on TOKEN_EXPIRED — wrong password / banned / no token won't be fixed by refresh
    if (code !== 'TOKEN_EXPIRED') return Promise.reject(error);

    // Another refresh already in-flight → queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      }).catch(err => Promise.reject(err));
    }

    orig._retry  = true;
    isRefreshing = true;

    try {
      const rt = getRefreshToken();

      // No refresh token, or refresh token itself expired → logout
      if (!rt || isTokenExpiredOrExpiring(rt)) {
        processQueue(error, null);
        forceLogout();
        return Promise.reject(error);
      }

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
      forceLogout(); // any refresh failure → logout
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;