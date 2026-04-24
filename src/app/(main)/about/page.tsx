'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Target, Heart, Globe, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';
import FounderPage from '@/components/page/Founderpage';

const VALUES = [
  { icon: Heart, title: 'সুদের দাসত্ব বন্ধ করতে', desc: '3ZF Interest-Free অর্থব্যবস্থার প্রচার করে দরিদ্র্য বিমোচনে কাজ করে।' },
  { icon: Shield, title: 'শোষণ ও বৈষম্য কমাতে', desc: 'মানুষকে সচেতন ও আত্মনির্ভর করতে আমরা অবিরাম কাজ করে যাচ্ছি।' },
  { icon: Globe, title: 'জ্ঞানের অভাব দূর করতে', desc: 'Education ও Training-এর মাধ্যমে আমরা সচেতনতা বৃদ্ধি করি।' },
  { icon: Zap, title: 'কমিউনিটি শক্তিশালী করা', desc: 'মানুষে মানুষে সহযোগিতা ও অংশীদারিত্বের মাধ্যমে একটি টেকসই অর্থনৈতিক ব্যবস্থা গড়ে তুলি।' },
];
  const missionItems = [
    'মানুষ থাকবে অর্থনৈতিক শোষণ ও ঋণমুক্ত, স্বাবলম্বী ও স্বাধীন',
    'প্রতিটি কমিউনিটি হবে সচেতন, মানবিক এবং সমন্বিত',
    'পরিবেশ ও প্রকৃতি থাকবে টেকসই ও সুরক্ষিত',
    'যুবসমাজ হবে নেতৃত্বশীল, নৈতিক ও ক্ষমতাসম্পন্ন',
    'জ্ঞান ও দক্ষতার মাধ্যমে সবার জন্য সমান সুযোগ নিশ্চিত',
    'ব্যবসা ও অর্থনীতি পরিচালিত হবে স্বচ্ছ, ন্যায্য ও দায়বদ্ধভাবে',
  ];
    const visionItems = [
    'অর্থনৈতিক স্বাধীনতা',
    'সচেতন ও মানবিক কমিউনিটি',
    'টেকসই প্রকৃতি',
    'নেতৃত্ব ও নৈতিকতা সম্পন্ন যুবসমাজ',
  ];
const TEAM = [
  { name: 'Founder', role: 'CEO & Visionary', avatar: '👤' },
  { name: 'Tech Lead', role: 'Full-Stack Engineer', avatar: '👤' },
  { name: 'Community', role: 'Community Manager', avatar: '👤' },
  { name: 'Design', role: 'UI/UX Designer', avatar: '👤' },
];

const TIMELINE = [
  { year: '2020', event: 'Harmony Association founded with a mission to serve the community' },
  { year: '2021', event: 'Launched Harmony Community — the social network' },
  { year: '2022', event: 'Organisation registration system goes live' },
  { year: '2023', event: 'Harmony Supershop opens for business' },
  { year: '2024', event: '3ZF Platform unified — all modules under one roof' },
  { year: '2025', event: 'Mobile apps launched, payment gateways integrated' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">

        {/* Hero */}
        <div className="gradient-brand text-white py-20 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4">About 3ZF</h1>
            <p className="text-purple-100 text-xl max-w-2xl mx-auto leading-relaxed">
              3ZF (Three Zeros of Freedom) হলো একটি মানবিক, সামাজিক ও উন্নয়নমূলক আন্দোলন,
                যার লক্ষ্য একটি সুদমুক্ত (Interest-Free), শোষণমুক্ত (Exploitation-Free) এবং
                জ্ঞানভিত্তিক (Knowledge-Based) সমাজ গঠন।
            </p>
          </motion.div>
        </div>

        {/* Mission */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card text-center py-12">
            <Target className="w-14 h-14 mx-auto mb-5" style={{ color: 'var(--color-brand)' }} />
            <h2 className="font-heading text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Our Mission</h2>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              <ul className="ab-mission-list">
                  {missionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
            </p>
          </motion.div>
        </section>
         <section className="py-16 px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card text-center py-12">
            <Target className="w-14 h-14 mx-auto mb-5" style={{ color: 'var(--color-brand)' }} />
            <h2 className="font-heading text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Our Vision (ভিশন)</h2>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="ab-vision-list">
                  {visionItems.map((item, i) => (
                    <div key={i} className="ab-vision-item">{item}</div>
                  ))}
                </div>
            </p>
          </motion.div>
        </section>
        {/* Values */}
        <section className="py-8 px-4 max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>কেন 3ZF প্রয়োজন?</h2>
          <p className="text-center mb-10" style={{ color: 'var(--color-text-secondary)' }}>What guides every decision we make</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card flex gap-4">
                <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center flex-shrink-0">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text)' }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-4 max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-10" style={{ color: 'var(--color-text)' }}>Our Journey</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'var(--color-border)' }} />
            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <motion.div key={t.year} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start pl-14 relative">
                  <div className="absolute left-0 w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {t.year.slice(2)}
                  </div>
                  <div className="card flex-1 py-4">
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-brand)' }}>{t.year}</p>
                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>{t.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16 px-4" style={{ background: 'var(--color-bg)' }}>
         
             <FounderPage/>
          
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card gradient-brand text-white py-12 rounded-3xl">
              <Users className="w-14 h-14 mx-auto mb-4 opacity-80" />
              <h2 className="font-heading text-3xl font-bold mb-3">Join 3ZF Today</h2>
              <p className="text-purple-100 mb-8"> 3ZF শুধুমাত্র একটি উদ্যোগ নয়—এটি একটি আন্দোলন, একটি বিশ্বাস, একটি সমাধান।
              আপনার অংশগ্রহণই আমাদের সমাজকে ন্যায্য, স্বচ্ছ ও মানবিক পথে এগিয়ে নেবে।</p>
              <div className="flex gap-3 justify-center">
                <Link href="/register"
                  className="bg-white text-purple-700 font-semibold px-8 py-3 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact"
                  className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <MainFooter />
      <style>
        {`
            .ab-mission-list {
    list-style: none;
    display: flex; flex-direction: column; gap: 10px;
  }
  .ab-mission-list li {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: clamp(0.82rem, 1.1vw, 0.9rem);
    color: var(--text-soft); line-height: 1.7; font-weight: 300;
  }
  .ab-mission-list li::before {
    content: '✦';
    color: var(--gold); font-size: 0.65rem; margin-top: 4px; flex-shrink: 0;
  }
    .ab-vision-list {
    display: flex; flex-direction: column; gap: 10px;
  }
  .ab-vision-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    border-radius: var(--r);
    font-size: clamp(0.82rem, 1.1vw, 0.9rem);
    color: var(--text-soft); font-weight: 400;
  }
  .ab-vision-item::before {
    content: '→';
    color: var(--gold); font-size: 0.85rem; flex-shrink: 0;
  }
        `}
      </style>
    </div>
  );
}
