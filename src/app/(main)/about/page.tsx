'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Target, Eye, Heart, Globe, Shield, Zap, ArrowRight } from 'lucide-react';
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

// Timeline starts from 2025
const TIMELINE = [
  { year: '2025', event: '3ZF Platform unified — Mobile apps launched, payment gateways integrated। আন্দোলনের আনুষ্ঠানিক সূচনা।' },
  { year: '2026', event: 'Community expansion — regional hubs established across Bangladesh with thousands of active members.' },
  { year: 'Future', event: 'আমাদের স্বপ্ন — একটি সম্পূর্ণ সুদমুক্ত, শোষণমুক্ত ও জ্ঞানভিত্তিক সমাজ গড়ে তোলা।' },
];

export default function AboutPage() {
  return (
    <div className="ab-root">
      <MainNavbar />
      <div style={{ paddingTop: 'var(--navbar-height)' }}>

        {/* ── HERO WITH BACKGROUND VIDEO ── */}
        <section className="ab-hero">
          {/* Video background */}
          <div className="ab-hero-video-wrap">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="ab-hero-video"
            >
              {/* Replace /videos/hero.mp4 with your actual video path */}
              <source src="https://res.cloudinary.com/dgdlyrgda/video/upload/v1777362372/217643_se2ekf.mp4" type="video/mp4" />
              <source src="https://res.cloudinary.com/dgdlyrgda/video/upload/v1777362372/217643_se2ekf.webm" type="video/webm" />
            </video>
          </div>
          {/* Gradient overlay */}
          <div className="ab-hero-overlay" />

          {/* Content */}
          <motion.div
            className="ab-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="ab-hero-badge">🌐 Three Zeros of Freedom</span>
            <h1 className="ab-hero-title">
              About <span className="ab-hero-accent">3ZF</span>
              <br />আমাদের পরিচয়
            </h1>
            <p className="ab-hero-desc">
              3ZF (Three Zeros of Freedom) হলো একটি মানবিক, সামাজিক ও উন্নয়নমূলক আন্দোলন,
              যার লক্ষ্য একটি সুদমুক্ত (Interest-Free), শোষণমুক্ত (Exploitation-Free) এবং
              জ্ঞানভিত্তিক (Knowledge-Based) সমাজ গঠন।
            </p>
            <div className="ab-hero-btns">
              <Link href="/register" className="ab-btn-primary">
                Get Started <ArrowRight className="ab-btn-icon" />
              </Link>
              <Link href="/contact" className="ab-btn-outline">
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <div className="ab-scroll-hint">
            <span>SCROLL</span>
            <div className="ab-scroll-dot" />
          </div>
        </section>

        {/* ── MISSION + VISION SIDE BY SIDE ── */}
        <section className="ab-section ab-section--light">
          <div className="ab-section-inner">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="ab-section-title">আমাদের মিশন ও ভিশন</h2>
              <p className="ab-section-sub">What drives us forward every single day</p>
            </motion.div>

            <div className="ab-mv-flex">
              {/* Mission */}
              <motion.div
                className="ab-mv-card"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="ab-mv-icon">🎯</div>
                <h3 className="ab-mv-heading">
                  Our Mission
                  <span className="ab-mv-tag">MISSION</span>
                </h3>
                <ul className="ab-mission-list">
                  {missionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Vision */}
              <motion.div
                className="ab-mv-card"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="ab-mv-icon">🔭</div>
                <h3 className="ab-mv-heading">
                  Our Vision
                  <span className="ab-mv-tag">VISION</span>
                </h3>
                <div className="ab-vision-list">
                  {visionItems.map((item, i) => (
                    <div key={i} className="ab-vision-item">{item}</div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── WHY 3ZF ── */}
        <section className="ab-section ab-section--white">
          <div className="ab-section-inner">
            <h2 className="ab-section-title">কেন 3ZF প্রয়োজন?</h2>
            <p className="ab-section-sub">What guides every decision we make</p>
            <div className="ab-values-grid">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  className="ab-val-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="ab-val-icon-wrap">
                    <v.icon className="ab-val-icon" />
                  </div>
                  <div>
                    <h3 className="ab-val-title">{v.title}</h3>
                    <p className="ab-val-desc">{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="ab-section ab-section--light">
          <div className="ab-section-inner">
            <h2 className="ab-section-title">Our Journey</h2>
            <p className="ab-section-sub">আমাদের যাত্রার গল্প — শুরু থেকে আজ পর্যন্ত</p>
            <div className="ab-timeline-wrap">
              <div className="ab-timeline-line" />
              <div className="ab-timeline-items">
                {TIMELINE.map((t, i) => (
                  <motion.div
                    key={t.year}
                    className="ab-tl-item"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                  >
                    <div className="ab-tl-dot">
                      <span>{t.year === 'Future' ? '→' : `'${t.year.slice(2)}`}</span>
                    </div>
                    <div className="ab-tl-card">
                      <p className="ab-tl-year">{t.year}</p>
                      <p className="ab-tl-event">{t.event}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER ── */}
        <section className="ab-section ab-section--white">
          <FounderPage />
        </section>

        {/* ── CTA ── */}
        <section className="ab-cta-section">
          <motion.div
            className="ab-cta-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Users className="ab-cta-icon" />
            <h2 className="ab-cta-title">Join 3ZF Today</h2>
            <p className="ab-cta-desc">
              3ZF শুধুমাত্র একটি উদ্যোগ নয়—এটি একটি আন্দোলন, একটি বিশ্বাস, একটি সমাধান।
              আপনার অংশগ্রহণই আমাদের সমাজকে ন্যায্য, স্বচ্ছ ও মানবিক পথে এগিয়ে নেবে।
            </p>
            <div className="ab-cta-btns">
              <Link href="/register" className="ab-btn-primary ab-btn-primary--dark">
                Get Started <ArrowRight className="ab-btn-icon" />
              </Link>
              <Link href="/contact" className="ab-btn-outline">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
      <MainFooter />

      <style>{`
        /* ════════════════════════════════════════
           THEME TOKENS — Light & Dark
        ════════════════════════════════════════ */
        :root,
        [data-theme="light"] {
          --ab-bg:            #faf7ff;
          --ab-bg-alt:        #ffffff;
          --ab-bg-card:       #ffffff;
          --ab-bg-vision:     linear-gradient(90deg,#faf5ff,#f5f3ff);
          --ab-bg-vision-hov: linear-gradient(90deg,#f3e8ff,#ede9fe);
          --ab-border:        #e5e0f8;
          --ab-border-vis:    #ddd6fe;
          --ab-text:          #1e1b4b;
          --ab-text-soft:     #4c4680;
          --ab-brand:         #7c3aed;
          --ab-brand2:        #a855f7;
          --ab-gold:          #f59e0b;
          --ab-tag-bg:        #ede9fe;
          --ab-tag-color:     #6d28d9;
          --ab-tl-ring:       #ede9fe;
          --ab-shadow-sm:     0 2px 12px rgba(124,58,237,0.06);
          --ab-shadow-md:     0 8px 28px rgba(124,58,237,0.11);
          --ab-shadow-lg:     0 16px 48px rgba(109,40,217,0.22);
          --ab-val-bg:        #f5f3ff;
        }
        [data-theme="dark"],
        .dark {
          --ab-bg:            #0d0b18;
          --ab-bg-alt:        #13102a;
          --ab-bg-card:       #18153a;
          --ab-bg-vision:     linear-gradient(90deg,#1c1538,#181230);
          --ab-bg-vision-hov: linear-gradient(90deg,#261848,#20133c);
          --ab-border:        #2a2250;
          --ab-border-vis:    #362a68;
          --ab-text:          #ede9fe;
          --ab-text-soft:     #b8b0e0;
          --ab-brand:         #a78bfa;
          --ab-brand2:        #c084fc;
          --ab-gold:          #fbbf24;
          --ab-tag-bg:        #2a1f58;
          --ab-tag-color:     #c4b5fd;
          --ab-tl-ring:       #2a1f58;
          --ab-shadow-sm:     0 2px 14px rgba(0,0,0,0.40);
          --ab-shadow-md:     0 8px 28px rgba(0,0,0,0.50);
          --ab-shadow-lg:     0 16px 48px rgba(0,0,0,0.60);
          --ab-val-bg:        #1c1940;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --ab-bg:            #0d0b18;
            --ab-bg-alt:        #13102a;
            --ab-bg-card:       #18153a;
            --ab-bg-vision:     linear-gradient(90deg,#1c1538,#181230);
            --ab-bg-vision-hov: linear-gradient(90deg,#261848,#20133c);
            --ab-border:        #2a2250;
            --ab-border-vis:    #362a68;
            --ab-text:          #ede9fe;
            --ab-text-soft:     #b8b0e0;
            --ab-brand:         #a78bfa;
            --ab-brand2:        #c084fc;
            --ab-gold:          #fbbf24;
            --ab-tag-bg:        #2a1f58;
            --ab-tag-color:     #c4b5fd;
            --ab-tl-ring:       #2a1f58;
            --ab-shadow-sm:     0 2px 14px rgba(0,0,0,0.40);
            --ab-shadow-md:     0 8px 28px rgba(0,0,0,0.50);
            --ab-shadow-lg:     0 16px 48px rgba(0,0,0,0.60);
            --ab-val-bg:        #1c1940;
          }
        }

        /* ═══════ ROOT ═══════ */
        .ab-root {
          min-height: 100vh;
          background: var(--ab-bg);
          color: var(--ab-text);
          transition: background 0.3s, color 0.3s;
        }

        /* ═══════ HERO ═══════ */
        .ab-hero {
          position: relative;
          min-height: 94vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          padding: 100px 20px 80px;
        }
        .ab-hero-video-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .ab-hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ab-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(109, 40, 217, 0.84) 0%,
            rgba(88, 28, 220, 0.72) 45%,
            rgba(15, 15, 60, 0.80) 100%
          );
          z-index: 1;
        }
        .ab-hero-content {
          position: relative;
          z-index: 2;
          max-width: 760px;
          width: 100%;
        }
        .ab-hero-badge {
          display: inline-block;
          padding: 5px 20px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #e9d5ff;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 22px;
          backdrop-filter: blur(6px);
        }
        .ab-hero-title {
          font-size: clamp(2rem, 5.5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.15;
          color: #fff;
          margin-bottom: 20px;
          text-shadow: 0 2px 28px rgba(0, 0, 0, 0.35);
        }
        .ab-hero-accent { color: #f9a8d4; }
        .ab-hero-desc {
          font-size: clamp(0.9rem, 1.6vw, 1.1rem);
          color: #ddd6fe;
          line-height: 1.85;
          max-width: 620px;
          margin: 0 auto 32px;
        }
        .ab-hero-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ab-scroll-hint {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.5);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
        }
        .ab-scroll-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.5);
          animation: ab-bounce 1.6s ease-in-out infinite;
        }
        @keyframes ab-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(7px); }
        }

        /* ═══════ BUTTONS ═══════ */
        .ab-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #6d28d9;
          font-weight: 700; font-size: 0.95rem;
          padding: 12px 28px; border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
        }
        .ab-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .ab-btn-primary--dark {
          background: #fff; color: #6d28d9;
        }
        .ab-btn-outline {
          display: inline-flex; align-items: center;
          background: transparent; color: #fff;
          font-weight: 600; font-size: 0.95rem;
          padding: 12px 28px; border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.45);
          transition: background 0.2s;
          text-decoration: none;
        }
        .ab-btn-outline:hover { background: rgba(255,255,255,0.12); }
        .ab-btn-icon { width: 16px; height: 16px; }

        /* ═══════ SECTION ═══════ */
        .ab-section { padding: 48px 16px; transition: background 0.3s; }
        .ab-section--light { background: var(--ab-bg); }
        .ab-section--white { background: var(--ab-bg-alt); }
        .ab-section-inner { max-width: 1080px; margin: 0 auto; }
        .ab-section-title {
          font-size: clamp(1.3rem, 2.4vw, 2rem);
          font-weight: 800; text-align: center;
          color: var(--ab-text);
          margin: 0 0 4px;
        }
        .ab-section-sub {
          text-align: center;
          color: var(--ab-text-soft);
          font-size: 0.85rem;
          margin: 0 0 28px;
        }

        /* ═══════ MISSION / VISION FLEX ═══════ */
        .ab-mv-flex {
          display: flex; gap: 16px; align-items: stretch;
        }
        .ab-mv-card {
          flex: 1;
          background: var(--ab-bg-card);
          border-radius: 18px; padding: 24px 22px;
          border: 1px solid var(--ab-border);
          box-shadow: var(--ab-shadow-sm);
          transition: transform 0.25s, box-shadow 0.25s, background 0.3s, border-color 0.3s;
        }
        .ab-mv-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--ab-shadow-md);
        }
        .ab-mv-icon {
          width: 44px; height: 44px; border-radius: 13px;
          background: linear-gradient(135deg, var(--ab-brand), var(--ab-brand2));
          display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem; margin-bottom: 12px;
        }
        .ab-mv-heading {
          font-size: 1.05rem; font-weight: 800;
          color: var(--ab-text);
          margin: 0 0 14px;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .ab-mv-tag {
          font-size: 0.58rem;
          background: var(--ab-tag-bg); color: var(--ab-tag-color);
          padding: 2px 8px; border-radius: 999px;
          font-weight: 700; letter-spacing: 0.06em;
        }

        /* Mission list */
        .ab-mission-list {
          list-style: none; display: flex; flex-direction: column; gap: 8px;
          padding: 0; margin: 0;
        }
        .ab-mission-list li {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: clamp(0.78rem, 1vw, 0.875rem);
          color: var(--ab-text-soft); line-height: 1.65; font-weight: 400;
        }
        .ab-mission-list li::before {
          content: '✦'; color: var(--ab-gold);
          font-size: 0.55rem; margin-top: 5px; flex-shrink: 0;
        }

        /* Vision list */
        .ab-vision-list { display: flex; flex-direction: column; gap: 8px; }
        .ab-vision-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: var(--ab-bg-vision);
          border: 1px solid var(--ab-border-vis); border-radius: 10px;
          font-size: clamp(0.8rem, 1vw, 0.875rem);
          color: var(--ab-text-soft); font-weight: 500;
          transition: background 0.2s;
        }
        .ab-vision-item:hover { background: var(--ab-bg-vision-hov); }
        .ab-vision-item::before {
          content: '→'; color: var(--ab-brand); font-size: 0.85rem; flex-shrink: 0;
        }

        /* ═══════ VALUES ═══════ */
        .ab-values-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
        }
        .ab-val-card {
          background: var(--ab-val-bg);
          border-radius: 14px; padding: 18px 16px;
          border: 1px solid var(--ab-border);
          display: flex; gap: 12px; align-items: flex-start;
          box-shadow: var(--ab-shadow-sm);
          transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
        }
        .ab-val-card:hover {
          transform: translateY(-2px); box-shadow: var(--ab-shadow-md);
        }
        .ab-val-icon-wrap {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--ab-brand), var(--ab-brand2));
          display: flex; align-items: center; justify-content: center;
        }
        .ab-val-icon { width: 20px; height: 20px; color: #fff; }
        .ab-val-title {
          font-weight: 700; font-size: 0.875rem;
          color: var(--ab-text); margin: 0 0 4px;
        }
        .ab-val-desc {
          font-size: 0.8rem; color: var(--ab-text-soft);
          line-height: 1.6; margin: 0;
        }

        /* ═══════ TIMELINE ═══════ */
        .ab-timeline-wrap { position: relative; max-width: 640px; margin: 0 auto; }
        .ab-timeline-line {
          position: absolute; left: 20px; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(180deg, var(--ab-brand), var(--ab-border));
        }
        .ab-timeline-items { display: flex; flex-direction: column; gap: 16px; }
        .ab-tl-item {
          display: flex; align-items: flex-start;
          padding-left: 52px; position: relative;
        }
        .ab-tl-dot {
          position: absolute; left: 0;
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, var(--ab-brand), var(--ab-brand2));
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 0.65rem;
          box-shadow: 0 0 0 3px var(--ab-tl-ring);
        }
        .ab-tl-card {
          flex: 1; background: var(--ab-bg-card);
          border-radius: 12px; padding: 12px 16px;
          border: 1px solid var(--ab-border);
          box-shadow: var(--ab-shadow-sm);
          transition: background 0.3s, border-color 0.3s;
        }
        .ab-tl-year {
          font-weight: 800; font-size: 0.75rem;
          color: var(--ab-brand); margin: 0 0 3px;
        }
        .ab-tl-event {
          font-size: 0.845rem; color: var(--ab-text);
          line-height: 1.6; margin: 0;
        }

        /* ═══════ CTA ═══════ */
        .ab-cta-section { padding: 40px 16px 56px; }
        .ab-cta-card {
          max-width: 600px; margin: 0 auto; text-align: center;
          background: linear-gradient(135deg, #6d28d9, #a855f7);
          border-radius: 22px; padding: 40px 28px;
          box-shadow: var(--ab-shadow-lg);
        }
        .ab-cta-icon { width: 44px; height: 44px; color: rgba(255,255,255,0.8); margin: 0 auto 12px; }
        .ab-cta-title {
          font-size: clamp(1.3rem, 2.5vw, 1.8rem); font-weight: 800;
          color: #fff; margin: 0 0 10px;
        }
        .ab-cta-desc {
          color: #ddd6fe; line-height: 1.75;
          font-size: clamp(0.84rem, 1.3vw, 0.95rem); margin: 0 0 22px;
        }
        .ab-cta-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

        /* ═══════ RESPONSIVE ═══════ */
        @media (max-width: 768px) {
          .ab-mv-flex { flex-direction: column; gap: 12px; }
          .ab-mv-card { padding: 20px 18px; }
          .ab-values-grid { grid-template-columns: 1fr; gap: 12px; }
          .ab-cta-card { padding: 30px 18px; }
          .ab-hero { padding: 72px 16px 60px; min-height: 80vh; }
          .ab-section { padding: 40px 14px; }
        }
        @media (max-width: 480px) {
          .ab-section { padding: 32px 12px; }
          .ab-section-sub { margin-bottom: 20px; }
          .ab-tl-item { padding-left: 46px; }
          .ab-tl-dot { width: 34px; height: 34px; font-size: 0.6rem; }
          .ab-timeline-line { left: 17px; }
          .ab-timeline-items { gap: 12px; }
          .ab-hero-btns { flex-direction: column; align-items: center; gap: 8px; }
          .ab-btn-primary, .ab-btn-outline { width: 100%; justify-content: center; max-width: 240px; }
          .ab-cta-section { padding: 28px 12px 40px; }
          .ab-cta-card { padding: 26px 16px; border-radius: 16px; }
          .ab-mv-icon { width: 38px; height: 38px; font-size: 1.1rem; margin-bottom: 10px; }
          .ab-val-card { padding: 14px 12px; gap: 10px; }
          .ab-val-icon-wrap { width: 36px; height: 36px; }
        }
      `}</style>
    </div>
  );
}