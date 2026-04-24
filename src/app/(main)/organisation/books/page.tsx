// organisation/donate/page.tsx — Book Donation → Donation Data Table

'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';
import { useT } from '@/hooks/useT';
import Link from 'next/link';
import {
  Heart, BookOpen, CreditCard, Clock, Image as ImageIcon,
  Users, Search, Filter, ChevronDown, CheckCircle,
  XCircle, Clock3, RefreshCw, Eye,
} from 'lucide-react';

const navItems = [
  { label: 'Organisation', href: '/organisation',          icon: Users },
  { label: 'Donations Complete',href: '/organisation/books',    icon: BookOpen },
  { label: 'Pending',      href: '/organisation/pending',  icon: Clock },
  { label: 'Requests',     href: '/organisation/requests', icon: CreditCard },
  { label: 'Gallery',      href: '/organisation/gallery',  icon: ImageIcon },
];

type BookDonation = {
  _id: string;
  title: string;
  author: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  donorName?: string;
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-amber-100  text-amber-800',  icon: Clock3      },
  approved:  { label: 'Approved',  color: 'bg-green-100  text-green-800',  icon: CheckCircle },
  rejected:  { label: 'Rejected',  color: 'bg-red-100    text-red-800',    icon: XCircle     },
  completed: { label: 'Completed', color: 'bg-blue-100   text-blue-800',   icon: CheckCircle },
};

export default function BookDonationPage() {
  const { t } = useT();

  const [data,    setData]    = useState<BookDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('all');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: LIMIT };
      if (search)        params.search = search;
      if (status !== 'all') params.status = status;

      const res = await api.get('/organisation/books', { params });
      setData(res.data.data);
      setTotal(res.data.pagination?.total ?? 0);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, status]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchData(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]">
        {/* ── Hero ── */}
        <div className="gradient-brand text-white py-12 px-4 text-center">
          <BookOpen className="w-14 h-14 mx-auto mb-3 opacity-80" />
          <h1 className="font-heading text-3xl font-bold">Book Donations</h1>
          <p className="mt-2 opacity-80 text-sm">All submitted book donations</p>
        </div>

        {/* ── Sub-nav ── */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {navItems.map(item => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.label === 'Book Donation'
                      ? 'gradient-brand text-white shadow-brand'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or author…"
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1); }}
                className="pl-9 pr-8 py-2 rounded-xl border text-sm appearance-none"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-[var(--color-text-secondary)]" />
            </div>

            {/* Refresh */}
            <button onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--color-bg-hover)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {/* ── Table card ── */}
          <div className="card overflow-hidden p-0">
            {/* summary row */}
            <div className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {total} donation{total !== 1 ? 's' : ''} found
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Page {page} of {totalPages || 1}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                    {['#', 'Book Title', 'Author', 'Qty', 'Donor', 'Date', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--color-text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    /* skeleton rows */
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 rounded animate-pulse"
                              style={{ background: 'var(--color-bg-secondary)', width: j === 1 ? '120px' : '60px' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center"
                        style={{ color: 'var(--color-text-secondary)' }}>
                        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No donations found</p>
                        <p className="text-xs mt-1">Try changing your filters</p>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) => {
                      const cfg = STATUS_CONFIG[row.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <tr key={row._id}
                          className="transition-colors hover:bg-[var(--color-bg-hover)]"
                          style={{ borderBottom: '1px solid var(--color-border)' }}>
                          {/* # */}
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {(page - 1) * LIMIT + idx + 1}
                          </td>
                          {/* Title */}
                          <td className="px-4 py-3 font-medium max-w-[180px] truncate"
                            style={{ color: 'var(--color-text)' }} title={row.title}>
                            {row.title}
                          </td>
                          {/* Author */}
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                            {row.author}
                          </td>
                          {/* Qty */}
                          <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>
                            {row.quantity}
                          </td>
                          {/* Donor */}
                          <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                            {row.donorName ?? '—'}
                          </td>
                          {/* Date */}
                          <td className="px-4 py-3 whitespace-nowrap text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}>
                            {new Date(row.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </td>
                          {/* Status badge */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3">
                            <Link href={`/organisation/books/${row._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:bg-[var(--color-bg-hover)]"
                              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t flex items-center justify-between gap-2"
                style={{ borderColor: 'var(--color-border)' }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 transition-all hover:bg-[var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  ← Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p); return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}>…</span>
                      ) : (
                        <button key={p} onClick={() => setPage(p as number)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all
                            ${page === p ? 'gradient-brand text-white' : 'hover:bg-[var(--color-bg-hover)]'}`}
                          style={page !== p ? { color: 'var(--color-text-secondary)' } : {}}>
                          {p}
                        </button>
                      )
                    )}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 transition-all hover:bg-[var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MainFooter />
    </div>
  );
}