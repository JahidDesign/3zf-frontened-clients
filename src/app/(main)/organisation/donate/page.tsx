// organisation/donate/page.tsx — Complete Donation Form

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Heart, Gift, BookOpen, Users, CreditCard,
  Clock, Image as ImageIcon, ChevronRight, CheckCircle,
} from 'lucide-react';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
import PaymentGateway from '@/components/payment/PaymentGateway';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

// ─── Nav ─────────────────────────────────────────────────────────────────────
const navItems = [
  { label: 'Organisation', href: '/organisation',          icon: Users },
  { label: 'Donate',       href: '/organisation/donate',   icon: Heart },
  { label: 'Book Donation',href: '/organisation/books',    icon: BookOpen },
  { label: 'Pending',      href: '/organisation/pending',  icon: Clock },
  { label: 'Requests',     href: '/organisation/requests', icon: CreditCard },
  { label: 'Gallery',      href: '/organisation/gallery',  icon: ImageIcon },
];

// ─── Constants ───────────────────────────────────────────────────────────────
const AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const PURPOSES = [
  { id: 'general',   label: 'General',   icon: Heart,    color: '#E2136E' },
  { id: 'education', label: 'Education', icon: BookOpen, color: '#006A4E' },
  { id: 'relief',    label: 'Relief',    icon: Gift,     color: '#F05A28' },
];

const DIVISIONS = [
  'Dhaka','Chittagong','Rajshahi','Khulna',
  'Barisal','Sylhet','Rangpur','Mymensingh',
];

