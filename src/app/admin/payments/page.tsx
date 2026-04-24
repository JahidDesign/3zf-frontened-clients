'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, Eye, Filter, Search,
  TrendingUp, Clock, BadgeCheck, AlertTriangle, RefreshCw
} from 'lucide-react';

const METHOD_INFO: Record<string, { color: string; emoji: string }> = {
  bkash:  { color: '#E2136E', emoji: '💳' },
  nagad:  { color: '#F05829', emoji: '💰' },
  rocket: { color: '#8B3D8B', emoji: '🚀' },
  bank:   { color: '#2563EB', emoji: '🏦' },
};

const STATUS_META: Record<string, { label: string; class: string }> = {
  pending:   { label: 'অপেক্ষমাণ', class: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
  verifying: { label: 'যাচাই চলছে', class: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  completed: { label: 'নিশ্চিত', class: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  failed:    { label: 'ব্যর্থ', class: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  refunded:  { label: 'ফেরত', class: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
};

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-payments', statusFilter, methodFilter],
    queryFn: () => api.get('/payments', { params: { status: statusFilter || undefined, method: methodFilter || undefined } }).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => api.get('/payments/stats').then(r => r.data.stats),
    refetchInterval: 60000,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/payments/${id}/verify`, { status, adminNote }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['payment-stats'] });
      toast.success(vars.status === 'completed' ? 'পেমেন্ট নিশ্চিত করা হয়েছে ✅' : 'পেমেন্ট বাতিল করা হয়েছে ❌');
      setSelectedPayment(null);
      setAdminNote('');
    },
    onError: () => toast.error('আপডেট ব্যর্থ হয়েছে'),
  });

  const payments = (data?.payments ?? []).filter((p: any) => {
    if (!search) return true;
    return (
      p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.senderNumber?.includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'যাচাই বাকি', value: statsData?.pending, color: 'yellow' },
          { icon: BadgeCheck, label: 'নিশ্চিত', value: statsData?.completed, color: 'green' },
          { icon: XCircle, label: 'ব্যর্থ', value: statsData?.failed, color: 'red' },
          { icon: TrendingUp, label: 'এই মাসে (৳)', value: statsData?.last30DaysTotal?.toLocaleString(), color: 'blue' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value ?? '—'}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-900/30 flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 text-${s.color}-600 dark:text-${s.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Method breakdown */}
      {statsData?.methodBreakdown?.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">পেমেন্ট পদ্ধতি ভাঙ্গন</h3>
          <div className="flex flex-wrap gap-3">
            {statsData.methodBreakdown.map((m: any) => (
              <div key={m._id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-xl">{METHOD_INFO[m._id]?.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{m._id}</p>
                  <p className="text-xs text-gray-400">{m.count}টি · ৳{m.amount?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" placeholder="TrxID, নাম বা নম্বর খুঁজুন..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input text-sm w-auto">
            <option value="">সব অবস্থা</option>
            <option value="verifying">যাচাই চলছে</option>
            <option value="pending">অপেক্ষমাণ</option>
            <option value="completed">নিশ্চিত</option>
            <option value="failed">ব্যর্থ</option>
          </select>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="input text-sm w-auto">
            <option value="">সব পদ্ধতি</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank">Bank</option>
          </select>
          <button onClick={() => refetch()} className="btn-ghost p-2.5 shrink-0" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Payments table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">পেমেন্ট তালিকা</h3>
          <span className="text-sm text-gray-500">{payments.length}টি রেকর্ড</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">কোনো পেমেন্ট পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">ব্যবহারকারী</th>
                  <th className="text-left px-5 py-3 font-medium">পরিমাণ</th>
                  <th className="text-left px-5 py-3 font-medium">পদ্ধতি</th>
                  <th className="text-left px-5 py-3 font-medium">TrxID</th>
                  <th className="text-left px-5 py-3 font-medium">অবস্থা</th>
                  <th className="text-left px-5 py-3 font-medium">তারিখ</th>
                  <th className="text-left px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map((p: any) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{p.user?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.senderNumber}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">৳{p.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: METHOD_INFO[p.method]?.color }}>
                        <span>{METHOD_INFO[p.method]?.emoji}</span>
                        <span className="capitalize">{p.method}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {p.transactionId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge text-xs ${STATUS_META[p.status]?.class}`}>
                        {STATUS_META[p.status]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{format(new Date(p.createdAt), 'dd MMM, HH:mm')}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedPayment(p)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300">
                          <Eye className="w-3.5 h-3.5" /> দেখুন
                        </button>
                        {(p.status === 'verifying' || p.status === 'pending') && (
                          <>
                            <button onClick={() => verifyMutation.mutate({ id: p._id, status: 'completed' })}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 text-green-700 dark:text-green-400 transition font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> নিশ্চিত
                            </button>
                            <button onClick={() => { setSelectedPayment(p); }}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-700 dark:text-red-400 transition font-medium">
                              <XCircle className="w-3.5 h-3.5" /> বাতিল
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">পেমেন্ট বিস্তারিত</h3>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['ব্যবহারকারী', selectedPayment.user?.name],
                  ['পরিমাণ', `৳${selectedPayment.amount?.toLocaleString()}`],
                  ['পদ্ধতি', `${METHOD_INFO[selectedPayment.method]?.emoji} ${selectedPayment.method}`],
                  ['TrxID', selectedPayment.transactionId],
                  ['নম্বর', selectedPayment.senderNumber],
                  ['ধরন', selectedPayment.type],
                  ['অবস্থা', STATUS_META[selectedPayment.status]?.label],
                  ['তারিখ', format(new Date(selectedPayment.createdAt), 'PPp')],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-500">{k}</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              {/* Screenshot */}
              {selectedPayment.screenshot?.url && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">স্ক্রিনশট</p>
                  <a href={selectedPayment.screenshot.url} target="_blank" rel="noopener noreferrer">
                    <img src={selectedPayment.screenshot.url} alt="Payment screenshot" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 hover:opacity-90 transition" />
                  </a>
                </div>
              )}

              {(selectedPayment.status === 'verifying' || selectedPayment.status === 'pending') && (
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">অ্যাডমিন নোট (ঐচ্ছিক)</label>
                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                      className="input text-sm resize-none" rows={2} placeholder="বাতিলের কারণ বা মন্তব্য..." />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => verifyMutation.mutate({ id: selectedPayment._id, status: 'completed' })}
                      disabled={verifyMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition"
                    >
                      <CheckCircle className="w-4 h-4" /> নিশ্চিত করুন
                    </button>
                    <button
                      onClick={() => verifyMutation.mutate({ id: selectedPayment._id, status: 'failed' })}
                      disabled={verifyMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition"
                    >
                      <XCircle className="w-4 h-4" /> বাতিল করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
