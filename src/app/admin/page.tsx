'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getAccessToken } from '@/lib/axios';
import { AxiosResponse } from "axios";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  ShoppingBag,
  CalendarDays,
  BookOpen,
  Building2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Crown,
  TrendingUp,
  Loader2,
  ExternalLink,
  MoreHorizontal,
  Search,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

interface OrgMember {
  _id: string;
  name: string;
  phone: string;
  district: string;
  nidDocument?: { url: string };
}

interface DeleteRequestUser {
  _id: string;
  name: string;
  email: string;
  deleteRequest?: { reason: string };
}

interface DashboardStats {
  users: number;
  orgMembers: number;
  products: number;
  orders: number;
  events: number;
  blogs: number;
  deleteRequests: number;
  pendingOrgMembers: number;
  pendingBloodRequests?: number;
  payments?: number;
  gallery?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatNumber(n: number | undefined): string {
  if (n === undefined) return '—';
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  accent: string;
  accentBg: string;
  trend?: string;
  trendUp?: boolean;
  href?: string;
  urgent?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  accentBg,
  trend,
  trendUp = true,
  href,
  urgent,
}: StatCardProps) {
  const inner = (
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group
        ${urgent
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
        }
      `}
    >
      <div
        className={`
          absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 transition-opacity group-hover:opacity-20
          ${accentBg}
        `}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentBg} bg-opacity-15`}
          >
            <Icon className={`w-4.5 h-4.5 ${accent}`} strokeWidth={1.8} />
          </div>
          {urgent && value !== undefined && value > 0 && (
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
              Action needed
            </span>
          )}
        </div>

        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wide uppercase mb-1">
          {label}
        </p>
        <p className={`text-2xl font-bold tabular-nums ${urgent && (value ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {value === undefined ? (
            <span className="text-gray-200 dark:text-gray-700">—</span>
          ) : (
            formatNumber(value)
          )}
        </p>

        {trend && (
          <p
            className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${
              trendUp ? 'text-emerald-500' : 'text-red-400'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const variants: Record<string, string> = {
    superadmin: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    admin:       'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    moderator:   'bg-blue-100  dark:bg-blue-900/30   text-blue-700   dark:text-blue-300',
    user:        'bg-gray-100  dark:bg-gray-800       text-gray-600   dark:text-gray-400',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${
        variants[role] ?? variants.user
      }`}
    >
      {role}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
        active
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`}
      />
      {active ? 'Active' : 'Suspended'}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-violet-400 to-violet-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-500',
  'from-teal-400 to-teal-600',
];

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const idx =
    name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx]} flex items-center justify-center text-white font-bold shrink-0 select-none`}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  badge,
  badgeVariant = 'default',
  href,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'warning' | 'danger';
  href?: string;
  iconColor?: string;
}) {
  const badgeClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    danger:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
        <Icon className={`w-4 h-4 ${iconColor ?? 'text-gray-400'}`} strokeWidth={1.8} />
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {badge !== undefined && (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeClasses[badgeVariant]}`}>
            {badge}
          </span>
        )}
        {href && (
          <Link
            href={href}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-0.5"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
      {message}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-sm text-red-400">
      {message}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [tokenReady, setTokenReady] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // ── Token check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setTokenReady(true);
    } else {
      window.location.href = '/login';
    }
  }, []);

  // ── Queries ──────────────────────────────────────────────────────────────────

  // GET /api/admin/dashboard
  const {
    data: stats,
    isError: statsError,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.stats),
    enabled: tokenReady,
    retry: 1,
    staleTime: 30_000,
  });

  // GET /api/admin/users?limit=10
  const {
    data: usersData,
    isError: usersError,
    isLoading: usersLoading,
  } = useQuery<{ users: User[] }>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users?limit=10').then((r) => r.data),
    enabled: tokenReady,
    retry: 1,
  });

  // GET /api/admin/delete-requests
  const { data: deleteRequests } = useQuery<{ users: DeleteRequestUser[] }>({
    queryKey: ['delete-requests'],
    queryFn: () => api.get('/admin/delete-requests').then((r) => r.data),
    enabled: tokenReady,
    retry: 1,
  });

  // GET /api/admin/org/members/pending
  const { data: orgPending } = useQuery<{ members: OrgMember[] }>({
    queryKey: ['org-pending'],
    queryFn: () =>
      api
        .get<{ members: OrgMember[] }>('/admin/org/members/pending')
        .then((r: AxiosResponse<{ members: OrgMember[] }>) => r.data),
    enabled: tokenReady,
    retry: 1,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  // PATCH /api/admin/users/:id/toggle
  const toggleUserMutation = useMutation({
    mutationFn: (userId: string) => api.patch(`/admin/users/${userId}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user status'),
  });

  // DELETE /api/admin/users/:id
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['delete-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  // PATCH /api/admin/org/members/:id/status
  const approveOrgMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/org/members/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['org-pending'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(`Member ${status}`);
    },
    onError: () => toast.error('Failed to update member status'),
  });

  // ── Filtered users ────────────────────────────────────────────────────────────
  const filteredUsers = (usersData?.users ?? []).filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // ── Stat cards config ─────────────────────────────────────────────────────────
  const statCards: StatCardProps[] = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats?.users,
      accent: 'text-indigo-600',
      accentBg: 'bg-indigo-500',
      href: '/admin/users',
    },
    {
      icon: Building2,
      label: 'Org Members',
      value: stats?.orgMembers,
      accent: 'text-amber-600',
      accentBg: 'bg-amber-500',
      href: '/admin/organisation',
    },
    {
      icon: Package,
      label: 'Products',
      value: stats?.products,
      accent: 'text-pink-600',
      accentBg: 'bg-pink-500',
      href: '/admin/products',
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      value: stats?.orders,
      accent: 'text-emerald-600',
      accentBg: 'bg-emerald-500',
      href: '/admin/orders',
    },
    {
      icon: CalendarDays,
      label: 'Events',
      value: stats?.events,
      accent: 'text-violet-600',
      accentBg: 'bg-violet-500',
      href: '/admin/events',
    },
    {
      icon: BookOpen,
      label: 'Blog Posts',
      value: stats?.blogs,
      accent: 'text-teal-600',
      accentBg: 'bg-teal-500',
      href: '/admin/blogs',
    },
    {
      icon: AlertTriangle,
      label: 'Delete Requests',
      value: stats?.deleteRequests,
      accent: 'text-red-600',
      accentBg: 'bg-red-500',
      href: '/admin/users',
      urgent: true,
    },
    {
      icon: Crown,
      label: 'Pending Members',
      value: stats?.pendingOrgMembers,
      accent: 'text-yellow-600',
      accentBg: 'bg-yellow-500',
      href: '/admin/organisation',
      urgent: (stats?.pendingOrgMembers ?? 0) > 0,
    },
  ];

  // ── Loading gate ──────────────────────────────────────────────────────────────
  if (!tokenReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Welcome back, Admin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              refetchStats();
              qc.invalidateQueries({ queryKey: ['admin-users'] });
              qc.invalidateQueries({ queryKey: ['delete-requests'] });
              qc.invalidateQueries({ queryKey: ['org-pending'] });
              toast.success('Dashboard refreshed');
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refresh all data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            View site
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Stats Error Banner ── */}
      {statsError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Failed to load dashboard statistics. Check your connection and try refreshing.
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card) =>
          statsLoading ? (
            <div
              key={card.label}
              className="h-28 bg-gray-100 dark:bg-gray-800/60 rounded-2xl animate-pulse"
            />
          ) : (
            <StatCard key={card.label} {...card} />
          )
        )}
      </div>

      {/* ── Recent Users ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <SectionHeader
          icon={Users}
          title="Recent Users"
          href="/admin/users"
          iconColor="text-indigo-400"
        />

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or role…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-gray-800/50">
                {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/80">
              {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : usersError ? (
                <tr>
                  <td colSpan={5}>
                    <ErrorState message="Failed to load users. Please refresh." />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      message={
                        userSearch ? `No users match "${userSearch}"` : 'No users found'
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {u.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-sm text-gray-400 dark:text-gray-500 max-w-[180px]">
                      <span className="truncate block">{u.email}</span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge active={u.isActive} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleUserMutation.mutate(u._id)}
                          disabled={toggleUserMutation.isPending}
                          className={`
                            text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 whitespace-nowrap
                            ${u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                            }
                          `}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        <Link
                          href={`/admin/users/${u._id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                          title="View user details"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete ${u.name}? This cannot be undone.`)) {
                              deleteUserMutation.mutate(u._id);
                            }
                          }}
                          disabled={deleteUserMutation.isPending}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer row */}
        {!usersLoading && !usersError && (usersData?.users?.length ?? 0) > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {filteredUsers.length} of {usersData?.users?.length ?? 0} recent users
            </p>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage all users →
            </Link>
          </div>
        )}
      </div>

      {/* ── Pending Org Members ── */}
      {(orgPending?.members?.length ?? 0) > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-100 dark:border-amber-900/40 overflow-hidden">
          <SectionHeader
            icon={Building2}
            title="Pending Organisation Members"
            badge={`${orgPending!.members.length} pending`}
            badgeVariant="warning"
            href="/admin/organisation"
            iconColor="text-amber-500"
          />

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {orgPending!.members.map((m, i) => (
              <div
                key={m._id}
                className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar name={m.name} size="md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {m.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {m.phone} · {m.district}
                    </p>
                    {m.nidDocument?.url && (
                      <a
                        href={m.nidDocument.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1.5"
                      >
                        View NID document
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 pt-0.5">
                  <button
                    onClick={() =>
                      approveOrgMutation.mutate({ id: m._id, status: 'approved' })
                    }
                    disabled={approveOrgMutation.isPending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-lg font-medium transition-colors disabled:opacity-40"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      approveOrgMutation.mutate({ id: m._id, status: 'rejected' })
                    }
                    disabled={approveOrgMutation.isPending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg font-medium transition-colors disabled:opacity-40"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Delete Requests ── */}
      {(deleteRequests?.users?.length ?? 0) > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/40 overflow-hidden">
          <SectionHeader
            icon={AlertTriangle}
            title="Account Delete Requests"
            badge={`${deleteRequests!.users.length} requests`}
            badgeVariant="danger"
            iconColor="text-red-500"
          />

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {deleteRequests!.users.map((u) => (
              <div
                key={u._id}
                className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar name={u.name} size="md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                    {u.deleteRequest?.reason && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 italic bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 border border-gray-100 dark:border-gray-700">
                        &ldquo;{u.deleteRequest.reason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Permanently delete ${u.name}'s account?\n\nThis action cannot be undone.`
                      )
                    ) {
                      deleteUserMutation.mutate(u._id);
                    }
                  }}
                  disabled={deleteUserMutation.isPending}
                  className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-40 shrink-0 mt-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete account
                </button>
              </div>
            ))}
          </div>

          {/* Warning footer */}
          <div className="px-5 py-3 bg-red-50/50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/40">
            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Account deletion is permanent and cannot be reversed. Verify before acting.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}