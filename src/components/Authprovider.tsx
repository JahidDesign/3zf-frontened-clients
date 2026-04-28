'use client';

import { useEffect, useState } from 'react';
import { ensureFreshToken, getRefreshToken } from '@/lib/axios';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(p => pathname?.startsWith(p));

    ensureFreshToken().then(() => {
      const hasRefreshToken = !!getRefreshToken();

      // If on a protected page with no tokens at all, redirect to login
      if (!isPublic && !hasRefreshToken) {
        router.replace('/login');
        return;
      }

      setReady(true);
    });
  }, []);

  // Show nothing while checking auth (prevents 401 flash)
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}