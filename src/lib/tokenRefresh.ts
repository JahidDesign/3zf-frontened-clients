import api from './axios';
import Cookies from 'js-cookie';

let refreshTimer: ReturnType<typeof setInterval> | null = null;

export const startTokenRefresh = (refreshToken: string, onNewToken: (token: string) => void) => {
  // Refresh every 12 minutes (token valid 15 min)
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(async () => {
    try {
      const res = await api.post('/auth/refresh', { refreshToken });
      if (res.data.accessToken) {
        Cookies.set('accessToken', res.data.accessToken, { expires: 1 });
        onNewToken(res.data.accessToken);
      }
    } catch {
      // Silently fail — user stays logged in until hard 401
    }
  }, 12 * 60 * 1000);
};

export const stopTokenRefresh = () => {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
};
