'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  Phone,
  Upload,
  Users,
  Crown,
  Star,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { useT } from '@/lib/i19n';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MembershipFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: string;
  paymentAmount: string;
  paymentNumber: string;
  transactionId: string;
}

interface Member {
  _id: string;
  name: string;
  memberId?: string;
  city?: string;
  joinedAt?: string;
  profilePhoto?: { url: string };
}

interface MyMembership {
  status: 'approved' | 'pending' | 'rejected';
  memberId?: string;
  transactionId?: string;
  joinedAt?: string;
  expiresAt?: string;
}

interface ConfigData {
  paymentNumbers?: Record<string, string>;
  benefits?: string[];
  membershipFee?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['ব্যক্তিগত তথ্য', 'পেমেন্ট', 'সম্পন্ন'] as const;

const PERSONAL_FIELDS: Array<{
  name: keyof MembershipFormValues;
  label: string;
  placeholder: string;
  required: boolean;
}> = [
  { name: 'name',    label: 'নাম *',    placeholder: 'আপনার নাম',       required: true  },
  { name: 'phone',   label: 'মোবাইল *', placeholder: '01XXXXXXXXX',     required: true  },
  { name: 'email',   label: 'ইমেইল',    placeholder: 'email@example.com', required: false },
  { name: 'address', label: 'ঠিকানা *', placeholder: 'বিস্তারিত ঠিকানা', required: true  },
  { name: 'city',    label: 'শহর',      placeholder: 'শহর/উপজেলা',      required: false },
];

const PAYMENT_METHODS = [
  { id: 'bkash',  label: 'bKash',  emoji: '💳' },
  { id: 'nagad',  label: 'Nagad',  emoji: '💰' },
  { id: 'rocket', label: 'Rocket', emoji: '🚀' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShopMembershipPage() {
  const t = useT();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [step, setStep]           = useState(0);
  const [activeTab, setActiveTab] = useState<'register' | 'members'>('register');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [copied, setCopied]       = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: configData } = useQuery<ConfigData>({
    queryKey: ['shop-config'],
    queryFn: () => api.get('/shop-membership/config').then(r => r.data),
  });

  const { data: myData } = useQuery<{ member: MyMembership }>({
    queryKey: ['my-shop-membership'],
    queryFn: () => api.get('/shop-membership/my').then(r => r.data),
    enabled: !!user,
  });

  const { data: membersData } = useQuery<{ members: Member[] }>({
    queryKey: ['shop-members'],
    queryFn: () => api.get('/shop-membership/members').then(r => r.data),
  });

  // ── Form ───────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<MembershipFormValues>({
    defaultValues: { paymentMethod: 'bkash', paymentAmount: '200' },
  });

  const watchPayMethod = watch('paymentMethod') || 'bkash';

  // ── Derived values ─────────────────────────────────────────────────────────

  const merchantNumber = configData?.paymentNumbers?.[watchPayMethod] ?? '01XXXXXXXXX';
  const myMembership   = myData?.member;
  const members        = membersData?.members ?? [];
  const benefits       = configData?.benefits ?? [];
  const FEE            = configData?.membershipFee ?? 200;

