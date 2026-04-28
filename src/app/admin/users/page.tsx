'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  Users,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
  X,
  TrendingUp,
  Ban,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'user' | 'admin' | 'superadmin' | 'moderator';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  createdAt: string;
  avatar?: string;
}

interface UsersResponse {
  success: boolean;
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

interface StatsResponse {
  success: boolean;
  stats: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    admins: number;
    superadmins: number;
    newThisMonth: number;
  };
}

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  variant: ConfirmVariant;
  onConfirm: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: Role[] = ['user', 'moderator', 'admin', 'superadmin'];
const PAGE_SIZE = 15;

const ROLE_LABELS: Record<Role, string> = {
  user:       'User',
  moderator:  'Moderator',
  admin:      'Admin',
  superadmin: 'Superadmin',
};

const AVATAR_PALETTE = [
  'from-violet-400 to-violet-600',
  'from-sky-400    to-sky-600',
  'from-emerald-400 to-emerald-600',
  'from-rose-400   to-rose-600',
  'from-amber-400  to-amber-600',
  'from-teal-400   to-teal-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-orange-400 to-orange-600',
];

function avatarGradient(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  if (!state.open) return null;

  const iconMap: Record<ConfirmVariant, React.ReactNode> = {
    danger:  <Trash2      className="w-5 h-5 text-red-600   dark:text-red-400"   />,
    warning: <UserX       className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    info:    <ShieldCheck className="w-5 h-5 text-sky-600   dark:text-sky-400"   />,
  };
  const bgMap: Record<ConfirmVariant, string> = {
    danger:  'bg-red-100   dark:bg-red-900/30',
    warning: 'bg-amber-100 dark:bg-amber-900/30',
    info:    'bg-sky-100   dark:bg-sky-900/30',
  };
  const btnMap: Record<ConfirmVariant, string> = {
    danger:  'bg-red-500   hover:bg-red-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info:    'bg-sky-500   hover:bg-sky-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${bgMap[state.variant]}`}>
          {iconMap[state.variant]}
        </div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{state.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{state.message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => { state.onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white transition ${btnMap[state.variant]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ban Reason Dialog ────────────────────────────────────────────────────────
// Dedicated modal to collect an optional ban reason before confirming.

interface BanDialogProps {
  user: AdminUser | null;
  onConfirm: (banReason?: string) => void;
  onClose: () => void;
}

function BanDialog({ user, onConfirm, onClose }: BanDialogProps) {
  const [reason, setReason] = useState('');

  if (!user) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 bg-orange-100 dark:bg-orange-900/30">
          <Ban className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Ban {user.name}?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This user will be permanently banned and immediately logged out.
        </p>

        <label className="block mb-4">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </span>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. Repeated policy violations"
            className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 resize-none transition"
          />
        </label>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition"
          >
            Ban user
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────

function RowActions({ user, onToggle, onBan, onDelete }: {
  user: AdminUser;
  onToggle: () => void;
  onBan: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
  }, []);

  return (
    <div ref={ref} className="relative" onBlur={handleBlur} tabIndex={-1}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
          {/* Toggle active — disabled while banned */}
          <button
            onMouseDown={e => { e.preventDefault(); onToggle(); setOpen(false); }}
            disabled={user.isBanned}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {user.isActive && !user.isBanned
              ? <><UserX     className="w-3.5 h-3.5 text-amber-500" /> Suspend user</>
              : <><UserCheck className="w-3.5 h-3.5 text-green-500" /> Activate user</>}
          </button>

          {/* Ban / Unban */}
          <button
            onMouseDown={e => { e.preventDefault(); onBan(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {user.isBanned
              ? <><ShieldOff className="w-3.5 h-3.5 text-green-500"  /> Unban user</>
              : <><Ban       className="w-3.5 h-3.5 text-orange-500" /> Ban user</>}
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          <button
            onMouseDown={e => { e.preventDefault(); onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete user
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Role Select with Inline Confirm ─────────────────────────────────────────

function RoleSelect({ user, onConfirm, isPending }: {
  user: AdminUser;
  onConfirm: (id: string, role: Role) => void;
  isPending: boolean;
}) {
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Role;
    if (next === user.role) return;
    setPendingRole(next);
  };

  if (pendingRole) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          → <span className="font-medium text-gray-700 dark:text-gray-300">{ROLE_LABELS[pendingRole]}</span>?
        </span>
        <button
          onClick={() => { onConfirm(user._id, pendingRole); setPendingRole(null); }}
          className="text-xs px-2 py-0.5 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition"
        >
          Yes
        </button>
        <button
          onClick={() => setPendingRole(null)}
          className="text-xs px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <select
      value={user.role}
      onChange={handleChange}
      disabled={isPending}
      className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50 transition"
    >
      {ROLES.map(r => (
        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
      ))}
    </select>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ user }: { user: AdminUser }) {
  if (user.isBanned) {
    return (
      <span
        title={user.banReason ?? 'No reason provided'}
        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 cursor-help"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        Banned
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
      user.isActive
        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-red-100   text-red-600   dark:bg-red-900/30   dark:text-red-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      {user.isActive ? 'Active' : 'Suspended'}
    </span>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-2.5 w-36 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const qc = useQueryClient();

  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter,      setRoleFilter]      = useState<Role | ''>('');
  const [page,            setPage]            = useState(1);

  // Standard confirm dialog — used for toggle / unban / delete
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false, title: '', message: '', variant: 'danger', onConfirm: () => {},
  });

  // Dedicated ban dialog — holds the user being banned so we can collect a reason
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);

 const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSearch = (val: string) => {
  setSearch(val);

  if (debounceRef.current) clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(() => {
    setDebouncedSearch(val);
    setPage(1);
  }, 350);
};

  // ── Queries ───────────────────────────────────────────────────────────────────
  // baseURL is /api — all admin routes need the /admin prefix explicitly.

  const usersKey = ['admin-users', debouncedSearch, roleFilter, page] as const;

  const { data, isLoading, isFetching, isError } = useQuery<UsersResponse>({
    queryKey: usersKey,
    queryFn: () =>
      api.get('/admin/users', {
        params: {
          search: debouncedSearch || undefined,
          role:   roleFilter      || undefined,
          page,
          limit:  PAGE_SIZE,
        },
      }).then(r => r.data),
    placeholderData: prev => prev,
  });

  const { data: statsData } = useQuery<StatsResponse>({
    queryKey: ['admin-stats'],
    queryFn:  () => api.get('/admin/stats').then(r => r.data),
    staleTime: 30_000,
    retry: false, // stats are non-critical; don't hammer on transient failure
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-users'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/admin/users/${id}/toggle`).then(r => r.data),
    onSuccess: (res: { isActive: boolean }) => {
      invalidateAll();
      toast.success(res.isActive ? 'User activated' : 'User suspended');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update status'),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, banReason }: { id: string; banReason?: string }) =>
      api.patch(`/admin/users/${id}/ban`, { banReason }).then(r => r.data),
    onSuccess: (res: { isBanned: boolean }) => {
      invalidateAll();
      toast.success(res.isBanned ? 'User banned' : 'User unbanned');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update ban status'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data),
    onSuccess: (_: any, { role }: { id: string; role: Role }) => {
      invalidateAll();
      toast.success(`Role updated to ${ROLE_LABELS[role]}`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/admin/users/${id}`).then(r => r.data),
    onSuccess: () => {
      // If we deleted the last item on a non-first page, step back one page
      if ((data?.users.length ?? 0) === 1 && page > 1) setPage(p => p - 1);
      invalidateAll();
      toast.success('User deleted');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete user'),
  });

  // ── Action handlers ───────────────────────────────────────────────────────────

  const askToggle = (u: AdminUser) => setConfirm({
    open: true,
    title:   u.isActive ? `Suspend ${u.name}?` : `Activate ${u.name}?`,
    message: u.isActive
      ? 'This user will lose access to the platform immediately.'
      : 'This user will regain full access to their account.',
    variant: 'warning',
    onConfirm: () => toggleMutation.mutate(u._id),
  });

  // Banning → open BanDialog to collect optional reason
  // Unbanning → standard ConfirmDialog (no reason needed)
  const askBan = (u: AdminUser) => {
    if (u.isBanned) {
      setConfirm({
        open: true,
        title:   `Unban ${u.name}?`,
        message: 'This user will be unbanned and can log in again.',
        variant: 'info',
        onConfirm: () => banMutation.mutate({ id: u._id }),
      });
    } else {
      setBanTarget(u);
    }
  };

  const askDelete = (u: AdminUser) => setConfirm({
    open: true,
    title:   `Delete ${u.name}?`,
    message: 'This is permanent. All posts and data belonging to this user will be removed.',
    variant: 'danger',
    onConfirm: () => deleteMutation.mutate(u._id),
  });

  // ── Derived values ────────────────────────────────────────────────────────────

  const users      = data?.users      ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? (Math.ceil(total / PAGE_SIZE) || 1);
  const stats      = statsData?.stats;

  const STAT_CARDS = [
    { label: 'Total members',  value: stats?.total        ?? total, icon: Users,      color: 'text-primary-600 bg-primary-50  dark:bg-primary-900/20 dark:text-primary-400' },
    { label: 'Active',         value: stats?.active       ?? 0,     icon: UserCheck,  color: 'text-green-600   bg-green-50   dark:bg-green-900/20   dark:text-green-400'   },
    { label: 'Suspended',      value: stats?.suspended    ?? 0,     icon: UserX,      color: 'text-red-500     bg-red-50     dark:bg-red-900/20     dark:text-red-400'     },
    { label: 'New this month', value: stats?.newThisMonth ?? 0,     icon: TrendingUp, color: 'text-sky-600     bg-sky-50     dark:bg-sky-900/20     dark:text-sky-400'     },
  ] as const;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Standard confirm dialog — toggle / unban / delete */}
      <ConfirmDialog
        state={confirm}
        onClose={() => setConfirm(s => ({ ...s, open: false }))}
      />

      {/* Ban dialog — collects optional reason before banning */}
      <BanDialog
        user={banTarget}
        onConfirm={banReason => banTarget && banMutation.mutate({ id: banTarget._id, banReason })}
        onClose={() => setBanTarget(null)}
      />

      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Users</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {total > 0 ? `${total.toLocaleString()} member${total !== 1 ? 's' : ''} total` : 'Loading…'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { invalidateAll(); toast.success('Refreshed'); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="card px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                  {s.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="card p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="input pl-9 pr-8 text-sm w-full"
              placeholder="Search by name, email or phone…"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {(['', ...ROLES] as const).map(r => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {r === '' ? 'All' : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card overflow-hidden">
          {/* Thin top bar shown while a background refetch is running */}
          {isFetching && !isLoading && (
            <div className="h-0.5 bg-primary-100 dark:bg-primary-900/30 overflow-hidden">
              <div className="h-full w-2/5 bg-primary-500 animate-pulse" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 font-medium w-12" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <p className="text-sm text-gray-400 mb-2">Failed to load users.</p>
                      <button onClick={invalidateAll} className="text-xs text-primary-600 hover:underline">
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <Users className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No users found</p>
                      {(debouncedSearch || roleFilter) && (
                        <button
                          onClick={() => { setSearch(''); setDebouncedSearch(''); setRoleFilter(''); setPage(1); }}
                          className="mt-2 text-xs text-primary-600 hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr
                      key={u._id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                        u.isBanned ? 'opacity-60' : ''
                      }`}
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(u.name)} flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden`}>
                            {u.avatar
                              ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              : initials(u.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 hidden md:table-cell whitespace-nowrap">
                        {u.phone || <span className="text-gray-300 dark:text-gray-700">—</span>}
                      </td>

                      {/* Role — inline confirm before firing mutation */}
                      <td className="px-4 py-3">
                        <RoleSelect
                          user={u}
                          onConfirm={(id, role) => roleMutation.mutate({ id, role })}
                          isPending={roleMutation.isPending && roleMutation.variables?.id === u._id}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge user={u} />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <RowActions
                          user={u}
                          onToggle={() => askToggle(u)}
                          onBan={() => askBan(u)}
                          onDelete={() => askDelete(u)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400">
                Showing{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–{Math.min(page * PAGE_SIZE, total).toLocaleString()}
                </span>{' '}
                of <span className="font-medium text-gray-700 dark:text-gray-300">{total.toLocaleString()}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p: number;
                  if      (totalPages <= 5)        p = i + 1;
                  else if (page <= 3)              p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else                             p = page - 2 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                        p === page
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}