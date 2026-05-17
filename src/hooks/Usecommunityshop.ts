import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────

export interface Shop {
  _id:         string;
  name:        string;
  area:        string;
  region:      string;
  description: string;
  memberCount: number;
  inviteCode:  string;
  status:      'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  coverPhoto?: { url: string };
}

export interface Membership {
  _id:           string;
  shop:          Shop;
  name:          string;
  status:        'pending' | 'approved' | 'rejected';
  paymentStatus: 'verifying' | 'paid' | 'failed';
  memberId?:     string;
  joinedAt?:     string;
  expiresAt?:    string;
  paymentMethod: string;
  transactionId: string;
  paymentAmount: number;
  adminNote?:    string;
}

export interface ChatMessage {
  _id:       string;
  shop:      string;
  user:      { _id: string; name: string; profilePhoto?: string };
  text:      string;
  createdAt: string;
}

export interface CommunityUpdate {
  _id:          string;
  title:        string;
  body:         string;
  type:         'announcement' | 'meeting' | 'document' | 'general';
  meetingLink?: string;
  meetingDate?: string;
  author:       { name: string };
   fileUrl?: string; 
  createdAt:    string;
}

export interface Config {
  membershipFee:  number;
  paymentNumbers: { bkash: string; nagad: string; rocket: string };
  regions:        string[];
  benefits:       string[];
}

// ─── useConfig ────────────────────────────────────────────────
export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  useEffect(() => {
    api.get('/community-shop/config').then(r => setConfig(r.data));
  }, []);
  return config;
}

// ─── useShops ─────────────────────────────────────────────────
export function useShops(filters?: { region?: string; search?: string }) {
  const [shops, setShops]   = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/community-shop/shops', { params: filters });
      setShops(data.shops);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filters?.region, filters?.search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { shops, loading, refetch: fetch };
}

// ─── useMyMemberships ─────────────────────────────────────────
export function useMyMemberships() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/community-shop/membership/my')
      .then(r => setMemberships(r.data.memberships))
      .finally(() => setLoading(false));
  }, []);

  return { memberships, loading };
}

// ─── useCreateShop ────────────────────────────────────────────
export function useCreateShop() {
  const [loading, setLoading] = useState(false);

  const createShop = async (formData: FormData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/community-shop/shops', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message || 'আবেদন জমা হয়েছে');
      return data.shop;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'ত্রুটি হয়েছে');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createShop, loading };
}

// ─── useJoinShop (Membership Register) ───────────────────────
export function useJoinShop() {
  const [loading, setLoading] = useState(false);

  const joinShop = async (formData: FormData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/community-shop/membership/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('সদস্যতা আবেদন জমা হয়েছে! অ্যাডমিন যাচাইয়ের পর নিশ্চিত হবে।');
      return data.member;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'ত্রুটি হয়েছে');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { joinShop, loading };
}

// ─── useMessages ──────────────────────────────────────────────
export function useMessages(shopId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/community-shop/messages/${shopId}`);
      setMessages(data.messages);
    } catch { /* 403 = not member */ }
    finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { if (shopId) fetchMessages(); }, [fetchMessages]);

  const sendMessage = async (text: string) => {
    try {
      const { data } = await api.post(`/community-shop/messages/${shopId}`, { text });
      setMessages(prev => [...prev, data.message]);
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'বার্তা পাঠানো যায়নি');
      return false;
    }
  };

  const addIncoming = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  return { messages, loading, sendMessage, addIncoming, refetch: fetchMessages };
}

// ─── useCommunityUpdates ──────────────────────────────────────
export function useCommunityUpdates(shopId: string) {
  const [updates, setUpdates] = useState<CommunityUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    api.get(`/community-shop/updates/${shopId}`)
      .then(r => setUpdates(r.data.updates))
      .catch(() => { /* 403 */ })
      .finally(() => setLoading(false));
  }, [shopId]);

  return { updates, loading };
}

// ─── useInviteLink ────────────────────────────────────────────
export function useInviteLink(shopId: string) {
  const [link, setLink] = useState('');

  const fetchLink = async () => {
    try {
      const { data } = await api.get(`/community-shop/invite-link/${shopId}`);
      setLink(data.inviteLink);
      return data.inviteLink as string;
    } catch { return ''; }
  };

  const copyLink = async () => {
    const l = link || await fetchLink();
    if (!l) return;
    await navigator.clipboard.writeText(l);
    toast.success('আমন্ত্রণ লিঙ্ক কপি হয়েছে!');
  };

  useEffect(() => { if (shopId) fetchLink(); }, [shopId]);

  return { link, copyLink };
}