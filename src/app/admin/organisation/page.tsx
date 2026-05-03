'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Member {
  _id: string;
  name: string;
  fatherName?: string;
  phone?: string;
  district?: string;
  religion?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  presentAddress?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentAmount?: number;
  profilePhoto?: { url: string };
  nidDocument?: { url: string };
}

interface HelpPost {
  _id: string;
  title: string;
  type: string;
  description: string;
  createdAt?: string;
  author?: { name: string; email?: string; avatar?: string };
  media?: { url: string; type?: string }[];
}

interface Donation {
  _id: string;
  donorName?: string;
  donor?: { name?: string; phone?: string };
  amount?: number;
  paymentMethod?: string;
  transactionId?: string;
  purpose?: string;
  status: 'pending' | 'verifying' | 'completed' | 'failed';
  createdAt?: string;
}

type TabId = 'members' | 'helpPosts' | 'donations';
type StatusVariant = 'green' | 'orange' | 'red' | 'gray';

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
function IBuilding({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
function IHeart({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IGift({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}
function ICheck() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IEye() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IChevLeft() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IChevRight() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IClock() {
  return (
    <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}
      style={{ margin: '0 auto 10px', opacity: .3, display: 'block' }}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────
function Avatar({ name, url, size = 'md' }: { name?: string; url?: string; size?: 'sm' | 'md' }) {
  const [err, setErr] = useState(false);
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const init = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className={`${sz} rounded-full shrink-0 overflow-hidden bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center font-semibold text-orange-700 dark:text-orange-400 select-none`}>
      {url && !err
        ? <img src={url} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} />
        : init}
    </div>
  );
}

const VARIANT_CLS: Record<StatusVariant, string> = {
  green:  'bg-green-100  dark:bg-green-900/25  text-green-800  dark:text-green-300',
  orange: 'bg-orange-100 dark:bg-orange-900/25 text-orange-800 dark:text-orange-300',
  red:    'bg-red-100    dark:bg-red-900/25    text-red-800    dark:text-red-300',
  gray:   'bg-gray-100   dark:bg-gray-800      text-gray-600   dark:text-gray-400',
};

function Badge({ label, variant = 'gray' }: { label: string; variant?: StatusVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${VARIANT_CLS[variant]}`}>
      {label}
    </span>
  );
}

function statusVariant(s: string): StatusVariant {
  if (['completed', 'approved'].includes(s)) return 'green';
  if (['verifying', 'pending'].includes(s))  return 'orange';
  if (['failed', 'rejected'].includes(s))    return 'red';
  return 'gray';
}

function Th({ children, cls = '' }: { children: React.ReactNode; cls?: string }) {
  return (
    <th className={`text-left px-4 py-3 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap ${cls}`}>
      {children}
    </th>
  );
}

function Td({ children, cls = '' }: { children: React.ReactNode; cls?: string }) {
  return <td className={`px-4 py-3 align-middle text-sm ${cls}`}>{children}</td>;
}

function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16 text-center text-gray-400 dark:text-gray-600">
        <IClock />
        <p className="text-sm">{label}</p>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────
function SkeletonRows({ cols, rows }: { cols: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-full" />
              {c === 0 && <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mt-1.5" />}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function PostSkeletonItem() {
  return (
    <div className="p-5 border-b border-gray-100 dark:border-gray-800 animate-pulse last:border-0">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
          <div className="flex gap-2 pt-1">
            {[1, 2, 3].map(i => <div key={i} className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Image Lightbox
// ─────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
      >
        <IClose size={20} />
      </button>

      {/* counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
          {idx + 1} / {images.length}
        </div>
      )}

      {/* prev */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-3 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          <IChevLeft />
        </button>
      )}

      {/* main image */}
      <img
        key={idx}
        src={images[idx]}
        alt=""
        onClick={e => e.stopPropagation()}
        className="max-w-full max-h-[82vh] rounded-2xl object-contain select-none"
      />

      {/* next */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-3 text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          <IChevRight />
        </button>
      )}

      {/* strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i); }}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition ${i === idx ? 'border-white' : 'border-transparent opacity-40 hover:opacity-70'}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Media thumbnail grid
// ─────────────────────────────────────────────────────────────
function MediaGrid({ media }: { media: { url: string }[] }) {
  const [lb, setLb] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });
  const urls = media.map(m => m.url);
  if (!urls.length) return null;

  return (
    <>
      <div className="flex gap-2 flex-wrap mt-2.5">
        {urls.slice(0, 5).map((url, i) => (
          <button
            key={i}
            onClick={() => setLb({ open: true, idx: i })}
            className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-orange-400 shrink-0"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 4 && urls.length > 5 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-semibold">
                +{urls.length - 5}
              </div>
            )}
          </button>
        ))}
      </div>
      {lb.open && <Lightbox images={urls} startIndex={lb.idx} onClose={() => setLb({ open: false, idx: 0 })} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Reject Modal
// ─────────────────────────────────────────────────────────────
function RejectModal({
  title, subtitle, loading, onConfirm, onCancel,
}: {
  title: string; subtitle: string; loading?: boolean;
  onConfirm: (note: string) => void; onCancel: () => void;
}) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">"{subtitle}"</p>
        </div>
        <div className="p-5">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Reason for rejection
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Explain why this is being rejected…"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>
        <div className="px-5 pb-5 flex gap-2.5">
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 active:scale-[.98] text-white transition disabled:opacity-50"
          >
            {loading ? 'Rejecting…' : 'Confirm rejection'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[.98] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Action buttons pair
// ─────────────────────────────────────────────────────────────
function ActionPair({
  onApprove, onReject, approveLabel = 'Approve', rejectLabel = 'Reject', loading,
}: {
  onApprove: () => void; onReject: () => void;
  approveLabel?: string; rejectLabel?: string; loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <button
        onClick={onApprove} disabled={loading}
        className="flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-green-100 dark:bg-green-900/25 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40 active:scale-[.97] transition disabled:opacity-40 whitespace-nowrap"
      >
        <ICheck /> {approveLabel}
      </button>
      <button
        onClick={onReject} disabled={loading}
        className="flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 dark:bg-red-900/25 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 active:scale-[.97] transition disabled:opacity-40 whitespace-nowrap"
      >
        <IClose size={13} /> {rejectLabel}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Card wrapper
// ─────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {children}
    </div>
  );
}

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-semibold text-sm text-gray-900 dark:text-white">{title}</h2>
      <div className="flex flex-wrap gap-1.5">{right}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Members Tab
// ─────────────────────────────────────────────────────────────
function MembersTab() {
  const qc = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<Member | null>(null);
  const [nidUrl, setNidUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ members: Member[] }>({
    queryKey: ['admin-org-members'],
    queryFn: () => api.get('/org/pending').then(r => r.data),
    staleTime: 30_000,
  });

  const mutate = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote: string }) =>
      api.patch(`/org/approve/${id}`, { status, adminNote }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin-org-members'] });
      toast.success(v.status === 'approved' ? 'Member approved ✓' : 'Member rejected');
      setRejectTarget(null);
    },
    onError: () => toast.error('Action failed — please try again'),
  });

  const members = data?.members ?? [];
  const COLS = 13;

  return (
    <>
      <Card>
        <CardHeader
          title="Pending member applications"
          right={!isLoading && <Badge label={`${members.length} pending`} variant="orange" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr>
               
                <Th>Name &amp; contact</Th>
                <Th>Father's name</Th>
                <Th>District</Th>
                <Th>Religion</Th>
                <Th>Date of birth</Th>
                <Th>Birth place</Th>
                <Th>Payment</Th>
                <Th>Amount</Th>
                <Th>Trx ID</Th>
                <Th>NID doc</Th>
                <Th>Address</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading
                ? <SkeletonRows cols={COLS} rows={3} />
                : members.length === 0
                  ? <EmptyRow cols={COLS} label="No pending applications" />
                  : members.map(m => (
                    <tr key={m._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/25 transition-colors">
                      <Td>
                        <Avatar name={m.name} url={m.profilePhoto?.url} size="sm" />
                      </Td>
                      <Td>
                        <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">{m.name}</p>
                        {m.phone && <p className="text-xs text-gray-400 mt-0.5">{m.phone}</p>}
                      </Td>
                      <Td cls="text-gray-700 dark:text-gray-300 whitespace-nowrap">{m.fatherName || '—'}</Td>
                      <Td cls="text-gray-700 dark:text-gray-300">{m.district || '—'}</Td>
                      <Td cls="text-gray-600 dark:text-gray-400">{m.religion || '—'}</Td>
                      <Td cls="text-gray-500 whitespace-nowrap">
                        {m.dateOfBirth ? format(new Date(m.dateOfBirth), 'd MMM yyyy') : '—'}
                      </Td>
                      <Td cls="text-gray-500 whitespace-nowrap">{m.birthPlace || '—'}</Td>
                      <Td>
                        {m.paymentMethod
                          ? <Badge label={m.paymentMethod.toUpperCase()} variant="orange" />
                          : <span className="text-gray-400">—</span>}
                      </Td>
                      <Td>
                        <span className="font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                          {m.paymentAmount != null ? `৳${m.paymentAmount.toLocaleString()}` : '—'}
                        </span>
                      </Td>
                      <Td>
                        {m.transactionId
                          ? <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{m.transactionId}</span>
                          : <span className="text-gray-400">—</span>}
                      </Td>
                      <Td>
                        {m.nidDocument?.url
                          ? (
                            <button
                              onClick={() => setNidUrl(m.nidDocument!.url)}
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                            >
                              <IEye /> View NID
                            </button>
                          )
                          : <span className="text-gray-400">—</span>}
                      </Td>
                      <Td cls="max-w-[160px]">
                        <p className="text-xs text-gray-500 truncate">{m.presentAddress || '—'}</p>
                      </Td>
                      <Td>
                        <ActionPair
                          loading={mutate.isPending}
                          onApprove={() => mutate.mutate({ id: m._id, status: 'approved', adminNote: '' })}
                          onReject={() => setRejectTarget(m)}
                        />
                      </Td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {nidUrl && <Lightbox images={[nidUrl]} startIndex={0} onClose={() => setNidUrl(null)} />}

      {rejectTarget && (
        <RejectModal
          title="Reject member application"
          subtitle={rejectTarget.name}
          loading={mutate.isPending}
          onConfirm={note => mutate.mutate({ id: rejectTarget._id, status: 'rejected', adminNote: note })}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Help Posts Tab
// ─────────────────────────────────────────────────────────────
function HelpPostsTab() {
  const [rejectTarget, setRejectTarget] = useState<HelpPost | null>(null);

  const { data, refetch, isLoading } = useQuery<{ posts: HelpPost[] }>({
    queryKey: ['admin-help-posts'],
    queryFn: () => api.get('/org/help-posts/pending').then(r => r.data),
    staleTime: 30_000,
  });

  const mutate = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote: string }) =>
      api.patch(`/org/help-posts/${id}/approve`, { status, adminNote }),
    onSuccess: (_, v) => {
      refetch();
      toast.success(v.status === 'approved' ? 'Post approved & members notified ✓' : 'Post rejected');
      setRejectTarget(null);
    },
    onError: () => toast.error('Action failed — please try again'),
  });

  const posts = data?.posts ?? [];

  return (
    <>
      <Card>
        <CardHeader
          title="Pending help posts"
          right={!isLoading && <Badge label={`${posts.length} pending`} variant="orange" />}
        />

        {isLoading
          ? <>{[1, 2].map(i => <PostSkeletonItem key={i} />)}</>
          : posts.length === 0
            ? (
              <div className="py-16 text-center text-gray-400 dark:text-gray-600">
                <IClock />
                <p className="text-sm">No pending help posts</p>
              </div>
            )
            : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {posts.map(post => (
                  <div
                    key={post._id}
                    className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* avatar */}
                      <Avatar name={post.author?.name} url={post.author?.avatar} size="sm" />

                      {/* content */}
                      <div className="flex-1 min-w-0">
                        {/* title + type */}
                        <div className="flex items-start flex-wrap gap-2 mb-1.5">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                            {post.title}
                          </p>
                          <Badge label={post.type} variant="orange" />
                        </div>

                        {/* description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-2">
                          {post.description}
                        </p>

                        {/* meta */}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                          {post.author?.name && (
                            <span>
                              By{' '}
                              <span className="text-gray-600 dark:text-gray-300 font-medium">
                                {post.author.name}
                              </span>
                            </span>
                          )}
                          {post.author?.email && <span>{post.author.email}</span>}
                          {post.createdAt && (
                            <span>{format(new Date(post.createdAt), 'd MMM yyyy, h:mm a')}</span>
                          )}
                        </div>

                        {/* media */}
                        {post.media && post.media.length > 0 && (
                          <MediaGrid media={post.media} />
                        )}
                      </div>

                      {/* actions */}
                      <div className="shrink-0 mt-0.5">
                        <ActionPair
                          loading={mutate.isPending}
                          approveLabel="Approve & notify"
                          rejectLabel="Reject"
                          onApprove={() => mutate.mutate({ id: post._id, status: 'approved', adminNote: '' })}
                          onReject={() => setRejectTarget(post)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </Card>

      {rejectTarget && (
        <RejectModal
          title="Reject help post"
          subtitle={rejectTarget.title}
          loading={mutate.isPending}
          onConfirm={note => mutate.mutate({ id: rejectTarget._id, status: 'rejected', adminNote: note })}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Donations Tab
// ─────────────────────────────────────────────────────────────
function DonationsTab() {
  const qc = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<Donation | null>(null);

  const { data, isLoading } = useQuery<{ donations: Donation[] }>({
    queryKey: ['admin-org-donations'],
    queryFn: () => api.get('/org/donations').then(r => r.data),
    staleTime: 30_000,
  });

  const mutate = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status: string; adminNote: string }) =>
      api.patch(`/org/donations/${id}/verify`, { status, adminNote }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['admin-org-donations'] });
      toast.success(v.status === 'completed' ? 'Donation confirmed ✓' : 'Donation rejected');
      setRejectTarget(null);
    },
    onError: () => toast.error('Action failed — please try again'),
  });

  const donations = data?.donations ?? [];

  // status summary counts
  const counts = donations.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // total amounts per status
  const totalVerifying = donations
    .filter(d => d.status === 'verifying' || d.status === 'pending')
    .reduce((s, d) => s + (d.amount ?? 0), 0);

  const COLS = 8;

  return (
    <>
      {/* Summary strip */}
      {!isLoading && donations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
          {([
            { label: 'Pending review', val: `৳${totalVerifying.toLocaleString()}`, variant: 'orange' as StatusVariant },
            { label: 'Completed',  val: counts['completed']  ?? 0, variant: 'green' as StatusVariant },
            { label: 'Verifying',  val: counts['verifying']  ?? 0, variant: 'orange' as StatusVariant },
            { label: 'Failed',     val: counts['failed']     ?? 0, variant: 'red' as StatusVariant },
          ]).map(({ label, val, variant }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-lg font-semibold mt-0.5 ${
                variant === 'green'  ? 'text-green-600 dark:text-green-400'  :
                variant === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                variant === 'red'    ? 'text-red-600 dark:text-red-400'     : 'text-gray-900 dark:text-white'
              }`}>{val}</p>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader
          title="Donation verification"
          right={
            <>
              {(['pending', 'verifying'] as const).map(s =>
                counts[s] ? <Badge key={s} label={`${counts[s]} ${s}`} variant="orange" /> : null,
              )}
              {counts['completed'] ? <Badge label={`${counts['completed']} completed`} variant="green" /> : null}
              {counts['failed']    ? <Badge label={`${counts['failed']} failed`}    variant="red"   /> : null}
            </>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr>
                <Th>Donor</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Trx ID</Th>
                <Th>Purpose</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading
                ? <SkeletonRows cols={COLS} rows={4} />
                : donations.length === 0
                  ? <EmptyRow cols={COLS} label="No donations yet" />
                  : donations.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/25 transition-colors">
                      <Td>
                        <p className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {d.donorName || d.donor?.name || '—'}
                        </p>
                        {d.donor?.phone && (
                          <p className="text-xs text-gray-400 mt-0.5">{d.donor.phone}</p>
                        )}
                      </Td>
                      <Td>
                        <span className="font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                          {d.amount != null ? `৳${d.amount.toLocaleString()}` : '—'}
                        </span>
                      </Td>
                      <Td cls="capitalize text-gray-700 dark:text-gray-300">{d.paymentMethod || '—'}</Td>
                      <Td>
                        {d.transactionId
                          ? <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{d.transactionId}</span>
                          : <span className="text-gray-400">—</span>}
                      </Td>
                      <Td cls="text-gray-500">{d.purpose || '—'}</Td>
                      <Td cls="text-gray-500 whitespace-nowrap">
                        {d.createdAt ? format(new Date(d.createdAt), 'd MMM yyyy') : '—'}
                      </Td>
                      <Td>
                        <Badge label={d.status} variant={statusVariant(d.status)} />
                      </Td>
                      <Td>
                        {(d.status === 'verifying' || d.status === 'pending')
                          ? (
                            <ActionPair
                              loading={mutate.isPending}
                              approveLabel="Confirm"
                              rejectLabel="Reject"
                              onApprove={() => mutate.mutate({ id: d._id, status: 'completed', adminNote: '' })}
                              onReject={() => setRejectTarget(d)}
                            />
                          )
                          : <span className="text-gray-300 dark:text-gray-700">—</span>}
                      </Td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {rejectTarget && (
        <RejectModal
          title="Reject donation"
          subtitle={`৳${rejectTarget.amount?.toLocaleString()} from ${rejectTarget.donorName || rejectTarget.donor?.name}`}
          loading={mutate.isPending}
          onConfirm={note => mutate.mutate({ id: rejectTarget._id, status: 'failed', adminNote: note })}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'members',   label: 'Members',    icon: <IBuilding /> },
  { id: 'helpPosts', label: 'Help Posts', icon: <IHeart />    },
  { id: 'donations', label: 'Donations',  icon: <IGift />     },
];

// ─────────────────────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────────────────────
export default function AdminOrgPage() {
  const [tab, setTab] = useState<TabId>('members');

  // Prefetch all three tabs in background for instant switching
  useQuery({
    queryKey: ['admin-org-members'],
    queryFn: () => api.get('/org/pending').then(r => r.data),
    staleTime: 30_000,
  });
  useQuery({
    queryKey: ['admin-help-posts'],
    queryFn: () => api.get('/org/help-posts/pending').then(r => r.data),
    staleTime: 30_000,
  });
  useQuery({
    queryKey: ['admin-org-donations'],
    queryFn: () => api.get('/org/donations').then(r => r.data),
    staleTime: 30_000,
  });

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Page heading */}
      <div className="flex items-center gap-2.5">
        <span className="text-orange-500 flex items-center">
          <IBuilding size={20} />
        </span>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          Organisation Management
        </h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'members'   && <MembersTab />}
      {tab === 'helpPosts' && <HelpPostsTab />}
      {tab === 'donations' && <DonationsTab />}
    </div>
  );
}