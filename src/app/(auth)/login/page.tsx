'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useT } from '@/hooks/useT';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { t } = useT();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      if (res.data.success) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        toast.success(t.auth.welcomeBack);
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.common.error);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-xl">3Z</div>
              <span className="font-heading font-bold text-2xl" style={{ color: 'var(--color-text)' }}>3ZF</span>
            </Link>
            <LanguageSwitcher variant="badge" />
          </div>
          <h1 className="font-heading text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{t.auth.login}</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t.auth.noAccount}{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--color-brand)' }}>{t.auth.signUp}</Link>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                <input type="email" placeholder="your@email.com" {...register('email')} style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{t.auth.password}</label>
                <Link href="/password" className="text-xs font-medium" style={{ color: 'var(--color-brand)' }}>{t.auth.forgotPassword}</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" {...register('password')}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {showPass ? <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
              {loading ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <>{t.auth.login} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t.auth.noAccount}{' '}
              <Link href="/register" className="font-semibold" style={{ color: 'var(--color-brand)' }}>{t.auth.signUp}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
