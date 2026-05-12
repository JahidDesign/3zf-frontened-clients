'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, User, Mail, Lock, Phone,
  Camera, ArrowRight, CheckCircle, RefreshCw,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

/* ─── Validation schema ─────────────────────────────────────────────────── */
const schema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email address'),
  confirmEmail:    z.string().email('Invalid email address'),
  phone:           z.string().min(10, 'Phone number is required'),
  password:        z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.email === d.confirmEmail, {
  message: "Email addresses don't match",
  path: ['confirmEmail'],
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const RESEND_COOLDOWN_SEC = 60;
const OTP_LENGTH          = 6;

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const router      = useRouter();
  const { setAuth } = useAuthStore();

  const [step,            setStep]            = useState<'form' | 'otp'>('form');
  const [loading,         setLoading]         = useState(false);
  const [resendLoading,   setResendLoading]   = useState(false);
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [otp,             setOtp]             = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [avatar,          setAvatar]          = useState<string | null>(null);
  const [resendCooldown,  setResendCooldown]  = useState(0);
  const [displayEmail,    setDisplayEmail]    = useState('');

  const fileRef        = useRef<HTMLInputElement>(null);
  const otpRefs        = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const isVerifyingRef = useRef(false);
  const userIdRef      = useRef<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  /* ── Cleanup on unmount ─────────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  /* ── Focus first OTP box when step changes to otp ──────────────────── */
  useEffect(() => {
    if (step === 'otp') {
      // Small delay to let AnimatePresence finish rendering
      const t = setTimeout(() => otpRefs.current[0]?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [step]);

  /* ── Cooldown timer ─────────────────────────────────────────────────── */
  const startCooldown = useCallback((seconds = RESEND_COOLDOWN_SEC) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /* ── Transition to OTP step ─────────────────────────────────────────── */
  const transitionToOtp = useCallback((userId: string, email: string, cooldownSec?: number) => {
    userIdRef.current = userId;

    flushSync(() => {
      setDisplayEmail(email);
      setOtp(Array(OTP_LENGTH).fill(''));
    });

    setStep('otp');
    startCooldown(cooldownSec ?? RESEND_COOLDOWN_SEC);
  }, [startCooldown]);

  /* ── Go back to form ────────────────────────────────────────────────── */
  const goBackToForm = useCallback(() => {
    userIdRef.current      = '';
    isVerifyingRef.current = false;

    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }

    flushSync(() => {
      setOtp(Array(OTP_LENGTH).fill(''));
      setDisplayEmail('');
      setResendCooldown(0);
    });

    setStep('form');
  }, []);

  /* ── Step 1: Register ───────────────────────────────────────────────── */
  const onSubmit = async (data: FormData) => {
    if (loading) return;
    setLoading(true);

    try {
      const { confirmEmail: _ce, confirmPassword: _cp, ...registerData } = data;
      const res = await api.post('/auth/register', { ...registerData, avatar });

      if (res.data.success) {
        transitionToOtp(res.data.userId, data.email);
        toast.success(
          res.data.resent
            ? 'OTP resent — finish verifying your existing session.'
            : 'OTP sent to your email!',
        );
      }
    } catch (err: any) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        const isPhoneConflict = message?.toLowerCase().includes('phone') ?? false;
        if (isPhoneConflict) {
          toast.error(message || 'This phone number is already registered.');
        } else {
          toast(
            (t) => (
              <span className="flex items-center gap-2">
                <span>{message || 'Email already registered.'}</span>
                <button
                  onClick={() => { router.push('/login'); toast.dismiss(t.id); }}
                  className="underline font-semibold whitespace-nowrap"
                >
                  Sign in →
                </button>
              </span>
            ),
            { duration: 6000, icon: '⚠️' },
          );
        }
      } else if (status === 429) {
        const waitSec = err.response?.data?.waitSec;
        const uid     = err.response?.data?.userId;

        if (uid) {
          transitionToOtp(uid, data.email, waitSec ?? RESEND_COOLDOWN_SEC);
          toast.error(message || 'OTP already sent. Please wait before requesting a new one.');
        } else {
          toast.error(message || 'Too many attempts. Please try again later.');
        }
      } else {
        toast.error(message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ─────────────────────────────────────────────── */
  const verifyOtp = useCallback(async (otpString: string) => {
    if (isVerifyingRef.current) return;

    if (otpString.length !== OTP_LENGTH) {
      toast.error('Enter the complete 6-digit code');
      return;
    }

    const currentUserId = userIdRef.current;
    if (!currentUserId) {
      toast.error('Session lost. Please register again.');
      goBackToForm();
      return;
    }

    isVerifyingRef.current = true;
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { userId: currentUserId, otp: otpString });
      if (res.data.success) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        toast.success('Account verified! Welcome to 3ZF 🎉');
        router.push('/community');
      }
    } catch (err: any) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 410) {
        toast.error('OTP has expired. Please request a new one.');
      } else if (status === 429) {
        toast.error('Too many attempts. Please wait before retrying.');
      } else {
        toast.error(message || 'Invalid OTP. Please try again.');
      }

      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
      isVerifyingRef.current = false;
    }
  }, [router, setAuth, goBackToForm]);

  /* ── OTP input handlers ─────────────────────────────────────────────── */
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1)     return;
    if (!/^\d*$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && index > 0)              otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();

    // Enter key submits if all digits filled
    if (e.key === 'Enter') {
      const filled = otp.join('');
      if (filled.length === OTP_LENGTH) verifyOtp(filled);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setOtp(next);

    const nextEmpty  = next.findIndex(d => d === '');
    const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    otpRefs.current[focusIndex]?.focus();
  };

  /* ── Resend OTP ─────────────────────────────────────────────────────── */
  const resendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    const currentUserId = userIdRef.current;
    if (!currentUserId) {
      toast.error('Session lost. Please register again.');
      goBackToForm();
      return;
    }

    setResendLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { userId: currentUserId });
      if (res.data.success) {
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        startCooldown();
        toast.success('New OTP sent! Check your email.');
      }
    } catch (err: any) {
      const status  = err.response?.status;
      const message = err.response?.data?.message;
      const waitSec = err.response?.data?.waitSec;

      if (status === 429) {
        if (waitSec) startCooldown(waitSec);
        toast.error(message || 'Too many resend requests. Please wait.');
      } else if (status === 404) {
        toast.error('Session expired. Please register again.');
        goBackToForm();
      } else {
        toast.error(message || 'Failed to resend OTP. Try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  /* ── Avatar ─────────────────────────────────────────────────────────── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-bg-secondary)' }}
    >
      <div className="w-full max-w-md">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-xl">
              3Z
            </div>
            <span className="font-heading font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
              3ZF Platform
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            {step === 'form' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {step === 'form'
              ? 'Join the 3ZF community today'
              : `Enter the 6-digit code sent to ${displayEmail}`}
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {['Account Info', 'Verify OTP'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i === 0 && step === 'form' ? 'gradient-brand text-white' :
                  i === 0 && step === 'otp'  ? 'bg-green-500 text-white' :
                  i === 1 && step === 'otp'  ? 'gradient-brand text-white' :
                  'bg-[var(--color-border)] text-[var(--color-text-muted)]'}`}>
                {i === 0 && step === 'otp' ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
                {s}
              </span>
              {i < 1 && <div className="w-8 h-px" style={{ background: 'var(--color-border)' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div className="card shadow-card">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Registration form ─────────────────────────────── */}
            {step === 'form' ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Avatar */}
                <div className="flex justify-center mb-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden group border-2 border-dashed transition-colors hover:border-[var(--color-brand)]"
                    style={{ borderColor: 'var(--color-border)' }}
                    aria-label="Upload profile photo"
                  >
                    {avatar
                      ? <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                      : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center gap-1"
                          style={{ background: 'var(--color-bg-tertiary)' }}
                        >
                          <Camera className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Photo</span>
                        </div>
                      )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Your full name"
                      autoComplete="name"
                      {...register('name')}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      {...register('email')}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Confirm Email */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Confirm Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="email"
                      placeholder="Re-enter your email"
                      autoComplete="off"
                      {...register('confirmEmail')}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  {errors.confirmEmail && <p className="text-red-500 text-xs mt-1">{errors.confirmEmail.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="tel"
                      placeholder="+880 1XXXXXXXXX"
                      autoComplete="tel"
                      {...register('phone')}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      {...register('password')}
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass
                        ? <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        : <Eye    className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      aria-label={showConfirmPass ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPass
                        ? <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        : <Eye    className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>

            ) : (

              /* ── STEP 2: OTP verification ──────────────────────────────── */
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-white" />
                </div>

                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {displayEmail}
                  </span>
                  . Enter it below to verify your account.
                  <br />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Code expires in 45 minutes.
                  </span>
                </p>

                {/* OTP inputs */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e  => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      disabled={loading}
                      aria-label={`OTP digit ${i + 1}`}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl transition-all"
                      style={{
                        borderColor: digit ? 'var(--color-brand)' : 'var(--color-border)',
                        padding:     0,
                        opacity:     loading ? 0.6 : 1,
                      }}
                    />
                  ))}
                </div>

                {/* Submit button */}
                <button
                  onClick={() => verifyOtp(otp.join(''))}
                  disabled={loading || otp.join('').length !== OTP_LENGTH}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Spinner /> : <>Verify &amp; Continue <ArrowRight className="w-4 h-4" /></>}
                </button>

                {/* Resend */}
                <div className="flex flex-col items-center gap-1">
                  {resendCooldown > 0 ? (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Resend OTP in{' '}
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--color-brand)' }}>
                        {resendCooldown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={resendOtp}
                      disabled={resendLoading}
                      className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-75 disabled:opacity-50"
                      style={{ color: 'var(--color-brand)' }}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                      {resendLoading ? 'Sending…' : 'Resend OTP'}
                    </button>
                  )}
                </div>

                <button
                  onClick={goBackToForm}
                  disabled={loading}
                  className="text-sm transition-opacity hover:opacity-75 disabled:opacity-40"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ← Change email address
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign-in link */}
          {step === 'form' && (
            <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Already have an account?{' '}
                <Link href="/login" className="font-semibold" style={{ color: 'var(--color-brand)' }}>
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}