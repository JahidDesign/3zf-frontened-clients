'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Heart, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { CATEGORY_LABELS, CATEGORY_ICONS, ALL_CATEGORIES, DISTRICTS, DIVISIONS } from '@/lib/org-constants';
import { DonationCategory } from '@/types/organisation';

interface Props {
  onClose:   () => void;
  onSuccess: () => void;
}

interface FormState {
  title:          string;
  description:    string;
  category:       DonationCategory;
  requestedAmount: string;
  district:       string;
  division:       string;
  address:        string;
  contactPhone:   string;
}

const EMPTY: FormState = {
  title:           '',
  description:     '',
  category:        'medical',
  requestedAmount: '',
  district:        '',
  division:        '',
  address:         '',
  contactPhone:    '',
};

const ALLOWED_MEDIA = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'];

export default function CreatePostModal({ onClose, onSuccess }: Props) {
  const [form,       setForm]       = useState<FormState>(EMPTY);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews,   setPreviews]   = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const f = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => {
      if (!ALLOWED_MEDIA.includes(f.type)) { toast.error(`${f.name} — অনুমোদিত ফরম্যাট নয়`); return false; }
      if (f.size > 20 * 1024 * 1024)       { toast.error(`${f.name} — সর্বোচ্চ 20MB`); return false; }
      return true;
    });

    const combined = [...mediaFiles, ...valid].slice(0, 5);
    setMediaFiles(combined);

    Promise.all(
      combined.map((file) =>
        new Promise<string>((resolve) => {
          if (file.type.startsWith('video')) { resolve('video'); return; }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
      )
    ).then(setPreviews);
  };

  const removeMedia = (idx: number) => {
    const newFiles    = mediaFiles.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setMediaFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim())           { toast.error('শিরোনাম লিখুন'); return; }
    if (!form.description.trim())     { toast.error('বিস্তারিত লিখুন'); return; }
    if (!form.requestedAmount || Number(form.requestedAmount) <= 0) {
      toast.error('প্রয়োজনীয় পরিমাণ লিখুন'); return;
    }

    setSubmitting(true);
    const tid = toast.loading('পোস্ট জমা হচ্ছে...');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      mediaFiles.forEach((file) => fd.append('media', file));

      await api.post('/org/programs', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('পোস্ট জমা হয়েছে! Admin পর্যালোচনা করবেন।', { id: tid });
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'জমা দিতে সমস্যা হয়েছে', { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                নতুন ডোনেশন পোস্ট
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Admin যাচাই করবেন, তারপর ভোটিং শুরু হবে
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]">
              <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                বিভাগ *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`py-2 px-1 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all
                      ${form.category === cat
                        ? 'gradient-brand text-white border-transparent'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
                  >
                    <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                শিরোনাম *
              </label>
              <input type="text" placeholder="সংক্ষিপ্ত ও স্পষ্ট শিরোনাম"
                value={form.title} onChange={f('title')} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                বিস্তারিত বিবরণ *
              </label>
              <textarea rows={4} placeholder="পরিস্থিতির বিস্তারিত বর্ণনা করুন..."
                value={form.description} onChange={f('description')} style={{ resize: 'none' }} />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                প্রয়োজনীয় পরিমাণ (৳) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold"
                  style={{ color: 'var(--color-brand)' }}>৳</span>
                <input type="number" min="1" placeholder="যেমন: 50000"
                  value={form.requestedAmount} onChange={f('requestedAmount')}
                  style={{ paddingLeft: '1.75rem' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                ভোটে চূড়ান্ত পরিমাণ নির্ধারিত হবে
              </p>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>বিভাগ</label>
                <select value={form.division} onChange={f('division')}>
                  <option value="">নির্বাচন করুন</option>
                  {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>জেলা</label>
                <select value={form.district} onChange={f('district')}>
                  <option value="">নির্বাচন করুন</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>ঠিকানা</label>
                <input type="text" placeholder="বিস্তারিত ঠিকানা"
                  value={form.address} onChange={f('address')} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text)' }}>যোগাযোগ</label>
                <input type="tel" placeholder="01XXXXXXXXX"
                  value={form.contactPhone} onChange={f('contactPhone')} />
              </div>
            </div>

            {/* Media upload */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                ছবি / ভিডিও (সর্বোচ্চ ৫টি)
              </label>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                      {preview === 'video' ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <span className="text-white text-xs">{mediaFiles[idx]?.name}</span>
                        </div>
                      ) : (
                        <img src={preview} className="w-full h-full object-cover" alt={`media-${idx}`} />
                      )}
                      <button type="button" onClick={() => removeMedia(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  {previews.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors hover:border-[var(--color-brand)]"
                      style={{ borderColor: 'var(--color-border)' }}>
                      <input ref={fileRef} type="file" accept={ALLOWED_MEDIA.join(',')}
                        multiple className="hidden" onChange={handleMediaChange} />
                      <Plus className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                    </label>
                  )}
                </div>
              )}

              {previews.length === 0 && (
                <label className="block cursor-pointer">
                  <input type="file" accept={ALLOWED_MEDIA.join(',')}
                    multiple className="hidden" onChange={handleMediaChange} />
                  <div className="border-2 border-dashed rounded-xl p-6 text-center transition-colors hover:border-[var(--color-brand)]"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      ছবি বা ভিডিও যোগ করুন
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      JPG, PNG, MP4 — সর্বোচ্চ 20MB প্রতিটি
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} disabled={submitting}
                className="btn-ghost flex-1 py-3">
                বাতিল
              </button>
              <button type="submit" disabled={submitting}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                {submitting ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <Heart className="w-4 h-4" />}
                {submitting ? 'জমা হচ্ছে...' : 'পোস্ট জমা দিন'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}