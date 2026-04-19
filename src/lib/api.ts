// lib/api.ts — Production-ready axios instance

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const STORAGE_KEY = '3zf-auth';
const BASE_URL    = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAuthState(): { accessToken?: string; refreshToken?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const { state } = JSON.parse(stored);
    return state ?? null;
  } catch {
    return null;
  }
}

function setAccessToken(token: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    parsed.state.accessToken = token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {}
}

function redirectToLogin(): void {
  if (typeof window !== 'undefined') window.location.href = '/login';
}

// ─── Instance ─────────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request: attach token ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = getAuthState();
    if (state?.accessToken) {
      config.headers.Authorization = `Bearer ${state.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response: auto-refresh on TOKEN_EXPIRED ──────────────────────────────────
let isRefreshing    = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string): void {
  refreshQueue.forEach(resolve => resolve(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry;

    if (!isExpired) return Promise.reject(error);

    // Queue concurrent requests while refresh is in-flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry  = true;
    isRefreshing     = true;

    try {
      const state = getAuthState();
      if (!state?.refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh-token`,
        { refreshToken: state.refreshToken },
        { timeout: 10_000 }
      );

      const newToken = data.accessToken;
      setAccessToken(newToken);
      processQueue(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);

    } catch {
      redirectToLogin();
      return Promise.reject(error);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;