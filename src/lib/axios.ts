import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

// Must match JWT expiresIn in auth.middleware.ts
const ACCESS_TOKEN_EXPIRES_DAYS  = 15 / (60 * 24); // 15 min
const REFRESH_TOKEN_EXPIRES_DAYS = 365;             // 1 year

// ─── Single source of truth for the localStorage key ─────────────────────────
// MUST match the `name` field in useAuthStore's persist config.
const STORAGE_KEY = '3zf-auth';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// ─── Token Helpers ────────────────────────────────────────────────────────────

/**
 * Save tokens to cookies (short-lived) AND patch the Zustand persist key
 * in localStorage so both stores stay in sync.
 */
export const saveTokens = (accessToken: string, refreshToken: string) => {
  // 1. Cookies — read by getAccessToken/getRefreshToken on every request
  Cookies.set('accessToken',  accessToken,  { expires: ACCESS_TOKEN_EXPIRES_DAYS,  sameSite: 'lax' });
  Cookies.set('refreshToken', refreshToken, { expires: REFRESH_TOKEN_EXPIRES_DAYS, sameSite: 'lax' });

  // 2. Patch Zustand's persisted state so the store stays in sync
  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state.accessToken  = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {}

  // 3. Update axios default header immediately
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

/**
 * Wipe every token location: cookies, localStorage (Zustand key), axios header.
 * Call ONLY on explicit logout or when refresh token is rejected by server.
 */
export const clearTokens = () => {
  // 1. Cookies
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');

  // 2. Zustand persist key
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed              = JSON.parse(raw);
      parsed.state.accessToken  = null;
      parsed.state.refreshToken = null;
      parsed.state.user         = null;
      parsed.state.isAuthenticated = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {}

  // 3. Axios header
  delete api.defaults.headers.common['Authorization'];
};

/** Force logout — only when server rejects the refresh token */
const forceLogout = () => {
  clearTokens();
  toast.error('Session expired. Please log in again.');
  window.location.href = '/login';
};

/**
 * Read access token: cookie first, Zustand localStorage fallback.
 * Cookie expires after 15 min client-side but token may still be valid
 * server-side — server returns TOKEN_EXPIRED and interceptor silently refreshes.
 */
export const getAccessToken = (): string | null => {
  const cookie = Cookies.get('accessToken');
  if (cookie) return cookie;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw)?.state?.accessToken ?? null;
  } catch {}
  return null;
};

/**
 * Read refresh token: cookie first (365-day), Zustand localStorage fallback.
 */
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

  if (accessToken)   return Promise.resolve(); // valid token — nothing to do
  if (!refreshToken) return Promise.resolve(); // not logged in — nothing to do

  _refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh-token`, { refreshToken }, { withCredentials: true })
    .then(({ data }) => { saveTokens(data.accessToken, data.refreshToken); })
    .catch((err) => {
      if ([401, 403].includes(err?.response?.status)) forceLogout();
    })
    .finally(() => { _refreshPromise = null; });

  return _refreshPromise;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  // Read fresh on every request — never stale from module load
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
    const code   = error.response?.data?.code; // TOKEN_EXPIRED | NO_TOKEN | INVALID_TOKEN

    const isTokenProblem = status === 401 && (code === 'TOKEN_EXPIRED' || code === 'NO_TOKEN');
    if (!isTokenProblem || orig._retry || orig.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh is in-flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then(token => { orig.headers.Authorization = `Bearer ${token}`; return api(orig); })
        .catch(err => Promise.reject(err));
    }

    orig._retry  = true;
    isRefreshing = true;

    try {
      const rt = getRefreshToken();
      if (!rt) { forceLogout(); return Promise.reject(error); }

      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
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