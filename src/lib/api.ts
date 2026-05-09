/**
 * lib/api.ts  ─  single source of truth for all HTTP calls
 *
 * Replaces both the old api.ts and axios.ts files.
 * Import everything from here:
 *
 *   import api, {
 *     ensureFreshToken, getAccessToken, getRefreshToken,
 *     saveTokens, clearTokens,
 *   } from '@/lib/api';
 */

import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

// ─── Cookie config ────────────────────────────────────────────────────────────
// Expiry matches the JWT lifetime set on the backend.
// These are not httpOnly so JS can read them, but sameSite: 'lax' limits CSRF.
const ACCESS_TOKEN_EXPIRES_DAYS  = 1;    // short-lived — backend refreshes often
const REFRESH_TOKEN_EXPIRES_DAYS = 30;   // longer window for seamless re-auth

const STORAGE_KEY = '3zf-auth';         // zustand persist key

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

// ─── Token storage ────────────────────────────────────────────────────────────
// Dual-write: cookies (survive page reload, readable by SSR) +
//             localStorage (fallback for environments that block cookies).

export const saveTokens = (accessToken: string, refreshToken: string): void => {
  // Cookies
  Cookies.set('accessToken',  accessToken,  { expires: ACCESS_TOKEN_EXPIRES_DAYS,  sameSite: 'lax' });
  Cookies.set('refreshToken', refreshToken, { expires: REFRESH_TOKEN_EXPIRES_DAYS, sameSite: 'lax' });

  // LocalStorage (zustand persist slot)
  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state.accessToken  = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch { /* ignore quota / SSR errors */ }

  // Attach to every subsequent request immediately
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

export const clearTokens = (): void => {
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
  // Cookie first (most up-to-date after a refresh)
  const cookie = Cookies.get('accessToken');
  if (cookie) return cookie;

  // LocalStorage fallback
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

// ─── JWT expiry check ─────────────────────────────────────────────────────────

const BUFFER_MS = 30_000; // refresh 30 s before expiry

/**
 * Returns true when the token is expired OR will expire within BUFFER_MS.
 * Returns false (treat as valid) if the token has no `exp` claim.
 * Returns true for null / malformed tokens.
 */
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false; // no expiry → valid indefinitely
    return payload.exp * 1000 < Date.now() + BUFFER_MS;
  } catch {
    return true; // malformed → treat as expired
  }
};

// ─── Force logout ─────────────────────────────────────────────────────────────

/**
 * Only call this when the server explicitly rejects credentials (401/403).
 * NEVER call on network errors, timeouts, or 5xx responses.
 */
const forceLogout = (): void => {
  clearTokens();
  toast.error('Session expired. Please log in again.');
  // Small delay so the toast is visible before navigation
  setTimeout(() => { window.location.href = '/login'; }, 800);
};

// ─── Proactive refresh (call once on app mount) ───────────────────────────────

/**
 * Shared in-flight promise — concurrent callers share one refresh request.
 * Exported so the response interceptor can piggyback on it.
 */
export let _refreshPromise: Promise<boolean> | null = null;

/**
 * Ensures a valid access token is set before the first authenticated request.
 *
 * Returns:
 *   true  — valid token is ready (existing or freshly refreshed)
 *   false — no tokens at all, OR a network / 5xx error prevented refreshing
 *           → caller should NOT redirect to /login (may be a transient error)
 *
 * Never throws.
 * Only force-logouts when the server explicitly rejects the refresh token
 * with 401 or 403.
 */
export const ensureFreshToken = (): Promise<boolean> => {
  // Re-use an in-flight refresh
  if (_refreshPromise) return _refreshPromise;

  const accessToken  = getAccessToken();
  const refreshToken = getRefreshToken();

  // Valid access token — attach and return immediately
  if (accessToken && !isTokenExpired(accessToken)) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return Promise.resolve(true);
  }

  // No refresh token — user is not logged in
  if (!refreshToken) return Promise.resolve(false);

  // FIX: if the refresh token itself is expired (and has an exp claim), logout
  // immediately instead of making a request that will 401 anyway.
  // But only do this when exp is present — no exp means "treat as valid".
  if (isTokenExpired(refreshToken)) {
    // Check if exp was actually present (isTokenExpired returns true for
    // missing exp only when the token is also null — already handled above)
    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      if (payload.exp) {
        // exp exists and token is expired → must logout
        forceLogout();
        return Promise.resolve(false);
      }
      // No exp claim → token never expires by design → proceed with refresh
    } catch {
      // Malformed → logout
      forceLogout();
      return Promise.resolve(false);
    }
  }

  // Access token missing / expired, refresh token available → refresh now
  _refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
    .then(({ data }) => {
      if (data?.accessToken) {
        saveTokens(data.accessToken, data.refreshToken ?? refreshToken);
        return true as boolean;
      }
      // Server responded but gave no token — not logged in
      return false as boolean;
    })
    .catch((err) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // Server explicitly rejected the token — must logout
        forceLogout();
      }
      // Network / timeout / 5xx → do NOT logout; return false so caller can decide
      return false as boolean;
    })
    .finally(() => {
      _refreshPromise = null;
    });

  return _refreshPromise;
};

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  // Skip token injection for the refresh endpoint (avoids loops)
  if (config.url?.includes('/auth/refresh')) return config;

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const orig   = error.config;
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    // ── Never retry 5xx — avoids hammering a broken server ───────────────────
    if (status >= 500) return Promise.reject(error);

    // ── Only intercept token-related 401s ────────────────────────────────────
    // Explicit codes sent by our backend:
    //   TOKEN_EXPIRED  — access token expired (refresh it)
    //   NO_TOKEN       — Authorization header was missing (attach & retry)
    //   INVALID_TOKEN  — token is malformed or revoked (refresh or logout)
    const isTokenProblem =
      status === 401 &&
      (code === 'TOKEN_EXPIRED' ||
       code === 'NO_TOKEN'      ||
       code === 'INVALID_TOKEN');

    if (!isTokenProblem)          return Promise.reject(error); // wrong password, banned, etc.
    if (orig._retry)              return Promise.reject(error); // already retried once
    if (orig.url?.includes('/auth/refresh')) {
      // The refresh endpoint itself returned 401 → credentials are gone
      forceLogout();
      return Promise.reject(error);
    }

    // ── Piggyback on ensureFreshToken if it's already running ─────────────────
    if (_refreshPromise) {
      try {
        const ok = await _refreshPromise;
        if (!ok) return Promise.reject(error);
        orig.headers.Authorization = `Bearer ${getAccessToken()}`;
        return api(orig);
      } catch {
        return Promise.reject(error);
      }
    }

    // ── Queue subsequent 401s while we refresh ────────────────────────────────
    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        })
        .catch(err => Promise.reject(err));
    }

    orig._retry  = true;
    isRefreshing = true;

    try {
      const rt = getRefreshToken();

      if (!rt) {
        // No refresh token — user is genuinely not logged in
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
      const errStatus = err?.response?.status;
      if (errStatus === 401 || errStatus === 403) {
        // Server explicitly rejected refresh token → logout
        forceLogout();
      }
      // Network / 5xx during refresh → reject silently, no logout
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;