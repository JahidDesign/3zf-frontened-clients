import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ' https://shrouded-dusk-16339-9777261d797a.herokuapp.com/api';

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

// Only force logout when the server explicitly rejects credentials.
// Never logout on network errors, timeouts, or 5xx server errors.
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

// ─── JWT Expiry Check ─────────────────────────────────────────────────────────

/**
 * Decodes the JWT payload and checks whether it expires within the next 30 seconds.
 * Returns true (treat as expired) for any malformed token.
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // 30-second buffer so we refresh slightly before actual expiry
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
};

// ─── Proactive Token Refresh on App Start ────────────────────────────────────

// Shared in-flight promise so concurrent callers share one refresh request.
// Also used by the response interceptor to avoid a double-refresh race.
export let _refreshPromise: Promise<boolean> | null = null;

/**
 * Call this once on app mount before firing any authenticated requests.
 *
 * Returns:
 *   true  — a valid access token is now set (existing or freshly refreshed)
 *   false — refresh failed due to network/5xx error — caller should show the
 *           dashboard anyway and let individual queries retry naturally.
 *
 * Side effects:
 *   - Calls forceLogout() when the server explicitly rejects the refresh
 *     token (401, 403, or 400 — i.e. token is expired/invalid on the server).
 *   - Never throws. Never force-logouts on network errors or 5xx responses.
 */
export const ensureFreshToken = (): Promise<boolean> => {
  // Re-use an in-flight refresh instead of firing a second one
  if (_refreshPromise) return _refreshPromise;

  const accessToken  = getAccessToken();
  const refreshToken = getRefreshToken();

  // Have a valid, non-expired access token → nothing to do
  if (accessToken && !isTokenExpired(accessToken)) {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    return Promise.resolve(true);
  }

  // No refresh token at all → user is genuinely not logged in, redirect
  if (!refreshToken) {
    // Don't forceLogout here (no toast needed for a clean logged-out state)
    return Promise.resolve(false);
  }

  // Access token missing or expired, but we have a refresh token → refresh now
  _refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
    .then(({ data }) => {
      if (data?.accessToken) {
        saveTokens(data.accessToken, data.refreshToken ?? refreshToken);
        return true;
      }
      // Server responded 2xx but gave no token — treat as expired session
      forceLogout();
      return false;
    })
    .catch((err) => {
      const status = err?.response?.status;

      // Any of these mean the refresh token is explicitly rejected by the server
      // 400 → malformed / expired token body
      // 401 → unauthorized
      // 403 → forbidden (token revoked / blacklisted)
      if (status === 400 || status === 401 || status === 403) {
        forceLogout();
        return false;
      }

      // Network error, timeout, 5xx, etc.
      // Do NOT logout — server may be temporarily down.
      // Let the caller show the UI; individual queries will retry.
      return false;
    })
    .finally(() => {
      _refreshPromise = null;
    }) as Promise<boolean>;

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

    // Treat ANY 401 as a token problem — with or without a specific error code.
    // This handles backends that return plain 401s without a code field.
    const isTokenProblem =
      status === 401 &&
      (!code ||
       code === 'TOKEN_EXPIRED' ||
       code === 'NO_TOKEN'      ||
       code === 'INVALID_TOKEN');

    // Not a token problem, already retried, or is the refresh endpoint itself
    if (!isTokenProblem || orig._retry || orig.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // ── If ensureFreshToken is already mid-flight, piggyback on it ───────────
    if (_refreshPromise) {
      try {
        const ok = await _refreshPromise;
        if (!ok) {
          // ensureFreshToken already called forceLogout if appropriate
          return Promise.reject(error);
        }
        orig.headers.Authorization = `Bearer ${getAccessToken()}`;
        return api(orig);
      } catch {
        return Promise.reject(error);
      }
    }

    // ── Queue subsequent 401s while we refresh ────────────────────────────────
    if (isRefreshing) {
      return new Promise((resolve, reject) =>
        failedQueue.push({ resolve, reject }),
      )
        .then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        })
        .catch((err) => Promise.reject(err));
    }

    orig._retry  = true;
    isRefreshing = true;

    try {
      const rt = getRefreshToken();
      if (!rt) {
        // No refresh token — session is fully gone, force logout
        forceLogout();
        processQueue(error, null);
        return Promise.reject(error);
      }

      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken: rt },
        { withCredentials: true },
      );

      if (!data?.accessToken) {
        // 2xx but no token in response — treat as rejected
        forceLogout();
        processQueue(error, null);
        return Promise.reject(error);
      }

      saveTokens(data.accessToken, data.refreshToken ?? rt);
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);

    } catch (err: any) {
      processQueue(err, null);

      const errStatus = err?.response?.status;

      // 400, 401, 403 → refresh token is explicitly rejected, must logout
      if (errStatus === 400 || errStatus === 401 || errStatus === 403) {
        forceLogout();
      }
      // Network error / 5xx during refresh → reject silently, no logout

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;