import { useEffect, useState } from 'react';
import api, { getAccessToken, ensureFreshToken } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Membership {
  status?: 'pending' | 'approved' | 'rejected';
  plan?: string;
  expiresAt?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin' | 'moderator' | string;
  membershipStatus?: 'pending' | 'approved' | 'rejected';
  membership?: Membership;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    // Step 1: token আছে কিনা check করো — না থাকলে call করবে না
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Step 2: token থাকলে fresh কিনা নিশ্চিত করো (expired হলে refresh করবে)
    const ok = await ensureFreshToken();
    if (!ok) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Step 3: valid token আছে — এখন /auth/me call করো
    try {
      const { data } = await api.get('/auth/me');
      setUser((data.user ?? data) as AuthUser | null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return { user, loading, refetch: fetchMe };
}