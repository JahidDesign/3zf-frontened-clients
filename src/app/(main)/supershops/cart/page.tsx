'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, MapPin, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import PaymentGateway from '@/components/payment/PaymentGateway';
import api from '@/lib/api';
import useAuthStore from '@/store/authStore';

type Step = 'cart' | 'address' | 'payment' | 'success';

export default function CartPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [cart, setCart] = useState<any>({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('cart');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState({ name: '', phone: '', address: '', district: '', city: '', postalCode: '' });

  useEffect(() => { if (isAuthenticated) fetchCart(); }, [isAuthenticated]);
  useEffect(() => { if (user) setAddress(a => ({ ...a, name: user.name, phone: user.phone || '' })); }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try { const { data } = await api.get('/supershop/cart'); setCart(data.cart || { items: [], totalAmount: 0 }); }
    catch {} finally { setLoading(false); }
  };

  const updateQty = async (productId: string, delta: number) => {
    const item = cart.items.find((i: any) => i.product._id === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return removeItem(productId);
    try {
      await api.post('/supershop/cart/add', { productId, quantity: delta });
      setCart((prev: any) => ({
        ...prev,
        items: prev.items.map((i: any) => i.product._id === productId ? { ...i, quantity: newQty } : i),
        totalAmount: prev.items.reduce((s: number, i: any) => s + i.price * (i.product._id === productId ? newQty : i.quantity), 0),
      }));
    } catch { toast.error('Failed to update'); }
  };

  const removeItem = async (productId: string) => {
    try { const { data } = await api.delete(`/supershop/cart/remove/${productId}`); setCart(data.cart); toast.success('Item removed'); }
    catch { toast.error('Failed'); }
  };

  const createOrder = async (): Promise<string | null> => {
    try {
      const { data } = await api.post('/supershop/orders', { shippingAddress: address, paymentMethod: 'pending' });
      return data.order._id;
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to create order'); return null; }
  };

  const handleAddressNext = async () => {
    const required = ['name', 'phone', 'address', 'district'] as const;
    for (const f of required) { if (!address[f]) return toast.error(`${f} is required`); }
    const id = await createOrder();
    if (id) { setOrderId(id); setStep('payment'); }
  };

  const DISTRICTS = ['Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Barisal','Mymensingh','Rangpur','Comilla','Noakhali',"Cox's Bazar"];
  const steps = [{ key: 'cart', label: 'Cart' }, { key: 'address', label: 'Address' }, { key: 'payment', label: 'Payment' }, { key: 'success', label: 'Done' }];

  if (!isAuthenticated) return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)] flex items-center justify-center min-h-[60vh]">
        <div className="card text-center py-14 max-w-sm">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
          <p className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text)' }}>Login to view your cart</p>
          <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        <div className="gradient-brand text-white py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading text-2xl font-bold mb-4">
              {step === 'cart' ? 'Shopping Cart' : step === 'address' ? 'Delivery Address' : step === 'payment' ? 'Secure Payment' : 'Order Placed!'}
            </h1>
            <div className="flex items-center gap-2">
              {steps.map((s, i) => {
                const idx = steps.findIndex(x => x.key === step);
                const isDone = i < idx;
                const isActive = s.key === step;
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-white text-purple-700' : isDone ? 'bg-white/40 text-white' : 'bg-white/20 text-white/60'}`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm hidden sm:block ${isActive ? 'font-semibold' : 'text-purple-200'}`}>{s.label}</span>
                    {i < steps.length - 1 && <div className="w-6 h-px bg-white/30" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

            {step === 'cart' && (
              <div className="space-y-4">
                <div className="card">
                  <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--color-text)' }}>Items ({cart.items.length})</h2>
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2].map(i => <div key={i} className="flex gap-3"><div className="w-20 h-20 rounded-xl" style={{ background: 'var(--color-border)' }} /><div className="flex-1 space-y-2"><div className="h-3 rounded w-3/4" style={{ background: 'var(--color-border)' }} /><div className="h-3 rounded w-1/2" style={{ background: 'var(--color-border)' }} /></div></div>)}
                    </div>
                  ) : cart.items.length === 0 ? (
                    <div className="text-center py-14">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
                      <p className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Your cart is empty</p>
                      <Link href="/supershop" className="btn-primary px-6 py-2.5">Shop Now</Link>
                    </div>
                  ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                      {cart.items.map((item: any) => (
                        <div key={item.product._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--color-bg-secondary)' }}>
                            {item.product.images?.[0] ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1 truncate" style={{ color: 'var(--color-text)' }}>{item.product.name}</p>
                            <p className="font-bold" style={{ color: 'var(--color-brand)' }}>৳{item.price.toLocaleString()}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1.5 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                                <button onClick={() => updateQty(item.product._id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="w-8 text-center text-sm font-bold" style={{ color: 'var(--color-text)' }}>{item.quantity}</span>
                                <button onClick={() => updateQty(item.product._id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-bg-hover)] transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                              </div>
                              <button onClick={() => removeItem(item.product._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <p className="font-bold flex-shrink-0" style={{ color: 'var(--color-text)' }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.items.length > 0 && (
                  <div className="card">
                    <div className="flex justify-between text-sm mb-2"><span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span><span style={{ color: 'var(--color-text)' }}>৳{cart.totalAmount?.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm mb-3"><span style={{ color: 'var(--color-text-secondary)' }}>Delivery</span><span className="text-green-500 font-medium">Free</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text)' }}>Total</span>
                      <span style={{ color: 'var(--color-brand)' }}>৳{cart.totalAmount?.toLocaleString()}</span>
                    </div>
                    <button onClick={() => setStep('address')} className="btn-primary w-full py-3.5 mt-4 flex items-center justify-center gap-2 text-base">
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 'address' && (
              <div className="card space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
                  <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Delivery Address</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[{ key: 'name', label: 'Full Name *', placeholder: 'Recipient name' }, { key: 'phone', label: 'Phone *', placeholder: '01XXXXXXXXX' }].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>{f.label}</label>
                      <input value={address[f.key as keyof typeof address]} onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Full Address *</label>
                    <textarea rows={2} value={address.address} onChange={e => setAddress(a => ({ ...a, address: e.target.value }))} placeholder="House, Road, Area..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>District *</label>
                    <select value={address.district} onChange={e => setAddress(a => ({ ...a, district: e.target.value }))}>
                      <option value="">Select district</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>City / Thana</label>
                    <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="City or Thana" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep('cart')} className="btn-secondary flex-1 py-3">← Back</button>
                  <button onClick={handleAddressNext} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <PaymentGateway
                amount={cart.totalAmount}
                purpose="order"
                referenceId={orderId || undefined}
                customerPhone={address.phone}
                customerName={address.name}
                description={`${cart.items.length} item(s) — Free delivery to ${address.district}`}
                onSuccess={() => { setStep('success'); setCart({ items: [], totalAmount: 0 }); }}
                onCancel={() => setStep('address')}
              />
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-16">
                <div className="w-28 h-28 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Order Placed!</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>You'll receive a confirmation notification shortly.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/supershop/orders" className="btn-primary px-6 py-3">Track Order</Link>
                  <Link href="/supershop" className="btn-secondary px-6 py-3">Shop More</Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
