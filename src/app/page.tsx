'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import Hero from '@/components/page/Hero';
import { useT } from '@/hooks/useT';
import { Users, Building2, Heart, ShoppingBag, Calendar, BookOpen, Image, ArrowRight, Globe, Shield, Zap } from 'lucide-react';
import HarmonyAbout from '@/components/page/HarmonyAbout';
import FounderPage from '@/components/page/Founderpage';
import EntrepreneurPreview from '@/components/page/Entrepreneurpage'; 
import HarmonyShop from '@/components/page/HarmonyShop';

export default function HomePage() {
  const { t } = useT();

  const modules = [
    { icon: Users,       label: t.nav.community,    desc: t.community.feed,        href: '/community',    color: 'from-violet-500 to-purple-600' },
    { icon: Building2,   label: t.nav.organisation, desc: t.organisation.subtitle, href: '/organisation', color: 'from-teal-500 to-cyan-600'    },
    { icon: Heart,       label: t.nav.association,  desc: t.common.all,            href: '/association',  color: 'from-pink-500 to-rose-600'    },
    { icon: ShoppingBag, label: t.nav.supershop,    desc: t.supershop.shop,        href: '/supershop',    color: 'from-amber-500 to-orange-600' },
    { icon: Calendar,    label: t.nav.events,       desc: t.events.subtitle,       href: '/events',       color: 'from-blue-500 to-indigo-600'  },
    { icon: BookOpen,    label: t.nav.blog,         desc: t.blog.subtitle,         href: '/blog',         color: 'from-green-500 to-emerald-600'},
    { icon: Image,       label: t.nav.gallery,      desc: t.gallery.subtitle,      href: '/gallery',      color: 'from-red-500 to-rose-600'     },
  ];

  const stats = [
    { value: '10K+',  label: t.admin.totalUsers },
    { value: '500+',  label: t.events.title     },
    { value: '৳25L+', label: t.admin.revenue    },
    { value: '45+',   label: t.admin.orders     },
  ];

  const features = [
    { icon: Globe,  title: t.common.language,  desc: 'English & বাংলা'                      },
    { icon: Shield, title: 'Secure & Private', desc: 'JWT, encrypted, privacy-first'         },
    { icon: Zap,    title: 'Realtime',          desc: 'Instant messaging & notifications'    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      {/* ── Hero ── */}
      <Hero />

      {/* ── About ── */}
      <HarmonyAbout />

      {/* ── Founder ── */}
      <FounderPage />

      {/* ── Entrepreneur preview (teaser for homepage — no auth gate) ── */}
      <EntrepreneurPreview />

      {/* ── Shop ── */}
      <HarmonyShop />

      <MainFooter />
    </div>
  );
}