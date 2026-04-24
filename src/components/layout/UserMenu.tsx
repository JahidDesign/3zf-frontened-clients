'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useT } from '@/lib/i19n';
import { Settings, LogOut, User, Shield, HelpCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface Props {
  user: { _id: string; name: string; avatar?: string; role: string };
  compact?: boolean;
}

export function UserMenu({ user, compact }: Props) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2">
        {user.avatar ? (
          <Image src={user.avatar} alt={user.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
            {user.name[0].toUpperCase()}
          </div>
        )}
        {!compact && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-[120px] truncate">
            {user.name}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl py-1 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
              user.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
            }`}>
              {user.role}
            </span>
          </div>

          <div className="py-1">
            <Link href={`/community/profile/${user._id}`} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <User className="w-4 h-4" /> {t.nav.viewProfile}
            </Link>

            {(user.role === 'admin' || user.role === 'superadmin') && (
              <Link href="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Shield className="w-4 h-4" /> {t.nav.adminPanel}
              </Link>
            )}

            <Link href="/settings" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <Settings className="w-4 h-4" /> {t.settings?.title || 'Settings'}
            </Link>

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? t.nav.lightMode : t.nav.darkMode}
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 py-1">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              <LogOut className="w-4 h-4" /> {t.nav.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
