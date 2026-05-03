'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/Cart.storeShop';
import { X, ShoppingBag, Plus, Minus, Trash2, ChevronRight, Package } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { items, remove, update, total, count } = useCartStore();
  const router = useRouter();
  const subtotal  = total();
  const shipping  = subtotal >= 1000 ? 0 : 60;
  const grandTotal = subtotal + shipping;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--color-background-primary, #fff)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">কার্ট</h2>
            {count() > 0 && (
              <span className="text-xs bg-primary-600 text-white font-bold px-2 py-0.5 rounded-full">{count()}</span>
            )}
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mb-4" />
              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">কার্ট খালি</p>
              <p className="text-xs text-gray-400 mb-5">পণ্য যোগ করুন</p>
              <button onClick={onClose}
                className="text-sm font-semibold text-primary-600 border border-primary-600 px-5 py-2 rounded-xl hover:bg-primary-50 transition">
                শপিং করুন
              </button>
            </div>
          ) : (
            items.map(item => {
              const price = item.discountPrice || item.price;
              return (
                <div key={item._id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-700 overflow-hidden shrink-0">
                    {item.images?.[0]?.url
                      ? <Image src={item.images[0].url} alt={item.name} width={56} height={56} className="w-full h-full object-contain p-1" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-sm font-bold text-primary-600 mt-0.5">৳{price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => update(item._id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 transition">
                        <Minus className="w-3 h-3 text-gray-500" />
                      </button>
                      <span className="text-sm font-bold text-gray-900 dark:text-white w-5 text-center">{item.quantity}</span>
                      <button onClick={() => update(item._id, Math.min(item.stock, item.quantity + 1))}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 transition">
                        <Plus className="w-3 h-3 text-gray-500" />
                      </button>
                      <span className="text-xs text-gray-400 ml-1">= ৳{(price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(item._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 text-gray-400 transition shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-5 shrink-0 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>সাবটোটাল</span><span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>ডেলিভারি চার্জ</span>
                <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                  {shipping === 0 ? 'বিনামূল্যে 🎉' : `৳${shipping}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-base text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                <span>সর্বমোট</span><span>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            {subtotal < 1000 && (
              <p className="text-xs text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl py-2">
                আরও ৳{(1000 - subtotal).toLocaleString()} কিনলে ফ্রি ডেলিভারি! 🚚
              </p>
            )}
            <button
              onClick={() => { onClose(); router.push('/supershop/checkout'); }}
              className="btn-primary w-full py-3.5 rounded-2xl text-base font-bold flex items-center justify-center gap-2">
              চেকআউট করুন <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}