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
import EntrepreneurPage from '@/components/page/Entrepreneurpage';
import HarmonyShop from '@/components/page/HarmonyShop';
export default function HomePage() {
  const { t } = useT();

  const modules = [
    { icon: Users,      label: t.nav.community,     desc: t.community.feed,         href: '/community',     color: 'from-violet-500 to-purple-600' },
    { icon: Building2,  label: t.nav.organisation,   desc: t.organisation.subtitle,  href: '/organisation',  color: 'from-teal-500 to-cyan-600' },
    { icon: Heart,      label: t.nav.association,    desc: t.common.all,             href: '/association',   color: 'from-pink-500 to-rose-600' },
    { icon: ShoppingBag,label: t.nav.supershop,      desc: t.supershop.shop,         href: '/supershop',     color: 'from-amber-500 to-orange-600' },
    { icon: Calendar,   label: t.nav.events,         desc: t.events.subtitle,        href: '/events',        color: 'from-blue-500 to-indigo-600' },
    { icon: BookOpen,   label: t.nav.blog,           desc: t.blog.subtitle,          href: '/blog',          color: 'from-green-500 to-emerald-600' },
    { icon: Image,      label: t.nav.gallery,        desc: t.gallery.subtitle,       href: '/gallery',       color: 'from-red-500 to-rose-600' },
  ];

  const stats = [
    { value: '10K+', label: t.admin.totalUsers },
    { value: '500+', label: t.events.title },
    { value: '৳25L+', label: t.admin.revenue },
    { value: '45+', label: t.admin.orders },
  ];

  const features = [
    { icon: Globe,  title: t.common.language,  desc: 'English & বাংলা' },
    { icon: Shield, title: 'Secure & Private', desc: 'JWT, encrypted, privacy-first' },
    { icon: Zap,    title: 'Realtime',          desc: 'Instant messaging & notifications' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />

      {/* Hero */}
      {/* <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 gradient-brand opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-brand)' }}>
              ✦ 3ZF Platform
            </span>
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-text)' }}>
              Three Zeros of{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                Freedom
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Community · Organisation · Commerce — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-base px-8 py-3.5">
                {t.auth.createFree}
              </Link>
              <Link href="/about" className="btn-secondary text-base px-8 py-3.5">
                {t.nav.about}
              </Link>
            </div>
          </motion.div>
        </div>
      </section> */}
      <Hero />
      {/* Stats */}
      {/* <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card text-center py-6">
              <p className="text-3xl font-bold font-heading" style={{ color: 'var(--color-brand)' }}>{s.value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section> */}
     <HarmonyAbout/>
      {/* Modules */}
      <FounderPage/>
      {/* <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: 'var(--color-text)' }}>
            Everything in One Platform
          </h2>
          <p className="text-center mb-12" style={{ color: 'var(--color-text-secondary)' }}>
            Seven powerful modules, one seamless experience
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {modules.map((mod, i) => (
              <motion.div key={mod.href} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                <Link href={mod.href} className="card group block hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4`}>
                    <mod.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1.5 group-hover:text-[var(--color-brand)] transition-colors" style={{ color: 'var(--color-text)' }}>
                    {mod.label}
                  </h3>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: 'var(--color-brand)' }}>
                    {t.common.viewAll} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features */}
      <EntrepreneurPage/>
      {/* <section className="py-16 px-4" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text)' }}>
            Why Choose 3ZF?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA */}
      {/* <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card gradient-brand text-white py-14 px-8 rounded-3xl">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t.nav.register === 'নিবন্ধন' ? '৩ZF-তে যোগ দিন আজই' : 'Join 3ZF Today'}
            </h2>
            <p className="text-purple-100 text-lg mb-8">
              {t.nav.register === 'নিবন্ধন' ? 'বিনামূল্যে নিবন্ধন করুন এবং সব ফিচার অন্বেষণ করুন।' : 'Register free and explore all features.'}
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-purple-50 transition-colors">
              {t.auth.createFree} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section> */}
      <HarmonyShop/>

      <MainFooter />
    </div>
  );
}
