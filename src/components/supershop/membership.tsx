'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, XCircle, Copy, Check,
  ShieldCheck, Truck, Star, Zap, Mail,
  ChevronRight, Upload, X, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

const SEND_NUMBER = '01734166488';

const BENEFITS = [
  { icon: Star,        label: 'বিশেষ সদস্য ছাড়' },
  { icon: ShieldCheck, label: 'প্রিমিয়াম সাপোর্ট' },
  { icon: Zap,         label: 'আর্লি অ্যাক্সেস' },
  { icon: Truck,       label: 'ফ্রি ডেলিভারি' },
  { icon: Mail,        label: 'নিউজলেটার' },
];

const PAYMENT_METHODS = [
  { key: 'bkash',  label: 'bKash',  color: '#E2136E', emoji: '📱' },
  { key: 'nagad',  label: 'Nagad',  color: '#F4831F', emoji: '🔶' },
  { key: 'rocket', label: 'Rocket', color: '#8B1FA8', emoji: '🚀' },
];

type Status = 'idle' | 'pending' | 'approved' | 'rejected';

export default function ShopMembershipPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [config,        setConfig]        = useState<any>(null);
  const [membership,    setMembership]    = useState<any>(null);
  const [status,        setStatus]        = useState<Status>('idle');
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [preview,       setPreview]       = useState<string | null>(null);
  const [payMethod,     setPayMethod]     = useState('bkash');

  const [form, setForm] = useState({
    name:          '',
    phone:         '',
    email:         '',
    city:          '',
    address:       '',
    whichNumber:   '',   // which number they sent from
    paymentAmount: '',
    transactionId: '',
    paymentMethod: 'bkash',
  });
  const [file, setFile] = useState<File | null>(null);

  /* ─── redirect if not authenticated ─── */
  useEffect(() => {
    if (!isAuthenticated) { router.push('/login?redirect=/supershop/membership'); return; }
    Promise.all([
      api.get('/supershop-membership/config'),
      api.get('/supershop-membership/my'),
    ]).then(([cfg, mem]) => {
      setConfig(cfg.data);
      if (mem.data.member) {
        setMembership(mem.data.member);
        setStatus(mem.data.member.status as Status);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  /* pre-fill name / email from user store */
  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: user.name || '', email: user.email || '' }));
  }, [user]);

  const copyNumber = () => {
    navigator.clipboard.writeText(SEND_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    const required = ['name', 'phone', 'whichNumber', 'paymentAmount', 'transactionId'] as const;
    for (const k of required) {
      if (!form[k].trim()) return toast.error(`${k} is required`);
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries({ ...form, paymentMethod: payMethod }).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('profilePhoto', file);
      const { data } = await api.post('/supershop-membership/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMembership(data.member);
      setStatus('pending');
      toast.success('আবেদন সফলভাবে জমা হয়েছে!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'আবেদন ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── status screens ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)' }}>
        <MainNavbar />
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const StatusBanner = () => {
    if (status === 'pending') return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(234,179,8,0.12)' }}>
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            আবেদন পর্যালোচনায়
          </h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            আপনার সদস্যতা আবেদন জমা হয়েছে। অ্যাডমিন অনুমোদন করার পর আপনাকে নোটিফিকেশন দেওয়া হবে।
          </p>
          {membership?.transactionId && (
            <div className="card text-left mb-4">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Transaction ID</p>
              <p className="font-mono font-medium" style={{ color: 'var(--color-text)' }}>{membership.transactionId}</p>
            </div>
          )}
          <button onClick={() => router.push('/')} className="btn-secondary text-sm">হোমে যান</button>
        </motion.div>
      </div>
    );

    if (status === 'approved') return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            অভিনন্দন! আপনি সদস্য
          </h2>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            আপনার সদস্যতা অনুমোদিত হয়েছে।
          </p>
          {membership?.memberId && (
            <div className="inline-block px-5 py-2 rounded-full gradient-brand text-white text-sm font-mono font-bold mb-6 shadow-brand">
              {membership.memberId}
            </div>
          )}
          <br />
          <button onClick={() => router.push('/supershop')}
            className="gradient-brand text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-brand hover:opacity-90 transition-opacity">
            শপে যান →
          </button>
        </motion.div>
      </div>
    );

    if (status === 'rejected') return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>আবেদন প্রত্যাখ্যাত</h2>
          {membership?.adminNote && (
            <div className="card mb-4 text-left">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>কারণ</p>
              <p className="text-sm" style={{ color: 'var(--color-text)' }}>{membership.adminNote}</p>
            </div>
          )}
          <button onClick={() => setStatus('idle')}
            className="gradient-brand text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-brand hover:opacity-90 transition-opacity">
            আবার আবেদন করুন
          </button>
        </motion.div>
      </div>
    );

    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="gradient-brand text-white py-10 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-lg mx-auto">
            <div className="text-4xl mb-3">🛍️</div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Supershop সদস্যতা</h1>
            <p className="text-purple-100 text-sm">মাত্র ৳{config?.membershipFee || 200} — বার্ষিক সদস্যতা</p>
          </div>
        </div>

        {/* Status screens */}
        {status !== 'idle' ? (
          <StatusBanner />
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

            {/* Benefits strip */}
            <div className="card">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>সদস্যতার সুবিধা</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {BENEFITS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                    style={{ background: 'var(--color-bg-secondary)' }}>
                    <span className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </span>
                    <span className="text-xs leading-tight" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1 – Pay */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>পেমেন্ট করুন</h3>
              </div>

              {/* Payment method tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.key} onClick={() => setPayMethod(m.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                      ${payMethod === m.key ? 'text-white shadow-sm' : ''}`}
                    style={{
                      background: payMethod === m.key ? m.color : 'var(--color-bg-secondary)',
                      color: payMethod === m.key ? 'white' : 'var(--color-text-secondary)',
                    }}>
                    <span className="text-base">{m.emoji}</span> {m.label}
                  </button>
                ))}
              </div>

              {/* Send to number */}
              <div className="rounded-xl p-4 flex items-center justify-between gap-3 mb-3"
                style={{ background: 'var(--color-bg-secondary)', border: '1px dashed var(--color-border)' }}>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Send Money করুন এই নম্বরে</p>
                  <p className="font-mono font-bold text-lg tracking-widest" style={{ color: 'var(--color-text)' }}>{SEND_NUMBER}</p>
                </div>
                <button onClick={copyNumber}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ background: copied ? 'rgba(16,185,129,0.12)' : 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </button>
              </div>

              <div className="flex items-start gap-2 text-xs p-3 rounded-lg"
                style={{ background: 'rgba(234,179,8,0.08)', color: 'var(--color-text-secondary)' }}>
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                Amount: ৳{config?.membershipFee || 200} | Send Money option ব্যবহার করুন
              </div>
            </div>

            {/* Step 2 – Fill form */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>তথ্য পূরণ করুন</h3>
              </div>

              <div className="space-y-4">
                {/* Row: Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      পূর্ণ নাম <span className="text-red-500">*</span>
                    </label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="আপনার নাম" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      ফোন নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX" type="tel" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>ইমেইল</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com" type="email" />
                </div>

                {/* Row: City + Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>শহর / জেলা</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="ঢাকা" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>ঠিকানা</label>
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="বিস্তারিত ঠিকানা" />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    পেমেন্ট তথ্য
                  </p>
                </div>

                {/* Which number sent from */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    যে নম্বর থেকে পাঠিয়েছেন <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.whichNumber}
                    onChange={e => setForm(f => ({ ...f, whichNumber: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    type="tel"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    আপনার {PAYMENT_METHODS.find(m => m.key === payMethod)?.label || 'মোবাইল'} নম্বর লিখুন
                  </p>
                </div>

                {/* Amount + TrxID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      পরিশোধিত পরিমাণ (৳) <span className="text-red-500">*</span>
                    </label>
                    <input value={form.paymentAmount} onChange={e => setForm(f => ({ ...f, paymentAmount: e.target.value }))}
                      placeholder={String(config?.membershipFee || 200)} type="number" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input value={form.transactionId} onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                      placeholder="TrxID123456" className="font-mono" />
                  </div>
                </div>

                {/* Profile photo upload */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                    প্রোফাইল ছবি (ঐচ্ছিক)
                  </label>
                  {preview ? (
                    <div className="relative w-20 h-20">
                      <img src={preview} alt="Preview" className="w-20 h-20 rounded-xl object-cover" style={{ border: '2px solid var(--color-border)' }} />
                      <button onClick={() => { setPreview(null); setFile(null); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full py-4 rounded-xl border-dashed flex flex-col items-center gap-2 transition-colors hover:bg-[var(--color-bg-hover)]"
                      style={{ border: '1.5px dashed var(--color-border)' }}>
                      <Upload className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>ছবি আপলোড করুন</span>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-xl gradient-brand text-white font-bold text-base
                         flex items-center justify-center gap-2 hover:opacity-90 transition-opacity
                         disabled:opacity-60 shadow-brand"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  জমা হচ্ছে...
                </span>
              ) : (
                <>আবেদন জমা দিন <ChevronRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="text-center text-xs pb-4" style={{ color: 'var(--color-text-muted)' }}>
              আবেদন যাচাইয়ের পর ২৪ ঘণ্টার মধ্যে অনুমোদন দেওয়া হবে
            </p>
          </div>
        )}
      </div>
      <MainFooter />
    </div>
  );
}