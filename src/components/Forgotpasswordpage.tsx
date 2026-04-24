'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/login" className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Forgot Password</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enter your email to receive a reset link</p>
          </div>

          {sent ? (
            <div className="card text-center py-10">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-semibold text-xl mb-2" style={{ color: 'var(--color-text)' }}>Email Sent!</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Check your inbox for the password reset link. It expires in 30 minutes.
              </p>
              <Link href="/login" className="btn-primary px-8 py-2.5">Back to Login</Link>
            </div>
          ) : (
            <div className="card">
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {loading
                    ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    : 'Send Reset Link'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}