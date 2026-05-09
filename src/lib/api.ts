/**
 * lib/api.ts  ─  single source of truth for all HTTP calls
 *
 * FIX: "Session expired" toast no longer shows on first visit.
 *      Toast only appears when the user HAD a valid session that truly expired.
 */

import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://threezf-backend-servers.onrender.com/api';

const ACCESS_TOKEN_EXPIRES_DAYS  = 1;
const REFRESH_TOKEN_EXPIRES_DAYS = 30;
const STORAGE_KEY = '3zf-auth';

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

// ─── Token storage ────────────────────────────────────────────────────────────

export const saveTokens = (accessToken: string, refreshToken: string): void => {
  Cookies.set('accessToken',  accessToken,  { expires: ACCESS_TOKEN_EXPIRES_DAYS,  sameSite: 'lax' });
  Cookies.set('refreshToken', refreshToken, { expires: REFRESH_TOKEN_EXPIRES_DAYS, sameSite: 'lax' });

  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
    parsed.state.accessToken  = accessToken;
    parsed.state.refreshToken = refreshToken;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch { /* ignore quota / SSR errors */ }

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

// ─── JWT expiry check ─────────────────────────────────────────────────────────

const BUFFER_MS = 30_000;

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now() + BUFFER_MS;
  } catch {
    return true;
  }
};

// ─── Force logout ─────────────────────────────────────────────────────────────

/**
 * FIX: Only shows "Session expired" toast when the user actually HAD a session.
 *
 * showToast = true  → user was logged in, session truly expired → show toast + redirect
 * showToast = false → user was never logged in (first visit) → silent, no toast
 */
const forceLogout = (showToast = false): void => {
  clearTokens();

  if (showToast) {
    toast.error('Session expired. Please log in again.');
    setTimeout(() => { window.location.href = '/login'; }, 800);
  }
};

// ─── Proactive refresh ────────────────────────────────────────────────────────

export let _refreshPromise: Promise<boolean> | null = null;

export const ensureFreshToken = (): Promise<boolean> => {
  if (_refreshPromise) return _refreshPromise;

  const accessToken  = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken && !isTokenExpired(accessToken)) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return Promise.resolve(true);
  }

  // ── No refresh token → user never logged in → silent false, NO toast ────────
  if (!refreshToken) return Promise.resolve(false);

  if (isTokenExpired(refreshToken)) {
    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      if (payload.exp) {
        // Had a real session that expired → show toast
        forceLogout(true);
        return Promise.resolve(false);
      }
    } catch {
      // Malformed token → logout silently (we don't know if they were logged in)
      forceLogout(false);
      return Promise.resolve(false);
    }
  }

  _refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
    .then(({ data }) => {
      if (data?.accessToken) {
        saveTokens(data.accessToken, data.refreshToken ?? refreshToken);
        return true as boolean;
      }
      return false as boolean;
    })
    .catch((err) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        // Refresh token rejected by server → had a session, now expired → show toast
        forceLogout(true);
      }
      return false as boolean;
    })
    .finally(() => {
      _refreshPromise = null;
    });

  return _refreshPromise;
};

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
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

    if (status >= 500) return Promise.reject(error);

    // ── TOKEN_EXPIRED / INVALID_TOKEN → try to refresh ────────────────────────
    const isTokenProblem =
      status === 401 &&
      (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN');

    // ── NO_TOKEN → only retry if user actually has a refresh token ────────────
    // FIX: If there is no refresh token, the user is simply not logged in.
    //      Do NOT call forceLogout — just silently reject the request.
    const isNoToken = status === 401 && code === 'NO_TOKEN';

    if (isNoToken && !getRefreshToken()) {
      // Not logged in at all — drop the request silently, zero toast
      return Promise.reject(error);
    }

    if (!isTokenProblem && !isNoToken) return Promise.reject(error);
    if (orig._retry)                   return Promise.reject(error);

    if (orig.url?.includes('/auth/refresh')) {
      // The refresh endpoint itself returned 401 → was logged in, now expired
      forceLogout(true);
      return Promise.reject(error);
    }

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
        // No refresh token → not logged in → silent reject, NO toast
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
        // Server rejected refresh token → real session expiry → show toast
        forceLogout(true);
      }
      // Network / 5xx → reject silently, no logout, no toast
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;