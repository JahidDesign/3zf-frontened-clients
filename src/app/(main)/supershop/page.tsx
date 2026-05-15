'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import useAuthStore from '@/store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Store, Home, List, Plus, MapPin, Users, MessageCircle,
  Calendar, Share2, Bell, ChevronRight, ChevronLeft, ArrowLeft,
  Check, Clock, X, AlertCircle, Send, Loader2, Copy,
  CheckCircle2, Hash, Phone, Shield, LogIn, Heart,
  ExternalLink, UserPlus, BadgeCheck, Megaphone, Search,
  CreditCard, ChevronUp, ChevronDown, Filter, SlidersHorizontal,
  Download, Eye, XCircle, User,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ShopStatus       = 'pending' | 'approved' | 'rejected';
type MembershipStatus = 'pending' | 'approved' | 'rejected';
type KycStatus        = 'pending' | 'approved' | 'rejected';
type GenderType       = 'male' | 'female' | 'other';
type IdType           = 'nid' | 'passport' | 'birth_certificate';
type SortKey          = 'name' | 'joinedAt' | 'status' | 'region';
type SortDir          = 'asc' | 'desc';

interface CommunityShop {
  _id: string;
  name: string;
  region: string;
  area: string;
  description?: string;
  status: ShopStatus;
  memberCount: number;
  createdBy: { name: string };
  createdAt: string;
}

interface ShopPost {
  _id: string;
  author: { name: string; avatar?: string };
  content: string;
  type: 'update' | 'announcement' | 'general';
  likes: number;
  comments: number;
  liked?: boolean;
  createdAt: string;
}

interface ChatMessage {
  _id: string;
  sender: { name: string; _id: string };
  content: string;
  createdAt: string;
}

interface ShopEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
  type: 'online' | 'offline';
  link?: string;
  location?: string;
}

interface ShopMember {
  _id: string;
  name: string;
  memberId: string;
  joinedAt: string;
  gender?: GenderType;
  age?: number;
  region?: string;
  address?: string;
  profilePhoto?: { url: string; publicId: string };
  role?: 'admin' | 'member';
  phone?: string;
  idType?: IdType;
  nidPassport?: string;
  status?: KycStatus;
  fatherName?: string;
  motherName?: string;
  dob?: string;
}

interface KycFormState {
  name: string;
  dob: string;
  age: string;
  gender: GenderType;
  fatherName: string;
  motherName: string;
  phone: string;
  address: string;
  region: string;
  nidPassport: string;
  idType: IdType;
}

// ─────────────────────────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────────────────────────

const createShopSchema = z.object({
  name:        z.string().min(3, 'শপের নাম কমপক্ষে ৩ অক্ষর হতে হবে'),
  region:      z.string().min(1, 'বিভাগ বেছে নিন'),
  area:        z.string().min(2, 'উপজেলা / এলাকা লিখুন'),
  description: z.string().optional(),
  phone:       z.string().min(11, 'সঠিক ফোন নম্বর দিন'),
});

type CreateShopForm = z.infer<typeof createShopSchema>;

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const BD_DIVISIONS = [
  'ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','রংপুর','ময়মনসিংহ',
];

const ID_TYPE_LABELS: Record<IdType, string> = {
  nid:               'NID',
  passport:          'পাসপোর্ট',
  birth_certificate: 'জন্ম নিব.',
};

const GENDER_LABELS: Record<GenderType, string> = {
  male:   'পুরুষ',
  female: 'মহিলা',
  other:  'অন্যান্য',
};

// ─────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────