  // ── Mutation ───────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: (data: MembershipFormValues) => {
      const fd = new FormData();
      (Object.keys(data) as Array<keyof MembershipFormValues>).forEach(k => {
        if (data[k]) fd.append(k, String(data[k]));
      });
      if (photoFile) fd.append('profilePhoto', photoFile);
      return api.post('/shop-membership/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setStep(2);
      qc.invalidateQueries({ queryKey: ['my-shop-membership'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'ব্যর্থ হয়েছে'),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const copyNumber = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopied(true);
    toast.success('কপি হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleNextStep = async () => {
    const ok = await trigger(['name', 'phone', 'address']);
    if (ok) setStep(1);
  };

  const onSubmit = (data: MembershipFormValues) => mutation.mutate(data);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Supershop সদস্যতা</h1>
              <p className="text-pink-100 text-sm">প্রিমিয়াম সদস্য হন, বিশেষ সুবিধা উপভোগ করুন</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {benefits.map((b, i) => (
              <span key={i} className="flex items-center gap-1 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                <Star className="w-3 h-3" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-gray-900 rounded-2xl p-1 border border-gray-200 dark:border-gray-800 shadow-sm max-w-xs">
          {([
            { id: 'register' as const, label: 'সদস্যতা',                  Icon: Crown },
            { id: 'members'  as const, label: `সদস্য (${members.length})`, Icon: Users },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === id
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Register Tab ── */}
        {activeTab === 'register' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Status / Form card */}
            <div>
              {myMembership ? (
                /* ── Existing membership ── */
                <div className="card p-6">
                  <div className="text-center mb-4">
                    {myMembership.status === 'approved' ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-3">
                          <Crown className="w-8 h-8 text-pink-600" />
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">প্রিমিয়াম সদস্য</p>
                        <p className="badge-pink badge mt-1">ID: {myMembership.memberId}</p>
                      </>
                    ) : (
                      <>
                        <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <p className="font-bold text-gray-900 dark:text-white">আবেদন প্রক্রিয়াধীন</p>
                        <p className="text-sm text-gray-500 mt-1">TrxID: {myMembership.transactionId}</p>
                      </>
                    )}
                  </div>

                  {myMembership.status === 'approved' && (
                    <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-4">
                      {([
                        ['সদস্য ID', myMembership.memberId],
                        ['যোগদানের তারিখ', myMembership.joinedAt  ? format(new Date(myMembership.joinedAt),  'PPP') : '—'],
                        ['মেয়াদ',          myMembership.expiresAt ? format(new Date(myMembership.expiresAt), 'PPP') : 'আজীবন'],
                      ] as [string, string | undefined][]).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-gray-500">{k}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* ── Multi-step form ── */
                <div className="card p-6">
                  {/* Step progress bar */}
                  <div className="flex gap-2 mb-6">
                    {STEPS.map((s, i) => (
                      <div key={i} className="flex-1">
                        <div className={`h-1 rounded-full transition-all ${i <= step ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        <p className={`text-xs mt-1 text-center ${i <= step ? 'text-pink-600 font-medium' : 'text-gray-400'}`}>{s}</p>
                      </div>
                    ))}
                  </div>

                  {/* Step 2 — Success */}
                  {step === 2 && (
                    <div className="text-center py-4">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">আবেদন সফল!</h3>
                      <p className="text-sm text-gray-500">অ্যাডমিন যাচাই করার পর সদস্য হবেন।</p>
                    </div>
                  )}

                  {/* Step 0 — Personal info */}
                  {step === 0 && (
                    <div className="space-y-3">
                      {/* Photo upload */}
                      <div className="flex justify-center mb-4">
                        <label className="cursor-pointer">
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-pink-400 flex items-center justify-center bg-gray-50 dark:bg-gray-800 transition">
                            {photoPreview
                              ? <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                              : <Upload className="w-6 h-6 text-gray-400" />}
                          </div>
                          <p className="text-xs text-center text-gray-400 mt-1">ছবি</p>
                          <input
                            ref={photoRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handlePhotoChange}
                          />
                        </label>
                      </div>

                      {/* Personal fields */}
                      {PERSONAL_FIELDS.map(({ name, label, placeholder, required }) => (
                        <div key={name}>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {label}
                          </label>
                          <input
                            {...register(name, { required })}
                            className="input text-sm"
                            placeholder={placeholder}
                          />
                          {errors[name] && (
                            <p className="text-red-500 text-xs mt-0.5">প্রয়োজন</p>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full btn-primary py-2.5 flex items-center justify-center gap-1"
                      >
                        পরবর্তী <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Step 1 — Payment */}
                  {step === 1 && (
                    <div className="space-y-4">
                      {/* Fee display */}
                      <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-pink-700 dark:text-pink-300">সদস্যতা ফি</p>
                        <p className="text-3xl font-black text-pink-600">৳{FEE}</p>
                      </div>

                      {/* Payment method selector */}
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map(({ id, label, emoji }) => (
                          <label
                            key={id}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition ${
                              watchPayMethod === id
                                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <input {...register('paymentMethod')} type="radio" value={id} hidden />
                            <span className="text-xl">{emoji}</span>
                            <span className="text-xs font-bold mt-1 text-gray-700 dark:text-gray-300">{label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Merchant number */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="font-mono font-bold text-gray-900 dark:text-white">{merchantNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={copyNumber}
                          className="text-xs px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition"
                        >
                          {copied ? 'কপি!' : 'কপি'}
                        </button>
                      </div>

                      {/* Transaction fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            পেমেন্ট নম্বর *
                          </label>
                          <input
                            {...register('paymentNumber', { required: true })}
                            className="input text-sm"
                            placeholder="01XXXXXXXXX"
                          />
                          {errors.paymentNumber && (
                            <p className="text-red-500 text-xs mt-0.5">প্রয়োজন</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Transaction ID *
                          </label>
                          <input
                            {...register('transactionId', { required: true })}
                            className="input text-sm font-mono"
                            placeholder="TrxID"
                          />
                          {errors.transactionId && (
                            <p className="text-red-500 text-xs mt-0.5">প্রয়োজন</p>
                          )}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setStep(0)}
                          className="flex-1 btn-secondary"
                        >
                          ← পূর্ববর্তী
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit(onSubmit)}
                          disabled={mutation.isPending}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                          জমা দিন
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Benefits sidebar ── */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-pink-500" /> প্রিমিয়াম সুবিধাসমূহ
              </h3>
              <div className="space-y-3">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-900/10">
                    <CheckCircle className="w-5 h-5 text-pink-500 shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{b}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl text-center">
                <p className="font-bold text-pink-700 dark:text-pink-400 text-lg">মাত্র ৳{FEE}</p>
                <p className="text-xs text-gray-500 mt-1">একবারের পেমেন্ট — আজীবন সদস্যতা</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Members Tab ── */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((m) => (
              <div key={m._id} className="card p-4 text-center hover:shadow-md transition">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {m.profilePhoto?.url
                    ? <img src={m.profilePhoto.url} alt={m.name} className="w-full h-full object-cover" />
                    : m.name?.[0]}
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.name}</p>
                {m.memberId  && <p className="text-xs text-pink-500 mt-0.5 font-mono">{m.memberId}</p>}
                {m.city      && <p className="text-xs text-gray-400 mt-1">{m.city}</p>}
                {m.joinedAt  && <p className="text-xs text-gray-300 dark:text-gray-600">{format(new Date(m.joinedAt), 'MMM yyyy')}</p>}
              </div>
            ))}

            {members.length === 0 && (
              <div className="col-span-full card p-12 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <p>কোনো সদস্য নেই এখনো</p>
              </div>
            )}
          </div>
        )}
      </div>

      <MainFooter />
    </div>
  );
}