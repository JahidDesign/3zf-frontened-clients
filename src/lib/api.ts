/**
 * lib/api.ts
 *
 * POLICY: Session expire হলে কখনো force logout বা redirect করা হবে না।
 *         Token refresh fail হলে শুধু request reject হবে — user যেখানে
 *         আছে সেখানেই থাকবে। কোনো toast, কোনো redirect নেই।
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shrouded-dusk-16339-9777261d797a.herokuapp.com/api';

const ACCESS_TOKEN_EXPIRES_DAYS  = 365;
const REFRESH_TOKEN_EXPIRES_DAYS = 365;

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
    parsed.state.accessToken     = accessToken;
    parsed.state.refreshToken    = refreshToken;
    parsed.state.isAuthenticated = true;
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

// ─── JWT Expiry Check ─────────────────────────────────────────────────────────

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
};

// ─── Single Global Refresh Promise ───────────────────────────────────────────

export let _refreshPromise: Promise<boolean> | null = null;

/**
 * Token refresh করার চেষ্টা করে।
 * সফল হলে → নতুন token save করে true return করে।
 * fail হলে → শুধু false return করে। কোনো logout নেই, কোনো toast নেই।
 */
export const doRefresh = (): Promise<boolean> => {
  if (_refreshPromise) return _refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);

  _refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
    .then(({ data }) => {
      if (data?.accessToken) {
        saveTokens(data.accessToken, data.refreshToken ?? refreshToken);
        return true as boolean;
      }
      // Server 200 দিলেও token না থাকলে — শুধু false, কোনো logout নেই
      return false as boolean;
    })
    .catch(() => {
      // যেকোনো error (401, 403, network) — শুধু false, কোনো logout নেই
      return false as boolean;
    })
    .finally(() => {
      _refreshPromise = null;
    });

  return _refreshPromise;
};

export const ensureFreshToken = (): Promise<boolean> => {
  if (_refreshPromise) return _refreshPromise;

  const accessToken = getAccessToken();

  if (accessToken && !isTokenExpired(accessToken)) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return Promise.resolve(true);
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);

  return doRefresh();
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  if (config.url?.includes('/auth/refresh')) return config;

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────

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

    const isTokenProblem =
      status === 401 &&
      (!code ||
       code === 'TOKEN_EXPIRED' ||
       code === 'NO_TOKEN'      ||
       code === 'INVALID_TOKEN');

    // Token সমস্যা নয়, বা already retry করা হয়েছে → শুধু reject
    if (!isTokenProblem || orig._retry) {
      return Promise.reject(error);
    }

    // Refresh endpoint নিজেই fail করলে → শুধু reject, কোনো logout নেই
    if (orig.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Already refreshing → queue mein daal do
    if (_refreshPromise) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        })
        .catch(() => Promise.reject(error));
    }

    orig._retry = true;

    const ok = await doRefresh();

    if (ok) {
      const newToken = getAccessToken();
      processQueue(null, newToken);
      orig.headers.Authorization = `Bearer ${newToken}`;
      return api(orig);
    } else {
      // Refresh fail — শুধু request reject করো, user কে logout করো না
      processQueue(error, null);
      return Promise.reject(error);
    }
  },
);

export default api;