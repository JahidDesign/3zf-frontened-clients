// ============================================================
// StoryRow.tsx
// ============================================================
'use client';
import { Plus } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const MOCK_STORIES = [
  { id: '1', name: 'Sarah K.', avatar: 'https://ui-avatars.com/api/?name=Sarah&background=EC4899&color=fff', gradient: 'from-pink-500 to-rose-600' },
  { id: '2', name: 'Ahmed R.', avatar: 'https://ui-avatars.com/api/?name=Ahmed&background=3B82F6&color=fff', gradient: 'from-blue-500 to-indigo-600' },
  { id: '3', name: 'Nadia M.', avatar: 'https://ui-avatars.com/api/?name=Nadia&background=10B981&color=fff', gradient: 'from-green-500 to-teal-600' },
  { id: '4', name: 'Karim B.', avatar: 'https://ui-avatars.com/api/?name=Karim&background=F59E0B&color=fff', gradient: 'from-amber-500 to-orange-600' },
];

export default function StoryRow() {
  const { user } = useAuthStore();
  return (
    <div className="flex gap-3 mb-3 overflow-x-auto pb-1">
      {/* Create story */}
      <div className="flex-shrink-0 w-28">
        <div className="relative rounded-2xl overflow-hidden cursor-pointer group" style={{ aspectRatio: '9/16', maxHeight: '180px' }}>
          <div className="w-full h-3/4 object-cover" style={{ background: 'var(--color-bg-tertiary)' }}>
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6B46C1&color=fff`}
              alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 pb-3 pt-6 text-center"
            style={{ background: 'var(--color-bg)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full gradient-brand flex items-center justify-center border-2 border-[var(--color-bg)]">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Create</p>
          </div>
        </div>
      </div>

      {/* Stories */}
      {MOCK_STORIES.map(story => (
        <div key={story.id} className="flex-shrink-0 w-28 cursor-pointer">
          <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-b ${story.gradient}`}
            style={{ aspectRatio: '9/16', maxHeight: '180px' }}>
            <img src={story.avatar} alt={story.name} className="w-full h-full object-cover opacity-80" />
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-3 border-[var(--color-brand)] overflow-hidden"
              style={{ border: '3px solid #6B46C1' }}>
              <img src={story.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white text-xs font-semibold drop-shadow">{story.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// FriendSuggestions.tsx
// ============================================================
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/friends/suggestions').then(({ data }) => setSuggestions(data.suggestions || [])).catch(() => {});
  }, []);

  const sendRequest = async (userId: string) => {
    try {
      await api.post(`/friends/request/${userId}`);
      setSent(prev => new Set([...prev, userId]));
      toast.success('Friend request sent!');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>People You May Know</h3>
      <div className="space-y-3">
        {suggestions.slice(0, 5).map((s: any) => (
          <div key={s._id} className="flex items-center justify-between gap-2">
            <Link href={`/community/profile/${s.username}`} className="flex items-center gap-2.5 min-w-0">
              <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=6B46C1&color=fff`}
                alt="" className="w-9 h-9 avatar flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>@{s.username}</p>
              </div>
            </Link>
            <button onClick={() => sendRequest(s._id)} disabled={sent.has(s._id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0
                ${sent.has(s._id) ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]' : 'gradient-brand text-white hover:opacity-90'}`}>
              <UserPlus className="w-3.5 h-3.5" />
              {sent.has(s._id) ? 'Sent' : 'Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CommunityNavbar.tsx
// ============================================================
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Video, ShoppingBag, Bell, Search, MessageCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut } from 'lucide-react';

const tabs = [
  { icon: Home, href: '/community', label: 'Home' },
  { icon: Video, href: '/community/reels', label: 'Reels' },
  { icon: Users, href: '/community/groups', label: 'Groups' },
  { icon: ShoppingBag, href: '/supershop', label: 'Shop' },
];

export default function CommunityNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b"
      style={{ borderColor: 'var(--color-border)', height: 'var(--navbar-height)' }}>
      <div className="max-w-[1400px] mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold">3Z</div>
          <span className="font-heading font-bold hidden sm:block" style={{ color: 'var(--color-text)' }}>Harmony</span>
        </Link>

        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          <input type="search" placeholder="Search Harmony..." className="pl-10 py-2 text-sm rounded-full" />
        </div>

        {/* Center tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map(tab => {
            const active = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex flex-col items-center justify-center w-14 py-2 rounded-xl transition-all
                  ${active ? 'text-[var(--color-brand)] border-b-2 border-[var(--color-brand)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                <tab.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-ghost w-9 h-9 flex items-center justify-center p-0">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/community/messages" className="btn-ghost w-9 h-9 flex items-center justify-center p-0 relative">
            <MessageCircle className="w-5 h-5" />
          </Link>
          <Link href="/community/notifications" className="btn-ghost w-9 h-9 flex items-center justify-center p-0 relative">
            <Bell className="w-5 h-5" />
          </Link>
          {user && (
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`}
              alt="" className="w-9 h-9 avatar cursor-pointer" />
          )}
        </div>
      </div>
    </header>
  );
}
