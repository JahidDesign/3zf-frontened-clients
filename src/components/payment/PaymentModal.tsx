'use client';

import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  X, ChevronRight, ChevronLeft, Upload, CheckCircle,
  Copy, Phone, AlertCircle, Loader2
} from 'lucide-react';

interface PaymentModalProps {
  amount: number;
  type: 'order' | 'donation' | 'membership';
  refId?: string;
  description?: string;
  onSuccess?: (payment: any) => void;
  onClose: () => void;
}

type Step = 'select' | 'instructions' | 'submit' | 'done';

const METHOD_META: Record<string, { emoji: string; ussd: string; appName: string }> = {
  bkash:  { emoji: '💳', ussd: '*247#', appName: 'bKash App' },
  nagad:  { emoji: '💰', ussd: '*167#', appName: 'Nagad App' },
  rocket: { emoji: '🚀', ussd: '*322#', appName: 'Rocket App' },
  bank:   { emoji: '🏦', ussd: '',       appName: 'Internet Banking' },
};

export function PaymentModal({ amount, type, refId, description, onSuccess, onClose }: PaymentModalProps) {
  const [step, setStep]         = useState<Step>('select');
  const [method, setMethod]     = useState<string>('');
  const [trxId, setTrxId]       = useState('');
  const [sender, setSender]     = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copied, setCopied]     = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () => api.get('/payments/config').then(r => r.data.config),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('amount', String(amount));
      fd.append('method', method);
      fd.append('senderNumber', sender);
      fd.append('transactionId', trxId);
      if (refId) fd.append('refId', refId);
      if (screenshot) fd.append('screenshot', screenshot);
      return api.post('/payments/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      setStep('done');
      onSuccess?.(res.data.payment);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'জমা ব্যর্থ হয়েছে'),
  });

  const copyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    toast.success('নম্বর কপি হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedConfig = configData?.[method];
  const meta = method ? METHOD_META[method] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            {step !== 'select' && step !== 'done' && (
              <button onClick={() => setStep(step === 'submit' ? 'instructions' : 'select')}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                {step === 'select' && 'পেমেন্ট পদ্ধতি বেছে নিন'}
                {step === 'instructions' && `${selectedConfig?.name} দিয়ে পাঠান`}
                {step === 'submit' && 'পেমেন্ট তথ্য জমা দিন'}
                {step === 'done' && 'পেমেন্ট জমা সফল!'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">মোট: <span className="font-bold text-gray-900 dark:text-white">৳{amount.toLocaleString()}</span></p>
            </div>
          </div>
          {step !== 'done' && (
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        <div className="p-5">
          {/* STEP 1: Select method */}
          {step === 'select' && (
            <div className="space-y-3">
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">{description}</p>
              )}

              {configLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : (
                Object.entries(configData || {}).map(([key, cfg]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => { setMethod(key); setStep('instructions'); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
                  >
                    {/* Method icon / logo */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: cfg.lightColor }}>
                      <span className="text-3xl">{METHOD_META[key]?.emoji}</span>
                    </div>

                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900 dark:text-white">{cfg.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cfg.merchantType}</p>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1">{cfg.merchantNumber}</p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition shrink-0" />
                  </button>
                ))
              )}

              <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 mt-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  পেমেন্ট করার পর TrxID এবং স্ক্রিনশট জমা দিন। অ্যাডমিন যাচাই করার পর অর্ডার নিশ্চিত হবে।
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Instructions */}
          {step === 'instructions' && selectedConfig && meta && (
            <div className="space-y-4">
              {/* Gateway banner */}
              <div className="rounded-2xl p-5 text-white text-center" style={{ background: selectedConfig.color }}>
                <p className="text-4xl mb-2">{meta.emoji}</p>
                <p className="font-bold text-xl">{selectedConfig.name}</p>
                <p className="text-white/80 text-sm mt-1">{meta.appName} {meta.ussd && `অথবা ${meta.ussd}`}</p>
              </div>

              {/* Merchant number */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">মার্চেন্ট নম্বরে পাঠান</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-mono font-bold text-xl text-gray-900 dark:text-white tracking-widest">
                      {selectedConfig.merchantNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => copyNumber(selectedConfig.merchantNumber)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition font-medium"
                    style={{ background: selectedConfig.lightColor, color: selectedConfig.color }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'কপি!' : 'কপি'}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">পাঠানোর পরিমাণ</p>
                <p className="font-bold text-2xl text-gray-900 dark:text-white">৳{amount.toLocaleString()}</p>
              </div>

              {/* Step-by-step instructions */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">ধাপে ধাপে নির্দেশনা:</p>
                {selectedConfig.instructions.map((instruction: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5"
                      style={{ background: selectedConfig.color }}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{instruction}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('submit')}
                className="w-full py-3 rounded-xl font-bold text-white transition active:scale-95 mt-2"
                style={{ background: selectedConfig.color }}
              >
                পেমেন্ট করলাম, এগিয়ে যাই →
              </button>
            </div>
          )}

          {/* STEP 3: Submit details */}
          {step === 'submit' && selectedConfig && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                <span className="text-lg">{meta?.emoji}</span>
                <span>{selectedConfig.name} — ৳{amount.toLocaleString()} পাঠানোর তথ্য জমা দিন</span>
              </div>

              {/* Sender number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  আপনার {selectedConfig.name} নম্বর *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={sender}
                    onChange={e => setSender(e.target.value)}
                    className="input pl-10"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                  />
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Transaction ID (TrxID) *
                </label>
                <input
                  value={trxId}
                  onChange={e => setTrxId(e.target.value.toUpperCase())}
                  className="input font-mono tracking-widest"
                  placeholder="e.g. ABC1234567"
                />
                <p className="text-xs text-gray-400 mt-1">পেমেন্ট সফল হলে SMS-এ TrxID পাবেন</p>
              </div>

              {/* Screenshot upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  পেমেন্ট স্ক্রিনশট (ঐচ্ছিক, তবে যাচাই দ্রুত হয়)
                </label>
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
                    screenshot
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                    {screenshotPreview ? (
                      <div className="relative">
                        <img src={screenshotPreview} alt="Screenshot" className="max-h-40 mx-auto rounded-lg object-contain" />
                        <button type="button" onClick={e => { e.preventDefault(); setScreenshot(null); setScreenshotPreview(''); }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center text-xs">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">ছবি আপলোড করুন</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setScreenshot(f); setScreenshotPreview(URL.createObjectURL(f)); }
                  }} />
                </label>
              </div>

              <button
                onClick={() => submitMutation.mutate()}
                disabled={!sender.trim() || !trxId.trim() || submitMutation.isPending}
                className="w-full py-3 rounded-xl font-bold text-white transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: selectedConfig.color }}
              >
                {submitMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> জমা হচ্ছে...</>
                ) : (
                  'পেমেন্ট জমা দিন ✓'
                )}
              </button>
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">পেমেন্ট জমা সফল!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  আপনার পেমেন্ট যাচাইয়ের জন্য পাঠানো হয়েছে।<br />
                  অ্যাডমিন নিশ্চিত করলে SMS/নোটিফিকেশন পাবেন।
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">পরিমাণ</span>
                  <span className="font-bold text-gray-900 dark:text-white">৳{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">মাধ্যম</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{selectedConfig?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">অবস্থা</span>
                  <span className="badge badge-orange">যাচাই চলছে</span>
                </div>
              </div>
              <button onClick={onClose} className="btn-primary w-full py-3">ঠিক আছে</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
