'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

type Step = 'email' | 'otp' | 'password' | 'done';

const RESEND_COOLDOWN = 60;

export default function ForgotPasswordPage() {
  const [step, setStep]         = useState<Step>('email');
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Auto-advance when all 6 digits are filled
  useEffect(() => {
    if (step === 'otp' && otp.every(d => d !== '')) {
      setStep('password');
    }
  }, [otp, step]);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
      startCooldown();
      toast.success('If that email exists, a reset code has been sent.');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      if (err.response?.status >= 500) {
        toast.error('Something went wrong. Please try again.');
      } else {
        // Backend returns 200 even for unknown emails — still advance
        setStep('otp');
        startCooldown();
        toast.success('If that email exists, a reset code has been sent.');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } finally { setLoading(false); }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setOtp(['', '', '', '', '', '']);
      startCooldown();
      toast.success('New reset code sent!');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error(err.response?.data?.message || 'Please wait before requesting a new code.');
      } else {
        toast.error('Failed to resend. Please try again.');
      }
    } finally { setLoading(false); }
  };

  // ── Step 2 → 3: Continue ─────────────────────────────────────────────────
  const handleOtpContinue = () => {
    if (otp.some(d => d === '')) return toast.error('Enter the complete 6-digit code.');
    setStep('password');
  };

  // ── Step 3: Reset password ────────────────────────────────────────────────
  // Sends { email, otp, newPassword } — server verifies OTP + sets new password.
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6)  return toast.error('Password must be at least 6 characters.');
    if (password !== confirm)  return toast.error("Passwords don't match.");
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp:         otp.join(''),
        newPassword: password,
      });
      setStep('done');
      toast.success('Password reset successfully!');
    } catch (err: any) {
      const msg: string = err.response?.data?.message || 'Failed to reset password.';
      toast.error(msg);
      // Bad/expired OTP → send back to OTP entry
      if (/otp|code|expired|invalid/i.test(msg)) {
        setOtp(['', '', '', '', '', '']);
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } finally { setLoading(false); }
  };

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft'  && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    const nextEmpty = next.findIndex(d => d === '');
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // ── Step indicator ────────────────────────────────────────────────────────
  const steps     = ['Email', 'Enter OTP', 'New Password'];
  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-bg-secondary)' }}
    >
      <div className="w-full max-w-md">

        <Link
          href="/login"
          className="flex items-center gap-2 text-sm mb-6 w-fit"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
            {step === 'done' ? 'All Done!' : 'Reset Password'}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {step === 'email'    && 'Enter your email to receive a reset code'}
            {step === 'otp'      && `We sent a 6-digit code to ${email}`}
            {step === 'password' && 'Choose a strong new password'}
            {step === 'done'     && 'Your password has been reset successfully'}
          </p>
        </motion.div>

        {step !== 'done' && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${i < stepIndex  ? 'bg-green-500 text-white' :
                      i === stepIndex ? 'gradient-brand text-white' :
                      'bg-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                >
                  {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div className="w-6 h-px" style={{ background: 'var(--color-border)' }} />
                )}
              </div>
            ))}
          </div>
        )}

        <motion.div className="card shadow-card">
          <AnimatePresence mode="wait">

            {/* STEP 1: Email */}
            {step === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" required style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {loading
                    ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    : 'Send Reset Code'}
                </button>
              </motion.form>
            )}

            {/* STEP 2: OTP */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>

                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Code expires in 45 minutes. You can paste it directly.
                </p>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      onPaste={handleOtpPaste}
                      disabled={loading}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl transition-all"
                      style={{
                        borderColor: digit ? 'var(--color-brand)' : 'var(--color-border)',
                        padding: 0,
                        opacity: loading ? 0.6 : 1,
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleOtpContinue}
                  disabled={loading || otp.some(d => d === '')}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue
                </button>

                <div>
                  {cooldown > 0 ? (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Resend in{' '}
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--color-brand)' }}>
                        {cooldown}s
                      </span>
                    </p>
                  ) : (
                    <button onClick={handleResend} disabled={loading}
                      className="flex items-center gap-1.5 text-sm font-medium mx-auto transition-opacity hover:opacity-75"
                      style={{ color: 'var(--color-brand)' }}>
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setStep('email');
                    setOtp(['', '', '', '', '', '']);
                    if (timerRef.current) clearInterval(timerRef.current);
                    setCooldown(0);
                  }}
                  className="text-sm" style={{ color: 'var(--color-text-secondary)' }}
                >
                  ← Change email
                </button>
              </motion.div>
            )}

            {/* STEP 3: New Password */}
            {step === 'password' && (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSetPassword}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters" required
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {showPass
                        ? <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        : <Eye    className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type={showConf ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat new password" required
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {showConf
                        ? <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        : <Eye    className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                    </button>
                  </div>
                  {confirm && (
                    <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                      password === confirm ? 'text-green-500' : 'text-red-500'}`}>
                      {password === confirm
                        ? <><CheckCircle className="w-3 h-3" /> Passwords match</>
                        : '✕ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button type="button" onClick={() => setStep('otp')}
                  className="text-sm flex items-center gap-1"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  ← Re-enter code
                </button>

                <button
                  type="submit"
                  disabled={loading || password !== confirm || password.length < 6}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading
                    ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    : 'Set New Password'}
                </button>
              </motion.form>
            )}

            {/* STEP 4: Done */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <div>
                  <h2 className="font-semibold text-xl" style={{ color: 'var(--color-text)' }}>
                    Password Reset!
                  </h2>
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    You can now log in with your new password.
                  </p>
                </div>
                <Link href="/login" className="btn-primary px-8 py-2.5 inline-block mt-2">
                  Go to Login
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}