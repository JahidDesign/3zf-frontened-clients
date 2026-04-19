'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, X, ExternalLink, Phone, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export type GatewayId = 'bkash' | 'nagad' | 'rocket' | 'szlm' | 'cod';

interface Gateway {
  id: GatewayId;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  numbers?: string[];
  processingTime: string;
  fee: string;
  supportManual: boolean;
}

export const GATEWAYS: Gateway[] = [
  {
    id: 'bkash',
    name: 'bKash',
    shortName: 'bKash',
    logo: '💳',
    color: '#E2136E',
    bgColor: '#fdf0f5',
    textColor: '#E2136E',
    borderColor: '#f8c5d8',
    description: "Bangladesh's largest mobile financial service",
    numbers: ['01XXXXXXXXX'],
    processingTime: 'Instant',
    fee: 'Free',
    supportManual: true,
  },
  {
    id: 'nagad',
    name: 'Nagad',
    shortName: 'Nagad',
    logo: '💰',
    color: '#F05A28',
    bgColor: '#fff5f1',
    textColor: '#F05A28',
    borderColor: '#fdd0bc',
    description: 'Digital financial service by Bangladesh Post Office',
    numbers: ['01XXXXXXXXX'],
    processingTime: 'Instant',
    fee: 'Free',
    supportManual: true,
  },
  {
    id: 'rocket',
    name: 'Rocket',
    shortName: 'Rocket',
    logo: '🚀',
    color: '#7B2D8B',
    bgColor: '#f8f0fa',
    textColor: '#7B2D8B',
    borderColor: '#e4c4ec',
    description: 'DBBL Mobile Banking service',
    numbers: ['018XXXXXXXX'],
    processingTime: 'Instant',
    fee: 'Free',
    supportManual: true,
  },
  {
    id: 'szlm',
    name: 'SureCash',
    shortName: 'SZLM',
    logo: '💸',
    color: '#006A4E',
    bgColor: '#f0f9f5',
    textColor: '#006A4E',
    borderColor: '#a3d4c0',
    description: 'SureCash by Rupali Bank — Secure digital payments',
    numbers: ['01XXXXXXXXX'],
    processingTime: 'Instant',
    fee: 'Free',
    supportManual: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    shortName: 'COD',
    logo: '💵',
    color: '#1a7a4a',
    bgColor: '#f0faf5',
    textColor: '#1a7a4a',
    borderColor: '#a7d9bc',
    description: 'Pay in cash when your order arrives',
    processingTime: 'On delivery',
    fee: 'Free',
    supportManual: false,
  },
];

interface PaymentGatewayProps {
  amount: number;
  purpose: 'order' | 'donation' | 'membership' | 'event';
  referenceId?: string;           // orderId, organisationId, etc.
  onSuccess?: (payment: any) => void;
  onCancel?: () => void;
  customerPhone?: string;
  customerName?: string;
  description?: string;
}

