'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  Package, ShoppingBag, Users, TrendingUp, Plus, Edit2,
  Trash2, CheckCircle, XCircle, Eye, Search, X, Upload,
  Save, Loader2, Star, DollarSign, BarChart3, ChevronDown,
  Truck, AlertTriangle, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  _id: string; name: string; price: number; discountPrice?: number;
  images: { url: string }[]; category: string; stock: number;
  isFeatured: boolean; isActive: boolean;
  ratings?: { average: number; count: number };
  createdAt: string;
}
interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string };
  items: { product: { name: string; images: { url: string }[] }; quantity: number; price: number }[];
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: { name: string; phone: string; city: string; district: string };
  trackingNumber?: string;
  createdAt: string;
}
interface Member {
  _id: string; name: string; phone: string; city: string;
  transactionId: string; paymentAmount: number; paymentMethod: string;
  status: string; memberId?: string;
  profilePhoto?: { url: string };
  user?: { name: string; email: string };
  createdAt: string;
}

type AdminTab = 'stats' | 'products' | 'orders' | 'members';

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const PAYMENT_STATUSES = ['pending','verifying','paid','failed','refunded'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductFormModal({ product, onClose, onSuccess }: {
  product?: Product | null; onClose: () => void; onSuccess: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>(product?.images?.map(i => i.url) || []);
  const [form, setForm] = useState({
    name:          product?.name          || '',
    description:   '',
    price:         product?.price         || '',
    discountPrice: product?.discountPrice || '',
    category:      product?.category      || '',
    stock:         product?.stock         || '',
    sku:           '',
    isFeatured:    product?.isFeatured    || false,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (fileRef.current?.files) {
        Array.from(fileRef.current.files).forEach(f => fd.append('images', f));
      }
      return product
        ? api.put(`/supershop/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : api.post('/supershop/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { toast.success(product ? 'পণ্য আপডেট হয়েছে' : 'পণ্য তৈরি হয়েছে'); onSuccess(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      const r = new FileReader();
      r.onload = () => setPreviews(p => [...p, r.result as string]);
      r.readAsDataURL(f);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="font-bold text-gray-900 dark:text-white">{product ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">পণ্যের নাম *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input w-full" placeholder="পণ্যের নাম" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">বিবরণ</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="input w-full resize-none" placeholder="পণ্যের বিবরণ..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">মূল্য (৳) *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="input w-full" placeholder="০" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">ডিসকাউন্ট মূল্য (৳)</label>
              <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                className="input w-full" placeholder="ঐচ্ছিক" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">ক্যাটাগরি *</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input w-full" placeholder="Electronics, Fashion..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">স্টক *</label>
              <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="input w-full" placeholder="০" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.isFeatured}
              onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
              className="w-4 h-4 rounded accent-primary-600" />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">ফিচার্ড পণ্য হিসেবে চিহ্নিত করুন</label>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">ছবি (সর্বোচ্চ ৮টি)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {previews.map((p, i) => (
                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPreviews(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ))}
              {previews.length < 8 && (
                <button onClick={() => fileRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-primary-400 transition">
                  <Upload className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-3 rounded-2xl">বাতিল</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.price}
            className="btn-primary flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
            {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> সেভ হচ্ছে...</> : <><Save className="w-4 h-4" /> সেভ করুন</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onUpdate }: { order: Order; onClose: () => void; onUpdate: () => void }) {
  const [orderStatus,   setOrderStatus]   = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [tracking,      setTracking]      = useState(order.trackingNumber || '');

  const mutation = useMutation({
    mutationFn: () => api.patch(`/supershop/orders/${order._id}/status`, {
      orderStatus, paymentStatus, trackingNumber: tracking,
    }),
    onSuccess: () => { toast.success('অর্ডার আপডেট হয়েছে'); onUpdate(); onClose(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  const statusColors: Record<string, string> = {
    pending: 'badge-orange', confirmed: 'bg-blue-100 text-blue-600',
    processing: 'bg-yellow-100 text-yellow-600', shipped: 'bg-purple-100 text-purple-600',
    delivered: 'badge-green', cancelled: 'bg-red-100 text-red-600',
    paid: 'badge-green', verifying: 'badge-orange', failed: 'bg-red-100 text-red-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">অর্ডার বিস্তারিত</h2>
            <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Customer */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">গ্রাহক</p>
            <p className="font-semibold text-gray-900 dark:text-white">{order.user?.name}</p>
            <p className="text-xs text-gray-500">{order.user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">{order.shippingAddress?.name} · {order.shippingAddress?.phone}</p>
            <p className="text-xs text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">পণ্যসমূহ</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  {item.product?.images?.[0]?.url && (
                    <img src={item.product.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">×{item.quantity} · ৳{item.price.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-base text-gray-900 dark:text-white mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>সর্বমোট</span><span>৳{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Status update */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">স্ট্যাটাস আপডেট</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">অর্ডার স্ট্যাটাস</label>
                <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                  className="input w-full text-sm">
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">পেমেন্ট স্ট্যাটাস</label>
                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                  className="input w-full text-sm">
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">ট্র্যাকিং নম্বর</label>
              <input value={tracking} onChange={e => setTracking(e.target.value)}
                className="input w-full text-sm" placeholder="BD123456789" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-3 rounded-2xl">বাতিল</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="btn-primary flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
            {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> আপডেট হচ্ছে...</> : <><Save className="w-4 h-4" /> আপডেট করুন</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminSupershopPage() {
  const qc = useQueryClient();
  const [activeTab,     setActiveTab]     = useState<AdminTab>('stats');
  const [productModal,  setProductModal]  = useState<Product | null | 'new'>('new' as any);
  const [showPModal,    setShowPModal]    = useState(false);
  const [orderModal,    setOrderModal]    = useState<Order | null>(null);
  const [orderFilter,   setOrderFilter]   = useState('');
  const [memberSearch,  setMemberSearch]  = useState('');

  // Set productModal to null initially
  useState(() => { setShowPModal(false); });

  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['admin-supershop-stats'],
    queryFn:  () => api.get('/supershop/admin/stats').then(r => r.data),
  });
  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn:  () => api.get('/supershop/products', { params: { limit: 50 } }).then(r => r.data),
    enabled: activeTab === 'products',
  });
  const { data: ordersData, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders', orderFilter],
    queryFn:  () => api.get('/supershop/orders', { params: { status: orderFilter || undefined, limit: 50 } }).then(r => r.data),
    enabled: activeTab === 'orders',
  });
  const { data: membersData, refetch: refetchMembers } = useQuery({
    queryKey: ['admin-shop-members'],
    queryFn:  () => api.get('/supershop/membership/all').then(r => r.data),
    enabled: activeTab === 'members',
  });

  const stats   = statsData?.stats;
  const products = productsData?.products ?? [];
  const orders   = ordersData?.orders ?? [];
  const members  = (membersData?.members ?? []).filter((m: Member) =>
    !memberSearch || m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.transactionId?.includes(memberSearch)
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/supershop/products/${id}`),
    onSuccess:  () => { toast.success('পণ্য মুছে ফেলা হয়েছে'); refetchProducts(); },
    onError:    (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  const approveMember = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/supershop/membership/approve/${id}`, { status }),
    onSuccess: () => { toast.success('আপডেট হয়েছে'); refetchMembers(); refetchStats(); },
    onError:   (e: any) => toast.error(e?.response?.data?.message ?? 'ব্যর্থ হয়েছে'),
  });

  const TABS = [
    { id: 'stats'    as AdminTab, label: 'পরিসংখ্যান', icon: BarChart3 },
    { id: 'products' as AdminTab, label: 'পণ্য',        icon: Package },
    { id: 'orders'   as AdminTab, label: 'অর্ডার',      icon: ShoppingBag, badge: stats?.pendingOrders },
    { id: 'members'  as AdminTab, label: 'সদস্য',       icon: Users, badge: stats?.pendingMembers },
  ];

  const statusBadge: Record<string, string> = {
    pending:    'badge-orange', confirmed: 'bg-blue-100 text-blue-600',
    processing: 'bg-yellow-100 text-yellow-700', shipped: 'bg-purple-100 text-purple-600',
    delivered:  'badge-green',  cancelled: 'bg-red-100 text-red-600',
    paid: 'badge-green', verifying: 'badge-orange', failed: 'bg-red-100 text-red-600',
    approved: 'badge-green', rejected: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-pink-500" /> Supershop ম্যানেজমেন্ট
        </h1>
        {activeTab === 'products' && (
          <button onClick={() => { setProductModal(null); setShowPModal(true); }}
            className="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> নতুন পণ্য
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition shrink-0 ${
              activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {!!tab.badge && tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── STATS ── */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="মোট পণ্য"       value={stats?.totalProducts ?? '—'}   icon={Package}     color="bg-blue-500" />
            <StatCard label="মোট অর্ডার"     value={stats?.totalOrders ?? '—'}     icon={ShoppingBag} color="bg-purple-500" />
            <StatCard label="পেন্ডিং অর্ডার" value={stats?.pendingOrders ?? '—'}   icon={AlertTriangle} color="bg-orange-500" />
            <StatCard label="মোট রাজস্ব"     value={`৳${(stats?.totalRevenue ?? 0).toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
            <StatCard label="সক্রিয় সদস্য"  value={stats?.totalMembers ?? '—'}    icon={Users}       color="bg-pink-500" />
            <StatCard label="পেন্ডিং সদস্য"  value={stats?.pendingMembers ?? '—'}  icon={RefreshCw}   color="bg-yellow-500" />
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {activeTab === 'products' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-3">পণ্য</th>
                  <th className="text-left px-4 py-3">ক্যাটাগরি</th>
                  <th className="text-left px-4 py-3">মূল্য</th>
                  <th className="text-left px-4 py-3">স্টক</th>
                  <th className="text-left px-4 py-3">রেটিং</th>
                  <th className="text-left px-4 py-3">ফিচার্ড</th>
                  <th className="text-left px-4 py-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((p: Product) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">৳{(p.discountPrice || p.price).toLocaleString()}</p>
                        {p.discountPrice && <p className="text-xs text-gray-400 line-through">৳{p.price.toLocaleString()}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${p.stock > 0 ? 'badge-green' : 'bg-red-100 text-red-600'}`}>
                        {p.stock > 0 ? p.stock : 'শেষ'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.ratings?.count ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{p.ratings.average}</span>
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${p.isFeatured ? 'badge-green' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isFeatured ? 'হ্যাঁ' : 'না'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setProductModal(p); setShowPModal(true); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { if (confirm('নিশ্চিত?')) deleteMutation.mutate(p._id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">কোনো পণ্য নেই</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['', ...ORDER_STATUSES].map(s => (
              <button key={s} onClick={() => setOrderFilter(s)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition ${
                  orderFilter === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}>{s || 'সব'}</button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3">অর্ডার ID</th>
                    <th className="text-left px-4 py-3">গ্রাহক</th>
                    <th className="text-left px-4 py-3">মোট</th>
                    <th className="text-left px-4 py-3">অর্ডার স্ট্যাটাস</th>
                    <th className="text-left px-4 py-3">পেমেন্ট</th>
                    <th className="text-left px-4 py-3">তারিখ</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map((o: Order) => (
                    <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{o.user?.name}</p>
                        <p className="text-xs text-gray-400">{o.shippingAddress?.city}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">৳{o.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${statusBadge[o.orderStatus] || ''}`}>{o.orderStatus}</span></td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${statusBadge[o.paymentStatus] || ''}`}>{o.paymentStatus}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{format(new Date(o.createdAt), 'MMM d, yy')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setOrderModal(o)}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition">
                          <Eye className="w-3.5 h-3.5" /> দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">কোনো অর্ডার নেই</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MEMBERS ── */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
              placeholder="নাম বা TrxID দিয়ে খুঁজুন..."
              className="input pl-9 w-full text-sm" />
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left px-4 py-3">সদস্য</th>
                    <th className="text-left px-4 py-3">ফোন</th>
                    <th className="text-left px-4 py-3">শহর</th>
                    <th className="text-left px-4 py-3">TrxID</th>
                    <th className="text-left px-4 py-3">পদ্ধতি</th>
                    <th className="text-left px-4 py-3">স্ট্যাটাস</th>
                    <th className="text-left px-4 py-3">তারিখ</th>
                    <th className="text-left px-4 py-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {members.map((m: Member) => (
                    <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 shrink-0 flex items-center justify-center text-pink-600 font-bold text-xs">
                            {m.profilePhoto?.url ? <img src={m.profilePhoto.url} alt="" className="w-full h-full object-cover" /> : m.name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{m.name}</p>
                            {m.memberId && <p className="text-xs text-pink-500 font-mono">{m.memberId}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.phone}</td>
                      <td className="px-4 py-3 text-gray-500">{m.city}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{m.transactionId}</span>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-gray-500">{m.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${statusBadge[m.status] || ''}`}>{
                          m.status === 'approved' ? 'অনুমোদিত' :
                          m.status === 'pending'  ? 'পেন্ডিং'   : 'প্রত্যাখ্যাত'
                        }</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{format(new Date(m.createdAt), 'MMM d, yy')}</td>
                      <td className="px-4 py-3">
                        {m.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => approveMember.mutate({ id: m._id, status: 'approved' })}
                              className="flex items-center gap-1 text-xs px-2 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-semibold transition">
                              <CheckCircle className="w-3 h-3" /> অনুমোদন
                            </button>
                            <button onClick={() => approveMember.mutate({ id: m._id, status: 'rejected' })}
                              className="flex items-center gap-1 text-xs px-2 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition">
                              <XCircle className="w-3 h-3" /> বাতিল
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">কোনো সদস্য নেই</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPModal && (
        <ProductFormModal
          product={productModal as Product | null}
          onClose={() => setShowPModal(false)}
          onSuccess={() => { setShowPModal(false); refetchProducts(); refetchStats(); }}
        />
      )}
      {orderModal && (
        <OrderDetailModal
          order={orderModal}
          onClose={() => setOrderModal(null)}
          onUpdate={() => { refetchOrders(); refetchStats(); }}
        />
      )}
    </div>
  );
}