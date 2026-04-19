'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useT } from '@/hooks/useT';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images?: { url: string }[];
  averageRating?: number;
  totalReviews?: number;
  stock: number;
  category?: string;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  onCartUpdate?: () => void;
}

export default function ProductCard({ product, index = 0, onCartUpdate }: ProductCardProps) {
  const { t } = useT();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/supershop/cart/add', { productId: product._id, quantity: 1 });
      toast.success(t.supershop.addToCart + '!');
      onCartUpdate?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t.common.error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/supershop/product/${product.slug}`}>
        <div className="card group cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 p-0 overflow-hidden">
          {/* Image */}
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: '1/1', background: 'var(--color-bg-secondary)' }}
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discount > 0 && (
                <span className="badge bg-red-500 text-white text-[10px] font-bold">-{discount}%</span>
              )}
              {product.isFeatured && (
                <span className="badge bg-amber-500 text-white text-[10px] font-bold">★ Featured</span>
              )}
              {product.stock === 0 && (
                <span className="badge bg-gray-500 text-white text-[10px]">{t.supershop.outOfStock}</span>
              )}
            </div>

            {/* Hover actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={e => { e.preventDefault(); setWishlisted(w => !w); }}
                className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition-colors"
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              <Link
                href={`/supershop/product/${product.slug}`}
                className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-50 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Eye className="w-4 h-4 text-blue-500" />
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <p
              className="text-sm font-medium mb-1 line-clamp-2 leading-snug group-hover:text-[var(--color-brand)] transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              {product.name}
            </p>

            {/* Rating */}
            {(product.totalReviews ?? 0) > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.round(product.averageRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  ({product.totalReviews})
                </span>
              </div>
            )}

            {/* Price + Add to cart */}
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
              <button
                onClick={addToCart}
                disabled={product.stock === 0 || adding}
                className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-brand"
              >
                {adding
                  ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
