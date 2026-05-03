'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Upload, X, Plus, Minus, Package,
  Tag, DollarSign, Hash, Loader2, CheckCircle2,
  ImagePlus, Trash2, GripVertical, AlertCircle,
  Search, Layers, BarChart2, Percent, ToggleLeft,
} from 'lucide-react';
import Link from 'next/link';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name:          z.string().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে'),
  description:   z.string().min(10, 'বিবরণ কমপক্ষে ১০ অক্ষর হতে হবে'),
  price:         z.coerce.number().min(1, 'দাম দিন'),
  discountPrice: z.coerce.number().optional(),
  category:      z.string().min(1, 'ক্যাটাগরি দিন'),
  stock:         z.coerce.number().min(0, 'স্টক দিন'),
  isFeatured:    z.boolean().default(false),
  tags:          z.array(z.object({ value: z.string() })).optional(),
  seoTitle:      z.string().optional(),
  seoDesc:       z.string().optional(),
  variants:      z.array(z.object({
    name:  z.string().min(1, 'Variant নাম দিন'),
    price: z.coerce.number().min(0),
    stock: z.coerce.number().min(0),
  })).optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

function InputLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAddProductPage() {
  const router   = useRouter();
  const qc       = useQueryClient();
  const imageRef = useRef<HTMLInputElement>(null);

  const [images,        setImages]        = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tagInput,      setTagInput]      = useState('');
  const [newCategory,   setNewCategory]   = useState('');

  // ── Categories ───────────────────────────────────────────────────────────────
  const { data: catData } = useQuery({
    queryKey: ['product-categories'],
    queryFn:  () => api.get('/supershop/products/categories').then(r => r.data),
  });
  const categories: string[] = catData?.categories ?? [];

  // ── Form ─────────────────────────────────────────────────────────────────────
  const {
    register, handleSubmit, watch, setValue, control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isFeatured: false, tags: [], variants: [], stock: 0 },
  });

  const { fields: tagFields,     append: appendTag,     remove: removeTag     } = useFieldArray({ control, name: 'tags' });
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const isFeatured   = watch('isFeatured');
  const watchPrice   = watch('price');
  const watchDisc    = watch('discountPrice');
  const watchStock   = watch('stock');

  const discountPct = watchPrice && watchDisc
    ? Math.round((1 - Number(watchDisc) / Number(watchPrice)) * 100)
    : 0;

  // ── Image handlers ────────────────────────────────────────────────────────────
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 6) { toast.error('সর্বোচ্চ ৬টি ছবি দেওয়া যাবে'); return; }
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── Tag handlers ──────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    appendTag({ value: t });
    setTagInput('');
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData();
      fd.append('name',        data.name);
      fd.append('description', data.description);
      fd.append('price',       String(data.price));
      fd.append('stock',       String(data.stock));
      fd.append('category',    data.category);
      fd.append('isFeatured',  String(data.isFeatured));
      if (data.discountPrice)    fd.append('discountPrice', String(data.discountPrice));
      if (data.seoTitle)         fd.append('seoTitle',      data.seoTitle);
      if (data.seoDesc)          fd.append('seoDesc',       data.seoDesc);
      if (data.tags?.length)     fd.append('tags',          JSON.stringify(data.tags.map(t => t.value)));
      if (data.variants?.length) fd.append('variants',      JSON.stringify(data.variants));
      images.forEach(img => fd.append('images', img));
      return api.post('/supershop/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('পণ্য সফলভাবে যোগ হয়েছে!');
      router.push('/admin/supershop/products');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'পণ্য যোগ ব্যর্থ হয়েছে'),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/supershop/products"
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <p className="text-xs text-gray-400 leading-none mb-0.5">Supershop Admin</p>
              <h1 className="font-black text-gray-900 dark:text-white text-lg leading-none">নতুন পণ্য যোগ করুন</h1>
            </div>
          </div>
          <button
            onClick={handleSubmit(d => mutation.mutate(d))}
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm"
          >
            {mutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> সেভ হচ্ছে...</>
              : <><CheckCircle2 className="w-4 h-4" /> পণ্য সেভ করুন</>
            }
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══════════ LEFT COLUMN ══════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic info */}
            <SectionCard title="মূল তথ্য" icon={Package}>
              <div className="space-y-4">
                <div>
                  <InputLabel required>পণ্যের নাম</InputLabel>
                  <input {...register('name')}
                    className="input w-full text-sm"
                    placeholder="যেমন: Samsung Galaxy A55 5G" />
                  <FieldError msg={errors.name?.message} />
                </div>
                <div>
                  <InputLabel required>বিবরণ</InputLabel>
                  <textarea {...register('description')} rows={4}
                    className="input w-full text-sm resize-none"
                    placeholder="পণ্যের বিস্তারিত বিবরণ লিখুন..." />
                  <FieldError msg={errors.description?.message} />
                </div>
              </div>
            </SectionCard>

            {/* Images */}
            <SectionCard title="পণ্যের ছবি" icon={ImagePlus}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 group">
                    <Image src={src} alt="" fill className="object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded-md font-bold">মেইন</span>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 6 && (
                  <button type="button" onClick={() => imageRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition group">
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                    <span className="text-xs text-gray-400 group-hover:text-primary-500">ছবি যোগ</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">সর্বোচ্চ ৬টি ছবি · প্রথম ছবিটি মেইন ছবি হবে</p>
              <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            </SectionCard>

            {/* Pricing */}
            <SectionCard title="দাম ও ছাড়" icon={DollarSign}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel required>মূল দাম (৳)</InputLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">৳</span>
                    <input {...register('price')} type="number" min="0"
                      className="input w-full pl-7 text-sm" placeholder="০" />
                  </div>
                  <FieldError msg={errors.price?.message} />
                </div>
                <div>
                  <InputLabel>ডিসকাউন্ট দাম (৳)</InputLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">৳</span>
                    <input {...register('discountPrice')} type="number" min="0"
                      className="input w-full pl-7 text-sm" placeholder="ঐচ্ছিক" />
                  </div>
                  {discountPct > 0 && (
                    <p className="text-green-600 dark:text-green-400 text-xs mt-1.5 flex items-center gap-1">
                      <Percent className="w-3 h-3" /> {discountPct}% ছাড়
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Variants */}
            <SectionCard title="Variants (সাইজ / রঙ)" icon={Layers}>
              <div className="space-y-3">
                {variantFields.map((field, i) => (
                  <div key={field.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <GripVertical className="w-4 h-4 text-gray-400 mt-2.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <InputLabel>নাম</InputLabel>
                        <input {...register(`variants.${i}.name`)} className="input w-full text-xs" placeholder="যেমন: L, Red" />
                        <FieldError msg={errors.variants?.[i]?.name?.message} />
                      </div>
                      <div>
                        <InputLabel>দাম (৳)</InputLabel>
                        <input {...register(`variants.${i}.price`)} type="number" min="0" className="input w-full text-xs" placeholder="০" />
                      </div>
                      <div>
                        <InputLabel>স্টক</InputLabel>
                        <input {...register(`variants.${i}.stock`)} type="number" min="0" className="input w-full text-xs" placeholder="০" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeVariant(i)}
                      className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition mt-5 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button"
                  onClick={() => appendVariant({ name: '', price: 0, stock: 0 })}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 hover:border-primary-400 hover:text-primary-600 transition flex items-center justify-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Variant যোগ করুন
                </button>
              </div>
            </SectionCard>

            {/* SEO */}
            <SectionCard title="SEO তথ্য" icon={Search}>
              <div className="space-y-4">
                <div>
                  <InputLabel>SEO Title</InputLabel>
                  <input {...register('seoTitle')} className="input w-full text-sm"
                    placeholder="Search engine-এ যে শিরোনাম দেখাবে" />
                </div>
                <div>
                  <InputLabel>SEO Description</InputLabel>
                  <textarea {...register('seoDesc')} rows={2}
                    className="input w-full text-sm resize-none"
                    placeholder="Search result-এ যে বিবরণ দেখাবে..." />
                </div>
              </div>
            </SectionCard>

          </div>

          {/* ══════════ RIGHT COLUMN ══════════ */}
          <div className="space-y-6">

            {/* Featured toggle */}
            <SectionCard title="স্ট্যাটাস" icon={ToggleLeft}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">ফিচার্ড পণ্য</p>
                  <p className="text-xs text-gray-400 mt-0.5">হোমপেজে দেখাবে</p>
                </div>
                <button type="button" onClick={() => setValue('isFeatured', !isFeatured)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isFeatured ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isFeatured ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
            </SectionCard>

            {/* Category & stock */}
            <SectionCard title="ক্যাটাগরি ও স্টক" icon={Tag}>
              <div className="space-y-4">
                <div>
                  <InputLabel required>ক্যাটাগরি</InputLabel>
                  <select {...register('category')} className="input w-full text-sm">
                    <option value="">ক্যাটাগরি বেছে নিন</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <FieldError msg={errors.category?.message} />
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newCategory.trim()) { setValue('category', newCategory.trim()); setNewCategory(''); }
                        }
                      }}
                      className="input flex-1 text-xs" placeholder="নতুন ক্যাটাগরি" />
                    <button type="button"
                      onClick={() => { if (newCategory.trim()) { setValue('category', newCategory.trim()); setNewCategory(''); } }}
                      className="px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 text-xs font-bold hover:bg-primary-100 transition">
                      যোগ
                    </button>
                  </div>
                </div>

                <div>
                  <InputLabel required>স্টক পরিমাণ</InputLabel>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => setValue('stock', Math.max(0, Number(watchStock) - 1))}
                      className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <input {...register('stock')} type="number" min="0"
                      className="input flex-1 text-sm text-center font-bold" placeholder="০" />
                    <button type="button"
                      onClick={() => setValue('stock', Number(watchStock) + 1)}
                      className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <FieldError msg={errors.stock?.message} />
                </div>
              </div>
            </SectionCard>

            {/* Tags */}
            <SectionCard title="ট্যাগ" icon={Hash}>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="input flex-1 text-sm" placeholder="ট্যাগ লিখুন..." />
                  <button type="button" onClick={addTag}
                    className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {tagFields.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagFields.map((field, i) => (
                      <span key={field.id}
                        className="flex items-center gap-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full font-semibold">
                        #{(field as any).value}
                        <button type="button" onClick={() => removeTag(i)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400">Enter চাপুন বা + বাটন দিন</p>
              </div>
            </SectionCard>

            {/* Summary */}
            <div className="bg-gradient-to-br from-primary-600 to-violet-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-white/70" />
                <p className="text-sm font-bold">সারসংক্ষেপ</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">ছবি</span>
                  <span className="font-bold">{imagePreviews.length} / 6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">ট্যাগ</span>
                  <span className="font-bold">{tagFields.length}টি</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Variants</span>
                  <span className="font-bold">{variantFields.length}টি</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/60">ছাড়</span>
                    <span className="font-bold text-yellow-300">{discountPct}%</span>
                  </div>
                )}
              </div>
              <button type="button"
                onClick={handleSubmit(d => mutation.mutate(d))}
                disabled={mutation.isPending}
                className="mt-4 w-full py-3 rounded-xl bg-white text-primary-700 font-black text-sm hover:bg-white/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {mutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> সেভ হচ্ছে...</>
                  : <><CheckCircle2 className="w-4 h-4" /> পণ্য সেভ করুন</>
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}