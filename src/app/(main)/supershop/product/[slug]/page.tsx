'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Minus, Plus, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
import { Spinner } from '@/components/ui/Spinner';
import api from '@/lib/api';
import { useT } from '@/hooks/useT';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { t } = useT();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc');

  useEffect(() => {
    api.get(`/supershop/products/${slug}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToCart = async () => {
    setAdding(true);
    try {
      await api.post('/supershop/cart/add', { productId: product._id, quantity: qty });
      toast.success(`${qty}x ${product.name} added to cart!`);
    } catch (e: any) { toast.error(e.response?.data?.message || t.common.error); }
    finally { setAdding(false); }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    try {
      await api.post(`/supershop/products/${product._id}/review`, { rating: reviewRating, review: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
      const { data } = await api.get(`/supershop/products/${slug}`);
      setProduct(data.product);
    } catch (e: any) { toast.error(e.response?.data?.message || t.common.error); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)' }}>
      <Spinner size="lg" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="card text-center py-12">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Product not found</p>
        <button onClick={() => router.back()} className="btn-primary mt-4 px-6 py-2.5">Go Back</button>
      </div>
    </div>
  );

  const images = product.images || [];
  const finalPrice = product.discountPrice || product.price;
  const discount = product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)] max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 mb-6 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to shop
        </button>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: '1', background: 'var(--color-bg-tertiary)' }}>
              {images.length > 0 ? (
                <img src={images[imgIdx]?.url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {discount > 0 && (
                <span className="absolute top-3 left-3 badge bg-red-500 text-white font-bold">-{discount}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${imgIdx === i ? 'border-[var(--color-brand)]' : 'border-transparent'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{product.category}</p>
            <h1 className="font-heading text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>{product.name}</h1>

            {/* Rating */}
            {product.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{product.averageRating?.toFixed(1)}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>({product.totalReviews} {t.supershop.reviews})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-heading text-3xl font-bold" style={{ color: 'var(--color-brand)' }}>
                ৳{finalPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-lg line-through" style={{ color: 'var(--color-text-muted)' }}>
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-medium mb-5 ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stock > 0 ? `✓ ${t.supershop.inStock} (${product.stock} left)` : `✗ ${t.supershop.outOfStock}`}
            </p>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Quantity:</p>
                <div className="flex items-center gap-2 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold" style={{ color: 'var(--color-text)' }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={addToCart} disabled={product.stock === 0 || adding}
                className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-base">
                {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><ShoppingCart className="w-5 h-5" /> {t.supershop.addToCart}</>}
              </button>
              <button onClick={() => setWishlisted(w => !w)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${wishlisted ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-[var(--color-border)] hover:border-red-300'}`}>
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              <button className="w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all hover:border-[var(--color-brand)]"
                style={{ borderColor: 'var(--color-border)' }}>
                <Share2 className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs: description + reviews */}
        <div className="card">
          <div className="flex border-b mb-5" style={{ borderColor: 'var(--color-border)' }}>
            {(['desc', 'reviews'] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${tab === tabKey ? 'border-[var(--color-brand)] text-[var(--color-brand)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}>
                {tabKey === 'desc' ? 'Description' : `${t.supershop.reviews} (${product.totalReviews || 0})`}
              </button>
            ))}
          </div>

          {tab === 'desc' ? (
            <div className="prose max-w-none text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {product.description}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag: string) => (
                    <span key={tag} className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-brand)' }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Write review */}
              <div className="card" style={{ background: 'var(--color-bg-secondary)' }}>
                <p className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Write a Review</p>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setReviewRating(i + 1)}>
                      <Star className={`w-6 h-6 transition-colors ${i < reviewRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea rows={3} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." className="mb-3" />
                <button onClick={submitReview} disabled={!reviewText.trim()} className="btn-primary px-5 py-2 text-sm">Submit Review</button>
              </div>

              {/* Reviews list */}
              {(product.ratings || []).map((r: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex gap-3">
                  <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(r.user?.name || 'U')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{r.user?.name || 'Customer'}</p>
                      <div className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}</div>
                    </div>
                    {r.review && <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{r.review}</p>}
                  </div>
                </motion.div>
              ))}
              {(!product.ratings || product.ratings.length === 0) && (
                <p className="text-center py-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first!</p>
              )}
            </div>
          )}
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
