'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, Users, ShoppingBag, MessageCircle, Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useT } from '@/hooks/useT';

const TABS = [
  { icon: Home,       href: '/community',         key: 'feed' },
  { icon: Video,      href: '/community/reels',    key: 'reels' },
  { icon: Users,      href: '/community/groups',   key: 'groups' },
  { icon: ShoppingBag,href: '/supershop',          key: 'shop' },
];

export default function CommunityNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { t } = useT();
  const [searchQ, setSearchQ] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/community/explore?q=${encodeURIComponent(searchQ)}`);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 glass border-b"
      style={{ borderColor: 'var(--color-border)', height: 'var(--navbar-height)' }}
    >
      <div className="max-w-[1400px] mx-auto px-3 h-full flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm">
            3Z
          </div>
          <span className="font-heading font-bold hidden sm:block" style={{ color: 'var(--color-text)' }}>
            Harmony
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative hidden md:block w-64 flex-shrink-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="search"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={t.common.search + '…'}
            className="pl-10 py-2 text-sm rounded-full w-full"
            style={{ background: 'var(--color-bg-secondary)', border: '1.5px solid var(--color-border)' }}
          />
        </form>

        {/* Center tabs */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {TABS.map(tab => {
            const isActive = pathname === tab.href || (tab.href !== '/community' && pathname.startsWith(tab.href));
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex flex-col items-center justify-center w-14 h-[calc(var(--navbar-height)-1px)] border-b-2 transition-all
                  ${isActive
                    ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]'}`}>
                <tab.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <LanguageSwitcher variant="badge" className="hidden sm:flex" />

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-ghost w-9 h-9 flex items-center justify-center p-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link href="/community/messages"
            className="btn-ghost w-9 h-9 flex items-center justify-center p-0 relative">
            <MessageCircle className="w-5 h-5" />
          </Link>

          <Link href="/community/notifications"
            className="btn-ghost w-9 h-9 flex items-center justify-center p-0 relative">
            <Bell className="w-5 h-5" />
          </Link>

          {user && (
            <Link href={`/community/profile/${user.username}`}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
