'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Pencil, Eye, MoreVertical,
  Calendar, Users, MapPin, Globe, CheckCircle2, XCircle,
  Star, AlertTriangle, X, ChevronLeft, ChevronRight,
  RefreshCw, Filter, Upload, Loader2, Check,
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import Link from 'next/link';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  banner?: { url: string; publicId: string };
  image?: string;
  location?: string;
  isOnline?: boolean;
  onlineUrl?: string;
  startDate: string;
  endDate?: string;
  capacity?: number;
  attendees: string[];
  organizer: { _id: string; name: string; avatar?: string };
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured?: boolean;
  isPublished: boolean;
  tags?: string[];
}

interface FormState {
  title: string;
  description: string;
  location: string;
  isOnline: boolean;
  onlineUrl: string;
  startDate: string;
  endDate: string;
  capacity: string;
  tags: string;
  isFeatured: boolean;
  isPublished: boolean;
  status: Event['status'];
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  location: '',
  isOnline: false,
  onlineUrl: '',
  startDate: '',
  endDate: '',
  capacity: '',
  tags: '',
  isFeatured: false,
  isPublished: true,
  status: 'upcoming',
};

const STATUS_OPTIONS: Event['status'][] = ['upcoming', 'ongoing', 'completed', 'cancelled'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusConfig(status?: Event['status'], startDate?: string) {
  const s = status ?? (startDate && isPast(new Date(startDate)) ? 'completed' : 'upcoming');
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    upcoming:  { label: 'Upcoming',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    dot: 'bg-blue-500' },
    ongoing:   { label: 'Live',      cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500 animate-pulse' },
    completed: { label: 'Completed', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',        dot: 'bg-gray-400' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',         dot: 'bg-red-500' },
  };
  return map[s!] ?? map.upcoming;
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title, message, onConfirm, onCancel, loading,
}: {
  title: string; message: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card p-6 max-w-sm w-full space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>{title}</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2 rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Event Form Modal ─────────────────────────────────────────────────────────

function EventFormModal({
  event, onClose, onSaved,
}: {
  event: Event | null;
  onClose: () => void;
  onSaved: (saved: Event) => void;
}) {
  const [form, setForm] = useState<FormState>(
    event
      ? {
          title:       event.title,
          description: event.description ?? '',
          location:    event.location ?? '',
          isOnline:    event.isOnline ?? false,
          onlineUrl:   event.onlineUrl ?? '',
          startDate:   event.startDate ? event.startDate.slice(0, 16) : '',
          endDate:     event.endDate   ? event.endDate.slice(0, 16)   : '',
          capacity:    event.capacity?.toString() ?? '',
          tags:        event.tags?.join(', ') ?? '',
          isFeatured:  event.isFeatured ?? false,
          isPublished: event.isPublished,
          status:      event.status ?? 'upcoming',
        }
      : EMPTY_FORM,
  );
  const [saving,        setSaving]        = useState(false);
  const [errors,        setErrors]        = useState<Partial<Record<keyof FormState, string>>>({});
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    event?.banner?.url ?? event?.image ?? null,
  );
  const [bannerFile,    setBannerFile]    = useState<File | null>(null);
  const [bannerDrag,    setBannerDrag]    = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = e => setBannerPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.startDate)    e.startDate = 'Start date is required.';
    if (form.endDate && form.startDate && form.endDate < form.startDate)
      e.endDate = 'End date must be after start.';
    if (form.capacity && isNaN(Number(form.capacity)))
      e.capacity = 'Must be a number.';
    return e;
  };

  const set = (key: keyof FormState, val: any) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      // Always send as multipart/form-data so multer can handle the banner upload
      const fd = new window.FormData();
      fd.append('title',       form.title.trim());
      fd.append('description', form.description);
      fd.append('location',    form.location);
      fd.append('isOnline',    String(form.isOnline));
      fd.append('onlineUrl',   form.onlineUrl);
      fd.append('startDate',   form.startDate);
      if (form.endDate)    fd.append('endDate',   form.endDate);
      if (form.capacity)   fd.append('capacity',  form.capacity);
      fd.append('isFeatured',  String(form.isFeatured));
      fd.append('isPublished', String(form.isPublished));
      fd.append('status',      form.status ?? 'upcoming');

      const tagList = form.tags
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      tagList.forEach(t => fd.append('tags[]', t));

      if (bannerFile) fd.append('banner', bannerFile);

      const { data } = event
        ? await api.put(`/events/${event._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/events',             fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      onSaved(data.event);
    } catch (e: any) {
      setErrors({ title: e?.response?.data?.message ?? 'Save failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="card w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-text)' }}>
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button onClick={onClose} className="btn-secondary p-2 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Banner Image */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
              Banner Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleBannerFile(f); }}
            />
            {bannerPreview ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden group"
                style={{ border: '1px solid var(--color-border)' }}>
                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition shadow">
                    <Upload className="w-4 h-4" /> Replace
                  </button>
                  <button type="button" onClick={removeBanner}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition shadow">
                    <X className="w-4 h-4" /> Remove
                  </button>
                </div>
                {bannerFile && (
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                      New • {(bannerFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setBannerDrag(true); }}
                onDragLeave={() => setBannerDrag(false)}
                onDrop={e => {
                  e.preventDefault(); setBannerDrag(false);
                  const f = e.dataTransfer.files?.[0]; if (f) handleBannerFile(f);
                }}
                className="w-full h-36 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                style={{
                  border: `2px dashed ${bannerDrag ? 'var(--color-brand)' : 'var(--color-border)'}`,
                  background: bannerDrag ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--color-bg-tertiary)' }}>
                  <Upload className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    PNG, JPG, WEBP — max 5 MB
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
              style={{
                background: 'var(--color-bg-secondary)',
                border: `1px solid ${errors.title ? '#ef4444' : 'var(--color-border)'}`,
                color: 'var(--color-text)',
              }}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: `1px solid ${errors.startDate ? '#ef4444' : 'var(--color-border)'}`,
                  color: 'var(--color-text)',
                }}
              />
              {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                End Date
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: `1px solid ${errors.endDate ? '#ef4444' : 'var(--color-border)'}`,
                  color: 'var(--color-text)',
                }}
              />
              {errors.endDate && <p className="text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          {/* Location + Capacity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                Capacity
              </label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={e => set('capacity', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: `1px solid ${errors.capacity ? '#ef4444' : 'var(--color-border)'}`,
                  color: 'var(--color-text)',
                }}
              />
              {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              ['isOnline',    'Online Event'],
              ['isFeatured',  'Featured'],
              ['isPublished', 'Published'],
            ] as [keyof FormState, string][]).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => set(key, !form[key])}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${form[key] ? 'gradient-brand' : ''}`}
                  style={{ background: form[key] ? undefined : 'var(--color-border)' }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    style={{ transform: form[key] ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              </label>
            ))}
          </div>

          {/* Online URL — only shown when isOnline is toggled on */}
          {form.isOnline && (
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                Online URL
              </label>
              <input
                type="url"
                value={form.onlineUrl}
                onChange={e => set('onlineUrl', e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          )}

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                    form.status === s ? 'gradient-brand text-white border-transparent' : 'btn-secondary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
              Tags{' '}
              <span className="text-xs normal-case font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="e.g. workshop, tech, networking"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={onClose} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="gradient-brand text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-brand hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {event ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────

function RowMenu({
  event, onEdit, onDelete, onTogglePublish, onToggleFeatured,
}: {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onToggleFeatured: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    { icon: Pencil,  label: 'Edit',   action: onEdit },
    {
      icon: event.isPublished ? XCircle : CheckCircle2,
      label: event.isPublished ? 'Unpublish' : 'Publish',
      action: onTogglePublish,
    },
    {
      icon: Star,
      label: event.isFeatured ? 'Unfeature' : 'Feature',
      action: onToggleFeatured,
    },
    { icon: Trash2,  label: 'Delete', action: onDelete, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="btn-secondary p-1.5 rounded-lg">
        <MoreVertical className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            className="absolute right-0 z-30 mt-1 w-44 rounded-xl overflow-hidden shadow-xl py-1"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            {items.map(({ icon: Icon, label, action, danger }) => (
              <button
                key={label}
                onClick={() => { action(); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                  danger
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'hover:bg-[var(--color-bg-secondary)]'
                }`}
                style={{ color: danger ? undefined : 'var(--color-text-secondary)' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ events }: { events: Event[] }) {
  const total     = events.length;
  const published = events.filter(e => e.isPublished).length;
  const featured  = events.filter(e => e.isFeatured).length;
  const upcoming  = events.filter(e =>
    e.status === 'upcoming' || (!e.status && !isPast(new Date(e.startDate))),
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total Events', value: total,     icon: Calendar,     color: 'var(--color-brand)' },
        { label: 'Published',    value: published, icon: CheckCircle2, color: '#10b981' },
        { label: 'Featured',     value: featured,  icon: Star,         color: '#f59e0b' },
        { label: 'Upcoming',     value: upcoming,  icon: RefreshCw,    color: '#6366f1' },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--color-text)' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function AdminEventsPage() {
  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page,         setPage]         = useState(1);
  const [modalEvent,   setModalEvent]   = useState<Event | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Fetch — uses the admin endpoint so unpublished events are included ──────
  const fetchEvents = () => {
    setLoading(true);
    api.get('/events/admin/all?limit=200')
      .then(({ data }) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filtered = events.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all'                                    ||
      e.status === statusFilter                                 ||
      (statusFilter === 'published'   &&  e.isPublished)       ||
      (statusFilter === 'unpublished' && !e.isPublished)       ||
      (statusFilter === 'featured'    &&  e.isFeatured);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Actions ───────────────────────────────────────────────────────────────────

  const handleSaved = (saved: Event) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e._id === saved._id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy; }
      return [saved, ...prev];
    });
    setModalEvent(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${deleteTarget._id}`);
      setEvents(prev => prev.filter(e => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      // noop — add a toast here in production
    } finally {
      setDeleting(false);
    }
  };

  // Uses the dedicated PATCH /publish endpoint — no multipart needed
  const togglePublish = async (event: Event) => {
    try {
      const { data } = await api.patch(`/events/${event._id}/publish`);
      setEvents(prev => prev.map(e =>
        e._id === event._id ? { ...e, isPublished: data.isPublished } : e,
      ));
    } catch {}
  };

  // Uses the dedicated PATCH /featured endpoint — no multipart needed
  const toggleFeatured = async (event: Event) => {
    try {
      const { data } = await api.patch(`/events/${event._id}/featured`);
      setEvents(prev => prev.map(e =>
        e._id === event._id ? { ...e, isFeatured: data.isFeatured } : e,
      ));
    } catch {}
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>

      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 border-b"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <h1 className="font-heading font-bold text-xl leading-tight" style={{ color: 'var(--color-text)' }}>
            Events
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Manage all community events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchEvents} className="btn-secondary p-2.5 rounded-xl" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setModalEvent('new')}
            className="gradient-brand text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-brand hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Event
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {!loading && <StatsBar events={events} />}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-text-muted)' }} />
            <input
              placeholder="Search events…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            {(['all', 'upcoming', 'ongoing', 'completed', 'cancelled', 'featured', 'published', 'unpublished'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                  statusFilter === f ? 'gradient-brand text-white border-transparent' : 'btn-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>

          {/* Table header */}
          <div
            className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wide"
            style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
          >
            <span>Event</span>
            <span>Date</span>
            <span>Attendees</span>
            <span>Status</span>
            <span>Flags</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex items-center justify-center py-24" style={{ background: 'var(--color-bg)' }}>
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-brand)' }} />
            </div>
          ) : paged.length === 0 ? (
            <div className="py-20 text-center" style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No events found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {paged.map((event, i) => {
                const badge     = statusConfig(event.status, event.startDate);
                const bannerUrl = event.banner?.url ?? event.image;
                return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b last:border-b-0 transition-colors hover:bg-[var(--color-bg-secondary)]"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                  >
                    {/* Title + thumbnail */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-secondary)]">
                        {bannerUrl ? (
                          <img src={bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gradient-brand flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white opacity-60" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {event.isOnline ? (
                            <Globe className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                          ) : event.location ? (
                            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                          ) : null}
                          <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                            {event.isOnline ? 'Online' : event.location ?? 'No location'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="hidden md:block">
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {format(new Date(event.startDate), 'h:mm a')}
                      </p>
                    </div>

                    {/* Attendees */}
                    <div className="hidden md:flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        {event.attendees.length}
                        {event.capacity ? (
                          <span className="font-normal text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            &nbsp;/ {event.capacity}
                          </span>
                        ) : null}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Flags */}
                    <div className="hidden md:flex items-center gap-1.5">
                      {event.isPublished ? (
                        <span title="Published" className="text-green-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span title="Unpublished" style={{ color: 'var(--color-text-muted)' }}>
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                      {event.isFeatured && (
                        <span title="Featured" className="text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <Link
                        href={`/events/${event.slug ?? event._id}`}
                        target="_blank"
                        className="btn-secondary p-1.5 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setModalEvent(event)}
                        className="btn-secondary p-1.5 rounded-lg"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <RowMenu
                        event={event}
                        onEdit={() => setModalEvent(event)}
                        onDelete={() => setDeleteTarget(event)}
                        onTogglePublish={() => togglePublish(event)}
                        onToggleFeatured={() => toggleFeatured(event)}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary p-2 rounded-xl disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2)
                .map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      p === page ? 'gradient-brand text-white shadow-brand' : 'btn-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary p-2 rounded-xl disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalEvent !== null && (
          <EventFormModal
            key="form"
            event={modalEvent === 'new' ? null : modalEvent}
            onClose={() => setModalEvent(null)}
            onSaved={handleSaved}
          />
        )}
        {deleteTarget && (
          <ConfirmModal
            key="delete"
            title="Delete Event"
            message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}