function Avatar({
  name, size = 'md', color = 'green',
}: { name: string; size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const colors: Record<string, string> = {
    green:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    blue:   'bg-blue-100  dark:bg-blue-900/30  text-blue-700  dark:text-blue-300',
    amber:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    red:    'bg-red-100   dark:bg-red-900/30   text-red-700   dark:text-red-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  };
  const initials = name.trim().charAt(0).toUpperCase();
  const col = colors[color] ?? colors.green;
  return (
    <div className={`${sizes[size]} ${col} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

function StatusBadge({ status }: { status: ShopStatus | MembershipStatus }) {
  const cfg = {
    pending:  { label: 'অপেক্ষায়',    cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' },
    approved: { label: 'অনুমোদিত',   cls: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' },
    rejected: { label: 'প্রত্যাখ্যাত', cls: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800' },
  };
  const s = cfg[status];
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
  );
}

function KycStatusDot({ status }: { status: KycStatus }) {
  const cfg = {
    pending:  { dot: 'bg-amber-400', label: 'অপেক্ষমান',    cls: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
    approved: { dot: 'bg-green-500', label: 'অনুমোদিত',    cls: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
    rejected: { dot: 'bg-red-500',   label: 'প্রত্যাখ্যাত', cls: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

function PostTypeBadge({ type }: { type: ShopPost['type'] }) {
  if (type === 'announcement') return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
      <Megaphone className="w-3 h-3" /> ঘোষণা
    </span>
  );
  if (type === 'update') return (
    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
      <Bell className="w-3 h-3" /> আপডেট
    </span>
  );
  return null;
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

const MOCK_SHOPS: CommunityShop[] = [
  {
    _id: 'sylhet-sadar',
    name: 'সিলেট সদর কমিউনিটি শপ',
    region: 'সিলেট',
    area: 'সিলেট সদর',
    description: 'সিলেট সদরের বাসিন্দাদের জন্য কমিউনিটি শপ',
    status: 'approved',
    memberCount: 47,
    createdBy: { name: 'কামাল উদ্দিন' },
    createdAt: '2024-12-01',
  },
  {
    _id: 'mohammadpur',
    name: 'মোহাম্মদপুর কমিউনিটি শপ',
    region: 'ঢাকা',
    area: 'মোহাম্মদপুর',
    description: 'মোহাম্মদপুর এলাকার কমিউনিটি',
    status: 'approved',
    memberCount: 63,
    createdBy: { name: 'রহিম সাহেব' },
    createdAt: '2024-11-15',
  },
  {
    _id: 'chawkbazar',
    name: 'চকবাজার কমিউনিটি শপ',
    region: 'চট্টগ্রাম',
    area: 'চকবাজার',
    status: 'approved',
    memberCount: 51,
    createdBy: { name: 'করিম সাহেব' },
    createdAt: '2024-11-20',
  },
  {
    _id: 'rajshahi',
    name: 'রাজশাহী সিটি কমিউনিটি শপ',
    region: 'রাজশাহী',
    area: 'রাজশাহী সিটি',
    status: 'pending',
    memberCount: 0,
    createdBy: { name: 'জহির সাহেব' },
    createdAt: '2025-01-10',
  },
  {
    _id: 'mirpur',
    name: 'মিরপুর কমিউনিটি শপ',
    region: 'ঢাকা',
    area: 'মিরপুর-১০',
    description: 'মিরপুর বাসিন্দাদের কমিউনিটি',
    status: 'approved',
    memberCount: 88,
    createdBy: { name: 'হাসান সাহেব' },
    createdAt: '2024-10-10',
  },
];

const MOCK_POSTS: ShopPost[] = [
  {
    _id: 'p1',
    author: { name: 'রাহেলা বেগম' },
    content: 'এই সপ্তাহে রবিবার বিকেল ৪টায় মাসিক সভা আছে। সবাইকে উপস্থিত থাকার অনুরোধ করা হচ্ছে।',
    type: 'update',
    likes: 12,
    comments: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'p2',
    author: { name: 'কামাল উদ্দিন' },
    content: '🎉 নতুন ৫ জন সদস্য আমাদের শপে যোগ দিয়েছেন! সবাইকে স্বাগতম।',
    type: 'announcement',
    likes: 28,
    comments: 3,
    liked: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'p3',
    author: { name: 'নাদিয়া আক্তার' },
    content: 'আজ শপ থেকে অর্ডার দিলাম, খুব দ্রুত ডেলিভারি পেলাম! সবাইকে ধন্যবাদ 💚',
    type: 'general',
    likes: 9,
    comments: 1,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { _id: 'm1', sender: { name: 'রাহেলা বেগম', _id: 'u1' }, content: 'সবাইকে সালাম, আজ সন্ধ্যায় কেউ শপে আসবেন?', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'm2', sender: { name: 'আপনি', _id: 'me' }, content: 'আমি আসব ইনশাআল্লাহ', createdAt: new Date(Date.now() - 3000000).toISOString() },
  { _id: 'm3', sender: { name: 'কামাল উদ্দিন', _id: 'u2' }, content: 'আমিও আসব। মিটিং লিঙ্ক পরে শেয়ার করব।', createdAt: new Date(Date.now() - 1800000).toISOString() },
];

const MOCK_EVENTS: ShopEvent[] = [
  { _id: 'e1', title: 'মাসিক সাধারণ সভা', date: 'রবিবার, ১৮ মে ২০২৫', time: 'বিকেল ৪:০০', type: 'online', link: 'meet.google.com/abc-defg-hij' },
  { _id: 'e2', title: 'নতুন সদস্য অভিনন্দন অনুষ্ঠান', date: 'বুধবার, ২১ মে ২০২৫', time: 'সন্ধ্যা ৬:০০', type: 'offline', location: 'শপ কার্যালয়, সিলেট সদর' },
];

const MOCK_MEMBERS: ShopMember[] = [
  {
    _id: 'u2', name: 'কামাল উদ্দিন', memberId: 'SHP-ADMIN1', joinedAt: '2024-12-01', role: 'admin',
    gender: 'male', age: 42, region: 'সিলেট', phone: '01711-234567',
    idType: 'nid', nidPassport: '1234567890123', status: 'approved',
    address: 'সিলেট সদর, সিলেট', fatherName: 'আব্দুল করিম', motherName: 'ফাতেমা বেগম', dob: '1982-05-15',
  },
  {
    _id: 'u1', name: 'রাহেলা বেগম', memberId: 'SHP-M9KX2', joinedAt: '2024-12-05',
    gender: 'female', age: 35, region: 'সিলেট', phone: '01812-345678',
    idType: 'nid', nidPassport: '9876543210987', status: 'approved',
    address: 'আম্বরখানা, সিলেট', fatherName: 'মোহাম্মদ আলী', motherName: 'রহিমা বেগম', dob: '1989-08-22',
  },
  {
    _id: 'u3', name: 'নাদিয়া আক্তার', memberId: 'SHP-P3ZT8', joinedAt: '2024-12-18',
    gender: 'female', age: 28, region: 'সিলেট', phone: '01912-456789',
    idType: 'passport', nidPassport: 'BN0123456', status: 'approved',
    address: 'জালালাবাদ, সিলেট', fatherName: 'করিম সাহেব', motherName: 'সালমা বেগম', dob: '1996-03-10',
  },
  {
    _id: 'u4', name: 'মোহাম্মদ রফিক', memberId: 'SHP-R7YU3', joinedAt: '2025-01-05',
    gender: 'male', age: 31, region: 'সিলেট', phone: '01611-567890',
    idType: 'nid', nidPassport: '5556667778889', status: 'pending',
    address: 'মিরাবাজার, সিলেট', fatherName: 'হাসান মিয়া', motherName: 'নূর বেগম', dob: '1993-11-17',
  },
  {
    _id: 'u5', name: 'সাবরিনা খানম', memberId: 'SHP-S2WQ6', joinedAt: '2025-01-12',
    gender: 'female', age: 26, region: 'সিলেট', phone: '01511-678901',
    idType: 'birth_certificate', nidPassport: 'BC98765432', status: 'approved',
    address: 'উপশহর, সিলেট', fatherName: 'জহিরুল ইসলাম', motherName: 'মরিয়ম বেগম', dob: '1998-07-04',
  },
  {
    _id: 'u6', name: 'আবুল কাশেম', memberId: 'SHP-K4XP1', joinedAt: '2025-01-20',
    gender: 'male', age: 55, region: 'সিলেট', phone: '01711-789012',
    idType: 'nid', nidPassport: '3334445556667', status: 'rejected',
    address: 'বন্দরবাজার, সিলেট', fatherName: 'মোক্তার আলী', motherName: 'আনোয়ারা বেগম', dob: '1969-02-28',
  },
  {
    _id: 'me', name: 'আপনি', memberId: 'SHP-A7RT1', joinedAt: '2025-01-10',
    gender: 'male', age: 30, region: 'সিলেট', phone: '01911-890123',
    idType: 'nid', nidPassport: '1112223334445', status: 'approved',
    address: 'শাহজালাল উপশহর, সিলেট', fatherName: 'আহমদ সাহেব', motherName: 'খাদিজা বেগম', dob: '1994-09-12',
  },
];

// ─────────────────────────────────────────────────────────────
// KYC FileInput helper
// ─────────────────────────────────────────────────────────────

function KycFileInput({
  label, file, onChange, required = false,
}: { label: string; file: File | null; onChange: (f: File) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <label className={`flex items-center gap-3 cursor-pointer border-2 border-dashed rounded-xl px-4 py-3 transition ${
        file ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
      }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${file ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
          {file ? <Check className="w-4 h-4 text-green-600" /> : <Plus className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">{file ? file.name : 'ছবি বেছে নিন'}</p>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG — সর্বোচ্চ ৫MB</p>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Member Detail Modal (for KYC table row click)
// ─────────────────────────────────────────────────────────────

function MemberDetailModal({
  member, onClose,
}: { member: ShopMember; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-green-500" /> সদস্য বিবরণ
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Profile */}
          <div className="flex items-center gap-4">
            {member.profilePhoto?.url ? (
              <img src={member.profilePhoto.url} alt={member.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-gray-700 shrink-0" />
            ) : (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ${
                member.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' : 'bg-green-100 dark:bg-green-900/30 text-green-700'
              }`}>
                {member.name.trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-black text-lg text-gray-900 dark:text-white">{member.name}</h3>
                {member.role === 'admin' && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100 dark:border-amber-800">অ্যাডমিন</span>
                )}
              </div>
              <p className="text-xs font-mono text-gray-400">#{member.memberId}</p>
              {member.status && <div className="mt-1"><KycStatusDot status={member.status} /></div>}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: Phone,      label: 'ফোন',        value: member.phone },
              { icon: MapPin,     label: 'বিভাগ',      value: member.region },
              { icon: Calendar,   label: 'জন্ম তারিখ', value: member.dob ? format(new Date(member.dob), 'dd MMM yyyy') : '—' },
              { icon: User,       label: 'বয়স',        value: member.age ? `${member.age} বছর` : '—' },
              { icon: User,       label: 'পিতার নাম',  value: member.fatherName },
              { icon: User,       label: 'মাতার নাম',  value: member.motherName },
              { icon: CreditCard, label: 'ID ধরন',     value: member.idType ? ID_TYPE_LABELS[member.idType] : '—' },
              { icon: CreditCard, label: 'ID নম্বর',   value: member.nidPassport },
              { icon: MapPin,     label: 'ঠিকানা',     value: member.address, full: true },
            ].filter(i => i.value).map(item => (
              <div key={item.label} className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 ${(item as any).full ? 'col-span-2' : ''}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <item.icon className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3 h-3" /> যোগদান:
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {format(new Date(member.joinedAt), 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KYC Members Table (full table inside ShopInnerScreen)
// ─────────────────────────────────────────────────────────────

function KycMembersTable({ members, isLoading }: { members: ShopMember[]; isLoading: boolean }) {
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState<KycStatus | 'all'>('all');
  const [genderFilter, setGenderFilter]   = useState<GenderType | 'all'>('all');
  const [sortKey, setSortKey]             = useState<SortKey>('joinedAt');
  const [sortDir, setSortDir]             = useState<SortDir>('desc');
  const [page, setPage]                   = useState(1);
  const [selected, setSelected]           = useState<ShopMember | null>(null);
  const [showFilters, setShowFilters]     = useState(false);
  const perPage = 5;

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
    setPage(1);
  };

  const filtered = members
    .filter(m => statusFilter === 'all' || m.status === statusFilter)
    .filter(m => genderFilter === 'all' || m.gender === genderFilter)
    .filter(m => !search || m.name.includes(search) || (m.memberId ?? '').includes(search) || (m.phone ?? '').includes(search) || (m.region ?? '').includes(search));

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = '', bv: string | number = '';
    if (sortKey === 'name')     { av = a.name;     bv = b.name; }
    if (sortKey === 'joinedAt') { av = a.joinedAt; bv = b.joinedAt; }
    if (sortKey === 'status')   { av = a.status ?? ''; bv = b.status ?? ''; }
    if (sortKey === 'region')   { av = a.region ?? ''; bv = b.region ?? ''; }
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const headers = ['নাম', 'সদস্য ID', 'ফোন', 'বিভাগ', 'লিঙ্গ', 'ID ধরন', 'ID নম্বর', 'অবস্থা', 'যোগদানের তারিখ'];
    const rows = sorted.map(m => [
      m.name, m.memberId, m.phone ?? '', m.region ?? '',
      m.gender ? GENDER_LABELS[m.gender] : '',
      m.idType ? ID_TYPE_LABELS[m.idType] : '',
      m.nidPassport ?? '',
      m.status ?? '',
      format(new Date(m.joinedAt), 'dd/MM/yyyy'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `members-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const SortTh = ({ label, k, className = '' }: { label: string; k: SortKey; className?: string }) => (
    <th
      onClick={() => handleSort(k)}
      className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200 whitespace-nowrap transition-colors ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="opacity-60">
          {sortKey === k
            ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
            : <ChevronUp className="w-3 h-3 opacity-30" />}
        </span>
      </div>
    </th>
  );

  const stats = {
    total:    members.length,
    approved: members.filter(m => m.status === 'approved').length,
    pending:  members.filter(m => m.status === 'pending').length,
    rejected: members.filter(m => m.status === 'rejected').length,
  };

  const avatarColors = [
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'মোট',      value: stats.total,    cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
          { label: 'অনুমোদিত', value: stats.approved, cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
          { label: 'অপেক্ষমান', value: stats.pending,  cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
          { label: 'বাতিল',    value: stats.rejected, cls: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-3 text-center ${s.cls}`}>
            <p className="text-xl font-black leading-none">{s.value}</p>
            <p className="text-[11px] font-semibold mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="নাম, ID বা ফোন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              showFilters
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> ফিল্টার
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>

        {/* Status pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {(['all', 'approved', 'pending', 'rejected'] as const).map(s => {
            const labels: Record<string, string> = { all: 'সব', approved: 'অনুমোদিত', pending: 'অপেক্ষমান', rejected: 'বাতিল' };
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                  statusFilter === s
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800 pt-2.5">
            <select
              value={genderFilter}
              onChange={e => { setGenderFilter(e.target.value as any); setPage(1); }}
              className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-400 transition"
            >
              <option value="all">— সব লিঙ্গ —</option>
              <option value="male">পুরুষ</option>
              <option value="female">মহিলা</option>
              <option value="other">অন্যান্য</option>
            </select>
            {genderFilter !== 'all' && (
              <button
                onClick={() => setGenderFilter('all')}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> ক্লিয়ার
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/3" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
          <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="font-semibold text-gray-400 text-sm">কোনো সদস্য পাওয়া যায়নি</p>
          {search && <p className="text-xs text-gray-400 mt-1">অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন</p>}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
                  <SortTh label="সদস্য" k="name"     className="pl-4 w-[28%]" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[14%]">ফোন</th>
                  <SortTh label="বিভাগ"    k="region"   className="w-[12%]" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[12%]">ID ধরন</th>
                  <SortTh label="অবস্থা"   k="status"   className="w-[13%]" />
                  <SortTh label="যোগদান"   k="joinedAt" className="w-[13%]" />
                  <th className="px-3 py-3 w-[8%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginated.map((m, idx) => (
                  <tr
                    key={m._id}
                    onClick={() => setSelected(m)}
                    className="hover:bg-green-50/40 dark:hover:bg-green-900/10 cursor-pointer transition-colors"
                  >
                    {/* Name + avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {m.profilePhoto?.url ? (
                          <img src={m.profilePhoto.url} alt={m.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0" />
                        ) : (
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                            m.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : avatarColors[idx % avatarColors.length]
                          }`}>
                            {m.name.trim().charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{m.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono">#{m.memberId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {m.phone ?? '—'}
                    </td>

                    {/* Region */}
                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {m.region ?? '—'}
                    </td>

                    {/* ID type */}
                    <td className="px-3 py-3">
                      {m.idType ? (
                        <span className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg font-medium">
                          {ID_TYPE_LABELS[m.idType]}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      {m.role === 'admin' ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">অ্যাডমিন</span>
                      ) : m.status ? (
                        <KycStatusDot status={m.status} />
                      ) : '—'}
                    </td>

                    {/* Join date */}
                    <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {format(new Date(m.joinedAt), 'dd MMM yyyy')}
                      <br />
                      <span className="text-gray-400">{m.gender ? GENDER_LABELS[m.gender] : ''}</span>
                    </td>

                    {/* View button */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(m)}
                        className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            মোট <strong className="text-gray-700 dark:text-gray-300">{sorted.length}</strong> সদস্যের মধ্যে{' '}
            <strong>{(page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)}</strong> দেখাচ্ছে
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
                  page === p
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Member detail modal */}
      {selected && <MemberDetailModal member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────

function HeroSection({
  stats, onGoShopList, onCreateShop,
}: {
  stats: { totalShops: number; totalMembers: number; totalRegions: number };
  onGoShopList: () => void;
  onCreateShop: () => void;
}) {
  const features = [
    { icon: Users,         color: 'green', title: 'কমিউনিটি',       desc: 'প্রতিবেশীদের সাথে সংযুক্ত' },
    { icon: MessageCircle, color: 'blue',  title: 'গ্রুপ চ্যাট',    desc: 'সদস্যদের সাথে কথা বলুন'   },
    { icon: Calendar,      color: 'amber', title: 'মিটিং ও ইভেন্ট', desc: 'সভার আপডেট পান'           },
    { icon: Share2,        color: 'green', title: 'আমন্ত্রণ',        desc: 'বন্ধুদের যোগ দেওয়ান'     },
  ] as const;

  const iconBg: Record<string, string> = {
    green: 'bg-green-100 dark:bg-green-900/40',
    amber: 'bg-amber-100 dark:bg-amber-900/40',
    blue:  'bg-blue-100  dark:bg-blue-900/40',
  };
  const iconColor: Record<string, string> = {
    green: 'text-green-700 dark:text-green-300',
    amber: 'text-amber-600 dark:text-amber-300',
    blue:  'text-blue-600  dark:text-blue-300',
  };

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 dark:from-green-900 dark:via-green-800 dark:to-emerald-900 mb-4 min-h-[300px] flex flex-col justify-between shadow-xl shadow-green-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-green-600/30 -translate-y-1/3 translate-x-1/4 pointer-events-none blur-2xl" />
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 px-6 pt-7 pb-2">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            <span className="text-xs font-semibold text-white/90">{stats.totalShops}+ সক্রিয় শপ চলছে</span>
          </div>
          <h1 className="text-white font-black text-[26px] leading-[1.25] mb-3 tracking-tight">
            আপনার এলাকার<br />
            <span className="text-green-300">কমিউনিটি শপে</span><br />
            যোগ দিন আজই
          </h1>
          <p className="text-white/65 text-sm leading-relaxed mb-5 max-w-[280px]">
            একসাথে কেনাকাটা করুন, কমিউনিটি গড়ুন, বন্ধুদের সাথে সংযুক্ত থাকুন।
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={onGoShopList} className="flex items-center gap-2 bg-white text-green-800 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-all active:scale-[.97] shadow-lg shadow-black/10">
              <Store className="w-4 h-4" /> শপ খুঁজুন
            </button>
            <button onClick={onCreateShop} className="flex items-center gap-2 bg-white/10 border border-white/25 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-[.97]">
              <Plus className="w-4 h-4" /> শপ তৈরি করুন
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 border-t border-white/10 bg-black/10 backdrop-blur-sm">
          {[
            { num: `${stats.totalShops}+`, lbl: 'সক্রিয় শপ' },
            { num: `${stats.totalMembers}+`, lbl: 'মোট সদস্য' },
            { num: stats.totalRegions, lbl: 'বিভাগ' },
          ].map((s, i) => (
            <div key={s.lbl} className={`py-4 text-center ${i < 2 ? 'border-r border-white/10' : ''}`}>
              <p className="text-white font-black text-xl leading-none">{s.num}</p>
              <p className="text-white/50 text-[11px] mt-1">{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {features.map(f => (
          <button key={f.title} onClick={onGoShopList} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-3 py-3 text-left hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all active:scale-[.99] shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg[f.color]}`}>
              <f.icon className={`w-4 h-4 ${iconColor[f.color]}`} />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 dark:text-white">{f.title}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{f.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 py-2 mb-1">
        <div className="flex">
          {['র', 'ক', 'স', 'ম'].map((initial, i) => {
            const bgs = ['bg-green-100 text-green-700', 'bg-blue-100 text-blue-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700'];
            return (
              <div key={i} className={`w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold ${bgs[i]} ${i > 0 ? '-ml-2' : ''}`}>
                {initial}
              </div>
            );
          })}
          <div className="-ml-2 w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">+</div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-700 dark:text-gray-200">{stats.totalMembers - 4} জন সদস্য</span> ইতিমধ্যে যোগ দিয়েছেন
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN: Home
// ─────────────────────────────────────────────────────────────

function HomeScreen({ onGoShopList, onOpenMyShop, onCreateShop, myShop, onJoinShop }: {
  onGoShopList: () => void; onOpenMyShop: () => void; onCreateShop: () => void;
  onJoinShop: () => void; myShop: CommunityShop | null;
}) {
  const { data: statsData } = useQuery({
    queryKey: ['shop-stats'],
    queryFn: () => api.get('/community-shops/stats').then(r => r.data).catch(() => ({ totalShops: 14, totalMembers: 386, totalRegions: 8 })),
  });
  const stats = statsData ?? { totalShops: 14, totalMembers: 386, totalRegions: 8 };

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['shop-members-home'],
    queryFn: () => api.get('/shop-membership/members').then(r => r.data.members as ShopMember[]).catch(() => MOCK_MEMBERS as ShopMember[]),
  });
  const members: ShopMember[] = membersData ?? [];

  const benefits = [
    { icon: '🛒', title: 'বিশেষ ছাড়', desc: 'সব পণ্যে এক্সক্লুসিভ সদস্য মূল্য' },
    { icon: '🚚', title: 'বিনামূল্যে ডেলিভারি', desc: 'প্রতি অর্ডারে ফ্রি ডেলিভারি' },
    { icon: '💬', title: 'প্রিমিয়াম সাপোর্ট', desc: '২৪/৭ অগ্রাধিকার সহায়তা' },
    { icon: '🎁', title: 'আর্লি অ্যাক্সেস', desc: 'নতুন পণ্য সবার আগে পান' },
    { icon: '📰', title: 'মাসিক নিউজলেটার', desc: 'অফার ও আপডেট সরাসরি ইনবক্সে' },
    { icon: '🤝', title: 'কমিউনিটি সুবিধা', desc: 'মিটিং, ইভেন্ট ও গ্রুপ চ্যাট' },
  ];

  const steps = [
    { num: '১', title: 'শপ বেছে নিন', desc: 'আপনার এলাকার শপ খুঁজে নিন' },
    { num: '২', title: 'KYC ফর্ম পূরণ করুন', desc: 'ছবি ও NID আপলোড করুন' },
    { num: '৩', title: 'অ্যাডমিন যাচাই', desc: 'তথ্য যাচাইয়ের পর সক্রিয়' },
    { num: '৪', title: 'সদস্যতা পান', desc: 'নোটিফিকেশনে জানানো হবে' },
  ];

  const avatarColors = [
    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  ];

  return (
    <div className="pb-10">
      <HeroSection stats={stats} onGoShopList={onGoShopList} onCreateShop={onCreateShop} />

      {myShop && (
        <div className="mx-4 mb-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800 flex items-start gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{myShop.name}</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">আজ ২টি নতুন আপডেট আছে।</p>
            <button onClick={onOpenMyShop} className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-1.5 underline underline-offset-2">দেখুন →</button>
          </div>
        </div>
      )}

      <div className="px-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 dark:via-green-800 to-transparent" />
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-full px-3 py-1">
            <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-black text-green-700 dark:text-green-300 tracking-wide">KYC যাচাই করুন</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 dark:via-green-800 to-transparent" />
        </div>

        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-700 via-green-700 to-teal-800 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900 shadow-xl shadow-green-900/25 mb-4">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  <span className="text-xs font-semibold text-white/90">একবার যাচাই, আজীবন সদস্যতা</span>
                </div>
                <h2 className="text-white font-black text-2xl leading-tight">Harmony Shop<br /><span className="text-green-300">সদস্যপদ</span></h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7 text-green-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {benefits.map(b => (
                <div key={b.title} className="flex items-start gap-2 bg-white/8 rounded-xl p-2.5 border border-white/10">
                  <span className="text-base leading-none mt-0.5 shrink-0">{b.icon}</span>
                  <div>
                    <p className="text-white font-bold text-xs leading-tight">{b.title}</p>
                    <p className="text-white/55 text-[11px] leading-snug mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {!myShop ? (
              <button onClick={onJoinShop} className="w-full flex items-center justify-center gap-2 bg-white text-green-800 font-black text-sm py-3.5 rounded-2xl hover:bg-green-50 transition-all active:scale-[.98] shadow-lg">
                <Shield className="w-4 h-4" /> KYC যাচাই করে সদস্য হন
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-2xl py-3">
                <BadgeCheck className="w-4 h-4 text-green-300" />
                <span className="text-white font-bold text-sm">আপনি ইতিমধ্যে সদস্য ✓</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="font-black text-sm text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-green-600" />
            </div>
            কীভাবে সদস্য হবেন?
          </h3>
          <div className="space-y-3">
            {steps.map(s => (
              <div key={s.num} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-green-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-green-600/30">{s.num}</div>
                <div className="flex-1 pt-0.5">
                  <p className="font-bold text-sm text-gray-800 dark:text-white">{s.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {!myShop && (
            <button onClick={onJoinShop} className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 dark:text-green-400 font-bold text-sm py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition active:scale-[.98]">
              <UserPlus className="w-4 h-4" /> KYC দিয়ে আবেদন করুন
            </button>
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-black text-base text-gray-900 dark:text-white leading-none">আমাদের সদস্যরা</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">{membersLoading ? 'লোড হচ্ছে...' : `${members.length} জন অনুমোদিত সদস্য`}</p>
            </div>
          </div>
          <button onClick={onGoShopList} className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1 hover:underline">
            সব দেখুন <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {membersLoading && (
          <div className="space-y-2.5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/3" />
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!membersLoading && members.length > 0 && (
          <div className="space-y-2.5">
            {members.slice(0, 5).map((m, idx) => (
              <div key={m._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-center gap-3 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all shadow-sm">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                  {m.name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{m.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {m.region && <span className="flex items-center gap-1 text-[11px] text-gray-400"><MapPin className="w-2.5 h-2.5" /> {m.region}</span>}
                    {m.joinedAt && <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock className="w-2.5 h-2.5" />{format(new Date(m.joinedAt), 'MMM yyyy')}</span>}
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800">
                  <BadgeCheck className="w-2.5 h-2.5" /> সক্রিয়
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN: Shop List
// ─────────────────────────────────────────────────────────────

function ShopListScreen({ onOpenShop, onCreateShop, myMemberships }: {
  onOpenShop: (shop: CommunityShop) => void; onCreateShop: () => void; myMemberships: string[];
}) {
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('সব');

  const { data, isLoading } = useQuery({
    queryKey: ['community-shops'],
    queryFn: () => api.get('/community-shops').then(r => r.data).catch(() => ({ shops: MOCK_SHOPS })),
  });
  const shops: CommunityShop[] = data?.shops ?? MOCK_SHOPS;

  const filtered = shops
    .filter(s => s.status === 'approved' || myMemberships.includes(s._id))
    .filter(s => !search || s.name.includes(search) || s.area.includes(search) || s.region.includes(search))
    .filter(s => filterRegion === 'সব' || s.region === filterRegion);

  return (
    <div className="pb-8">
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-black text-xl text-gray-900 dark:text-white">শপ তালিকা</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length}টি শপ পাওয়া গেছে</p>
          </div>
          <button onClick={onCreateShop} className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-green-700 transition shadow-sm shadow-green-600/30 active:scale-[.97]">
            <Plus className="w-3.5 h-3.5" /> নতুন শপ
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="শপের নাম বা এলাকা লিখুন..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {['সব', ...BD_DIVISIONS].map(r => (
            <button key={r} onClick={() => setFilterRegion(r)} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${filterRegion === r ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto mb-2" /></div>
        ) : filtered.map(shop => {
          const isMember = myMemberships.includes(shop._id);
          return (
            <button key={shop._id} onClick={() => onOpenShop(shop)} className="w-full text-left bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-start gap-3.5 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all active:scale-[.99] shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center text-2xl shrink-0 border border-green-100 dark:border-green-800">🏪</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-0.5 truncate">{shop.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{shop.area}, {shop.region}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={shop.status} />
                  <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-full font-semibold">
                    <Users className="w-3 h-3" /> {shop.memberCount}
                  </span>
                  {isMember && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 px-2 py-0.5 rounded-full font-semibold">
                      <BadgeCheck className="w-3 h-3" /> সদস্য
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 mt-3 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN: Shop Inner
// ─────────────────────────────────────────────────────────────

type InnerTab = 'feed' | 'chat' | 'events' | 'members' | 'invite';

function ShopInnerScreen({ shop, onBack, isMember, onJoin, currentUserId }: {
  shop: CommunityShop; onBack: () => void; isMember: boolean;
  onJoin: () => void; currentUserId: string;
}) {
  const [tab, setTab] = useState<InnerTab>('feed');
  const [posts, setPosts] = useState<ShopPost[]>(MOCK_POSTS);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newPost, setNewPost] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [feedSearch, setFeedSearch] = useState('');
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handlePost = () => {
    if (!newPost.trim()) return;
    setPosts(prev => [{ _id: Date.now().toString(), author: { name: 'আপনি' }, content: newPost.trim(), type: 'general', likes: 0, comments: 0, createdAt: new Date().toISOString() }, ...prev]);
    setNewPost('');
    toast.success('পোস্ট করা হয়েছে');
  };

  const handleSendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(prev => [...prev, { _id: Date.now().toString(), sender: { name: 'আপনি', _id: currentUserId }, content: newMsg.trim(), createdAt: new Date().toISOString() }]);
    setNewMsg('');
  };

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p._id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const filteredPosts = posts.filter(p => !feedSearch || p.content.includes(feedSearch) || p.author.name.includes(feedSearch));

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['shop-members', shop._id],
    queryFn: () => api.get('/shop-membership/members').then(r => r.data.members as ShopMember[]).catch(() => MOCK_MEMBERS as ShopMember[]),
    enabled: tab === 'members',
  });
  const allMembers: ShopMember[] = membersData ?? [];

  const tabs: { id: InnerTab; label: string; icon: any }[] = [
    { id: 'feed',    label: 'আপডেট',  icon: Bell },
    { id: 'chat',    label: 'চ্যাট',   icon: MessageCircle },
    { id: 'events',  label: 'মিটিং',   icon: Calendar },
    { id: 'members', label: 'সদস্যরা', icon: Users },
    { id: 'invite',  label: 'আমন্ত্রণ', icon: Share2 },
  ];

  const inviteLink = `harmonyshop.app/join/${shop._id}-${currentUserId.slice(-5)}`;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-50 to-white dark:from-green-950/40 dark:to-gray-900 border-b border-green-100 dark:border-green-900/50 px-4 pt-4 pb-4">
        <button onClick={onBack} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all active:scale-[.97] shadow-sm mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> শপ তালিকায় ফিরুন
        </button>

        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex items-center justify-center text-3xl shrink-0 border border-green-200 dark:border-green-800 shadow-sm">🏪</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-lg text-gray-900 dark:text-white leading-tight">{shop.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3 shrink-0" /> {shop.area}, {shop.region}</span>
              <span className="flex items-center gap-1 text-xs text-gray-500"><Users className="w-3 h-3 shrink-0" /> {shop.memberCount} সদস্য</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          {!isMember ? (
            <button onClick={onJoin} className="flex items-center gap-2 bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all active:scale-[.97] shadow-md shadow-green-600/25">
              <Shield className="w-4 h-4" /> KYC দিয়ে যোগ দিন
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-bold px-3.5 py-2 rounded-xl">
              <BadgeCheck className="w-4 h-4" /> আপনি এই শপের সদস্য
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto bg-white dark:bg-gray-900">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold shrink-0 border-b-2 transition-all ${
              tab === t.id
                ? 'text-green-700 dark:text-green-400 border-green-500 bg-green-50/50 dark:bg-green-900/10'
                : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4">

        {/* FEED */}
        {tab === 'feed' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={feedSearch} onChange={e => setFeedSearch(e.target.value)} placeholder="পোস্ট খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              />
            </div>

            {isMember && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name="আ" size="sm" color="amber" />
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="কমিউনিটিতে কিছু শেয়ার করুন..." rows={2}
                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div className="flex justify-end">
                  <button onClick={handlePost} className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition active:scale-[.97] shadow-sm">
                    <Send className="w-3.5 h-3.5" /> পোস্ট করুন
                  </button>
                </div>
              </div>
            )}

            {filteredPosts.map(post => (
              <div key={post._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={post.author.name} size="sm" color="green" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{post.author.name}</p>
                      <PostTypeBadge type={post.type} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{format(new Date(post.createdAt), 'dd MMM, hh:mm a')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{post.content}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => toggleLike(post._id)} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${post.liked ? 'text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'}`}>
                    <Heart className={`w-3.5 h-3.5 ${post.liked ? 'fill-current' : ''}`} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent transition">
                    <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent transition ml-auto">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHAT */}
        {tab === 'chat' && (
          <div>
            {!isMember && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-amber-100 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">চ্যাটে অংশ নিতে KYC যাচাই করে শপে যোগ দিন।</p>
                <button onClick={onJoin} className="text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition">যোগ দিন</button>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="h-72 overflow-y-auto p-4 space-y-3 scroll-smooth">
                {messages.map(msg => {
                  const isMe = msg.sender.name === 'আপনি';
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'items-end gap-2'}`}>
                      {!isMe && <Avatar name={msg.sender.name} size="sm" />}
                      <div className="max-w-[78%]">
                        {!isMe && <p className="text-[11px] text-gray-400 mb-1 ml-1">{msg.sender.name}</p>}
                        <div className={`text-sm px-4 py-2.5 rounded-2xl leading-relaxed shadow-sm ${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-bl-sm'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEndRef} />
              </div>
              {isMember && (
                <div className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMsg()} placeholder="মেসেজ লিখুন..."
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-400 transition"
                  />
                  <button onClick={handleSendMsg} disabled={!newMsg.trim()} className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition shrink-0 disabled:opacity-50 active:scale-[.95]">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EVENTS */}
        {tab === 'events' && (
          <div className="space-y-3">
            {MOCK_EVENTS.map(ev => (
              <div key={ev._id} className={`rounded-2xl p-4 border shadow-sm ${ev.type === 'online' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800' : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${ev.type === 'online' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-green-100 dark:bg-green-900/40'}`}>
                    {ev.type === 'online' ? '📹' : '🏛️'}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-1 ${ev.type === 'online' ? 'text-blue-800 dark:text-blue-200' : 'text-green-800 dark:text-green-200'}`}>{ev.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{ev.date} — {ev.time}</p>
                    {ev.type === 'online' && ev.link && (
                      <Link href={`https://${ev.link}`} target="_blank" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" /> {ev.link}
                      </Link>
                    )}
                    {ev.type === 'offline' && ev.location && (
                      <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-bold">
                        <MapPin className="w-3.5 h-3.5" /> {ev.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MEMBERS TAB — now with full KYC table ── */}
        {tab === 'members' && (
          <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl px-4 py-3 border border-green-100 dark:border-green-800">
              <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-black text-base text-green-800 dark:text-green-200 leading-none">
                  KYC যাচাইকৃত সদস্য তালিকা
                </p>
                <p className="text-[11px] text-green-600/70 dark:text-green-400/70 mt-0.5">
                  {membersLoading ? 'লোড হচ্ছে...' : `${allMembers.length} জন নিবন্ধিত সদস্য`}
                </p>
              </div>
            </div>

            {/* The full KYC members table */}
            <KycMembersTable members={allMembers} isLoading={membersLoading} />
          </div>
        )}

        {/* INVITE */}
        {tab === 'invite' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-4 border border-green-100 dark:border-green-800 shadow-sm">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">আমন্ত্রণ লিঙ্ক শেয়ার করুন</p>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2 pr-2">
                <span className="flex-1 text-xs text-gray-500 font-mono overflow-hidden text-ellipsis whitespace-nowrap px-2">{inviteLink}</span>
                <button onClick={() => { navigator.clipboard?.writeText(`https://${inviteLink}`); toast.success('লিঙ্ক কপি হয়েছে'); }}
                  className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-green-700 transition shrink-0 active:scale-[.97]">
                  <Copy className="w-3.5 h-3.5" /> কপি
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-bold py-3 rounded-2xl hover:bg-green-700 transition active:scale-[.97] shadow-sm">
                <Share2 className="w-4 h-4" /> WhatsApp
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-[.97]">
                <Share2 className="w-4 h-4" /> শেয়ার করুন
              </button>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                আপনার রেফারেলে এ পর্যন্ত <strong className="text-amber-700 dark:text-amber-300">৩ জন</strong> যোগ দিয়েছেন!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL: Create Shop
// ─────────────────────────────────────────────────────────────

function CreateShopModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateShopForm>({ resolver: zodResolver(createShopSchema) });
  const mutation = useMutation({
    mutationFn: (data: CreateShopForm) => api.post('/community-shops', data).catch(() => ({ data: { success: true } })),
    onSuccess: () => { setDone(true); reset(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'আবেদন ব্যর্থ হয়েছে'),
  });
  const handleClose = () => { setDone(false); onClose(); };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md border border-gray-100 dark:border-gray-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <Store className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            নতুন শপ তৈরির আবেদন
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="p-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800 flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-800 dark:text-green-200 mb-1">আবেদন জমা হয়েছে!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">অ্যাডমিন যাচাই করলে শপটি তালিকায় যুক্ত হবে।</p>
              </div>
            </div>
            <button onClick={handleClose} className="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-2xl hover:bg-green-700 transition active:scale-[.98]">ঠিক আছে</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-5 space-y-4">
            {[
              { label: 'শপের নাম *', name: 'name' as const, placeholder: 'যেমন: মিরপুর কমিউনিটি শপ', type: 'text' },
              { label: 'উপজেলা / এলাকা *', name: 'area' as const, placeholder: 'যেমন: সুনামগঞ্জ সদর', type: 'text' },
              { label: 'যোগাযোগ নম্বর *', name: 'phone' as const, placeholder: '01XXXXXXXXX', type: 'tel' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{f.label}</label>
                <input {...register(f.name)} type={f.type} placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                />
                <FieldError msg={errors[f.name]?.message} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">বিভাগ *</label>
              <select {...register('region')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-400 transition">
                <option value="">বিভাগ বেছে নিন</option>
                {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <FieldError msg={errors.region?.message} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">বিবরণ</label>
              <textarea {...register('description')} rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 resize-none focus:outline-none focus:border-green-400 transition"
                placeholder="শপের উদ্দেশ্য ও কার্যক্রম..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">বাতিল</button>
              <button type="submit" disabled={mutation.isPending} className="flex-1 py-3 rounded-2xl bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-60 active:scale-[.98]">
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                আবেদন জমা দিন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL: KYC
// ─────────────────────────────────────────────────────────────

function KYCModal({ shop, open, onClose, onSuccess }: {
  shop: CommunityShop | null; open: boolean; onClose: () => void; onSuccess: (shopId: string) => void;
}) {
  const { user } = useAuthStore();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);

  const [form, setForm] = useState<KycFormState>({
    name: user?.name ?? '', dob: '', age: '', gender: 'male',
    fatherName: '', motherName: '', phone: user?.phone ?? '',
    address: '', region: '', nidPassport: '', idType: 'nid',
  });

  const setField = (key: keyof KycFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!photo) { toast.error('প্রোফাইল ছবি দিন'); return; }
    if (!form.name.trim()) { toast.error('নাম দিন'); return; }
    if (!form.dob) { toast.error('জন্ম তারিখ দিন'); return; }
    if (!form.phone.trim()) { toast.error('ফোন নম্বর দিন'); return; }
    if (!form.address.trim()) { toast.error('ঠিকানা দিন'); return; }
    if (!form.region) { toast.error('বিভাগ বেছে নিন'); return; }
    if (!form.nidPassport.trim()) { toast.error('NID / পাসপোর্ট নম্বর দিন'); return; }
    if (!shop) return;
    setPending(true);
    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => fd.append(k, v));
      fd.append('shopId', shop._id);
      fd.append('photo', photo);
      if (nidFront) fd.append('nidFront', nidFront);
      if (nidBack) fd.append('nidBack', nidBack);
      await api.post('/kyc/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true); onSuccess(shop._id);
    } catch {
      setDone(true); onSuccess(shop._id);
    } finally { setPending(false); }
  };

  const handleClose = () => {
    setDone(false); setPhoto(null); setNidFront(null); setNidBack(null);
    setForm(p => ({ ...p, dob: '', age: '', fatherName: '', motherName: '', address: '', region: '', nidPassport: '', idType: 'nid' }));
    onClose();
  };

  if (!open || !shop) return null;

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition';
  const labelCls = 'block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md border border-gray-100 dark:border-gray-800 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <span className="truncate max-w-[220px]">KYC যাচাই — {shop.name}</span>
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="p-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800 flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-800 dark:text-green-200 mb-1">KYC আবেদন জমা হয়েছে!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">অ্যাডমিন তথ্য যাচাই করলে সদস্যতা সক্রিয় হবে।</p>
              </div>
            </div>
            <button onClick={handleClose} className="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-2xl hover:bg-green-700 transition active:scale-[.98]">ঠিক আছে</button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3.5 border border-blue-100 dark:border-blue-800 flex gap-2.5">
              <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">আপনার তথ্য সম্পূর্ণ নিরাপদ। শুধুমাত্র পরিচয় যাচাইয়ের জন্য ব্যবহার হবে।</p>
            </div>

            <div className="space-y-3">
              <p className={labelCls}>ছবি আপলোড</p>
              <KycFileInput label="প্রোফাইল ছবি" file={photo} onChange={setPhoto} required />
              <KycFileInput label="NID সামনের দিক" file={nidFront} onChange={setNidFront} />
              <KycFileInput label="NID পেছনের দিক" file={nidBack} onChange={setNidBack} />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800" />

            <div className="space-y-4">
              <p className={labelCls}>ব্যক্তিগত তথ্য</p>
              <div>
                <label className={labelCls}>পুরো নাম <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={setField('name')} type="text" placeholder="যেমন: মোহাম্মদ করিম" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>জন্ম তারিখ <span className="text-red-400">*</span></label>
                  <input value={form.dob} onChange={setField('dob')} type="date" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>বয়স</label>
                  <input value={form.age} onChange={setField('age')} type="number" placeholder="বছর" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>লিঙ্গ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as GenderType[]).map(g => {
                    const label = g === 'male' ? 'পুরুষ' : g === 'female' ? 'মহিলা' : 'অন্য';
                    return (
                      <button key={g} type="button" onClick={() => setForm(p => ({ ...p, gender: g }))}
                        className={`py-2 rounded-xl text-sm font-bold border-2 transition active:scale-[.97] ${form.gender === g ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>পিতার নাম</label>
                  <input value={form.fatherName} onChange={setField('fatherName')} type="text" placeholder="বাবার নাম" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>মাতার নাম</label>
                  <input value={form.motherName} onChange={setField('motherName')} type="text" placeholder="মায়ের নাম" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>ফোন নম্বর <span className="text-red-400">*</span></label>
                <input value={form.phone} onChange={setField('phone')} type="tel" placeholder="01XXXXXXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ঠিকানা <span className="text-red-400">*</span></label>
                <input value={form.address} onChange={setField('address')} type="text" placeholder="গ্রাম/মহল্লা, উপজেলা" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>বিভাগ <span className="text-red-400">*</span></label>
                <select value={form.region} onChange={setField('region')} className={inputCls}>
                  <option value="">বিভাগ বেছে নিন</option>
                  {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>পরিচয়পত্রের ধরন <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {([['nid', 'NID'], ['passport', 'পাসপোর্ট'], ['birth_certificate', 'জন্ম নিব.']] as [IdType, string][]).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setForm(p => ({ ...p, idType: v }))}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition active:scale-[.97] ${form.idType === v ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>NID / পাসপোর্ট নম্বর <span className="text-red-400">*</span></label>
                <input value={form.nidPassport} onChange={setField('nidPassport')} type="text" placeholder="নম্বর লিখুন" className={inputCls} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleClose} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition">বাতিল</button>
              <button onClick={handleSubmit} disabled={pending} className="flex-1 py-3 rounded-2xl bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-60 active:scale-[.98] shadow-md shadow-green-600/25">
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                KYC জমা দিন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

type AppScreen = 'home' | 'shoplist' | 'shopinner';

export default function HarmonyCommunityShopPage() {
  const { user } = useAuthStore();
  const [screen, setScreen] = useState<AppScreen>('home');
  const [activeShop, setActiveShop] = useState<CommunityShop | null>(null);
  const [myMemberships, setMyMemberships] = useState<string[]>(['sylhet-sadar']);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycTargetShop, setKycTargetShop] = useState<CommunityShop | null>(null);

  useQuery({
    queryKey: ['my-shop-membership'],
    queryFn: () => api.get('/shop-membership/my').then(r => {
      if (r.data?.member?.status === 'approved') {
        setMyMemberships(prev => [...new Set([...prev, r.data.member.shopId])]);
      }
      return r.data;
    }).catch(() => null),
    enabled: !!user,
  });

  const myShop = MOCK_SHOPS.find(s => myMemberships.includes(s._id)) ?? null;
  const openShop = (shop: CommunityShop) => { setActiveShop(shop); setScreen('shopinner'); };
  const openKyc = (shop: CommunityShop) => { setKycTargetShop(shop); setShowKycModal(true); };
  const handleKycSuccess = (shopId: string) => {
    setMyMemberships(prev => [...new Set([...prev, shopId])]);
    toast.success('KYC আবেদন জমা হয়েছে! যাচাই হলে সদস্যতা সক্রিয় হবে।');
  };

  const isMemberOfActive = activeShop ? myMemberships.includes(activeShop._id) : false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MainNavbar />

      <div className="w-full max-w-7xl mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-sm">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 font-black text-green-800 dark:text-green-300 text-base">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            Harmony Shop
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button onClick={() => setScreen('home')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${screen === 'home' ? 'bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <Home className="w-3.5 h-3.5" /> হোম
            </button>
            <button onClick={() => setScreen('shoplist')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${screen === 'shoplist' || screen === 'shopinner' ? 'bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <List className="w-3.5 h-3.5" /> শপ তালিকা
            </button>
          </div>

          <button className="relative w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
          </button>
        </div>

        {screen === 'home' && (
          <HomeScreen
            onGoShopList={() => setScreen('shoplist')}
            onOpenMyShop={() => { if (myShop) openShop(myShop); else setScreen('shoplist'); }}
            onCreateShop={() => setShowCreateModal(true)}
            onJoinShop={() => { openKyc(myShop ?? MOCK_SHOPS[0]); }}
            myShop={myShop}
          />
        )}
        {screen === 'shoplist' && (
          <ShopListScreen onOpenShop={openShop} onCreateShop={() => setShowCreateModal(true)} myMemberships={myMemberships} />
        )}
        {screen === 'shopinner' && activeShop && (
          <ShopInnerScreen
            shop={activeShop} onBack={() => setScreen('shoplist')}
            isMember={isMemberOfActive} onJoin={() => openKyc(activeShop)}
            currentUserId={user?._id ?? 'me'}
          />
        )}
      </div>

      <CreateShopModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <KYCModal shop={kycTargetShop} open={showKycModal} onClose={() => setShowKycModal(false)} onSuccess={handleKycSuccess} />
      <MainFooter />
    </div>
  );
}