type FormData = {
  donorName:   string;
  phone:       string;
  email:       string;
  division:    string;
  district:    string;
  message:     string;
  isAnonymous: boolean;
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ['Category & Amount', 'Your Info', 'Payment'];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${i < current  ? 'gradient-brand text-white'
              : i === current ? 'gradient-brand text-white ring-4 ring-purple-200'
              : 'border-2 border-[var(--color-border)]'}`}
              style={i >= current ? { color: 'var(--color-text-secondary)' } : {}}>
              {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-[10px] font-medium whitespace-nowrap hidden sm:block"
              style={{ color: i === current ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 rounded transition-all"
              style={{ background: i < current ? 'var(--color-brand)' : 'var(--color-border)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DonatePage() {
  const { isAuthenticated, user } = useAuthStore();

  const [step,            setStep]            = useState(0);
  const [selectedPurpose, setSelectedPurpose] = useState('general');
  const [amount,          setAmount]          = useState(500);
  const [customAmount,    setCustomAmount]    = useState('');
  const [done,            setDone]            = useState(false);

  const finalAmount = customAmount ? Number(customAmount) : amount;
  const purposeLabel = PURPOSES.find(p => p.id === selectedPurpose)?.label ?? '';

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      donorName:   user?.name ?? '',
      phone:       user?.phone ?? '',
      email:       user?.email ?? '',
      isAnonymous: false,
    },
  });

  const isAnonymous = watch('isAnonymous');

  const onInfoSubmit = () => setStep(2);   // go to payment

  if (done) return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)] flex items-center justify-center min-h-[80vh] px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card text-center py-16 max-w-md w-full">
          <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Thank you!
          </h2>
          <p className="mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Your donation of{' '}
            <span className="font-bold" style={{ color: 'var(--color-brand)' }}>
              ৳{finalAmount.toLocaleString()}
            </span>{' '}
            was received.
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Category: {purposeLabel}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setDone(false); setStep(0); setCustomAmount(''); setAmount(500); }}
              className="btn-primary px-6 py-2.5">
              Donate Again
            </button>
            <Link href="/organisation" className="btn-ghost px-6 py-2.5">Dashboard</Link>
          </div>
        </motion.div>
      </div>
      <MainFooter />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      <div className="pt-[var(--navbar-height)]">
        {/* Hero */}
        <div className="gradient-brand text-white py-12 px-4 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="font-heading text-4xl font-bold mb-2">Make a Donation</h1>
          <p className="text-purple-100 text-lg">Your generosity changes lives. Every taka counts.</p>
        </div>

        {/* Sub-nav */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b shadow-sm"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
            <div className="flex items-center gap-1 py-2">
              {navItems.map(item => (
                <Link key={item.label} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                    ${item.label === 'Donate'
                      ? 'gradient-brand text-white shadow-brand'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-8">

          {/* Not logged in */}
          {!isAuthenticated ? (
            <div className="card text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <p className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Login to donate</p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Create an account to track your donations
              </p>
              <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
            </div>
          ) : (
            <>
              <StepBar current={step} />

              <AnimatePresence mode="wait">

                {/* ── STEP 0: Category & Amount ── */}
                {step === 0 && (
                  <motion.div key="step0"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-5">

                    {/* Purpose */}
                    <div className="card">
                      <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text)' }}>
                        Choose Category
                      </h2>
                      <div className="grid grid-cols-3 gap-3">
                        {PURPOSES.map(p => (
                          <button key={p.id} onClick={() => setSelectedPurpose(p.id)}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                            style={{
                              borderColor:  selectedPurpose === p.id ? p.color : 'var(--color-border)',
                              background:   selectedPurpose === p.id ? `${p.color}15` : 'var(--color-bg)',
                            }}>
                            <p.icon className="w-7 h-7" style={{ color: p.color }} />
                            <span className="text-xs font-medium"
                              style={{ color: selectedPurpose === p.id ? p.color : 'var(--color-text-secondary)' }}>
                              {p.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="card">
                      <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text)' }}>
                        Select Amount (৳)
                      </h2>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {AMOUNTS.map(a => (
                          <button key={a}
                            onClick={() => { setAmount(a); setCustomAmount(''); }}
                            className={`py-3 rounded-xl font-bold text-base border-2 transition-all
                              ${amount === a && !customAmount
                                ? 'gradient-brand text-white border-transparent shadow-brand'
                                : 'border-[var(--color-border)] hover:border-[var(--color-brand)]'}`}
                            style={{ color: amount === a && !customAmount ? undefined : 'var(--color-text)' }}>
                            ৳{a.toLocaleString()}
                          </button>
                        ))}
                      </div>

                      {/* Custom amount */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                          Custom Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg"
                            style={{ color: 'var(--color-brand)' }}>৳</span>
                          <input type="number" min="10" value={customAmount}
                            onChange={e => { setCustomAmount(e.target.value); setAmount(0); }}
                            placeholder="Enter any amount"
                            style={{ paddingLeft: '2.5rem', fontSize: '18px', fontWeight: 'bold' }} />
                        </div>
                      </div>

                      {/* Preview */}
                      {finalAmount > 0 && (
                        <div className="mt-4 p-4 rounded-xl text-center"
                          style={{ background: 'var(--color-bg-tertiary)' }}>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>You are donating</p>
                          <p className="font-heading text-3xl font-bold mt-1"
                            style={{ color: 'var(--color-brand)' }}>
                            ৳{finalAmount.toLocaleString()}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            for {purposeLabel}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      disabled={finalAmount < 10}
                      onClick={() => setStep(1)}
                      className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base">
                      Continue <ChevronRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                      Minimum donation ৳10
                    </p>
                  </motion.div>
                )}

                {/* ── STEP 1: Donor Info ── */}
                {step === 1 && (
                  <motion.div key="step1"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                    <form onSubmit={handleSubmit(onInfoSubmit)} className="card space-y-4">
                      <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                        Your Information
                      </h2>

                      {/* Anonymous toggle */}
                      <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-[var(--color-bg-hover)]"
                        style={{ borderColor: 'var(--color-border)' }}>
                        <input type="checkbox" {...register('isAnonymous')} className="w-4 h-4 accent-[var(--color-brand)]" />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          Donate anonymously
                        </span>
                      </label>

                      {!isAnonymous && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4">

                          {/* Name */}
                          <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                              Full Name *
                            </label>
                            <input {...register('donorName', { required: 'Name is required' })}
                              placeholder="Your full name" />
                            {errors.donorName && (
                              <p className="text-xs mt-1 text-red-500">{errors.donorName.message}</p>
                            )}
                          </div>

                          {/* Phone + Email */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                                Phone *
                              </label>
                              <input {...register('phone', {
                                required: 'Phone required',
                                pattern: { value: /^01[3-9]\d{8}$/, message: 'Invalid BD number' },
                              })}
                                placeholder="01XXXXXXXXX" />
                              {errors.phone && (
                                <p className="text-xs mt-1 text-red-500">{errors.phone.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                                Email
                              </label>
                              <input type="email" {...register('email')} placeholder="you@email.com" />
                            </div>
                          </div>

                          {/* Division */}
                          <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                              Division
                            </label>
                            <select {...register('division')}
                              style={{ color: 'var(--color-text)', background: 'var(--color-bg)' }}>
                              <option value="">Select division</option>
                              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>

                          {/* District */}
                          <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                              District
                            </label>
                            <input {...register('district')} placeholder="Your district" />
                          </div>
                        </motion.div>
                      )}

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                          Message <span style={{ color: 'var(--color-text-secondary)' }}>(optional)</span>
                        </label>
                        <textarea {...register('message')} rows={3}
                          placeholder="Leave a message with your donation…"
                          style={{ resize: 'none' }} />
                      </div>

                      {/* Summary */}
                      <div className="p-4 rounded-xl flex items-center justify-between"
                        style={{ background: 'var(--color-bg-tertiary)' }}>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Donating</p>
                          <p className="font-bold text-xl" style={{ color: 'var(--color-brand)' }}>
                            ৳{finalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Category</p>
                          <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{purposeLabel}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setStep(0)}
                          className="btn-ghost flex-1 py-3">
                          ← Back
                        </button>
                        <button type="submit" className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                          Proceed to Pay <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ── STEP 2: Payment ── */}
                {step === 2 && (
                  <motion.div key="step2"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <button onClick={() => setStep(1)}
                      className="btn-ghost mb-4 flex items-center gap-2 text-sm">
                      ← Change info
                    </button>
                    <PaymentGateway
                      amount={finalAmount}
                      purpose="donation"
                      customerPhone={user?.phone}
                      customerName={user?.name}
                      description={`Donation — ${purposeLabel}`}
                      onSuccess={() => setDone(true)}
                      onCancel={() => setStep(1)}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <MainFooter />
    </div>
  );
}