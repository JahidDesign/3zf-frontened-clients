'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, CheckCircle, ChevronRight, ChevronLeft,
  AlertCircle, Copy, User, MapPin, CreditCard, ClipboardCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useOrgStore from '@/store/Orgstore';
import { MEMBERSHIP_FEE, DISTRICTS, DIVISIONS, PAYMENT_LABELS } from '@/lib/org-constants';
import { PaymentMethod } from '@/types/organisation';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1 — Personal
  name:           string;
  dob:            string;
  occupation:     string;
  religion:       string;
  birthPlace:     string;
  motherName:     string;
  fatherName:     string;
  nidNumber:      string;
  // Step 2 — Contact
  phone:          string;
  email:          string;
  district:       string;
  division:       string;
  address:        string;
  presentAddress: string;
  // Step 3 — Payment
  paymentMethod:  PaymentMethod;
  senderNumber:   string;
  transactionId:  string;
  paymentAmount:  string;
}

const EMPTY: FormData = {
  name: '', dob: '', occupation: '', religion: '', birthPlace: '',
  motherName: '', fatherName: '', nidNumber: '',
  phone: '', email: '', district: '', division: '',
  address: '', presentAddress: '',
  paymentMethod: 'bkash', senderNumber: '', transactionId: '',
  paymentAmount: String(MEMBERSHIP_FEE),
};

const RECEIVER_NUMBER = '01734166488';

const STEP_META: { label: string; icon: React.ReactNode }[] = [
  { label: 'ব্যক্তিগত',  icon: <User className="w-3.5 h-3.5" /> },
  { label: 'যোগাযোগ',    icon: <MapPin className="w-3.5 h-3.5" /> },
  { label: 'পেমেন্ট',    icon: <CreditCard className="w-3.5 h-3.5" /> },
  { label: 'নিশ্চিত',    icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
];

const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  bkash:  '৳',
  nagad:  '৳',
  rocket: '৳',
  bank:   '৳',
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
      style={{ color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
      {children}{required && <span style={{ color: 'var(--color-brand)', marginLeft: 2 }}>*</span>}
    </label>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-brand)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        props.onBlur?.(e);
      }}
    />
  );
}

