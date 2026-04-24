'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Users, ShoppingBag, CalendarDays, BookOpen, Building2, Trash2,
  CheckCircle, XCircle, BarChart2, Bell, Package, AlertTriangle,
  CreditCard, Droplets, Heart, Crown, Images, Phone, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────
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

// ─── Stat card ────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  trend,
  trendUp = true,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  iconBg: string;
  iconColor: string;
  trend?: string;
  trendUp?: boolean;
  href?: string;
}) {
  const inner = (
    <div className="card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
            {value?.toLocaleString() ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
          </p>
          {trend && (
            <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              <TrendingUp className="w-3 h-3" />
              {trend} this month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Main dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const qc = useQueryClient();

  // ── Queries ──
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.stats),
  });

  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users?limit=10').then((r) => r.data),
  });

  const { data: deleteRequests } = useQuery<{ users: DeleteRequestUser[] }>({
    queryKey: ['delete-requests'],
    queryFn: () => api.get('/admin/delete-requests').then((r) => r.data),
  });

  const { data: orgPending } = useQuery<{ members: OrgMember[] }>({
    queryKey: ['org-pending'],
    queryFn: () => api.get('/org/members/pending').then((r) => r.data),
  });

  // ── Mutations ──
  const toggleUserMutation = useMutation({
    mutationFn: (userId: string) => api.patch(`/admin/users/${userId}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['delete-requests'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const approveOrgMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/organisation/members/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['org-pending'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(`Member ${status}`);
    },
    onError: () => toast.error('Failed to update member status'),
  });

  // ── Stat cards config ──
  const statCards = [
    { icon: Users,         label: 'Total Users',       value: stats?.users,              iconBg: 'bg-blue-50 dark:bg-blue-900/20',    iconColor: 'text-blue-500',    href: '/admin/users' },
    { icon: Building2,     label: 'Org Members',        value: stats?.orgMembers,         iconBg: 'bg-orange-50 dark:bg-orange-900/20',iconColor: 'text-orange-500',  href: '/admin/organisation' },
    { icon: Package,       label: 'Products',           value: stats?.products,           iconBg: 'bg-pink-50 dark:bg-pink-900/20',    iconColor: 'text-pink-500',    href: '/admin/products' },
    { icon: ShoppingBag,   label: 'Orders',             value: stats?.orders,             iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',iconColor: 'text-emerald-500',href: '/admin/orders' },
    { icon: CalendarDays,  label: 'Events',             value: stats?.events,             iconBg: 'bg-violet-50 dark:bg-violet-900/20',iconColor: 'text-violet-500',  href: '/admin/events' },
    { icon: BookOpen,      label: 'Blog Posts',         value: stats?.blogs,              iconBg: 'bg-teal-50 dark:bg-teal-900/20',    iconColor: 'text-teal-500',    href: '/admin/blogs' },
    { icon: AlertTriangle, label: 'Delete Requests',    value: stats?.deleteRequests,     iconBg: 'bg-red-50 dark:bg-red-900/20',      iconColor: 'text-red-500',     href: '/admin/users' },
    { icon: Crown,         label: 'Pending Members',    value: stats?.pendingOrgMembers,  iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',iconColor: 'text-yellow-500',  href: '/admin/organisation' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, Admin</p>
        </div>
        <Link href="/" className="btn-secondary text-sm px-4 py-2">
          View Site
        </Link>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Recent Users table ── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            Recent Users
          </h2>
          <Link href="/admin/users" className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {usersData?.users?.length ? (
                usersData.users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${u.role === 'admin' || u.role === 'superadmin'
                          ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${u.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleUserMutation.mutate(u._id)}
                          disabled={toggleUserMutation.isPending}
                          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50
                            ${u.isActive
                              ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete ${u.name}?`)) {
                              deleteUserMutation.mutate(u._id);
                            }
                          }}
                          disabled={deleteUserMutation.isPending}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pending Org Members ── */}
      {(orgPending?.members?.length ?? 0) > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              Pending Organisation Members
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              {orgPending!.members.length} pending
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {orgPending!.members.map((m) => (
              <div key={m._id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{m.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.phone} · {m.district}</p>
                  {m.nidDocument?.url && (
                    <a
                      href={m.nidDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline mt-1 inline-block"
                    >
                      View NID Document ↗
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approveOrgMutation.mutate({ id: m._id, status: 'approved' })}
                    disabled={approveOrgMutation.isPending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => approveOrgMutation.mutate({ id: m._id, status: 'rejected' })}
                    disabled={approveOrgMutation.isPending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Delete Requests ── */}
      {(deleteRequests?.users?.length ?? 0) > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Account Delete Requests
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
              {deleteRequests!.users.length} requests
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {deleteRequests!.users.map((u) => (
              <div key={u._id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  {u.deleteRequest?.reason && (
                    <p className="text-xs text-gray-400 mt-1 italic">
                      &ldquo;{u.deleteRequest.reason}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Permanently delete ${u.name}'s account? This cannot be undone.`)) {
                      deleteUserMutation.mutate(u._id);
                    }
                  }}
                  disabled={deleteUserMutation.isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}