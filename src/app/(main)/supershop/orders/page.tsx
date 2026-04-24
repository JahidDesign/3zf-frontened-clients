'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import  MainNavbar  from '@/components/layout/Navbar';
import  MainFooter  from '@/components/layout/Footer';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useT } from '@/lib/i19n';

const STATUS_MAP: Record<string, { icon: any; color: string; label: string }> = {
  pending:    { icon: Clock,        color: 'text-gray-500',   label: 'Pending' },
  confirmed:  { icon: CheckCircle, color: 'text-blue-500',   label: 'Confirmed' },
  processing: { icon: Package,     color: 'text-yellow-500', label: 'Processing' },
  shipped:    { icon: Truck,       color: 'text-purple-500', label: 'Shipped' },
  delivered:  { icon: CheckCircle, color: 'text-green-500',  label: 'Delivered' },
  cancelled:  { icon: XCircle,     color: 'text-red-500',    label: 'Cancelled' },
};

export default function MyOrdersPage() {
  const t = useT();
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/supershop/orders/my').then(r => r.data),
  });
  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-pink-600" /> My Orders
        </h1>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card p-4 animate-pulse h-24" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link href="/supershop" className="btn-primary px-6">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const st = STATUS_MAP[order.orderStatus] || STATUS_MAP.pending;
              const Icon = st.icon;
              return (
                <div key={order._id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{format(new Date(order.createdAt), 'PPP')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${st.color}`} />
                      <span className={`text-sm font-medium ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-3">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                        {item.product?.images?.[0]?.url && (
                          <img src={item.product.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">×{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`badge text-xs ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-orange'}`}>
                        Payment: {order.paymentStatus}
                      </span>
                      {order.trackingNumber && <span className="text-xs text-gray-400 ml-2">Track: {order.trackingNumber}</span>}
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">৳{order.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <MainFooter />
    </div>
  );
}
