'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, DollarSign, ShoppingBag, CheckCircle, XCircle,
  Clock, Eye, Search, Filter, ChevronLeft, ChevronRight,
  Loader2, X, AlertCircle, RefreshCw, BadgeCheck,
  Banknote, UserCheck, Building2, MapPin, Phone,
  Mail, Calendar, FileText, Image, Video, Plus,
  Trash2, Edit2, ToggleLeft, ToggleRight, ArrowLeft,
  CreditCard, Hash, User, Flag, Home, IdCard,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type AdminTab = 'registrations' | 'funding' | 'members' | 'pools';
type RegStatus  = 'pending' | 'approved' | 'rejected';
type FundStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface Registration {
  _id: string;
  name:          string;
  dateOfBirth:   string;
  age:           number;
  gender:        string;
  address:       string;
  district:      string;
  division:      string;
  region?:       string;
  phone:         string;
  nidOrPassport: string;
  fatherName:    string;
  motherName:    string;
  email?:        string;
  photo?:        { url: string; publicId: string };
  businessName:  string;
  category:      string;
  description:   string;
  problems?:     string;
  mediaLink?:    string;
  media?:        { url: string; publicId: string; mimeType: string };
  status:        RegStatus;
  adminNote?:    string;
  submittedAt:   string;
  reviewedAt?:   string;
}

interface FundingApp {
  _id:            string;
  name:           string;
  regId:          string;
  amount:         number;
  purpose:        string;
  repayPlan?:     string;
  pitchVideo?:    string;
  payment: {
    method:         string;
    senderNumber:   string;
    receiverNumber: string;
    transactionId:  string;
    fee:            number;
    verified:       boolean;
  };
  status:         FundStatus;
  approvedAmount?: number;
  adminNote?:     string;
  submittedAt:    string;
  reviewedAt?:    string;
}

interface Member {
  _id:      string;
  name:     string;
  role:     string;
  business: string;
  location: string;
  joinedAt: string;
  photo?:   { url: string };
  isActive: boolean;
}

interface FundPool {
  _id:         string;
  title:       string;
  description: string;
  maxAmount:   number;
  deadline:    string;
  status:      'active' | 'closed';
  image?:      { url: string };
}

// ─── API ─────────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

// ✅ FIX: Read token from '3zf-auth' key (same as axios interceptor)
function getToken(): string {
  try {
    if (typeof window === 'undefined') return '';
    // Try '3zf-auth' first (main auth store)
    const raw = localStorage.getItem('3zf-auth');
    if (raw) {
      const token = JSON.parse(raw)?.state?.accessToken;
      if (token) return token;
    }
    // Fallback to legacy 'adminToken'
    return localStorage.getItem('adminToken') ?? '';
  } catch {
    return '';
  }
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });

const fmtMoney = (n: number) => `৳${n?.toLocaleString('en-IN')}`;

const GENDER_LABELS: Record<string, string> = {
  male: 'পুরুষ', female: 'মহিলা', other: 'অন্যান্য',
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { label: string; cls: string }> = {
    pending:      { label: 'অপেক্ষমান',    cls: 'bg-amber-50 text-amber-700 border-amber-200'       },
    under_review: { label: 'পর্যালোচনায়', cls: 'bg-blue-50 text-blue-700 border-blue-200'           },
    approved:     { label: 'অনুমোদিত',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected:     { label: 'প্রত্যাখ্যাত', cls: 'bg-red-50 text-red-700 border-red-200'              },
    active:       { label: 'সক্রিয়',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    closed:       { label: 'বন্ধ',          cls: 'bg-slate-50 text-slate-600 border-slate-200'       },
  };
  const s = MAP[status] ?? { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: any; color: string;
}) {
  return (
    <div className="card flex items-center gap-4 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: color + '20' }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: {
  msg: string; type: 'success' | 'error'; onClose: () => void;
}) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl"
      style={{ background: type === 'success' ? '#0F4C35' : '#DC2626', color: '#fff', minWidth: 240 }}>
      {type === 'success'
        ? <CheckCircle className="h-5 w-5 shrink-0" />
        : <AlertCircle className="h-5 w-5 shrink-0" />}
      <span className="text-sm font-medium flex-1">{msg}</span>
      <button onClick={onClose}><X className="h-4 w-4 opacity-70 hover:opacity-100" /></button>
    </motion.div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 pt-16 pb-16"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className={`relative w-full rounded-2xl shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-xl'}`}
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-red-50 hover:text-red-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </div>
  );
}

