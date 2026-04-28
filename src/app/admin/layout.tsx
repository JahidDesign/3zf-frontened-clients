'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  BarChart2, Users, Building2, ShoppingBag, Package, Droplets,
  CalendarDays, BookOpen, Images, Phone, Heart,
  CreditCard, Menu, X, LogOut, Home, Shield, Crown,
} from 'lucide-react';

// ─── Nav definition ───────────────────────────────────────────
const nav = [
  { href: '/admin',               icon: BarChart2,    label: 'Dashboard' },
  { href: '/admin/users',         icon: Users,        label: 'Users',             badge: 'deleteRequests' },
  { href: '/admin/organisation',  icon: Building2,    label: 'Organisation',      badge: 'pendingOrgMembers' },
  { href: '/admin/shop-members',  icon: Crown,        label: 'Shop Members' },
  { href: '/admin/association',   icon: Heart,        label: 'Association' },
  { href: '/admin/blood',         icon: Droplets,     label: 'Blood Requests',    badge: 'pendingBloodRequests' },
  { href: '/admin/products',      icon: Package,      label: 'Products' },
  { href: '/admin/orders',        icon: ShoppingBag,  label: 'Orders' },
  { href: '/admin/payments',      icon: CreditCard,   label: 'Payments' },
  { href: '/admin/events',        icon: CalendarDays, label: 'Events' },
  { href: '/admin/blogs',         icon: BookOpen,     label: 'Blogs' },
  { href: '/admin/gallery',       icon: Images,       label: 'Gallery' },
  { href: '/admin/contact',       icon: Phone,        label: 'Contact' },
];

const ADMIN_EMAIL = 'asadforex2025@gmail.com';

// ─── Loading spinner ──────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// ─── Sidebar inner component ──────────────────────────────────
function SidebarContent({
  pathname,
  stats,
  user,
  onClose,
  onLogout,
}: {
  pathname: string;
  stats: Record<string, number> | undefined;
  user: { name: string; email?: string; role?: string } | null;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shadow-violet-200 dark:shadow-violet-900">
            3Z
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">3ZF Admin</p>
            <p className="text-xs text-gray-400 mt-0.5">Control Panel v2</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
          const count = item.badge ? (stats?.[item.badge] ?? 0) : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center font-bold">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Home className="w-4 h-4 shrink-0" />
          Back to Site
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const { user, logout, isHydrated, isLoading } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const hasAccess =
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    user?.email === ADMIN_EMAIL;

  // ─── Redirect logic — isHydrated না হওয়া পর্যন্ত অপেক্ষা করুন ───
  useEffect(() => {
    if (!isHydrated) return; // store এখনো localStorage থেকে load হয়নি

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!hasAccess) {
      router.replace('/');
    }
  }, [isHydrated, user, hasAccess, router]);

  // Fetch badge counts — শুধু access থাকলে
  const { data: stats } = useQuery<Record<string, number>>({
    queryKey: ['admin-badge-stats'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.stats),
    refetchInterval: 60_000,
    enabled: !!user && hasAccess,
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ─── Hydration বা loading চলাকালীন spinner দেখান ───────────────
  if (!isHydrated || isLoading) {
    return <LoadingScreen />;
  }

  // ─── Access নেই — redirect হচ্ছে, blank দেখান ─────────────────
  if (!user || !hasAccess) {
    return <LoadingScreen />;
  }

  const pageLabel =
    nav.find(
      (n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href + '/'))
    )?.label ?? 'Admin Panel';

  const sidebarProps = {
    pathname,
    stats,
    user,
    onClose: () => setDrawerOpen(false),
    onLogout: handleLogout,
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-0 h-screen">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen shadow-xl">
            <SidebarContent {...sidebarProps} />
          </div>
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">

          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 dark:text-white text-sm">
              {pageLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.name[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {user.name}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
              <Shield className="w-3 h-3" />
              {user.email === ADMIN_EMAIL && !user.role?.includes('admin') ? 'superadmin' : user.role}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}