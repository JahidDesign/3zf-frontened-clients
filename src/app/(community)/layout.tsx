'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, MessageCircle, Bell, Bookmark,
  Settings, UserCircle, Video, Hash, Globe
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { useT } from '@/hooks/useT';
import CommunityNavbar from '@/components/community/CommunityNavbar';
import FriendSuggestions from '@/components/community/FriendSuggestions';

const getSidebarItems = (t: any, username: string) => [
  { icon: Home,          label: t.community.feed,          href: '/community' },
  { icon: UserCircle,    label: t.nav.profile,             href: '/community/profile/' + username },
  { icon: Users,         label: t.community.friends,       href: '/community/friends' },
  { icon: MessageCircle, label: t.community.messages,      href: '/community/messages' },
  { icon: Bell,          label: t.community.notifications, href: '/community/notifications' },
  { icon: Users,         label: t.community.groups,        href: '/community/groups' },
  { icon: Globe,         label: t.community.pages,         href: '/community/pages' },
  { icon: Video,         label: t.community.reels,         href: '/community/reels' },
  { icon: Bookmark,      label: t.community.saved,         href: '/community/saved' },
  { icon: Hash,          label: t.community.explore,       href: '/community/explore' },
];

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, fetchMe } = useAuthStore();
  const { t } = useT();
  useSocket();

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (!user) fetchMe();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const sidebarItems = getSidebarItems(t, user?.username || '');

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <CommunityNavbar />

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 pt-[calc(var(--navbar-height)+12px)] flex gap-4">

        {/* Left Sidebar */}
        <aside className="w-[260px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-[calc(var(--navbar-height)+12px)]">
            {/* User card */}
            {user && (
              <Link href={'/community/profile/' + user.username}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors mb-2 group">
                <img
                  src={user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=6B46C1&color=fff'}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-[var(--color-brand)] transition-colors" style={{ color: 'var(--color-text)' }}>
                    {user.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    @{user.username}
                  </p>
                </div>
              </Link>
            )}

            <nav className="space-y-0.5">
              {sidebarItems.map(item => {
                const isActive = pathname === item.href ||
                  (item.href !== '/community' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}
                    className={
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ' +
                      (isActive
                        ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-brand)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]')
                    }
                  >
                    <item.icon className={'w-5 h-5 flex-shrink-0 ' + (isActive ? 'text-[var(--color-brand)]' : '')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Link href="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] transition-all">
                <Settings className="w-5 h-5" />
                {t.nav.settings}
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Panel - Friend Suggestions (desktop) */}
        <aside className="w-[300px] flex-shrink-0 hidden xl:block">
          <div className="sticky top-[calc(var(--navbar-height)+12px)]">
            <FriendSuggestions />
          </div>
        </aside>
      </div>
    </div>
  );
}
