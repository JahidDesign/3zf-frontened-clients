'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/axios';
import  MainNavbar  from '@/components/layout/Navbar';
import  MainFooter  from '@/components/layout/Footer';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { Star, ShoppingCart, Heart, ArrowLeft, Plus, Minus, Truck, Shield, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { add } = useCartStore();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const { data, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/supershop/products/${id}`).then(r => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: () => api.post(`/supershop/products/${id}/review`, { rating, comment: reviewText }),
    onSuccess: () => { toast.success('Review added!'); setReviewText(''); refetch(); },
    onError: () => toast.error('Failed to add review'),
  });

  const product = data?.product;
  if (!product) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/supershop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-3 relative">
              {product.images?.[activeImg]?.url ? (
                <Image src={product.images[activeImg].url} alt={product.name} fill className="object-contain p-4" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ShoppingCart className="w-20 h-20" />
                </div>
              )}
              {product.discountPrice && (
                <span className="absolute top-3 left-3 badge bg-red-500 text-white text-sm px-3 py-1">
                  {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${activeImg === i ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'}`}>
                    <Image src={img.url} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.category && <span className="badge-pink badge text-xs mb-2">{product.category}</span>}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.ratings?.average || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.ratings?.count || 0} reviews)</span>
              </div>
            </div>

            <div>
              <span className="text-3xl font-black text-gray-900 dark:text-white">৳{(product.discountPrice || product.price).toLocaleString()}</span>
              {product.discountPrice && (
                <span className="text-lg text-gray-400 line-through ml-2">৳{product.price.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2">
              <span className={`badge ${product.stock > 0 ? 'badge-green' : 'bg-red-100 text-red-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
              {product.sku && <span className="text-xs text-gray-400">SKU: {product.sku}</span>}
            </div>

            {product.stock > 0 && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-xl p-1">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{product.stock} available</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { for (let i = 0; i < qty; i++) add(product); }}
                    className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-base"
                  >
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                  </button>
                  <button className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-400 transition">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'On ৳1000+' },
                { icon: Shield, label: 'Secure Payment', sub: 'bKash/Nagad' },
                { icon: RotateCcw, label: 'Easy Return', sub: '7 days policy' },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <b.icon className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{b.label}</p>
                  <p className="text-xs text-gray-400">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="card p-6 mt-8">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-6">Customer Reviews</h2>
          {user && (
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Write a Review</p>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)}>
                    <Star className={`w-6 h-6 transition ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={reviewText} onChange={e => setReviewText(e.target.value)} className="input flex-1 text-sm" placeholder="Share your experience..." />
                <button onClick={() => reviewMutation.mutate()} disabled={!reviewText.trim() || reviewMutation.isPending} className="btn-primary px-4">Post</button>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {product.reviews?.slice(0,5).map((r: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold text-sm">U</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                    </div>
                    </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>
                </div>
              </div>
            ))}
            {(!product.reviews || product.reviews.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
