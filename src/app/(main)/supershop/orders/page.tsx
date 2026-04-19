'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
import { Badge } from '@/components/ui/Modal';
import api from '@/lib/api';
import { useT } from '@/hooks/useT';

const STATUS_MAP: Record<string, { label: string; variant: any; icon: any }> = {
  pending:    { label: 'Pending',    variant: 'warning', icon: Clock },
  confirmed:  { label: 'Confirmed',  variant: 'info',    icon: CheckCircle },
  processing: { label: 'Processing', variant: 'info',    icon: Clock },
  shipped:    { label: 'Shipped',    variant: 'brand',   icon: Truck },
  delivered:  { label: 'Delivered',  variant: 'success', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  variant: 'error',   icon: XCircle },
};

export default function OrdersPage() {
  const { t } = useT();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/supershop/orders/my')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        <div className="gradient-brand text-white py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <Link href="/supershop" className="flex items-center gap-2 text-purple-200 text-sm mb-2 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> {t.nav.supershop}
            </Link>
            <h1 className="font-heading text-2xl font-bold">{t.supershop.orders}</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse space-y-3">
                <div className="h-4 rounded w-32" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 rounded w-24" style={{ background: 'var(--color-border)' }} />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="card text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
              <p className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>No orders yet</p>
              <Link href="/supershop" className="btn-primary px-6 py-2.5 mt-2 inline-block">{t.supershop.shopNow}</Link>
            </div>
          ) : orders.map((order, i) => {
            const st = STATUS_MAP[order.orderStatus] || STATUS_MAP.pending;
            const Icon = st.icon;
            return (
              <motion.div key={order._id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs mb-1" style={{ color:'var(--color-text-muted)' }}>#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs" style={{ color:'var(--color-text-secondary)' }}>
                      {format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                  </div>
                  <Badge variant={st.variant}>
                    <Icon className="w-3 h-3 mr-1" /> {st.label}
                  </Badge>
                </div>
                <div className="space-y-2 mb-3">
                  {order.items?.slice(0, 3).map((item: any) => (
                    <div key={item._id || item.name} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background:'var(--color-bg-secondary)' }}>
                        {item.product?.images?.[0]
                          ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color:'var(--color-text)' }}>{item.name}</p>
                        <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>Qty: {item.quantity} × ৳{item.price}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>+{order.items.length - 3} more items</p>
                  )}
                </div>
                <div className="flex items-center justify-between border-t pt-3" style={{ borderColor:'var(--color-border)' }}>
                  <div>
                    <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>{t.supershop.total}</p>
                    <p className="font-bold" style={{ color:'var(--color-brand)' }}>৳{order.totalAmount?.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{order.paymentStatus}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
