'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, Plus, Users, MapPin, Star, TrendingUp, ArrowRight, Zap } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  onShopNow: () => void;
  onCreate:  () => void;
}

// ─── Ticker Items ─────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  '🔥 ঢাকা শপ নতুন পণ্য যোগ করেছে',
  'চট্টগ্রামে নতুন কমিউনিটি শপ চালু',
  'রাজশাহীতে ৩০% ছাড়',
  'সিলেট কমিউনিটি শপ টপ রেটেড',
  '🎉 ময়মনসিংহে ৫০টি নতুন শপ যোগ হয়েছে',
  'খুলনায় বিশেষ অফার চলছে',
  '⚡ বরিশালে ফ্ল্যাশ সেল শুরু',
];

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: ShoppingBag, value: '২০০+',    label: 'সক্রিয় শপ'      },
  { icon: Users,       value: '৫০০০+',   label: 'কমিউনিটি সদস্য' },
  { icon: MapPin,      value: '৬৪ জেলা', label: 'সারা বাংলাদেশ'  },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────

export default function HeroSection({ onShopNow, onCreate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // Parallax on scroll
  const { scrollY } = useScroll();
  const videoY = useTransform(scrollY, [0, 500], ['0%', '18%']);

  // Staggered mount
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const tickerText = TICKER_ITEMS.join('  •  ');
  const doubled    = `${tickerText}  •  ${tickerText}`;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden w-full"
      style={{ minHeight: 520 }}
    >
      {/* ── Video layer ── */}
      <motion.div
        style={{ y: videoY }}
        className="absolute inset-0 scale-110 origin-center"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => videoRef.current?.play()}
          poster="/images/community-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/videos/community-hero.webm" type="video/webm" />
          <source src="/videos/community-hero.mp4"  type="video/mp4"  />
        </video>
      </motion.div>

      {/* ── Cinematic overlay stack ── */}
      {/* 1. Dark base */}
      <div className="absolute inset-0 bg-gray-950/60" />
      {/* 2. Directional gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-950/80 via-gray-950/40 to-transparent" />
      {/* 3. Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
      />
      {/* 4. Scan-line texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.6) 2px, rgba(255,255,255,0.6) 3px)',
          backgroundSize: '100% 3px',
        }}
      />
      {/* 5. Teal accent glow — bottom left */}
      <div
        className="absolute -bottom-20 -left-20 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.22) 0%, transparent 70%)' }}
      />
      {/* 6. Warm accent glow — top right */}
      <div
        className="absolute -top-16 right-0 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)' }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col justify-between" style={{ minHeight: 460 }}>
        <div className="px-4 pt-10 sm:px-8 sm:pt-14 md:px-12 md:pt-16 lg:px-16 pb-6 flex-1">

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-black leading-[1.05] tracking-tight mb-4">
              <span
                className="block text-white"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
              >
                Harmony
              </span>
              <span
                className="block"
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  background: 'linear-gradient(135deg, #5eead4 0%, #34d399 50%, #a7f3d0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Community Shop
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="text-white/65 text-sm sm:text-base leading-relaxed max-w-md mb-8"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            আপনার এলাকার কমিউনিটি শপে যোগ দিন। স্থানীয় ব্যবসায়ীদের সাথে সংযুক্ত হন
            এবং আপনার নিজের শপ তৈরি করুন।
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            {/* Primary */}
            <button
              onClick={onShopNow}
              className="group relative flex items-center gap-2.5 px-7 py-3.5 overflow-hidden
                text-sm font-bold text-gray-900
                shadow-2xl shadow-teal-500/30 transition-all duration-300
                hover:shadow-teal-400/50 hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #5eead4 0%, #34d399 100%)' }}
            >
              {/* Shimmer */}
              <span
                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
                  bg-gradient-to-r from-transparent via-white/40 to-transparent
                  transition-transform duration-700 ease-in-out"
              />
              <ShoppingBag className="w-4 h-4 relative z-10" />
              <span className="relative z-10">শপ দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary */}
            <button
              onClick={onCreate}
              className="flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold text-white
                border border-white/20 bg-white/8 backdrop-blur-md
                hover:bg-white/15 hover:border-white/35 hover:scale-[1.03]
                active:scale-[0.98] transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              শপ তৈরি করুন
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.48 }}
            className="flex flex-wrap gap-4 sm:gap-6"
          >
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={ready ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.52 + i * 0.08 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center shrink-0"
                  style={{
                    background: 'rgba(20,184,166,0.2)',
                    border: '1px solid rgba(94,234,212,0.25)',
                  }}
                >
                  <Icon className="w-3.5 h-3.5 text-teal-300" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-sm leading-none">{value}</p>
                  <p className="text-white/45 text-[10px] mt-0.5 leading-none">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Ticker strip ── */}
        <div
          className="relative overflow-hidden border-t border-white/10 w-full"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}
        >
          {/* Left/right fade masks */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.4), transparent)' }}
          />

          <div className="flex items-center px-4 sm:px-6 py-2.5 gap-4">
            <div className="flex items-center gap-1.5 shrink-0 z-10">
              <Zap className="w-3 h-3 text-teal-400" />
              <span className="text-teal-400 text-[10px] font-bold tracking-widest uppercase">Live</span>
            </div>
            <div className="overflow-hidden flex-1">
              <motion.p
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                className="text-white/55 text-xs whitespace-nowrap"
              >
                {doubled}
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}