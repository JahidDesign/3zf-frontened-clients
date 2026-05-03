'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import useAuthStore from '@/store/authStore';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  ShoppingBag, Truck, Shield, Tag, ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, remove, updateQty, clear } = useCartStore();

  const subtotal = items.reduce((s, i) => s + (i.discountPrice || i.price) * i.quantity, 0);
  const shipping  = subtotal >= 1000 ? 0 : subtotal === 0 ? 0 : 60;
  const total     = subtotal + shipping;
  const savings   = items.reduce((s, i) => s + (i.discountPrice ? (i.price - i.discountPrice) * i.quantity : 0), 0);

  const handleCheckout = () => {
    if (!user) { router.push('/login?redirect=/supershop/checkout'); return; }
    router.push('/supershop/checkout');
  };

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <MainNavbar />
        <div className="max-w-md mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          >
            <ShoppingCart className="w-12 h-12 text-pink-300" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">কার্ট খালি</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-7">এখনো কোনো পণ্য যোগ করা হয়নি।</p>
            <Link
              href="/supershop"
              className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" /> শপিং শুরু করুন
            </Link>
          </motion.div>
        </div>
        <MainFooter />
      </div>
    );
  }

  // ── Filled cart ──
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      <div className="max-w-5xl mx-auto px-4 pt-20 pb-10 sm:pt-24 sm:pb-12">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-6 sm:mb-7"
        >
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            আমার কার্ট
            <span className="text-sm sm:text-base font-semibold text-gray-400 ml-1">
              ({items.length}টি পণ্য)
            </span>
          </h1>
          <button
            onClick={clear}
            className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" /> সব মুছুন
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item, idx) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                >
                  {/* Image */}
                  <Link href={`/supershop/products/${item._id}`} className="shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
                      {item.images?.[0]?.url ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/supershop/products/${item._id}`}>
                      <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-pink-600 dark:hover:text-pink-400 transition leading-snug">
                        {item.name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-black text-gray-900 dark:text-white text-sm">
                        ৳{(item.discountPrice || item.price).toLocaleString()}
                      </span>
                      {item.discountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ৳{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Qty + Remove */}
                    <div className="flex items-center justify-between mt-2.5 sm:mt-3">
                      <div className="flex items-center gap-0.5 sm:gap-1 border border-gray-200 dark:border-gray-700 rounded-xl p-0.5">
                        <button
                          onClick={() => updateQty(item._id, item.quantity - 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition text-gray-600 dark:text-gray-400"
                        >
                          <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item._id, item.quantity + 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition text-gray-600 dark:text-gray-400"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item._id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0">
                    <p className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
                      ৳{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                    </p>
                    {item.discountPrice && item.quantity > 1 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">×{item.quantity}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <Link
              href="/supershop"
              className="flex items-center gap-1.5 text-sm text-pink-600 dark:text-pink-400 font-semibold hover:underline pt-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> শপিং চালিয়ে যান
            </Link>
          </div>

          {/* ── Order Summary ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5 lg:sticky lg:top-24">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600" /> অর্ডার সারসংক্ষেপ
              </h2>

              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>সাবটোটাল ({items.reduce((s, i) => s + i.quantity, 0)}টি)</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> সাশ্রয়
                    </span>
                    <span>-৳{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> ডেলিভারি
                  </span>
                  <span className={shipping === 0 && subtotal > 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {subtotal === 0 ? '—' : shipping === 0 ? 'বিনামূল্যে 🎉' : `৳${shipping}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex justify-between font-black text-base text-gray-900 dark:text-white">
                  <span>সর্বমোট</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Free shipping progress */}
              {subtotal > 0 && subtotal < 1000 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    আরো ৳{(1000 - subtotal).toLocaleString()} এর পণ্য কিনলে ফ্রি ডেলিভারি!
                  </p>
                  <div className="mt-2 bg-blue-100 dark:bg-blue-900/40 rounded-full h-1.5">
                    <motion.div
                      className="bg-blue-500 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (subtotal / 1000) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="btn-primary w-full py-3 sm:py-3.5 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                চেকআউট করুন <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {!user && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                  চেকআউট করতে{' '}
                  <Link
                    href="/login?redirect=/supershop/checkout"
                    className="text-pink-600 dark:text-pink-400 font-semibold hover:underline"
                  >
                    লগইন করুন
                  </Link>
                </p>
              )}

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
                {[
                  { Icon: Shield, label: 'নিরাপদ পেমেন্ট' },
                  { Icon: Truck, label: 'দ্রুত ডেলিভারি' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <b.Icon className="w-3.5 h-3.5 text-green-500" />
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      <MainFooter />
    </div>
  );
}