'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import  MainNavbar  from '@/components/layout/Navbar';
import  MainFooter  from '@/components/layout/Footer';
import { ShoppingCart, Search, Filter, Star, Heart, ShoppingBag, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useT } from '@/lib/i19n';

// Cart store
interface CartItem { _id: string; name: string; price: number; images: any[]; quantity: number; }
const useCart = create<{ items: CartItem[]; add: (p: any) => void; remove: (id: string) => void; total: () => number }>()(
  persist((set, get) => ({
    items: [],
    add: (product) => {
      const existing = get().items.find(i => i._id === product._id);
      if (existing) {
        set({ items: get().items.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i) });
      } else {
        set({ items: [...get().items, { ...product, quantity: 1 }] });
      }
      toast.success('Added to cart!');
    },
    remove: (id) => set({ items: get().items.filter(i => i._id !== id) }),
    total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  }), { name: '3zf-cart' })
);

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home', 'Beauty'];

export default function SupershopPage() {
  const t = useT();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [showCart, setShowCart] = useState(false);
  const { items: cartItems, add: addToCart, remove: removeFromCart, total } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ['products', category, search, sort],
    queryFn: () => api.get('/supershop/products', {
      params: {
        category: category === 'All' ? undefined : category,
        search: search || undefined,
        sort: sort === 'newest' ? undefined : sort,
      }
    }).then(r => r.data),
  });

  const products = data?.products ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      {/* Shop Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{t.shop.title}</h1>
                <p className="text-pink-100 text-sm">সেরা পণ্য, সেরা দামে</p>
              </div>
            </div>
            <button onClick={() => setShowCart(true)} className="relative bg-white/20 hover:bg-white/30 transition px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium">
              <ShoppingCart className="w-5 h-5" />
              Cart
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 text-gray-900 text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-pink-200 outline-none focus:bg-white/20 transition"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="card p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Categories
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === cat ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
                <div className="space-y-1">
                  {[['newest', 'Newest'], ['price_asc', 'Price: Low to High'], ['price_desc', 'Price: High to Low']].map(([val, label]) => (
                    <button key={val} onClick={() => setSort(val)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${sort === val ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{products.length} products found</p>
              <select value={sort} onChange={e => setSort(e.target.value)} className="lg:hidden input w-auto text-sm">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t.shop.noProducts}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p: any) => (
                  <div key={p._id} className="card overflow-hidden group cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <Link href={`/supershop/products/${p._id}`}>
                      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {p.images?.[0]?.url ? (
                          <Image src={p.images[0].url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="w-12 h-12" />
                          </div>
                        )}
                        {p.discountPrice && (
                          <span className="absolute top-2 left-2 badge bg-red-500 text-white text-xs">
                            {Math.round((1 - p.discountPrice / p.price) * 100)}% OFF
                          </span>
                        )}
                        <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{p.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">{p.ratings?.average?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-gray-400">({p.ratings?.count || 0})</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white text-sm">৳{(p.discountPrice || p.price).toLocaleString()}</span>
                          {p.discountPrice && (
                            <span className="text-xs text-gray-400 line-through ml-1">৳{p.price.toLocaleString()}</span>
                          )}
                        </div>
                        <button onClick={() => addToCart(p)}
                          className="w-7 h-7 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center justify-center transition active:scale-95">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Shopping Cart ({cartItems.length})</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0
                ? <div className="text-center py-12 text-gray-400"><ShoppingCart className="w-12 h-12 mx-auto mb-3" /><p>Your cart is empty</p></div>
                : cartItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3 card p-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                      {item.images?.[0]?.url && <Image src={item.images[0].url} alt="" width={56} height={56} className="object-cover w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-sm text-pink-600 font-bold mt-0.5">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">×{item.quantity}</span>
                      <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 text-lg font-bold">×</button>
                    </div>
                  </div>
                ))
              }
            </div>
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-lg text-pink-600">৳{total().toLocaleString()}</span>
                </div>
                <Link href="/supershop/checkout" onClick={() => setShowCart(false)} className="btn-primary w-full py-3 text-center block">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <MainFooter />
    </div>
  );
}