// ─── Detail row ──────────────────────────────────────────────────────────────
function DetailRow({ label, value, mono }: { label: string; value?: string | number; mono?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 py-2 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      <span className="w-40 shrink-0 text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <span className={`text-sm flex-1 ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--color-text)' }}>
        {value}
      </span>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, pages, onChange }: {
  page: number; pages: number; onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-40"
        style={{ borderColor: 'var(--color-border)' }}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === page ? 'text-white' : ''}`}
          style={{
            borderColor: p === page ? '#0F4C35' : 'var(--color-border)',
            background:  p === page ? '#0F4C35' : 'transparent',
          }}>
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)} disabled={page >= pages}
        className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-40"
        style={{ borderColor: 'var(--color-border)' }}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Registrations
// ═══════════════════════════════════════════════════════════════════════════════
function RegistrationsTab({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [items, setItems]       = useState<Registration[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Registration | null>(null);
  const [acting, setActing]     = useState(false);
  const [note, setNote]         = useState('');
  const [filters, setFilters]   = useState({
    status: '', district: '', division: '', gender: '',
  });

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), limit: '15' });
      if (filters.status)   q.set('status',   filters.status);
      if (filters.district) q.set('district', filters.district);
      if (filters.division) q.set('division', filters.division);
      if (filters.gender)   q.set('gender',   filters.gender);

      const res = await api<any>(`/association/register?${q}`);
      // ✅ FIX: handle both array shapes safely
      setItems(Array.isArray(res.registrations) ? res.registrations : []);
      setTotal(res.total  ?? 0);
      setPage(res.page    ?? p);
      setPages(res.pages  ?? 1);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(1); }, [filters]);

  const act = async (status: RegStatus) => {
    if (!selected) return;
    setActing(true);
    try {
      await api(`/association/register/${selected._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNote: note.trim() || undefined }),
      });
      toast(
        status === 'approved' ? '✅ আবেদন অনুমোদিত হয়েছে।' : '❌ আবেদন প্রত্যাখ্যাত হয়েছে।',
        'success',
      );
      setSelected(null);
      setNote('');
      load(page);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card py-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-secondary)' }}>
            <Filter className="h-3.5 w-3.5" /> ফিল্টার
          </div>
          {[
            {
              key: 'status', label: 'স্ট্যাটাস',
              opts: [['', 'সব'], ['pending', 'অপেক্ষমান'], ['approved', 'অনুমোদিত'], ['rejected', 'প্রত্যাখ্যাত']],
            },
            {
              key: 'gender', label: 'লিঙ্গ',
              opts: [['', 'সব'], ['male', 'পুরুষ'], ['female', 'মহিলা'], ['other', 'অন্যান্য']],
            },
            {
              key: 'division', label: 'বিভাগ',
              opts: [['', 'সব'], ...['ঢাকা','চট্টগ্রাম','সিলেট','রাজশাহী','খুলনা','বরিশাল','রংপুর','ময়মনসিংহ'].map(d => [d, d])],
            },
          ].map(f => (
            <select
              key={f.key}
              value={(filters as any)[f.key]}
              onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
              {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <input
            value={filters.district}
            onChange={e => setFilters(p => ({ ...p, district: e.target.value }))}
            placeholder="জেলা লিখুন..."
            className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)',
              width: 140,
            }} />
          <button
            onClick={() => setFilters({ status: '', district: '', division: '', gender: '' })}
            className="ml-auto rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-red-50 hover:text-red-600"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            রিসেট
          </button>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            মোট: {total}
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
        </div>
      ) : items.length === 0 ? (
        <div
          className="card py-16 text-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}>
          কোনো আবেদন পাওয়া যায়নি।
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                  {['ছবি', 'নাম / ফোন', 'ব্যবসা', 'জেলা / বিভাগ', 'বয়স / লিঙ্গ', 'তারিখ', 'স্ট্যাটাস', ''].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => (
                  <tr
                    key={r._id}
                    className="border-b transition-colors hover:bg-[#E1F5EE]/20"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-secondary)/30',
                    }}>
                    <td className="px-4 py-3">
                      {r.photo?.url ? (
                        <img
                          src={r.photo.url}
                          alt={r.name}
                          className="h-9 w-9 rounded-full object-cover border-2 border-[#E1F5EE]" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0F4C35] font-bold text-sm">
                          {r.name?.charAt(0) ?? '?'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{r.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{r.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--color-text)' }}>{r.businessName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{r.category}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <p>{r.district}</p><p>{r.division}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <p>{r.age} বছর</p>
                      <p>{GENDER_LABELS[r.gender] ?? r.gender}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {fmtDate(r.submittedAt)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelected(r); setNote(r.adminNote ?? ''); }}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[#E1F5EE]"
                        style={{ color: '#0F4C35', border: '1px solid #5DCAA5' }}>
                        <Eye className="h-3.5 w-3.5" /> বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pages={pages} onChange={p => { setPage(p); load(p); }} />

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setNote(''); }}
        title="আবেদনের বিস্তারিত"
        wide>
        {selected && (
          <div className="space-y-5">
            {/* Photo + identity */}
            <div className="flex gap-4 items-start">
              {selected.photo?.url ? (
                <img
                  src={selected.photo.url}
                  alt={selected.name}
                  className="h-20 w-20 rounded-xl object-cover shrink-0 border-2"
                  style={{ borderColor: '#5DCAA5' }} />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-[#0F4C35] font-bold text-2xl shrink-0">
                  {selected.name?.charAt(0) ?? '?'}
                </div>
              )}
              <div className="flex-1">
                <p className="font-heading text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  {selected.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {selected.businessName} · {selected.category}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge status={selected.status} />
                  <span
                    className="text-xs rounded-full border px-2 py-0.5"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    জমার তারিখ: {fmtDate(selected.submittedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Two-column details */}
            <div
              className="grid grid-cols-2 gap-x-8 gap-y-0 rounded-xl border p-4"
              style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-2">
                  ব্যক্তিগত তথ্য
                </p>
                <DetailRow label="ফোন"          value={selected.phone} mono />
                <DetailRow label="ইমেইল"        value={selected.email} />
                <DetailRow label="জন্ম তারিখ"  value={`${fmtDate(selected.dateOfBirth)} (${selected.age} বছর)`} />
                <DetailRow label="লিঙ্গ"         value={GENDER_LABELS[selected.gender] ?? selected.gender} />
                <DetailRow label="NID/পাসপোর্ট" value={selected.nidOrPassport} mono />
                <DetailRow label="পিতার নাম"    value={selected.fatherName} />
                <DetailRow label="মাতার নাম"    value={selected.motherName} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-2">
                  ঠিকানা ও ব্যবসা
                </p>
                <DetailRow label="বিভাগ"        value={selected.division} />
                <DetailRow label="জেলা"         value={selected.district} />
                <DetailRow label="উপজেলা"       value={selected.region} />
                <DetailRow label="ঠিকানা"       value={selected.address} />
                <DetailRow label="ব্যবসার নাম"  value={selected.businessName} />
                <DetailRow label="ক্যাটাগরি"    value={selected.category} />
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75]">
                ব্যবসার বিবরণ
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {selected.description}
              </p>
              {selected.problems && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mt-2">
                    সমস্যাসমূহ
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {selected.problems}
                  </p>
                </>
              )}
            </div>

            {/* Media */}
            {(selected.media?.url || selected.mediaLink) && (
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-3">
                  পণ্যের মিডিয়া
                </p>
                {selected.media?.url && (
                  selected.media.mimeType?.startsWith('video')
                    ? <video src={selected.media.url} controls className="w-full rounded-lg max-h-48" />
                    : <img src={selected.media.url} alt="media" className="w-full rounded-lg max-h-48 object-cover" />
                )}
                {selected.mediaLink && (
                  <a
                    href={selected.mediaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-1 text-sm text-[#1D9E75] hover:underline">
                    <FileText className="h-4 w-4" /> {selected.mediaLink}
                  </a>
                )}
              </div>
            )}

            {/* Admin action */}
            {selected.status === 'pending' && (
              <div className="rounded-xl border-2 border-dashed border-[#1D9E75]/40 p-4 space-y-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  অ্যাডমিন সিদ্ধান্ত
                </p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  placeholder="অ্যাডমিন নোট (ঐচ্ছিক)..."
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30 resize-none"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text)',
                  }} />
                <div className="flex gap-3">
                  <button
                    onClick={() => act('approved')}
                    disabled={acting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                    style={{ background: '#0F4C35' }}>
                    {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    অনুমোদন করুন
                  </button>
                  <button
                    onClick={() => act('rejected')}
                    disabled={acting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    style={{ borderColor: '#FCA5A5' }}>
                    {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    প্রত্যাখ্যান করুন
                  </button>
                </div>
              </div>
            )}

            {selected.status !== 'pending' && selected.adminNote && (
              <div
                className="rounded-xl border p-3"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-1">
                  অ্যাডমিন নোট
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{selected.adminNote}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Funding Applications
// ═══════════════════════════════════════════════════════════════════════════════
function FundingTab({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [items, setItems]          = useState<FundingApp[]>([]);
  const [total, setTotal]          = useState(0);
  const [page, setPage]            = useState(1);
  const [pages, setPages]          = useState(1);
  const [loading, setLoading]      = useState(true);
  const [selected, setSelected]    = useState<FundingApp | null>(null);
  const [acting, setActing]        = useState(false);
  const [note, setNote]            = useState('');
  const [approvedAmt, setApproved] = useState('');
  const [statusFilter, setFilter]  = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), limit: '15' });
      if (statusFilter) q.set('status', statusFilter);
      const res = await api<any>(`/association/funding-apply?${q}`);
      // ✅ FIX: safely handle response shape
      setItems(Array.isArray(res.applications) ? res.applications : []);
      setTotal(res.total  ?? 0);
      setPage(res.page    ?? p);
      setPages(res.pages  ?? 1);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(1); }, [statusFilter]);

  const act = async (status?: FundStatus, paymentVerified?: boolean) => {
    if (!selected) return;
    setActing(true);
    try {
      const body: Record<string, any> = { adminNote: note.trim() || undefined };
      if (status !== undefined)          body.status = status;
      if (paymentVerified !== undefined) body.paymentVerified = paymentVerified;
      if (approvedAmt)                   body.approvedAmount = Number(approvedAmt);

      await api(`/association/funding-apply/${selected._id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      toast('✅ আপডেট সফল হয়েছে।', 'success');
      setSelected(null);
      setNote('');
      setApproved('');
      load(page);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setActing(false);
    }
  };

  const PAY_METHOD_COLORS: Record<string, string> = {
    bkash: '#E2136E', nagad: '#EF5F20', rocket: '#8F16B2',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card py-3 flex flex-wrap gap-3 items-center">
        <div
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-text-secondary)' }}>
          <Filter className="h-3.5 w-3.5" /> স্ট্যাটাস
        </div>
        <select
          value={statusFilter}
          onChange={e => setFilter(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>
          <option value="">সব</option>
          <option value="pending">অপেক্ষমান</option>
          <option value="under_review">পর্যালোচনায়</option>
          <option value="approved">অনুমোদিত</option>
          <option value="rejected">প্রত্যাখ্যাত</option>
        </select>
        <span className="ml-auto text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          মোট: {total}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
        </div>
      ) : items.length === 0 ? (
        <div className="card py-16 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          কোনো আবেদন পাওয়া যায়নি।
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                  {['নাম / রেজি আইডি', 'পরিমাণ', 'পেমেন্ট', 'পরিশোধ পরিকল্পনা', 'তারিখ', 'স্ট্যাটাস', ''].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr
                    key={f._id}
                    className="border-b transition-colors hover:bg-[#E1F5EE]/20"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{f.name}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        {f.regId}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1D9E75]">{fmtMoney(f.amount)}</p>
                      {f.approvedAmount != null && (
                        <p className="text-xs text-emerald-600">
                          অনুমোদিত: {fmtMoney(f.approvedAmount)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {/* ✅ FIX: safe access with optional chaining */}
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                        style={{
                          background: (PAY_METHOD_COLORS[f.payment?.method] ?? '#888') + '18',
                          color: PAY_METHOD_COLORS[f.payment?.method] ?? '#888',
                        }}>
                        {f.payment?.method?.toUpperCase() ?? '—'}
                      </span>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: f.payment?.verified ? '#059669' : '#D97706' }}>
                        {f.payment?.verified ? '✅ যাচাই হয়েছে' : '⏳ যাচাই বাকি'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {f.repayPlan ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {fmtDate(f.submittedAt)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelected(f);
                          setNote(f.adminNote ?? '');
                          setApproved(String(f.approvedAmount ?? ''));
                        }}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[#E1F5EE]"
                        style={{ color: '#0F4C35', border: '1px solid #5DCAA5' }}>
                        <Eye className="h-3.5 w-3.5" /> বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination page={page} pages={pages} onChange={p => { setPage(p); load(p); }} />

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setNote(''); setApproved(''); }}
        title="ফান্ডিং আবেদনের বিস্তারিত"
        wide>
        {selected && (
          <div className="space-y-4">
            <div
              className="grid grid-cols-2 gap-x-8 rounded-xl border p-4"
              style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-2">
                  আবেদনকারী
                </p>
                <DetailRow label="নাম"               value={selected.name} />
                <DetailRow label="নিবন্ধন আইডি"     value={selected.regId} mono />
                <DetailRow label="চাহিত পরিমাণ"     value={fmtMoney(selected.amount)} />
                <DetailRow label="পরিশোধ পরিকল্পনা" value={selected.repayPlan ?? '—'} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-2">
                  পেমেন্ট তথ্য
                </p>
                {/* ✅ FIX: safe optional chaining throughout */}
                <DetailRow label="পদ্ধতি"         value={selected.payment?.method?.toUpperCase()} />
                <DetailRow label="প্রেরক নম্বর"   value={selected.payment?.senderNumber} mono />
                <DetailRow label="প্রাপক নম্বর"   value={selected.payment?.receiverNumber} mono />
                <DetailRow label="Transaction ID" value={selected.payment?.transactionId} mono />
                <DetailRow label="ফি"             value={selected.payment?.fee != null ? fmtMoney(selected.payment.fee) : undefined} />
                <DetailRow label="যাচাই"          value={selected.payment?.verified ? '✅ সম্পন্ন' : '⏳ বাকি'} />
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-2">উদ্দেশ্য</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {selected.purpose}
              </p>
              {selected.pitchVideo && (
                <a
                  href={selected.pitchVideo}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-1 text-sm text-[#1D9E75] hover:underline">
                  <Video className="h-4 w-4" /> পিচ ভিডিও দেখুন
                </a>
              )}
            </div>

            {/* Admin actions */}
            <div className="rounded-xl border-2 border-dashed border-[#1D9E75]/40 p-4 space-y-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                অ্যাডমিন সিদ্ধান্ত
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    অনুমোদিত পরিমাণ
                  </label>
                  <input
                    value={approvedAmt}
                    onChange={e => setApproved(e.target.value)}
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text)',
                    }}
                    placeholder="যেমন: ৩০০০০" />
                </div>
                <div>
                  <label
                    className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    অ্যাডমিন নোট
                  </label>
                  <input
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text)',
                    }}
                    placeholder="নোট..." />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!selected.payment?.verified && (
                  <button
                    onClick={() => act(undefined, true)}
                    disabled={acting}
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: '#059669' }}>
                    <BadgeCheck className="h-4 w-4" /> পেমেন্ট যাচাই করুন
                  </button>
                )}
                <button
                  onClick={() => act('under_review')}
                  disabled={acting}
                  className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-blue-50 disabled:opacity-60"
                  style={{ borderColor: '#93C5FD', color: '#1D4ED8' }}>
                  <Clock className="h-4 w-4" /> পর্যালোচনায় নিন
                </button>
                <button
                  onClick={() => act('approved')}
                  disabled={acting}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#0F4C35' }}>
                  {acting
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle className="h-4 w-4" />}
                  অনুমোদন করুন
                </button>
                <button
                  onClick={() => act('rejected')}
                  disabled={acting}
                  className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  style={{ borderColor: '#FCA5A5' }}>
                  <XCircle className="h-4 w-4" /> প্রত্যাখ্যান করুন
                </button>
              </div>
            </div>

            {selected.adminNote && (
              <div
                className="rounded-xl border p-3"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1D9E75] mb-1">
                  বিদ্যমান অ্যাডমিন নোট
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{selected.adminNote}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Members
// ═══════════════════════════════════════════════════════════════════════════════
function MembersTab({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [items, setItems]     = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [acting, setActing]   = useState(false);
  const [form, setForm]       = useState({ name: '', role: '', business: '', location: '' });
  const [photo, setPhoto]     = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api<any>('/association/members');
      // ✅ FIX: handle both active and inactive (admin sees all)
      setItems(Array.isArray(res.members) ? res.members : []);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', role: '', business: '', location: '' });
    setPhoto(null);
    setModal(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role, business: m.business, location: m.location });
    setPhoto(null);
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast('নাম ও ভূমিকা আবশ্যক।', 'error');
      return;
    }
    setActing(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      const token  = getToken(); // ✅ FIX: use same getToken()
      const url    = editing ? `/association/members/${editing._id}` : '/association/members';
      const method = editing ? 'PUT' : 'POST';

      const res  = await fetch(`${API}${url}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast(editing ? '✅ সদস্য আপডেট হয়েছে।' : '✅ সদস্য যুক্ত হয়েছে।', 'success');
      setModal(false);
      load();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setActing(false);
    }
  };

  const softDelete = async (id: string) => {
    if (!confirm('সদস্যকে নিষ্ক্রিয় করবেন?')) return;
    try {
      await api(`/association/members/${id}`, { method: 'DELETE' });
      toast('সদস্য নিষ্ক্রিয় হয়েছে।', 'success');
      load();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#0F4C35' }}>
          <Plus className="h-4 w-4" /> নতুন সদস্য
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
        </div>
      ) : items.length === 0 ? (
        <div className="card py-16 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          কোনো সদস্য পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map(m => (
            <div
              key={m._id}
              className="card flex flex-col items-center text-center py-5 gap-3 relative">
              {!m.isActive && (
                <span
                  className="absolute top-2 right-2 text-[10px] rounded-full border px-2 py-0.5 font-semibold"
                  style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#DC2626' }}>
                  নিষ্ক্রিয়
                </span>
              )}
              {m.photo?.url ? (
                <img
                  src={m.photo.url}
                  alt={m.name}
                  className="h-16 w-16 rounded-full object-cover border-2"
                  style={{ borderColor: '#5DCAA5' }} />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0F4C35] font-bold text-xl">
                  {m.name?.charAt(0) ?? '?'}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{m.name}</p>
                <p className="text-xs font-semibold text-[#0F6E56]">{m.role}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{m.business}</p>
                <p
                  className="text-xs flex items-center gap-1 justify-center mt-1"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin className="h-3 w-3" />{m.location}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(m)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors hover:bg-[#E1F5EE]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                  <Edit2 className="h-3 w-3" /> এডিট
                </button>
                {m.isActive && (
                  <button
                    onClick={() => softDelete(m._id)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border text-red-600 hover:bg-red-50 transition-colors"
                    style={{ borderColor: '#FCA5A5' }}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title={editing ? 'সদস্য এডিট করুন' : 'নতুন সদস্য যুক্ত করুন'}>
        <div className="space-y-4">
          {[
            { k: 'name',     label: 'নাম',         ph: 'সদস্যের পূর্ণ নাম',    req: true  },
            { k: 'role',     label: 'ভূমিকা',      ph: 'যেমন: মেন্টর, সভাপতি', req: true  },
            { k: 'business', label: 'ব্যবসার নাম', ph: 'যেমন: গ্রিন ফার্ম',     req: false },
            { k: 'location', label: 'অবস্থান',     ph: 'যেমন: সিলেট',           req: false },
          ].map(f => (
            <div key={f.k}>
              <label
                className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
                style={{ color: 'var(--color-text-secondary)' }}>
                {f.label}{f.req && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input
                value={(form as any)[f.k]}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                placeholder={f.ph}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                }} />
            </div>
          ))}
          <div>
            <label
              className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
              style={{ color: 'var(--color-text-secondary)' }}>
              ছবি (ঐচ্ছিক)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setPhoto(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
              style={{ color: 'var(--color-text)' }} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModal(false)}
              className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-[#E1F5EE]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              বাতিল
            </button>
            <button
              onClick={save}
              disabled={acting}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: '#0F4C35' }}>
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {editing ? 'আপডেট করুন' : 'যুক্ত করুন'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Funding Pools
// ═══════════════════════════════════════════════════════════════════════════════
function PoolsTab({ toast }: { toast: (m: string, t: 'success' | 'error') => void }) {
  const [items, setItems]     = useState<FundPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState<FundPool | null>(null);
  const [acting, setActing]   = useState(false);
  const [form, setForm]       = useState({
    title: '', description: '', maxAmount: '', deadline: '', status: 'active' as 'active' | 'closed',
  });

  const load = async () => {
    setLoading(true);
    try {
      // ✅ FIX: use /funding/all so admin sees both active + closed pools
      // If your backend doesn't have /funding/all yet, fall back to /funding
      let res: any;
      try {
        res = await api<any>('/association/funding/all');
      } catch {
        // fallback: the public endpoint only returns active ones
        res = await api<any>('/association/funding');
      }
      setItems(Array.isArray(res.funding) ? res.funding : []);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', maxAmount: '', deadline: '', status: 'active' });
    setModal(true);
  };

  const openEdit = (p: FundPool) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      maxAmount: String(p.maxAmount),
      deadline: p.deadline ? p.deadline.split('T')[0] : '',
      status: p.status,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.maxAmount) {
      toast('শিরোনাম ও সর্বোচ্চ পরিমাণ আবশ্যক।', 'error');
      return;
    }
    setActing(true);
    try {
      const body = { ...form, maxAmount: Number(form.maxAmount) };
      if (editing) {
        await api(`/association/funding/${editing._id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        toast('✅ ফান্ডিং পুল আপডেট হয়েছে।', 'success');
      } else {
        await api('/association/funding', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        toast('✅ নতুন ফান্ডিং পুল তৈরি হয়েছে।', 'success');
      }
      setModal(false);
      load();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setActing(false);
    }
  };

  const toggle = async (pool: FundPool) => {
    try {
      await api(`/association/funding/${pool._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: pool.status === 'active' ? 'closed' : 'active' }),
      });
      toast('স্ট্যাটাস আপডেট হয়েছে।', 'success');
      load();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: '#0F4C35' }}>
          <Plus className="h-4 w-4" /> নতুন ফান্ডিং পুল
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D9E75]" />
        </div>
      ) : items.length === 0 ? (
        <div className="card py-16 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          কোনো ফান্ডিং পুল নেই।
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map(pool => (
            <div key={pool._id} className="card flex gap-4">
              {pool.image?.url && (
                <img
                  src={pool.image.url}
                  alt={pool.title}
                  className="h-16 w-16 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{pool.title}</p>
                  <StatusBadge status={pool.status} />
                </div>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  {pool.description}
                </p>
                <div
                  className="flex items-center gap-3 mt-2 text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="font-semibold text-[#1D9E75]">
                    সর্বোচ্চ {fmtMoney(pool.maxAmount)}
                  </span>
                  {pool.deadline && <span>শেষ: {fmtDate(pool.deadline)}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(pool)}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors hover:bg-[#E1F5EE]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                    <Edit2 className="h-3 w-3" /> এডিট
                  </button>
                  <button
                    onClick={() => toggle(pool)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                      pool.status === 'active'
                        ? 'hover:bg-amber-50 text-amber-600 border-amber-200'
                        : 'hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                    {pool.status === 'active'
                      ? <ToggleRight className="h-3.5 w-3.5" />
                      : <ToggleLeft  className="h-3.5 w-3.5" />}
                    {pool.status === 'active' ? 'বন্ধ করুন' : 'সক্রিয় করুন'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title={editing ? 'ফান্ডিং পুল এডিট' : 'নতুন ফান্ডিং পুল'}>
        <div className="space-y-4">
          {[
            { k: 'title',       label: 'শিরোনাম',            ph: 'যেমন: Q3 ২০২৫ ফান্ড', req: true,  type: 'text'   },
            { k: 'description', label: 'বিবরণ',               ph: 'ফান্ডের বিবরণ লিখুন',  req: false, type: 'text'   },
            { k: 'maxAmount',   label: 'সর্বোচ্চ পরিমাণ (৳)', ph: '৫০০০০',                req: true,  type: 'number' },
            { k: 'deadline',    label: 'শেষ তারিখ',           ph: '',                       req: false, type: 'date'   },
          ].map(f => (
            <div key={f.k}>
              <label
                className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
                style={{ color: 'var(--color-text-secondary)' }}>
                {f.label}{f.req && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input
                value={(form as any)[f.k]}
                type={f.type}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                placeholder={f.ph}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                }} />
            </div>
          ))}
          <div>
            <label
              className="text-[11px] font-semibold uppercase tracking-wider mb-1 block"
              style={{ color: 'var(--color-text-secondary)' }}>
              স্ট্যাটাস
            </label>
            <select
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)',
              }}>
              <option value="active">সক্রিয়</option>
              <option value="closed">বন্ধ</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModal(false)}
              className="rounded-lg border px-4 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              বাতিল
            </button>
            <button
              onClick={save}
              disabled={acting}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: '#0F4C35' }}>
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {editing ? 'আপডেট' : 'তৈরি করুন'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AssociationAdminPage() {
  const [tab, setTab]      = useState<AdminTab>('registrations');
  const [toast, setToastQ] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [stats, setStats]  = useState({
    totalRegs: 0, pendingRegs: 0, totalFunding: 0, pendingFunding: 0,
  });

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error') => setToastQ({ msg, type }),
    [],
  );

  useEffect(() => {
    Promise.allSettled([
      api<any>('/association/register?limit=1'),
      api<any>('/association/register?limit=1&status=pending'),
      api<any>('/association/funding-apply?limit=1'),
      api<any>('/association/funding-apply?limit=1&status=pending'),
    ]).then(([r, p, f, fp]) => {
      setStats({
        totalRegs:      r.status  === 'fulfilled' ? (r.value.total  ?? 0) : 0,
        pendingRegs:    p.status  === 'fulfilled' ? (p.value.total  ?? 0) : 0,
        totalFunding:   f.status  === 'fulfilled' ? (f.value.total  ?? 0) : 0,
        pendingFunding: fp.status === 'fulfilled' ? (fp.value.total ?? 0) : 0,
      });
    });
  }, []);

  const TABS: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'registrations', label: 'নিবন্ধন আবেদন', icon: UserCheck  },
    { id: 'funding',       label: 'ফান্ডিং আবেদন', icon: Banknote   },
    { id: 'members',       label: 'সদস্যবৃন্দ',     icon: Users      },
    { id: 'pools',         label: 'ফান্ডিং পুল',    icon: DollarSign },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="pt-[var(--navbar-height)]">

        {/* Header */}
        <div className="px-4 py-8" style={{ background: '#0F4C35' }}>
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9FE1CB] mb-1">
              অ্যাডমিন প্যানেল
            </p>
            <h1 className="font-heading text-2xl font-bold text-white">
              Harmony Entrepreneur Association
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Users}       label="মোট নিবন্ধন"        value={stats.totalRegs}      color="#1D9E75" />
            <StatCard icon={Clock}       label="অপেক্ষমান নিবন্ধন"  value={stats.pendingRegs}    color="#D97706" />
            <StatCard icon={Banknote}    label="মোট ফান্ডিং আবেদন"  value={stats.totalFunding}   color="#2563EB" />
            <StatCard icon={AlertCircle} label="অপেক্ষমান ফান্ডিং"  value={stats.pendingFunding} color="#DC2626" />
          </div>

          {/* Tab nav */}
          <div
            className="flex overflow-x-auto border-b"
            style={{ borderColor: 'var(--color-border)' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors
                  ${tab === t.id ? 'border-[#0F4C35] text-[#0F4C35]' : 'border-transparent'}`}
                style={{ color: tab === t.id ? undefined : 'var(--color-text-secondary)' }}>
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}>
              {tab === 'registrations' && <RegistrationsTab toast={showToast} />}
              {tab === 'funding'       && <FundingTab       toast={showToast} />}
              {tab === 'members'       && <MembersTab       toast={showToast} />}
              {tab === 'pools'         && <PoolsTab         toast={showToast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast msg={toast.msg} type={toast.type} onClose={() => setToastQ(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}