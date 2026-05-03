'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Trash2, Plus, X, Upload, Loader2, Check,
  Eye, EyeOff, Star, Filter, Search, RefreshCw,
  AlertTriangle, CheckCircle2, XCircle, Film, Image as ImageIcon,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaFile {
  url: string;
  publicId: string;
  type: 'image' | 'video';
}

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  album?: string;
  category?: string;
  media: MediaFile[];
  isPublished: boolean;
  isFeatured?: boolean;
  uploadedBy?: { _id: string; name: string; avatar?: string };
  createdAt: string;
}

interface UploadForm {
  title: string;
  description: string;
  album: string;
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
}

const EMPTY_FORM: UploadForm = {
  title: '',
  description: '',
  album: '',
  category: '',
  isPublished: true,
  isFeatured: false,
};

const PAGE_SIZE = 20;

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

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({
  albums, onClose, onUploaded,
}: {
  albums: string[];
  onClose: () => void;
  onUploaded: (item: GalleryItem) => void;
}) {
  const [form,    setForm]    = useState<UploadForm>(EMPTY_FORM);
  const [files,   setFiles]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [drag,    setDrag]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState<Partial<Record<keyof UploadForm | 'files', string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    const next = [...files, ...valid].slice(0, 20);
    setFiles(next);
    setErrors(e => ({ ...e, files: undefined }));

    // Generate previews (images only; videos show placeholder)
    next.forEach((f, i) => {
      if (previews[i]) return;
      if (f.type.startsWith('image/')) {
        const r = new FileReader();
        r.onload = ev => setPreviews(p => { const c = [...p]; c[i] = ev.target?.result as string; return c; });
        r.readAsDataURL(f);
      }
    });
  };

  const removeFile = (i: number) => {
    setFiles(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const set = (key: keyof UploadForm, val: any) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (files.length === 0) e.files = 'Upload at least one file.';
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const fd = new window.FormData();
      fd.append('title',       form.title.trim());
      fd.append('description', form.description);
      fd.append('album',       form.album);
      fd.append('category',    form.category);
      fd.append('isPublished', String(form.isPublished));
      fd.append('isFeatured',  String(form.isFeatured));
      files.forEach(f => fd.append('media', f));

      const { data } = await api.post('/gallery', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Uploaded successfully!');
      onUploaded(data.item);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="card w-full max-w-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-text)' }}>
            Upload Media
          </h2>
          <button onClick={onClose} className="btn-secondary p-2 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Drop zone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>
              Files <span className="text-red-500">*</span>
              <span className="ml-1 normal-case font-normal">(up to 20)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />

            {files.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                className="w-full h-36 rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                style={{
                  border: `2px dashed ${drag ? 'var(--color-brand)' : errors.files ? '#ef4444' : 'var(--color-border)'}`,
                  background: drag ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
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
                    Images & videos — up to 20 files
                  </p>
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ border: '1px solid var(--color-border)' }}>
                      {f.type.startsWith('image/') && previews[i] ? (
                        <img src={previews[i]} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: 'var(--color-bg-secondary)' }}>
                          <Film className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 px-1 py-0.5"
                        style={{ background: 'rgba(0,0,0,0.55)' }}>
                        <p className="text-white text-[9px] truncate">{f.name}</p>
                      </div>
                    </div>
                  ))}
                  {files.length < 20 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl flex items-center justify-center transition-colors"
                      style={{
                        border: '2px dashed var(--color-border)',
                        background: 'var(--color-bg-secondary)',
                      }}
                    >
                      <Plus className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
            {errors.files && <p className="text-xs text-red-500">{errors.files}</p>}
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
              rows={3}
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

          {/* Album + Category */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                Album
              </label>
              <input
                type="text"
                list="album-list"
                value={form.album}
                onChange={e => set('album', e.target.value)}
                placeholder="e.g. Events 2024"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <datalist id="album-list">
                {albums.map(a => <option key={a} value={a} />)}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="e.g. Photography"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            {([
              ['isPublished', 'Published'],
              ['isFeatured',  'Featured'],
            ] as [keyof UploadForm, string][]).map(([key, label]) => (
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Gallery Page ──────────────────────────────────────────────────

export default function AdminGalleryPage() {
  const qc = useQueryClient();

  const [showUpload,   setShowUpload]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [search,       setSearch]       = useState('');
  const [albumFilter,  setAlbumFilter]  = useState('all');
  const [typeFilter,   setTypeFilter]   = useState<'all' | 'image' | 'video'>('all');
  const [page,         setPage]         = useState(1);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => api.get('/gallery/admin/all?limit=500').then(r => r.data),
  });

  const { data: albumsData } = useQuery({
    queryKey: ['gallery-albums-all'],
    queryFn: () => api.get('/gallery/albums/all').then(r => r.data),
  });

  const items: GalleryItem[] = data?.items ?? [];
  const albums: string[]     = albumsData?.albums ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/gallery/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-gallery'] });
      toast.success('Deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Delete failed'),
  });

  const togglePublish = async (item: GalleryItem) => {
    try {
      const { data } = await api.patch(`/gallery/${item._id}/publish`);
      qc.setQueryData(['admin-gallery'], (old: any) => ({
        ...old,
        items: old.items.map((i: GalleryItem) =>
          i._id === item._id ? { ...i, isPublished: data.isPublished } : i,
        ),
      }));
      toast.success(data.isPublished ? 'Published' : 'Unpublished');
    } catch {
      toast.error('Failed to update');
    }
  };

  const toggleFeatured = async (item: GalleryItem) => {
    try {
      const { data } = await api.patch(`/gallery/${item._id}/featured`);
      qc.setQueryData(['admin-gallery'], (old: any) => ({
        ...old,
        items: old.items.map((i: GalleryItem) =>
          i._id === item._id ? { ...i, isFeatured: data.isFeatured } : i,
        ),
      }));
      toast.success(data.isFeatured ? 'Featured' : 'Unfeatured');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleUploaded = (item: GalleryItem) => {
    qc.setQueryData(['admin-gallery'], (old: any) =>
      old ? { ...old, items: [item, ...(old.items ?? [])] } : old,
    );
    qc.invalidateQueries({ queryKey: ['gallery-albums-all'] });
    setShowUpload(false);
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filtered = items.filter(item => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    const matchAlbum  = albumFilter === 'all' || item.album === albumFilter;
    const matchType   = typeFilter  === 'all' || item.media?.[0]?.type === typeFilter;
    return matchSearch && matchAlbum && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const totalItems    = items.length;
  const publishedCount = items.filter(i => i.isPublished).length;
  const featuredCount  = items.filter(i => i.isFeatured).length;
  const videoCount     = items.filter(i => i.media?.[0]?.type === 'video').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}>

      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 border-b"
        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <h1 className="font-heading font-bold text-xl leading-tight flex items-center gap-2"
            style={{ color: 'var(--color-text)' }}>
            <Images className="w-5 h-5" style={{ color: 'var(--color-brand)' }} />
            Gallery
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Manage all media items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="btn-secondary p-2.5 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="gradient-brand text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-brand hover:opacity-90 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Items',  value: totalItems,     icon: Images,       color: 'var(--color-brand)' },
              { label: 'Published',    value: publishedCount, icon: CheckCircle2, color: '#10b981' },
              { label: 'Featured',     value: featuredCount,  icon: Star,         color: '#f59e0b' },
              { label: 'Videos',       value: videoCount,     icon: Film,         color: '#6366f1' },
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
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-text-muted)' }} />
            <input
              placeholder="Search gallery…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
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

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            {(['all', 'image', 'video'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                  typeFilter === t ? 'gradient-brand text-white border-transparent' : 'btn-secondary'
                }`}
              >
                {t === 'image' ? <><ImageIcon className="w-3 h-3 inline mr-1" />Images</> :
                 t === 'video' ? <><Film className="w-3 h-3 inline mr-1" />Videos</> : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Album pills */}
        {albums.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {['all', ...albums].map(a => (
              <button
                key={a}
                onClick={() => { setAlbumFilter(a); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                  albumFilter === a ? 'gradient-brand text-white border-transparent' : 'btn-secondary'
                }`}
              >
                {a === 'all' ? 'All Albums' : a}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-brand)' }} />
          </div>
        ) : paged.length === 0 ? (
          <div className="py-24 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <Images className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No items found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence initial={false}>
              {paged.map((item, i) => {
                const thumb   = item.media?.[0];
                const isVideo = thumb?.type === 'video';
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.02 }}
                    className="card overflow-hidden group relative"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square overflow-hidden"
                      style={{ background: 'var(--color-bg-secondary)' }}>
                      {thumb?.url ? (
                        isVideo ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                          </div>
                        ) : (
                          <img
                            src={thumb.url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
                        </div>
                      )}

                      {/* Media count badge */}
                      {item.media.length > 1 && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                          +{item.media.length}
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-start gap-1.5 p-2">
                        {/* Publish toggle */}
                        <button
                          onClick={() => togglePublish(item)}
                          title={item.isPublished ? 'Unpublish' : 'Publish'}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition"
                          style={{ background: item.isPublished ? '#10b981' : 'rgba(255,255,255,0.2)' }}
                        >
                          {item.isPublished
                            ? <Eye className="w-3.5 h-3.5 text-white" />
                            : <EyeOff className="w-3.5 h-3.5 text-white" />}
                        </button>

                        {/* Featured toggle */}
                        <button
                          onClick={() => toggleFeatured(item)}
                          title={item.isFeatured ? 'Unfeature' : 'Feature'}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition"
                          style={{ background: item.isFeatured ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}
                        >
                          <Star className={`w-3.5 h-3.5 text-white ${item.isFeatured ? 'fill-white' : ''}`} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          title="Delete"
                          className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-2.5">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {item.album && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                            {item.album}
                          </span>
                        )}
                        {!item.isPublished && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Draft
                          </span>
                        )}
                        {item.isFeatured && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
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
        {showUpload && (
          <UploadModal
            key="upload"
            albums={albums}
            onClose={() => setShowUpload(false)}
            onUploaded={handleUploaded}
          />
        )}
        {deleteTarget && (
          <ConfirmModal
            key="delete"
            title="Delete Media"
            message={`Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`}
            onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}