function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontSize: 14,
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: 32,
        ...props.style,
      }}
    >
      {props.children}
    </select>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
      <span className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RegistrationModal() {
  const { showRegistrationModal, setShowRegistrationModal, setMembership } = useOrgStore();

  const [step, setStep]               = useState<Step>(1);
  const [form, setForm]               = useState<FormData>(EMPTY);
  const [nidFile, setNidFile]         = useState<File | null>(null);
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [nidPreview, setNidPreview]   = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [copied, setCopied]           = useState(false);

  const nidRef   = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const f = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void,
    preview: (s: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('ফাইল সাইজ সর্বোচ্চ 5MB'); return; }
    setter(file);
    const reader = new FileReader();
    reader.onload = () => preview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(RECEIVER_NUMBER);
      setCopied(true);
      toast.success('নম্বর কপি হয়েছে!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('কপি করা যায়নি');
    }
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.name.trim())      { toast.error('নাম লিখুন'); return false; }
      if (!form.nidNumber.trim()) { toast.error('NID নম্বর লিখুন'); return false; }
    }
    if (step === 2) {
      if (!form.phone.trim())   { toast.error('ফোন নম্বর লিখুন'); return false; }
      if (!form.district)       { toast.error('জেলা নির্বাচন করুন'); return false; }
      if (!form.address.trim()) { toast.error('স্থায়ী ঠিকানা লিখুন'); return false; }
    }
    if (step === 3) {
      if (!form.senderNumber.trim())  { toast.error('আপনার পেমেন্ট নম্বর লিখুন'); return false; }
      if (!form.transactionId.trim()) { toast.error('Transaction ID লিখুন'); return false; }
      if (Number(form.paymentAmount) < MEMBERSHIP_FEE) {
        toast.error(`সর্বনিম্ন ৳${MEMBERSHIP_FEE} পাঠাতে হবে`);
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => (s + 1) as Step); };
  const prev = () => setStep((s) => (s - 1) as Step);

  const handleSubmit = async () => {
    setSubmitting(true);
    const tid = toast.loading('আবেদন জমা হচ্ছে...');
    try {
      const fd = new window.FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          fd.append(k, String(v));
        }
      });
      fd.set('paymentAmount', String(Number(form.paymentAmount)));
      fd.append('receiverNumber', RECEIVER_NUMBER);
      if (nidFile)   fd.append('nidDocument',  nidFile);
      if (photoFile) fd.append('profilePhoto', photoFile);

      const { data } = await api.post('/org/register', fd);
      toast.success('আবেদন সফলভাবে জমা হয়েছে!', { id: tid });
      setMembership(data.membership);
      setShowRegistrationModal(false);
      resetForm();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'জমা দিতে সমস্যা হয়েছে';
      toast.error(msg, { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1); setForm(EMPTY);
    setNidFile(null); setPhotoFile(null);
    setNidPreview(null); setPhotoPreview(null);
  };

  const close = () => { setShowRegistrationModal(false); resetForm(); };

  if (!showRegistrationModal) return null;

  // ── Summary rows for step 4
  const summaryRows: [string, string][] = [
    ['নাম',              form.name],
    ['জন্ম তারিখ',       form.dob || '—'],
    ['পেশা',             form.occupation || '—'],
    ['ধর্ম',             form.religion || '—'],
    ['NID নম্বর',        form.nidNumber],
    ['ফোন',              form.phone],
    ['জেলা',             form.district],
    ['পেমেন্ট পদ্ধতি',  PAYMENT_LABELS[form.paymentMethod]],
    ['প্রেরক নম্বর',     form.senderNumber],
    ['Transaction ID',   form.transactionId],
    ['পরিমাণ',           `৳${form.paymentAmount}`],
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="w-full sm:max-w-lg relative flex flex-col"
          style={{
            background: 'var(--color-bg-card, var(--color-bg))',
            borderRadius: '20px 20px 0 0',
            border: '1px solid var(--color-border)',
            maxHeight: '94vh',
            overflow: 'hidden',
          }}
        >
          {/* ── Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* ── Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center gradient-brand">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
                  সদস্যপদ নিবন্ধন
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Harmony Organisation
                </p>
              </div>
            </div>
            <button onClick={close}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-bg-hover)]">
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>

          {/* ── Step Indicator */}
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center">
              {STEP_META.map((meta, i) => {
                const num  = i + 1;
                const done = num < step;
                const curr = num === step;
                return (
                  <div key={num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <motion.div
                        animate={{
                          scale: curr ? 1.1 : 1,
                        }}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                          done ? 'gradient-brand text-white' :
                          curr ? 'border-2 text-[var(--color-brand)]' :
                                 'border text-[var(--color-text-muted)]'
                        }`}
                        style={{
                          borderColor: curr ? 'var(--color-brand)' : 'var(--color-border)',
                          background: done ? undefined : curr ? 'color-mix(in srgb, var(--color-brand) 8%, transparent)' : 'var(--color-bg-secondary)',
                        }}
                      >
                        {done ? <CheckCircle className="w-4 h-4" /> : meta.icon}
                      </motion.div>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${
                        curr ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-muted)]'
                      }`}>
                        {meta.label}
                      </span>
                    </div>
                    {i < STEP_META.length - 1 && (
                      <div className="flex-1 mx-1 mb-4 h-0.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--color-border)' }}>
                        <motion.div
                          className="h-full rounded-full gradient-brand"
                          animate={{ width: num < step ? '100%' : '0%' }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >

                {/* ════ Step 1: Personal ════ */}
                {step === 1 && (
                  <div className="space-y-4">

                    {/* Photo upload */}
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => photoRef.current?.click()}
                        className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 transition-all"
                        style={{ border: '2px dashed var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                        {photoPreview
                          ? <img src={photoPreview} className="w-full h-full object-cover" alt="photo" />
                          : <Upload className="w-5 h-5 absolute inset-0 m-auto" style={{ color: 'var(--color-text-muted)' }} />}
                      </button>
                      <input ref={photoRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleFile(e, setPhotoFile, setPhotoPreview)} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>প্রোফাইল ছবি</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>ঐচ্ছিক · সর্বোচ্চ 5MB</p>
                        <button type="button" onClick={() => photoRef.current?.click()}
                          className="text-xs mt-1 font-medium" style={{ color: 'var(--color-brand)' }}>
                          ছবি আপলোড করুন
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <FieldLabel required>পূর্ণ নাম</FieldLabel>
                        <FieldInput type="text" placeholder="আপনার সম্পূর্ণ নাম" value={form.name} onChange={f('name')} />
                      </div>
                      <div>
                        <FieldLabel>জন্মতারিখ</FieldLabel>
                        <FieldInput type="date" value={form.dob} onChange={f('dob')} />
                      </div>
                      <div>
                        <FieldLabel>জন্মস্থান</FieldLabel>
                        <FieldInput type="text" placeholder="গ্রাম / শহর" value={form.birthPlace} onChange={f('birthPlace')} />
                      </div>
                    </div>

                    <SectionDivider label="পারিবারিক তথ্য" />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>পিতার নাম</FieldLabel>
                        <FieldInput type="text" placeholder="পিতার নাম" value={form.fatherName} onChange={f('fatherName')} />
                      </div>
                      <div>
                        <FieldLabel>মাতার নাম</FieldLabel>
                        <FieldInput type="text" placeholder="মাতার নাম" value={form.motherName} onChange={f('motherName')} />
                      </div>
                      <div>
                        <FieldLabel>পেশা</FieldLabel>
                        <FieldInput type="text" placeholder="যেমন: শিক্ষক" value={form.occupation} onChange={f('occupation')} />
                      </div>
                      <div>
                        <FieldLabel>ধর্ম</FieldLabel>
                        <FieldSelect value={form.religion} onChange={f('religion')}>
                          <option value="">নির্বাচন করুন</option>
                          <option value="ইসলাম">ইসলাম</option>
                          <option value="হিন্দু">হিন্দু</option>
                          <option value="খ্রিস্টান">খ্রিস্টান</option>
                          <option value="বৌদ্ধ">বৌদ্ধ</option>
                          <option value="অন্যান্য">অন্যান্য</option>
                        </FieldSelect>
                      </div>
                    </div>

                    <SectionDivider label="পরিচয়পত্র" />

                    <div>
                      <FieldLabel required>জাতীয় পরিচয়পত্র নম্বর</FieldLabel>
                      <FieldInput type="text" placeholder="NID নম্বর লিখুন" value={form.nidNumber} onChange={f('nidNumber')} />
                    </div>

                    <div>
                      <FieldLabel>NID স্ক্যান / ছবি</FieldLabel>
                      {nidPreview ? (
                        <div className="relative h-28 rounded-xl overflow-hidden"
                          style={{ border: '1.5px solid var(--color-border)' }}>
                          <img src={nidPreview} className="w-full h-full object-cover" alt="nid" />
                          <button type="button"
                            onClick={() => { setNidFile(null); setNidPreview(null); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.6)' }}>
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="block cursor-pointer">
                          <input ref={nidRef} type="file" accept="image/*,.pdf" className="hidden"
                            onChange={(e) => handleFile(e, setNidFile, setNidPreview)} />
                          <div className="rounded-xl p-5 text-center transition-colors hover:border-[var(--color-brand)]"
                            style={{ border: '1.5px dashed var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                            <Upload className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                              NID আপলোড করুন
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                              JPG, PNG বা PDF · সর্বোচ্চ 5MB
                            </p>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* ════ Step 2: Contact ════ */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel required>ফোন নম্বর</FieldLabel>
                        <FieldInput type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={f('phone')} />
                      </div>
                      <div>
                        <FieldLabel>ইমেইল</FieldLabel>
                        <FieldInput type="email" placeholder="email@example.com" value={form.email} onChange={f('email')} />
                      </div>
                      <div>
                        <FieldLabel>বিভাগ</FieldLabel>
                        <FieldSelect value={form.division} onChange={f('division')}>
                          <option value="">নির্বাচন করুন</option>
                          {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </FieldSelect>
                      </div>
                      <div>
                        <FieldLabel required>জেলা</FieldLabel>
                        <FieldSelect value={form.district} onChange={f('district')}>
                          <option value="">নির্বাচন করুন</option>
                          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </FieldSelect>
                      </div>
                    </div>

                    <SectionDivider label="স্থায়ী ঠিকানা" />

                    <div>
                      <FieldLabel required>বিস্তারিত ঠিকানা</FieldLabel>
                      <textarea
                        rows={3}
                        placeholder="গ্রাম/মহল্লা, উপজেলা, জেলা"
                        value={form.address}
                        onChange={f('address')}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 10,
                          border: '1.5px solid var(--color-border)',
                          background: 'var(--color-bg)', color: 'var(--color-text)',
                          fontSize: 14, resize: 'none', outline: 'none',
                          fontFamily: 'inherit',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; }}
                        onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      />
                    </div>

                    <SectionDivider label="বর্তমান ঠিকানা" />

                    <div>
                      <FieldLabel>বর্তমান ঠিকানা (যদি আলাদা হয়)</FieldLabel>
                      <textarea
                        rows={3}
                        placeholder="বর্তমান বাসস্থান, স্থায়ীর মতো হলে খালি রাখুন"
                        value={form.presentAddress}
                        onChange={f('presentAddress')}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 10,
                          border: '1.5px solid var(--color-border)',
                          background: 'var(--color-bg)', color: 'var(--color-text)',
                          fontSize: 14, resize: 'none', outline: 'none',
                          fontFamily: 'inherit',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)'; }}
                        onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                      />
                    </div>
                  </div>
                )}

                {/* ════ Step 3: Payment ════ */}
                {step === 3 && (
                  <div className="space-y-4">

                    {/* Fee highlight */}
                    <div className="rounded-2xl p-4 text-center relative overflow-hidden"
                      style={{ background: 'color-mix(in srgb, var(--color-brand) 8%, transparent)', border: '1.5px solid color-mix(in srgb, var(--color-brand) 20%, transparent)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--color-brand)' }}>একবারের সদস্যপদ ফি</p>
                      <p className="text-4xl font-bold" style={{ color: 'var(--color-brand)' }}>
                        ৳{MEMBERSHIP_FEE}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        অ-ফেরতযোগ্য · এককালীন
                      </p>
                    </div>

                    {/* Payment method grid */}
                    <div>
                      <FieldLabel>পেমেন্ট পদ্ধতি</FieldLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {(['bkash', 'nagad', 'rocket', 'bank'] as PaymentMethod[]).map((m) => (
                          <button key={m} type="button"
                            onClick={() => setForm((p) => ({ ...p, paymentMethod: m }))}
                            className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                              border: form.paymentMethod === m
                                ? '2px solid var(--color-brand)'
                                : '1.5px solid var(--color-border)',
                              background: form.paymentMethod === m
                                ? 'color-mix(in srgb, var(--color-brand) 10%, transparent)'
                                : 'var(--color-bg-secondary)',
                              color: form.paymentMethod === m
                                ? 'var(--color-brand)'
                                : 'var(--color-text-secondary)',
                            }}>
                            {PAYMENT_LABELS[m]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Receiver number box */}
                    <div className="rounded-xl overflow-hidden"
                      style={{ border: '1.5px solid var(--color-border)' }}>
                      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                        style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                        এই নম্বরে পাঠান — {PAYMENT_LABELS[form.paymentMethod]}
                      </div>
                      <div className="flex items-center justify-between px-4 py-3"
                        style={{ background: 'var(--color-bg)' }}>
                        <div>
                          <p className="text-2xl font-bold tracking-widest" style={{ color: 'var(--color-brand)' }}>
                            {RECEIVER_NUMBER}
                          </p>
                        </div>
                        <button type="button" onClick={copyNumber}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: copied ? 'color-mix(in srgb, #22c55e 12%, transparent)' : 'var(--color-bg-secondary)',
                            color: copied ? '#16a34a' : 'var(--color-text-secondary)',
                            border: `1.5px solid ${copied ? '#86efac' : 'var(--color-border)'}`,
                          }}>
                          <Copy className="w-3.5 h-3.5" />
                          {copied ? 'কপি হয়েছে ✓' : 'কপি করুন'}
                        </button>
                      </div>
                    </div>

                    {/* Sender number */}
                    <div>
                      <FieldLabel required>আপনার পেমেন্ট নম্বর (যেটি থেকে পাঠিয়েছেন)</FieldLabel>
                      <FieldInput type="tel" placeholder="01XXXXXXXXX" value={form.senderNumber} onChange={f('senderNumber')} />
                    </div>

                    {/* TrxID + Amount */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel required>Transaction ID</FieldLabel>
                        <FieldInput type="text" placeholder="TrxID" value={form.transactionId} onChange={f('transactionId')} />
                      </div>
                      <div>
                        <FieldLabel required>পাঠানো পরিমাণ (৳)</FieldLabel>
                        <FieldInput type="number" min={MEMBERSHIP_FEE} value={form.paymentAmount} onChange={f('paymentAmount')} />
                      </div>
                    </div>

                    {/* Info banner */}
                    <div className="flex gap-3 p-3 rounded-xl"
                      style={{ background: 'color-mix(in srgb, var(--color-brand) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--color-brand) 15%, transparent)' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-brand)' }} />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        উপরের নম্বরে ৳{MEMBERSHIP_FEE} পাঠান, তারপর আপনার নম্বর ও Transaction ID দিন।
                        Admin যাচাই করার পর সদস্যপদ সক্রিয় হবে।
                      </p>
                    </div>
                  </div>
                )}

                {/* ════ Step 4: Confirm ════ */}
                {step === 4 && (
                  <div className="space-y-4">

                    {/* Success banner */}
                    <div className="flex gap-3 p-4 rounded-2xl items-start"
                      style={{ background: 'color-mix(in srgb, #22c55e 8%, transparent)', border: '1.5px solid color-mix(in srgb, #22c55e 25%, transparent)' }}>
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#16a34a' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>সব তথ্য পর্যালোচনা করুন</p>
                        <p className="text-xs mt-0.5" style={{ color: '#166534' }}>
                          জমা দেওয়ার পর Admin যাচাই করবেন। অনুমোদন হলে SMS ও নোটিফিকেশন পাবেন।
                        </p>
                      </div>
                    </div>

                    {/* Summary table */}
                    <div className="rounded-xl overflow-hidden"
                      style={{ border: '1.5px solid var(--color-border)' }}>
                      {summaryRows.map(([label, value], i) => (
                        <div key={label}
                          className="flex justify-between items-center px-4 py-2.5 text-sm"
                          style={{
                            background: i % 2 === 0 ? 'var(--color-bg)' : 'var(--color-bg-secondary)',
                            borderBottom: i < summaryRows.length - 1 ? '1px solid var(--color-border)' : 'none',
                          }}>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                          <span className="font-semibold text-sm text-right" style={{ color: 'var(--color-text)' }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Photo & NID thumbnails if uploaded */}
                    {(photoPreview || nidPreview) && (
                      <div className="flex gap-3">
                        {photoPreview && (
                          <div className="flex-1">
                            <p className="text-xs mb-1.5 font-semibold uppercase tracking-wider"
                              style={{ color: 'var(--color-text-muted)' }}>প্রোফাইল ছবি</p>
                            <img src={photoPreview} alt="photo"
                              className="w-full h-20 object-cover rounded-xl"
                              style={{ border: '1.5px solid var(--color-border)' }} />
                          </div>
                        )}
                        {nidPreview && (
                          <div className="flex-1">
                            <p className="text-xs mb-1.5 font-semibold uppercase tracking-wider"
                              style={{ color: 'var(--color-text-muted)' }}>NID ছবি</p>
                            <img src={nidPreview} alt="nid"
                              className="w-full h-20 object-cover rounded-xl"
                              style={{ border: '1.5px solid var(--color-border)' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer Navigation */}
          <div className="px-5 py-4 flex gap-3"
            style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-card, var(--color-bg))' }}>
            {step > 1 && (
              <button type="button" onClick={prev} disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-[var(--color-bg-hover)]"
                style={{ border: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <ChevronLeft className="w-4 h-4" />
                আগে
              </button>
            )}

            {step < 4 ? (
              <button type="button" onClick={next}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all gradient-brand hover:opacity-90 active:scale-[0.98]">
                পরবর্তী
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all gradient-brand hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    চূড়ান্তভাবে জমা দিন
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}