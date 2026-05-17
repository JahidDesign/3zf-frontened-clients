'use client';

import { useState, useRef } from 'react';
import { CheckCircle, Upload, MapPin, Phone, FileText, Store, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateShop } from '@/hooks/Usecommunityshop';

interface Props { onSuccess: () => void; }

const REGIONS = ['ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','রংপুর','ময়মনসিংহ'];

// ─── Floating Label Input ─────────────────────────────────────────────────────

function FloatingInput({
  label, id, icon, error, type = 'text', ...props
}: {
  label: string; id: string; icon?: React.ReactNode;
  error?: string; type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const hasValue = String(props.value ?? '').length > 0;
  const active = focused || hasValue;

  return (
    <div className="relative">
      <div className={`
        relative rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-900
        ${error
          ? 'border-red-400 dark:border-red-500 shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
          : focused
            ? 'border-teal-400 dark:border-teal-500 shadow-[0_0_0_3px_rgba(45,212,191,0.12)]'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}>
        {/* Icon */}
        {icon && (
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
            focused ? 'text-teal-500' : 'text-gray-400'
          }`}>
            {icon}
          </span>
        )}

        {/* Floating label */}
        <label
          htmlFor={id}
          className={`
            absolute transition-all duration-200 pointer-events-none select-none
            ${icon ? 'left-9' : 'left-3.5'}
            ${active
              ? 'top-2 text-[10px] font-semibold tracking-wide'
              : 'top-1/2 -translate-y-1/2 text-sm'
            }
            ${error ? 'text-red-400' : active ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}
          `}
        >
          {label}
        </label>

        <input
          id={id}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-transparent text-sm text-gray-900 dark:text-white
            focus:outline-none rounded-2xl
            ${icon ? 'pl-9 pr-3.5' : 'px-3.5'}
            ${active ? 'pt-5 pb-2' : 'py-3.5'}
          `}
          {...props}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-red-500 mt-1.5 ml-1 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Floating Label Select ────────────────────────────────────────────────────

function FloatingSelect({
  label, id, icon, error, children, ...props
}: {
  label: string; id: string; icon?: React.ReactNode;
  error?: string; children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  const hasValue = String(props.value ?? '').length > 0;
  const active = focused || hasValue;

  return (
    <div className="relative">
      <div className={`
        relative rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-900
        ${error
          ? 'border-red-400 dark:border-red-500 shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
          : focused
            ? 'border-teal-400 dark:border-teal-500 shadow-[0_0_0_3px_rgba(45,212,191,0.12)]'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}>
        {icon && (
          <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
            focused ? 'text-teal-500' : 'text-gray-400'
          }`}>
            {icon}
          </span>
        )}

        <label
          htmlFor={id}
          className={`
            absolute transition-all duration-200 pointer-events-none select-none
            ${icon ? 'left-9' : 'left-3.5'}
            ${active
              ? 'top-2 text-[10px] font-semibold tracking-wide'
              : 'top-1/2 -translate-y-1/2 text-sm'
            }
            ${error ? 'text-red-400' : active ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}
          `}
        >
          {label}
        </label>

        <select
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-transparent text-sm text-gray-900 dark:text-white
            focus:outline-none rounded-2xl appearance-none cursor-pointer
            ${icon ? 'pl-9 pr-8' : 'pl-3.5 pr-8'}
            ${active ? 'pt-5 pb-2' : 'py-3.5'}
          `}
          {...props}
        >
          {children}
        </select>

        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${
          focused ? 'text-teal-500' : 'text-gray-400'
        }`} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-red-500 mt-1.5 ml-1 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Floating Label Textarea ──────────────────────────────────────────────────

function FloatingTextarea({
  label, id, icon, error, ...props
}: {
  label: string; id: string; icon?: React.ReactNode; error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false);
  const hasValue = String(props.value ?? '').length > 0;
  const active = focused || hasValue;

  return (
    <div className="relative">
      <div className={`
        relative rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-900
        ${error
          ? 'border-red-400 dark:border-red-500 shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
          : focused
            ? 'border-teal-400 dark:border-teal-500 shadow-[0_0_0_3px_rgba(45,212,191,0.12)]'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}>
        {icon && (
          <span className={`absolute left-3.5 top-4 transition-colors duration-200 ${
            focused ? 'text-teal-500' : 'text-gray-400'
          }`}>
            {icon}
          </span>
        )}

        <label
          htmlFor={id}
          className={`
            absolute transition-all duration-200 pointer-events-none select-none
            ${icon ? 'left-9' : 'left-3.5'}
            ${active
              ? 'top-2 text-[10px] font-semibold tracking-wide'
              : 'top-3.5 text-sm'
            }
            ${error ? 'text-red-400' : active ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}
          `}
        >
          {label}
        </label>

        <textarea
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-transparent text-sm text-gray-900 dark:text-white
            focus:outline-none rounded-2xl resize-none
            ${icon ? 'pl-9 pr-3.5' : 'px-3.5'}
            ${active ? 'pt-6 pb-3' : 'py-3.5'}
          `}
          {...props}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[11px] text-red-500 mt-1.5 ml-1 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function CreateShopForm({ onSuccess }: Props) {
  const { createShop, loading } = useCreateShop();
  const fileRef = useRef<HTMLInputElement>(null);
  const [done, setDone] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', area: '', region: '', description: '', phone: '',
  });
  const [errors, setErrors] = useState<typeof form>({
    name: '', area: '', region: '', description: '', phone: '',
  });

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = { name: '', area: '', region: '', description: '', phone: '' };
    if (!form.name.trim())        e.name        = 'শপের নাম লিখুন';
    if (!form.area.trim())        e.area        = 'এলাকা লিখুন';
    if (!form.region)             e.region      = 'অঞ্চল নির্বাচন করুন';
    if (!form.description.trim()) e.description = 'বিবরণ লিখুন';
    if (!form.phone.trim() || !/^01\d{9}$/.test(form.phone)) e.phone = 'সঠিক নম্বর দিন';
    setErrors(e);
    return Object.values(e).every(v => !v);
  };

  const handleFile = (file: File | null) => {
    setCover(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (cover) fd.append('coverPhoto', cover);
    const shop = await createShop(fd);
    if (shop) setDone(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence mode="wait">

        {/* ── Success state ── */}
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500
                flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/30"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">আবেদন জমা হয়েছে!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
              অ্যাডমিন আপনার আবেদন যাচাই করবেন। অনুমোদনের পর শপটি Shop List-এ যুক্ত হবে।
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800
              rounded-2xl px-5 py-3.5 max-w-xs mx-auto mb-7 flex items-center gap-2.5">
              <span className="text-lg">⏱️</span>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-left">
                সাধারণত ২৪–৪৮ ঘণ্টার মধ্যে রিভিউ করা হয়
              </p>
            </div>
            <button
              onClick={onSuccess}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600
                text-white rounded-2xl font-bold text-sm hover:from-teal-500 hover:to-emerald-500
                transition-all duration-200 shadow-lg shadow-teal-500/25"
            >
              Shop List-এ ফিরুন →
            </button>
          </motion.div>

        ) : (

          /* ── Form ── */
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

            {/* Info banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800
              rounded-2xl px-4 py-3.5 mb-6 flex gap-3 items-start">
              <span className="text-lg shrink-0 mt-0.5">ℹ️</span>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-0.5">কীভাবে কাজ করে?</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  আবেদন জমার পর অ্যাডমিন যাচাই করবেন। অনুমোদিত হলে Shop List-এ যুক্ত হবে।
                  তখন অন্যরা আপনার শপে যোগ দিতে পারবেন।
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Shop name — full width */}
              <FloatingInput
                id="name" label="শপের নাম *"
                icon={<Store className="w-4 h-4" />}
                value={form.name} onChange={e => set('name', e.target.value)}
                error={errors.name}
                placeholder=""
              />

              {/* Area · Region · Phone — 3 col */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FloatingInput
                  id="area" label="এলাকা *"
                  icon={<MapPin className="w-4 h-4" />}
                  value={form.area} onChange={e => set('area', e.target.value)}
                  error={errors.area}
                />

                <FloatingSelect
                  id="region" label="বিভাগ / অঞ্চল *"
                  icon={<MapPin className="w-4 h-4" />}
                  value={form.region} onChange={e => set('region', e.target.value)}
                  error={errors.region}
                >
                  <option value="" disabled />
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </FloatingSelect>

                <FloatingInput
                  id="phone" label="যোগাযোগ নম্বর *"
                  icon={<Phone className="w-4 h-4" />}
                  type="tel"
                  value={form.phone} onChange={e => set('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>

              {/* Description + Cover photo — 2 col */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FloatingTextarea
                  id="description" label="বিস্তারিত বিবরণ *"
                  icon={<FileText className="w-4 h-4" />}
                  rows={6}
                  value={form.description} onChange={e => set('description', e.target.value)}
                  error={errors.description}
                />

                {/* Cover photo upload */}
                <div className="flex flex-col">
                  <p className="text-[10px] font-semibold tracking-wide text-gray-400 dark:text-gray-500 mb-1.5 ml-0.5">
                    শপের কভার ছবি (ঐচ্ছিক)
                  </p>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`
                      flex-1 relative rounded-2xl border-2 border-dashed cursor-pointer
                      flex flex-col items-center justify-center gap-2.5 overflow-hidden
                      transition-all duration-200 min-h-[140px]
                      ${preview
                        ? 'border-teal-400 dark:border-teal-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/30 dark:hover:bg-teal-900/10'
                      }
                    `}
                  >
                    {preview ? (
                      <>
                        <img src={preview} alt="cover preview"
                          className="absolute inset-0 w-full h-full object-cover" />
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={ev => { ev.stopPropagation(); handleFile(null); }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm
                            flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                        <div className="absolute bottom-2 left-2 right-2 text-center z-10">
                          <span className="text-[10px] text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            পরিবর্তন করতে ক্লিক করুন
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800
                          flex items-center justify-center">
                          <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            ছবি আপলোড করুন
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            JPG, PNG · সর্বোচ্চ ৫MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white
                  bg-gradient-to-r from-teal-600 to-emerald-600
                  hover:from-teal-500 hover:to-emerald-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  shadow-lg shadow-teal-500/20
                  flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    আবেদন জমা দিন
                  </>
                )}
              </motion.button>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}