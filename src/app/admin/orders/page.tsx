'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ShoppingBag, Truck } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const { data } = useQuery({
    queryKey: ['admin-orders', status],
    queryFn: () => api.get('/supershop/orders', { params: { status: status || undefined } }).then(r => r.data),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, orderStatus, trackingNumber }: any) => api.patch(`/supershop/orders/${id}/status`, { orderStatus, trackingNumber }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order updated'); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5" />Orders ({data?.total ?? 0})</h1>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input w-auto text-sm">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {(data?.orders ?? []).map((order: any) => (
          <div key={order._id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'PPp')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">৳{order.totalAmount?.toLocaleString()}</p>
                <span className={`badge text-xs ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-orange'}`}>{order.paymentStatus}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{order.user?.name} · {order.user?.phone}</p>
                <p className="text-xs text-gray-400 mt-0.5">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={order.orderStatus}
                  onChange={e => updateMutation.mutate({ id: order._id, orderStatus: e.target.value })}
                  className="input text-xs w-auto py-1"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
