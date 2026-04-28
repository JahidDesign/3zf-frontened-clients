import api from './axios';
import { saveTokens, getRefreshToken } from './axios';

let refreshTimer: ReturnType<typeof setInterval> | null = null;

export const startTokenRefresh = (onNewToken: (token: string) => void) => {
  // Refresh every 12 minutes (access token valid 15 min)
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(async () => {
    try {
      const rt = getRefreshToken();
      if (!rt) { stopTokenRefresh(); return; }

      const res = await api.post('/auth/refresh', { refreshToken: rt });
      if (res.data.accessToken && res.data.refreshToken) {
        // saveTokens handles cookie expiry correctly (15 min) + localStorage sync
        saveTokens(res.data.accessToken, res.data.refreshToken);
        onNewToken(res.data.accessToken);
      }
    } catch {
      // Silently fail — response interceptor handles hard 401 if needed
    }
  }, 12 * 60 * 1000);
};

export const stopTokenRefresh = () => {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
};