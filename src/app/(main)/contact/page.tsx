'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import MainNavbar from '@/components/layout/MainNavbar';
import MainFooter from '@/components/layout/MainFooter';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
type FormData = z.infer<typeof schema>;

const INFO = [
  { icon: Phone, label: 'Phone', value: '+880 1734-166488', color: 'from-blue-500 to-indigo-600' },
  { icon: Mail, label: 'Email', value: 'harmonyhub3zf@gmail.com', color: 'from-purple-500 to-violet-600' },
  { icon: MapPin, label: 'Address', value: 'Madhabpur, Habiganj, Bangladesh', color: 'from-teal-500 to-cyan-600' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/contact', data);
      setSent(true); reset();
      toast.success('Message sent successfully!');
    } catch { toast.error('Failed to send message'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        <div className="gradient-brand text-white py-12 px-4 text-center">
          <h1 className="font-heading text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-purple-100">We'd love to hear from you</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {INFO.map(info => (
              <div key={info.label} className="card text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{info.label}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{info.value}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-16">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Message Sent!</h2>
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>We'll respond within 24-48 hours.</p>
                <button onClick={() => setSent(false)} className="btn-primary px-8 py-3">Send Another</button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                <h2 className="font-heading text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Send a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Full Name *</label>
                      <input placeholder="Your name" {...register('name')} />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Email *</label>
                      <input type="email" placeholder="your@email.com" {...register('email')} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Phone</label>
                      <input placeholder="+880 1..." {...register('phone')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Subject *</label>
                      <input placeholder="How can we help?" {...register('subject')} />
                      {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Message *</label>
                    <textarea rows={5} placeholder="Write your message here..." {...register('message')} />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base">
                    {loading ? <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <><Send className="w-5 h-5" /> Send Message</>}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
