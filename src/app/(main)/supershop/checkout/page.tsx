'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import  MainNavbar  from '@/components/layout/Navbar';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { ShoppingBag, MapPin, ChevronRight, Truck, Shield } from 'lucide-react';
import { useT } from '@/lib/i19n';

// Reuse cart store
interface CartItem { _id: string; name: string; price: number; discountPrice?: number; images: any[]; quantity: number; }
const useCart = create<{ items: CartItem[]; clear: () => void }>()(
  persist(
    (set) => ({
      items: [],
      clear: () => set({ items: [] }),
    }),
    { name: '3zf-cart' }
  )
);

const shippingSchema = z.object({
  name:       z.string().min(2),
  phone:      z.string().min(11),
  address:    z.string().min(5),
  city:       z.string().min(2),
  district:   z.string().min(2),
  postalCode: z.string().optional(),
});
type ShippingForm = z.infer<typeof shippingSchema>;

export default function CheckoutPage() {
  const t = useT();
  const router  = useRouter();
  const { items: cartItems, clear } = useCart();
  const [orderId, setOrderId]     = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [orderStep, setOrderStep] = useState<'shipping' | 'payment' | 'done'>('shipping');

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
  });

  const subtotal = cartItems.reduce((s, i) => s + (i.discountPrice || i.price) * i.quantity, 0);
  const shipping = subtotal >= 1000 ? 0 : 60;
  const total    = subtotal + shipping;

  const createOrderMutation = useMutation({
    mutationFn: (shippingAddress: ShippingForm) =>
      api.post('/supershop/orders', {
        items: cartItems.map(i => ({ product: i._id, quantity: i.quantity, price: i.discountPrice || i.price })),
        totalAmount: total,
        shippingAddress,
      }),
    onSuccess: (res) => {
      setOrderId(res.data.order._id);
      setOrderStep('payment');
      setShowPayment(true);
    },
    onError: () => toast.error('অর্ডার তৈরি ব্যর্থ হয়েছে'),
  });

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setOrderStep('done');
    clear();
  };

  if (cartItems.length === 0 && orderStep !== 'done') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MainNavbar />
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <ShoppingBag className="w-16 h-16 mb-4" />
          <p className="font-medium text-gray-600 dark:text-gray-400 mb-4">কার্ট খালি</p>
          <button onClick={() => router.push('/supershop')} className="btn-primary">শপিং করতে যান</button>
        </div>
      </div>
    );
  }

  if (orderStep === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MainNavbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">অর্ডার সফল!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">পেমেন্ট যাচাইয়ের পর আপনার অর্ডার প্রক্রিয়া শুরু হবে।</p>
          <div className="card p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">অর্ডার ID</span><span className="font-mono text-xs font-medium text-gray-900 dark:text-white">{orderId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">মোট</span><span className="font-bold text-gray-900 dark:text-white">৳{total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">পেমেন্ট অবস্থা</span><span className="badge badge-orange">যাচাই চলছে</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/supershop')} className="flex-1 btn-secondary py-3">আরো শপিং</button>
            <button onClick={() => router.push('/supershop/orders')} className="flex-1 btn-primary py-3">আমার অর্ডার</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">চেকআউট</h1>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {[['shipping', 'ঠিকানা'], ['payment', 'পেমেন্ট'], ['done', 'সম্পন্ন']].map(([s, label], i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                orderStep === s ? 'bg-primary-600 text-white' : i < ['shipping','payment','done'].indexOf(orderStep) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs">{i + 1}</span>
                {label}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" /> ডেলিভারি ঠিকানা
              </h2>
              <form onSubmit={handleSubmit(d => createOrderMutation.mutate(d))} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">প্রাপকের নাম *</label>
                    <input {...register('name')} className="input" placeholder="পূর্ণ নাম" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">মোবাইল নম্বর *</label>
                    <input {...register('phone')} className="input" placeholder="01XXXXXXXXX" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">সম্পূর্ণ ঠিকানা *</label>
                  <textarea {...register('address')} rows={2} className="input resize-none" placeholder="বাড়ি নম্বর, রাস্তা, এলাকা..." />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">শহর/উপজেলা *</label>
                    <input {...register('city')} className="input" placeholder="শহর" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">জেলা *</label>
                    <input {...register('district')} className="input" placeholder="জেলা" />
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">পোস্টাল কোড</label>
                    <input {...register('postalCode')} className="input" placeholder="1234" />
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {subtotal >= 1000 ? '🎉 ১,০০০ টাকার উপরে অর্ডারে বিনামূল্যে ডেলিভারি!' : `ডেলিভারি চার্জ: ৳${shipping}। ১,০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি।`}
                  </p>
                </div>

                <button type="submit" disabled={createOrderMutation.isPending} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                  {createOrderMutation.isPending
                    ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> অর্ডার তৈরি হচ্ছে...</>
                    : <>পেমেন্ট করতে যান <ChevronRight className="w-5 h-5" /></>
                  }
                </button>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-5 sticky top-24">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-pink-600" /> অর্ডার সারসংক্ষেপ
              </h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
                      {item.images?.[0]?.url && <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                      ৳{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>সাবটোটাল</span><span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>ডেলিভারি চার্জ</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'বিনামূল্যে 🎉' : `৳${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span>সর্বমোট</span><span>৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Accepted payment methods */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">গ্রহণযোগ্য পেমেন্ট</p>
                <div className="flex items-center gap-2">
                  {[
                    { name: 'bKash', color: '#E2136E', emoji: '💳' },
                    { name: 'Nagad', color: '#F05829', emoji: '💰' },
                    { name: 'Rocket', color: '#8B3D8B', emoji: '🚀' },
                    { name: 'Bank', color: '#2563EB', emoji: '🏦' },
                  ].map(m => (
                    <div key={m.name} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span>{m.emoji}</span>
                      <span className="text-gray-600 dark:text-gray-400" style={{ color: m.color }}>{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && orderId && (
        <PaymentModal
          amount={total}
          type="order"
          refId={orderId}
          description={`${cartItems.length}টি পণ্যের জন্য পেমেন্ট`}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
