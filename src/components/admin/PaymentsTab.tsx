'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, XCircle, RefreshCw, Filter, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const GATEWAYS = ['', 'bkash', 'nagad', 'rocket', 'szlm', 'cod'];
const STATUSES = ['', 'initiated', 'pending', 'completed', 'failed', 'refunded'];

const GATEWAY_COLORS: Record<string, string> = {
  bkash: '#E2136E', nagad: '#F05A28', rocket: '#7B2D8B', szlm: '#006A4E', cod: '#1a7a4a',
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchPayments(); }, [gatewayFilter, statusFilter, page]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (gatewayFilter) params.set('gateway', gatewayFilter);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/payments/admin/all?${params}`);
      setPayments(data.payments || []);
      setTotal(data.total || 0);
      setTotalRevenue(data.totalRevenue || 0);
    } catch {} finally { setLoading(false); }
  };

  const approvePayment = async (id: string) => {
    try {
      await api.patch(`/payments/admin/${id}/approve`);
      toast.success('Payment approved!');
      fetchPayments();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const refundPayment = async (id: string) => {
    const reason = prompt('Refund reason:');
    if (!reason) return;
    try {
      await api.post(`/payments/refund/${id}`, { reason });
      toast.success('Refund initiated');
      fetchPayments();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      initiated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const statCards = [
    { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { label: 'Total Payments', value: total, icon: DollarSign, color: 'from-blue-500 to-indigo-600' },
    { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, icon: Clock, color: 'from-yellow-500 to-amber-600' },
    { label: 'Failed', value: payments.filter(p => p.status === 'failed').length, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(c => (
          <div key={c.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{c.label}</p>
                <p className="font-heading text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{c.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0`}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={gatewayFilter} onChange={e => { setGatewayFilter(e.target.value); setPage(1); }} className="w-auto">
          {GATEWAYS.map(g => <option key={g} value={g}>{g ? g.charAt(0).toUpperCase() + g.slice(1) : 'All Gateways'}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
        </select>
        <button onClick={fetchPayments} className="btn-ghost flex items-center gap-2 px-3">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              {['User', 'Gateway', 'Amount', 'Purpose', 'TrxID', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="py-3 px-3"><div className="h-3 rounded animate-pulse" style={{ background: 'var(--color-border)' }} /></td>
                  ))}
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>No payments found</td></tr>
            ) : payments.map((p) => (
              <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="border-b hover:bg-[var(--color-bg-hover)] transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <img src={p.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || 'U')}&background=6B46C1&color=fff`}
                      alt="" className="w-7 h-7 rounded-full" />
                    <div>
                      <p className="font-medium text-xs" style={{ color: 'var(--color-text)' }}>{p.user?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-sm px-2 py-1 rounded-lg"
                    style={{ color: GATEWAY_COLORS[p.gateway] || 'var(--color-text)', background: `${GATEWAY_COLORS[p.gateway] || '#666'}18` }}>
                    {p.gateway?.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold" style={{ color: 'var(--color-brand)' }}>৳{p.amount?.toLocaleString()}</td>
                <td className="py-3 px-3 capitalize text-xs" style={{ color: 'var(--color-text-secondary)' }}>{p.purpose}</td>
                <td className="py-3 px-3">
                  <p className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {(p.gatewayTransactionId || p.userTransactionId || '—').slice(0, 12)}
                  </p>
                  {p.userTransactionId && !p.gatewayTransactionId && (
                    <span className="text-xs text-orange-500 font-medium">Manual</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span className={`badge text-xs ${statusBadge(p.status)}`}>{p.status}</span>
                </td>
                <td className="py-3 px-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(p.createdAt).toLocaleDateString('en-BD')}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    {p.status === 'pending' && (
                      <button onClick={() => approvePayment(p._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {p.status === 'completed' && (
                      <button onClick={() => refundPayment(p._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Refund
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">← Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