export default function PaymentGateway({
  amount, purpose, referenceId, onSuccess, onCancel,
  customerPhone, customerName, description,
}: PaymentGatewayProps) {
  const [selected, setSelected] = useState<GatewayId | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'manual' | 'processing' | 'success' | 'failed'>('select');
  const [manualTrxId, setManualTrxId] = useState('');
  const [manualPhone, setManualPhone] = useState(customerPhone || '');
  const [paymentData, setPaymentData] = useState<any>(null);

  const selectedGateway = GATEWAYS.find(g => g.id === selected);

  const handlePay = async () => {
    if (!selected) return toast.error('Select a payment method');
    setLoading(true);
    setStep('processing');

    try {
      const body: any = {
        gateway: selected,
        amount,
        purpose,
        customerPhone: customerPhone || manualPhone,
        customerName,
      };
      if (purpose === 'order') body.orderId = referenceId;
      if (purpose === 'donation') body.organisationId = referenceId;
      if (purpose === 'event') body.eventId = referenceId;

      const { data } = await api.post('/payments/initiate', body);

      if (data.success) {
        setPaymentData(data);

        if (selected === 'cod') {
          setStep('success');
          onSuccess?.(data.payment);
          return;
        }

        // Redirect to gateway
        const redirectURL = data.bkashURL || data.redirectURL || data.payment_url;
        if (redirectURL) {
          window.location.href = redirectURL;
          return;
        }

        // Fallback to manual if no redirect
        setStep('manual');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Payment initiation failed');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualTrxId.trim()) return toast.error('Enter transaction ID');
    setLoading(true);
    try {
      await api.post('/payments/manual-verify', {
        paymentId: paymentData?.payment?.paymentId,
        transactionId: manualTrxId,
        senderNumber: manualPhone,
      });
      setStep('success');
      toast.success('Payment submitted for verification!');
      onSuccess?.(paymentData?.payment);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Amount display */}
      <div className="card text-center py-5" style={{ background: 'var(--color-bg-tertiary)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Amount</p>
        <p className="font-heading text-4xl font-bold" style={{ color: 'var(--color-brand)' }}>
          ৳{amount.toLocaleString('en-BD')}
        </p>
        {description && <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
      </div>

      <AnimatePresence mode="wait">

        {/* STEP: SELECT GATEWAY */}
        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              Choose Payment Method
            </p>
            <div className="space-y-2">
              {GATEWAYS.map((gw) => (
                <button key={gw.id} onClick={() => setSelected(gw.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                  style={{
                    borderColor: selected === gw.id ? gw.color : 'var(--color-border)',
                    background: selected === gw.id ? gw.bgColor : 'var(--color-bg)',
                    boxShadow: selected === gw.id ? `0 0 0 4px ${gw.color}22` : 'none',
                  }}>
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
                    style={{ background: `${gw.color}18` }}>
                    {gw.logo}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-base" style={{ color: gw.color }}>{gw.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${gw.color}18`, color: gw.color }}>
                          {gw.processingTime}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                          {gw.fee}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {gw.description}
                    </p>
                    {gw.id !== 'cod' && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                          Auto redirect
                        </span>
                        {gw.supportManual && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium"
                            style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                            Manual TrxID
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Radio */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors`}
                    style={{ borderColor: selected === gw.id ? gw.color : 'var(--color-border)' }}>
                    {selected === gw.id && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: gw.color }} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Pay button */}
            <button onClick={handlePay} disabled={!selected || loading}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-4">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <>Pay ৳{amount.toLocaleString('en-BD')} via {selectedGateway?.shortName || '...'}</>
              }
            </button>

            {onCancel && (
              <button onClick={onCancel} className="w-full text-center text-sm mt-3 btn-ghost py-2">
                Cancel
              </button>
            )}
          </motion.div>
        )}

        {/* STEP: MANUAL PAYMENT INSTRUCTIONS */}
        {step === 'manual' && selectedGateway && (
          <motion.div key="manual" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4">
            <div className="card p-5 border-l-4" style={{ borderLeftColor: selectedGateway.color, background: selectedGateway.bgColor }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedGateway.logo}</span>
                <div>
                  <p className="font-bold text-lg" style={{ color: selectedGateway.color }}>{selectedGateway.name} Payment</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Follow steps below</p>
                </div>
              </div>

              {/* Step-by-step instructions */}
              <div className="space-y-3">
                {[
                  { step: 1, text: `Open your ${selectedGateway.name} app` },
                  { step: 2, text: 'Go to "Send Money" or "Payment"' },
                  { step: 3, text: `Send ৳${amount.toLocaleString('en-BD')} to our merchant number` },
                  { step: 4, text: 'Copy the Transaction ID (TrxID)' },
                  { step: 5, text: 'Paste it below and submit' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: selectedGateway.color }}>{s.step}</div>
                    <p className="text-sm pt-0.5" style={{ color: 'var(--color-text)' }}>{s.text}</p>
                  </div>
                ))}
              </div>

              {/* Merchant number */}
              {selectedGateway.numbers && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: `${selectedGateway.color}15` }}>
                  <p className="text-xs font-medium mb-1" style={{ color: selectedGateway.color }}>
                    {selectedGateway.name} Merchant Number
                  </p>
                  {selectedGateway.numbers.map(n => (
                    <p key={n} className="font-bold text-xl tracking-wider" style={{ color: selectedGateway.color }}>{n}</p>
                  ))}
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Reference: {paymentData?.payment?.paymentId}
                  </p>
                </div>
              )}
            </div>

            {/* TrxID input */}
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Your {selectedGateway.name} Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }} />
                  <input type="tel" value={manualPhone} onChange={e => setManualPhone(e.target.value)}
                    placeholder="01XXXXXXXXX" style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  Transaction ID (TrxID) *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--color-text-muted)' }} />
                  <input type="text" value={manualTrxId} onChange={e => setManualTrxId(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC1234567" style={{ paddingLeft: '2.5rem' }}
                    className="font-mono tracking-widest" />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Find TrxID in your {selectedGateway.name} transaction history
                </p>
              </div>

              <button onClick={handleManualVerify} disabled={loading || !manualTrxId.trim()}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  <CheckCircle className="w-4 h-4" /> Submit for Verification
                </>}
              </button>
              <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                ✅ Payments are verified within 1–2 hours. You'll be notified by notification.
              </p>
            </div>

            <button onClick={() => setStep('select')} className="btn-ghost w-full text-sm py-2">
              ← Choose different method
            </button>
          </motion.div>
        )}

        {/* STEP: PROCESSING */}
        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card text-center py-14">
            <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <p className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>
              Connecting to {selectedGateway?.name}...
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              You'll be redirected to complete your payment. Please don't close this window.
            </p>
          </motion.div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-14">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <p className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {selected === 'cod' ? 'Order Placed!' : 'Payment Submitted!'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {selected === 'cod'
                ? 'Your order is confirmed. Pay when it arrives.'
                : 'Your payment is being verified. You\'ll be notified once confirmed.'}
            </p>
            <p className="text-xs px-4 py-2 rounded-xl inline-block font-mono"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
              Ref: {paymentData?.payment?.paymentId}
            </p>
          </motion.div>
        )}

        {/* STEP: FAILED */}
        {step === 'failed' && (
          <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="card text-center py-14">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-14 h-14 text-red-500" />
            </div>
            <p className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Payment Failed</p>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Something went wrong. Please try again or choose a different payment method.
            </p>
            <button onClick={() => { setStep('select'); setSelected(null); setPaymentData(null); }}
              className="btn-primary px-8 py-3">
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
