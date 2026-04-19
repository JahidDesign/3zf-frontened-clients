'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight, Home } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function PaymentFailedPage() {
  const params = useSearchParams();
  const reason = params.get('reason') || params.get('error') || 'Payment was not completed';
  const { t } = useT();
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-secondary)' }}>
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        className="card max-w-md w-full text-center py-14">
        <div className="w-28 h-28 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="font-heading text-3xl font-bold mb-2" style={{ color:'var(--color-text)' }}>{t.payment.failed}</h1>
        <p className="mb-6" style={{ color:'var(--color-text-secondary)' }}>
          {reason === 'cancel' ? 'You cancelled the payment.' : reason === 'failure' ? 'Gateway declined the payment.' : reason}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/supershop/cart" className="btn-primary px-6 py-3 flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" /> {t.payment.tryAgain}
          </Link>
          <Link href="/" className="btn-secondary px-6 py-3 flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> {t.nav.home}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
