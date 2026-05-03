'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Wheat, Home, BookOpen, Link } from 'lucide-react';

function LogoEmblem({ size = 96 }) {
  const ticks = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="eg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-brand-light, #a78bfa)" />
          <stop offset="55%" stopColor="var(--color-brand, #7c3aed)" />
          <stop offset="100%" stopColor="var(--color-brand-dark, #4c1d95)" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="47" fill="none" stroke="url(#eg1)" strokeWidth="1.5" opacity="0.3" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#eg1)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.2" />
      {/* Center text */}
      <text x="50" y="56" textAnchor="middle" fontFamily="inherit" fontWeight="900" fontSize="22"
        fill="url(#eg1)" letterSpacing="2">3ZF</text>
      {/* Dots */}
      <circle cx="35" cy="64" r="2.2" fill="var(--color-brand, #7c3aed)" opacity="0.4" />
      <circle cx="50" cy="64" r="2.2" fill="var(--color-brand, #7c3aed)" opacity="0.7" />
      <circle cx="65" cy="64" r="2.2" fill="var(--color-brand, #7c3aed)" opacity="0.4" />
      {/* Ticks */}
      {ticks.map((deg, i) => {
        const rad = (deg - 90) * Math.PI / 180;
        const x1 = 50 + 45 * Math.cos(rad), y1 = 50 + 45 * Math.sin(rad);
        const x2 = 50 + 42 * Math.cos(rad), y2 = 50 + 42 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-brand, #7c3aed)" strokeWidth="1.2" opacity="0.25" />;
      })}
    </svg>
  );
}

export default function Hero() {
  const pillars = [
    { icon: Wheat,    en: 'Zero Interest',     bn: 'সুদমুক্ত',       num: '01', color: 'from-violet-500 to-purple-600' },
    { icon: Home,     en: 'Zero Exploitation', bn: 'শোষণমুক্ত',     num: '02', color: 'from-purple-500 to-indigo-600' },
    { icon: BookOpen, en: 'Zero Ignorance',    bn: 'অজ্ঞতামুক্ত',   num: '03', color: 'from-indigo-500 to-violet-600' },
  ];

  const stats = [
    { value: '2K+', label: 'Members' },
    { value: '8',   label: 'Districts' },
    { value: '2025', label: 'Founded' },
  ];

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center pt-20 pb-16 px-4"
      style={{ background: 'var(--color-bg-secondary)' }}>

      {/* Subtle background gradient */}
      <div className="absolute inset-0 gradient-brand opacity-[0.04] pointer-events-none" />

      {/* Decorative grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-brand) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }} />

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT ── */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>

            {/* Heading */}
            <h1 className="font-heading font-bold leading-[1.05] mb-3" style={{ color: 'var(--color-text)' }}>
              <span className="block text-6xl md:text-8xl bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                3ZF
              </span>
              <span className="block text-2xl md:text-3xl mt-2">
                Three Zeros of Freedom
              </span>
            </h1>

            <p className="text-sm tracking-widest mb-5" style={{ color: 'var(--color-text-secondary)' }}>
              Zero Interest · Zero Exploitation · Zero Ignorance
            </p>

            {/* Divider */}
            <div className="w-10 h-0.5 rounded-full mb-5 bg-gradient-to-r from-violet-600 to-transparent" />

            {/* Tagline */}
            <p className="italic text-base mb-4 leading-relaxed" style={{ color: 'var(--color-brand)' }}>
              একটি সুন্দর ভবিষ্যতের দিকে — Towards a Brighter Future
            </p>

            {/* Description */}
            <p className="text-sm leading-relaxed mb-8 max-w-lg" style={{ color: 'var(--color-text-secondary)' }}>
                3ZF is a justice-driven economic and social movement built on three transformative principles — Zero Interest, Zero Exploitation, and Zero Ignorance.
                Together, we work towards financial freedom, social dignity, and knowledge-based empowerment for all.
            </p>

            {/* Pillars */}
            <div className="flex flex-col gap-3 mb-8">
              {pillars.map((p, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="card flex items-center gap-4 py-3 px-4 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0`}>
                    <p.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.en}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{p.bn}</p>
                  </div>
                  <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    {p.num}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              
              <button className="btn-primary text-sm px-7 py-3 flex items-center justify-center gap-2">
               
                Join the Movement <ArrowRight className="w-4 h-4" />
              </button>
             
              <button className="btn-secondary text-sm px-7 py-3">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-heading text-xl font-bold" style={{ color: 'var(--color-brand)' }}>{s.value}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT ── */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-3">

            {/* Video card */}
            <div className="card overflow-hidden p-0">
              <div className="relative" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src="https://www.youtube.com/embed/cqb6aO_BYsc"
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="3ZF Foundation — Our Story"
                />
                {/* Overlay label */}
                <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.55))' }}>
                  <span className="text-xs font-semibold tracking-widest uppercase text-white opacity-80">
                    Our Story
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}