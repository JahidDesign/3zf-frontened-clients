import { useEffect, useState } from 'react';
import api from '@/lib/api';

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
  /** Flat status field — populated if your backend returns membershipStatus directly on user */
  membershipStatus?: 'pending' | 'approved' | 'rejected';
  /** Nested object — populated if your backend returns user.membership.status */
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
    try {
      const { data } = await api.get('/auth/me');
      // Support both { user: {...} } and flat { _id, name, ... } response shapes
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