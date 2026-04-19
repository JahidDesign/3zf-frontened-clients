'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Search, Filter, Heart, Eye, Plus, Minus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports', 'Beauty'];
const SORT_OPTIONS = [
  { value: '', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const navItems = ['Shop', 'Cart', 'My Orders', 'Wishlist'];

export default function SupershopPage() {
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [activeNav, setActiveNav] = useState('Shop');

  useEffect(() => { fetchProducts(); }, [category, sort, search]);
  useEffect(() => { if (isAuthenticated) fetchCartCount(); }, [isAuthenticated]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (sort) params.set('sort', sort);
      if (search) params.set('search', search);
      const { data } = await api.get(`/supershop/products?${params}`);
      setProducts(data.products || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const fetchCartCount = async () => {
    try {
      const { data } = await api.get('/supershop/cart');
      setCartCount(data.cart?.items?.length || 0);
    } catch {}
  };

  const addToCart = async (productId: string) => {
    if (!isAuthenticated) return toast.error('Please login to add to cart');
    try {
      await api.post('/supershop/cart/add', { productId, quantity: 1 });
      setCartCount(prev => prev + 1);
      toast.success('Added to cart!');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        {/* Hero */}
        <div className="gradient-brand text-white py-10 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">Harmony Supershop</h1>
              <p className="text-purple-100">Quality products, fast delivery</p>
            </div>
            <Link href="/supershop/cart" className="relative flex items-center gap-2 bg-white text-purple-700 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-50 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gradient-brand text-white text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sub nav */}
        <div className="sticky top-[var(--navbar-height)] z-30 border-b" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
            {navItems.map(item => (
              <Link key={item} href={item === 'Cart' ? '/supershop/cart' : item === 'My Orders' ? '/supershop/orders' : '/supershop'}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${activeNav === item ? 'gradient-brand text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
                onClick={() => setActiveNav(item)}>{item}</Link>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
                placeholder="Search products..." style={{ paddingLeft: '2.5rem' }} />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} className="sm:w-48">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                  ${(category === cat) || (cat === 'All' && !category)
                    ? 'gradient-brand text-white shadow-brand'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
                style={{ background: (category === cat) || (cat === 'All' && !category) ? '' : 'var(--color-bg)' }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="rounded-xl mb-3" style={{ aspectRatio: '1', background: 'var(--color-border)' }} />
                  <div className="space-y-2">
                    <div className="h-3 rounded" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 rounded w-2/3" style={{ background: 'var(--color-border)' }} />
                    <div className="h-4 rounded w-1/2" style={{ background: 'var(--color-border)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card text-center py-16">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
              <p className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>No products found</p>
              <p style={{ color: 'var(--color-text-secondary)' }}>Try different filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="card group cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
                    {/* Image */}
                    <div className="relative rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '1', background: 'var(--color-bg-secondary)' }}>
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                      )}
                      {product.discountPrice && (
                        <span className="absolute top-2 left-2 badge bg-red-500 text-white text-[10px]">
                          -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Out of Stock</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition-colors">
                          <Heart className="w-4 h-4 text-red-500" />
                        </button>
                        <Link href={`/supershop/product/${product.slug}`}
                          className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4 text-blue-500" />
                        </Link>
                      </div>
                    </div>

                    {/* Info */}
                    <Link href={`/supershop/product/${product.slug}`}>
                      <p className="text-sm font-medium mb-1 line-clamp-2 leading-snug group-hover:text-[var(--color-brand)] transition-colors"
                        style={{ color: 'var(--color-text)' }}>{product.name}</p>
                    </Link>

                    {/* Rating */}
                    {product.totalReviews > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>({product.totalReviews})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-base" style={{ color: 'var(--color-brand)' }}>
                          ৳{(product.discountPrice || product.price).toLocaleString()}
                        </span>
                        {product.discountPrice && (
                          <span className="text-xs line-through ml-1.5" style={{ color: 'var(--color-text-muted)' }}>
                            ৳{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button onClick={() => addToCart(product._id)} disabled={product.stock === 0}
                        className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-brand flex-shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
