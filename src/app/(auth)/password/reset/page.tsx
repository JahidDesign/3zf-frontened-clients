'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Reset Password</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enter your new password</p>
          </div>
          <div className="card">
            <form onSubmit={submit} className="space-y-4">
              {[
                { label: 'New Password',     value: password, setter: setPassword },
                { label: 'Confirm Password', value: confirm,  setter: setConfirm  },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{f.label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={f.value}
                      onChange={e => f.setter(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    />
                    {i === 0 && (
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {showPass
                          ? <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                          : <Eye    className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : 'Reset Password'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}