'use client';

import { Suspense } from 'react'; // Crucial import
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

// 1. Move the logic into a content component
function PaymentContent() {
  const params = useSearchParams();
  const trxId = params.get('trxId');
  const gateway = params.get('gateway');

  const gatewayLabels: Record<string, string> = {
    bkash: 'bKash', 
    nagad: 'Nagad', 
    rocket: 'Rocket', 
    szlm: 'SureCash',
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="card max-w-md w-full text-center py-14">
      <div className="w-28 h-28 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        Payment Successful!
      </h1>
      <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        Your {gateway ? gatewayLabels[gateway] || gateway : ''} payment has been confirmed.
      </p>
      {trxId && (
        <div className="my-4 px-4 py-2.5 rounded-xl inline-block" style={{ background: 'var(--color-bg-tertiary)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Transaction ID</p>
          <p className="font-mono font-bold text-sm" style={{ color: 'var(--color-text)' }}>{trxId}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link href="/supershop/orders" className="btn-primary px-6 py-3 flex items-center justify-center gap-2">
          <ShoppingBag className="w-4 h-4" /> View Orders
        </Link>
        <Link href="/" className="btn-secondary px-6 py-3 flex items-center justify-center gap-2">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </motion.div>
  );
}

// 2. The main Page export wraps the content in Suspense
export default function PaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg-secondary)' }}>
      <Suspense fallback={<div className="text-center py-10">Initializing payment...</div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}