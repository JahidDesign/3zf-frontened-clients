import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

export const saveTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1 / 96, sameSite: 'lax' });
  Cookies.set('refreshToken', refreshToken, { expires: 90, sameSite: 'lax' });
};

export const clearTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
};

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const orig = error.config;

    if (error.response?.status !== 401 || orig._retry || orig.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then(token => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
    }

    orig._retry = true;
    isRefreshing = true;

    try {
      const rt = Cookies.get('refreshToken');
      if (!rt) throw new Error('No refresh token');

      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken: rt },
        { withCredentials: true },
      );

      saveTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);
    } catch (err) {
      processQueue(err, null);
      clearTokens();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;