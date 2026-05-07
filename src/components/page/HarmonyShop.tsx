'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import useAuthStore from '@/store/authStore';

/* ─── data ─────────────────────────────────────────────────────────────── */
const howItems = [
  { num: '০১', title: 'নির্ধারিত ও স্বচ্ছ প্রফিট মার্জিন', desc: 'অযৌক্তিক মূল্য নয়। নির্ধারিত ও যুক্তিসঙ্গত মার্জিন। এতে ভোক্তা সুরক্ষিত, ব্যবসা টেকসই।' },
  { num: '০২', title: 'স্থানীয় উৎপাদক অগ্রাধিকার', desc: 'উৎপাদক থেকে সরাসরি সংগ্রহ। মধ্যস্বত্ব কমলে মূল্য কমে, আয় বাড়ে।' },
  { num: '০৩', title: 'কমিউনিটি কর্মসংস্থান কাঠামো', desc: 'প্রতি উপজেলা ভিত্তিক সুপারভাইজার ও মার্কেটিং এক্সিকিউটিভ নিয়োগ। এটি শুধু দোকান নয়, একটি অর্থনৈতিক প্ল্যাটফর্ম।' },
  { num: '০৪', title: 'ডিজিটাল স্বচ্ছতা', desc: 'ইনভেন্টরি, বিক্রয় ও হিসাব—সবকিছু ট্র্যাকযোগ্য। স্বচ্ছতা ছাড়া ইনসাফ সম্ভব নয়।' },
];

const diffItems = [
  'মুনাফা-কেন্দ্রিক নয়, ভারসাম্য-কেন্দ্রিক',
  'সামাজিক প্রভাব ও ব্যবসার সমন্বয়',
  'স্থানীয় পুঁজি স্থানীয় উন্নয়নে',
  'পরিকল্পিত সম্প্রসারণ কাঠামো',
];

const proofPillars = [
  { num: '০১', title: 'ন্যায্য মূল্য', desc: 'স্বচ্ছ মার্জিন, নির্ধারিত মূল্য — কোনো অস্পষ্টতা নেই।' },
  { num: '০২', title: 'সমান সুযোগ', desc: 'উদ্যোক্তা থেকে ভোক্তা — সবার জন্য একই মঞ্চ।' },
  { num: '০৩', title: 'স্বচ্ছ তথ্য', desc: 'ডিজিটাল ট্র্যাকিং নিশ্চিত করে সম্পূর্ণ জবাবদিহিতা।' },
];

const outcomes = [
  'একজন উদ্যোক্তা বাজার পায়',
  'একজন যুবক কর্মসংস্থান পায়',
  'একজন ভোক্তা ন্যায্য মূল্য পায়',
];

const offerItems = [
  { icon: '🥬', title: 'দৈনন্দিন প্রয়োজনীয় পণ্য', desc: 'বিশ্বস্ত উৎস থেকে সংগ্রহ করা মানসম্মত খাদ্য ও নিত্যপ্রয়োজনীয় পণ্য।' },
  { icon: '🏪', title: 'স্থানীয় উদ্যোক্তা কর্নার', desc: 'স্থানীয় উৎপাদকদের জন্য বিশেষ প্রদর্শনী ও বিক্রয় সুবিধা।' },
  { icon: '💼', title: 'কর্মসংস্থান সুযোগ', desc: 'মার্কেটিং এক্সিকিউটিভ, সুপারভাইজার এবং ব্যবস্থাপনা পর্যায়ে কাজের সুযোগ।' },
  { icon: '📊', title: 'স্বচ্ছ সিস্টেম', desc: 'ডিজিটাল ইনভেন্টরি, হিসাব এবং অপারেশনাল ট্র্যাকিং ব্যবস্থা।' },
];

const needItems = [
  { icon: '🥬', title: '১. খাদ্য নিরাপত্তা', desc: 'নিয়ন্ত্রিত ও স্বচ্ছ প্রফিট মার্জিনের মাধ্যমে প্রয়োজনীয় খাদ্যপণ্য ন্যায্যমূল্যে সরবরাহ। মধ্যস্বত্বভোগী কমলে খাদ্যের দাম স্থিতিশীল হয়।' },
  { icon: '👕', title: '২. বস্ত্র ও নিত্যপ্রয়োজনীয়', desc: 'স্থানীয় উৎপাদকদের জন্য নির্দিষ্ট প্রদর্শনী ও বিক্রয় প্ল্যাটফর্ম। স্থানীয় উৎপাদন বাড়ে, দাম কমে, বাজার স্থিতিশীল হয়।' },
  { icon: '🏠', title: '৩. বাসস্থান নিরাপত্তা', desc: 'কমিউনিটি কর্মসংস্থান কাঠামো স্থিতিশীল আয় নিশ্চিত করে। স্থিতিশীল আয় মানে স্থিতিশীল পরিবার ও নিরাপদ বাসস্থান।' },
  { icon: '📚', title: '৪. শিক্ষা সক্ষমতা', desc: 'যেখানে আয় নিয়মিত, সেখানে শিক্ষা ব্যয় সম্ভব। শোষণমুক্ত বাজার পরিবারকে দীর্ঘমেয়াদি পরিকল্পনা করতে সক্ষম করে।' },
  { icon: '🏥', title: '৫. স্বাস্থ্য সুরক্ষা', desc: 'অযৌক্তিক মূল্যবৃদ্ধি কমলে পরিবার স্বাস্থ্য ব্যয় বহন করতে পারে। আর্থিক চাপ কমলে চিকিৎসা অবহেলা কমে।' },
];

const zeroItems = [
  { label: 'Zero Interest', bn: 'সুদমুক্ত অর্থনীতি' },
  { label: 'Zero Exploitation', bn: 'শোষণমুক্ত সমাজ' },
  { label: 'Zero Ignorance', bn: 'অজ্ঞতামুক্ত জনগোষ্ঠী' },
];

const whoTags = ['উদ্যোক্তা', 'সচেতন ভোক্তা', 'বিনিয়োগকারী', 'সমাজ পরিবর্তনের অংশীদার'];
const problems = ['মধ্যস্বত্বভোগী মূল্যবৃদ্ধি', 'ক্ষুদ্র উদ্যোক্তার সীমাবদ্ধতা', 'অস্বচ্ছ বাজার'];

/* ─── animation helper ──────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function ShopPage() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Sync with app theme: dark = true when theme is 'dark'
  const dark = theme === 'dark';

  // Auth-aware navigation handler
  const handleNavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/supershop');
    } else {
      router.push('/register');
    }
  };

  return (
    <main className={`hs-root${dark ? ' hs-dark' : ' hs-light'}`}>

      {/* ════ HERO ════ */}
      <section className="hs-hero">
        <div className="hs-orb" />
        <div className="hs-grid-bg" />
        <div className="hs-wrap hs-hero-inner" style={{ position: 'relative' }}>
          <motion.div {...fadeUp(0)} className="hs-hero-left">
            <h1 className="hs-hero-h1">
              <span className="hs-grad">Harmony</span>
              <span className="hs-hero-sub">Community</span>
              <span className="hs-hero-sub">Shop</span>
            </h1>
            <p className="hs-hero-tag">এটি একটি দোকান নয় — এটি একটি অর্থনৈতিক আন্দোলন</p>
            <div className="hs-btn-row">
              {/* Auth-aware primary button */}
              <a href="#" onClick={handleNavClick} className="hs-btn-p">
                {isAuthenticated ? 'Shop Now' : 'Join Community'} <ArrowRight size={15} />
              </a>
              {/* Auth-aware secondary button */}
              <a href="#" onClick={handleNavClick} className="hs-btn-s">
                {isAuthenticated ? 'Browse Shop' : 'Register'}
              </a>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="hs-card hs-vision">
            <p className="hs-vision-label">Core Vision</p>
            <p className="hs-vision-body">
              ন্যায্য মূল্য, কর্মসংস্থান ও কমিউনিটি অংশীদারিত্বের মাধ্যমে একটি ভারসাম্যপূর্ণ অর্থনীতি।
            </p>
            <div className="hs-stats">
              {[
                { v: '৩টি', l: 'মূল নীতি' },
                { v: '৮টি', l: 'জেলা' },
                { v: '২০২৫', l: 'প্রতিষ্ঠা' },
              ].map((s, i) => (
                <div key={i} className="hs-stat">
                  <span className="hs-stat-v">{s.v}</span>
                  <span className="hs-stat-l">{s.l}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════ PROBLEM ════ */}
      <motion.section {...fadeUp(0)} className="hs-sec">
        <div className="hs-wrap hs-two-col">
          <div>
            <div className="hs-label">সমস্যা</div>
            <h2 className="hs-h2">
              বাজারের <span className="hs-accent">অসুস্থতা</span>
            </h2>
            <div className="hs-rule" />
            <div className="hs-prob-list">
              {problems.map((item, i) => (
                <div key={i} className="hs-prob-item">
                  <span className="hs-prob-n">০{i + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hs-card hs-belief">
            <div className="hs-belief-icon">💡</div>
            <p className="hs-belief-lbl">আমাদের বিশ্বাস</p>
            <p className="hs-belief-txt">
              ন্যায্য মূল্য ও স্বচ্ছতা থাকলে একটি ইনসাফভিত্তিক সমাজ গড়া সম্ভব।
            </p>
          </div>
        </div>
      </motion.section>

      {/* ════ HOW IT WORKS ════ */}
      <section className="hs-sec hs-alt">
        <div className="hs-wrap">
          <div className="hs-label">কার্যপদ্ধতি</div>
          <h2 className="hs-h2">
            কীভাবে <span className="hs-accent">কাজ করে?</span>
          </h2>
          <div className="hs-rule" style={{ marginBottom: 'clamp(1.2rem,3.5vw,2rem)' }} />
          <div className="hs-4col">
            {howItems.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="hs-card hs-pad">
                <div className="hs-num">{item.num}</div>
                <h3 className="hs-card-h">{item.title}</h3>
                <p className="hs-card-p">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ OFFER ════ */}
      <section className="hs-sec">
        <div className="hs-wrap">
          <div className="hs-label">সেবা</div>
          <h2 className="hs-h2">
            আমরা কী <span className="hs-accent">দিচ্ছি?</span>
          </h2>
          <div className="hs-rule" style={{ marginBottom: 'clamp(1.2rem,3.5vw,2rem)' }} />
          <div className="hs-4col">
            {offerItems.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="hs-card hs-pad">
                <div className="hs-emoji">{item.icon}</div>
                <h3 className="hs-card-h">{item.title}</h3>
                <p className="hs-card-p">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SOCIAL NEEDS ════ */}
      <section className="hs-sec hs-alt">
        <div className="hs-wrap">
          <div className="hs-label">সামাজিক প্রভাব</div>
          <h2 className="hs-h2">
            মৌলিক চাহিদা <span className="hs-accent">পূরণ</span>
          </h2>
          <div className="hs-rule" style={{ marginBottom: 'clamp(1.2rem,3.5vw,2rem)' }} />
          <div className="hs-3col">
            {needItems.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)} className="hs-card hs-need">
                <span className="hs-emoji">{item.icon}</span>
                <div>
                  <h3 className="hs-card-h">{item.title}</h3>
                  <p className="hs-card-p">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PHILOSOPHY ════ */}
      <motion.section {...fadeUp(0)} className="hs-sec hs-center">
        <div className="hs-wrap hs-center">
          <div className="hs-label">দর্শন</div>
          <h2 className="hs-h2">
            আমাদের <span className="hs-accent">দর্শন</span>
          </h2>
          <div className="hs-rule hs-rule-c" />
          <p className="hs-phil-p">
            এই উদ্যোগ বৃহত্তর সামাজিক দর্শন{' '}
            <strong className="hs-accent">3ZF (Three Zeros of Freedom)</strong>-এর সাথে সামঞ্জস্যপূর্ণ।
            অর্থনীতি যদি সুদমুক্ত, শোষণমুক্ত ও জ্ঞানভিত্তিক হয় — তবেই প্রকৃত স্বাধীনতা সম্ভব।
          </p>
          <div className="hs-3col">
            {zeroItems.map((z, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="hs-card hs-zero">
                <div className="hs-zero-n">0{i + 1}</div>
                <p className="hs-zero-en">{z.label}</p>
                <p className="hs-zero-bn">{z.bn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════ DIFFERENTIATORS ════ */}
      <section className="hs-sec hs-alt">
        <div className="hs-wrap" style={{ maxWidth: '50rem' }}>
          <div className="hs-label">কেন আলাদা</div>
          <h2 className="hs-h2">
            হারমনি শপ কী <span className="hs-accent">আলাদা করে?</span>
          </h2>
          <div className="hs-rule" style={{ marginBottom: 'clamp(1.2rem,3.5vw,2rem)' }} />
          <div className="hs-diff-list">
            {diffItems.map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)} className="hs-diff-item">
                <div className="hs-check">
                  <Check size={13} />
                </div>
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
          <div className="hs-stmt">
            <p>এটি একটি দোকান নয়।</p>
            <p>
              <span className="hs-accent">এটি একটি সামাজিক অবকাঠামো।</span>
            </p>
          </div>
        </div>
      </section>

      {/* ════ PROOF / PILLARS ════ */}
      <section className="hs-sec">
        <div className="hs-wrap">
          <div className="hs-label">প্রমাণ</div>
          <h2 className="hs-h2">
            ন্যায্য সমাজের <span className="hs-accent">তিন স্তম্ভ</span>
          </h2>
          <div className="hs-rule" style={{ marginBottom: 'clamp(1.2rem,3.5vw,2rem)' }} />
          <div className="hs-3col" style={{ marginBottom: '1.5rem' }}>
            {proofPillars.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="hs-card hs-pad">
                <div className="hs-num">{p.num}</div>
                <h4 className="hs-card-h">{p.title}</h4>
                <p className="hs-card-p">{p.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="hs-outcomes">
            {outcomes.map((o, i) => (
              <motion.div key={i} {...fadeUp(0.3 + i * 0.08)} className="hs-outcome">
                <div className="hs-dot" />
                <span>{o} — সেখানে ইনসাফের ভিত্তি গড়ে ওঠে।</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ WHO IS THIS FOR ════ */}
      <motion.section {...fadeUp(0)} className="hs-sec hs-alt hs-center">
        <div className="hs-wrap hs-center">
          <div className="hs-label">আপনি কোথায়?</div>
          <h2 className="hs-h2">
            এই উদ্যোগ <span className="hs-accent">কার জন্য?</span>
          </h2>
          <div className="hs-rule hs-rule-c" />
          <div className="hs-tags">
            {whoTags.map((tag) => (
              <span key={tag} className="hs-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════ FOOTER CTA ════ */}
      <footer className="hs-footer">
        <div className="hs-footer-orb" />
        <div className="hs-wrap hs-center" style={{ position: 'relative' }}>
          <div className="hs-label">আহ্বান</div>
          <h2 className="hs-footer-h">
            &ldquo;ন্যায্য বাজার গড়া <span style={{ color: '#a78bfa' }}>সম্ভব</span>&rdquo;
          </h2>
          <p className="hs-footer-pledge">
            আমরা প্রতিশ্রুতি দিচ্ছি না যে একদিনেই সমাজ বদলে যাবে।
            <br />
            আমরা প্রমাণ করতে চাই — <strong>ন্যায্য বাজার গড়া সম্ভব।</strong>
            <br />
            এবং সেখান থেকেই ন্যায্য সমাজের শুরু।
          </p>
          <p className="hs-footer-q">
            একটি প্রশ্ন নিজেকে করুন:
            <br />
            <em>আপনি কি শুধু ক্রেতা হতে চান, নাকি একটি ন্যায্য অর্থনীতির অংশ হতে চান?</em>
          </p>
          {/* Auth-aware footer CTA */}
          <a
            href="#"
            onClick={handleNavClick}
            className="hs-btn-p hs-footer-btn inline-flex items-center gap-2"
          >
            {isAuthenticated ? 'Shop Now' : 'আজই যুক্ত হোন'} <ArrowRight size={17} />
          </a>
          <div className="hs-copy">
            <Zap size={11} />
            © {new Date().getFullYear()} হারমনি কমিউনিটি শপ — 3ZF Foundation. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* ════ STYLES ════ */}
      <style>{`
        /* ══════════════════════════════════════════════
           DARK THEME (default)
        ══════════════════════════════════════════════ */
        .hs-dark {
          --hs-b:     #7c3aed;
          --hs-b2:    #a78bfa;
          --hs-tx:    #f1eeff;
          --hs-mt:    #a89ec4;
          --hs-bg:    #0f0d18;
          --hs-bgs:   #15111f;
          --hs-ca:    rgba(124,58,237,.10);
          --hs-cb:    rgba(124,58,237,.22);
          --hs-cd:    rgba(255,255,255,0.04);
          --hs-ce:    rgba(255,255,255,0.08);
          --hs-shadow:rgba(124,58,237,.35);
          --hs-shadow2:rgba(124,58,237,.5);
          --hs-footer-bg: linear-gradient(135deg,#1a0d3a 0%,#0f0d18 100%);
          --hs-footer-tx: rgba(255,255,255,.65);
          --hs-footer-tx2:rgba(255,255,255,.55);
          --hs-footer-h:  #fff;
          --hs-copy:  rgba(255,255,255,.45);
          --hs-grid:  rgba(124,58,237,.03);
          --hs-orb-op:.10;
        }

        /* ══════════════════════════════════════════════
           LIGHT THEME
        ══════════════════════════════════════════════ */
        .hs-light {
          --hs-b:     #6d28d9;
          --hs-b2:    #7c3aed;
          --hs-tx:    #1a0a3d;
          --hs-mt:    #5b4e7e;
          --hs-bg:    #faf9ff;
          --hs-bgs:   #f3f0ff;
          --hs-ca:    rgba(109,40,217,.08);
          --hs-cb:    rgba(109,40,217,.18);
          --hs-cd:    rgba(109,40,217,.04);
          --hs-ce:    rgba(109,40,217,.12);
          --hs-shadow:rgba(109,40,217,.25);
          --hs-shadow2:rgba(109,40,217,.4);
          --hs-footer-bg: linear-gradient(135deg,#2d1166 0%,#1a0a3d 100%);
          --hs-footer-tx: rgba(255,255,255,.72);
          --hs-footer-tx2:rgba(255,255,255,.58);
          --hs-footer-h:  #fff;
          --hs-copy:  rgba(255,255,255,.5);
          --hs-grid:  rgba(109,40,217,.025);
          --hs-orb-op:.07;
        }

        /* ══════════════════════════════════════════════
           BASE
        ══════════════════════════════════════════════ */
        .hs-root {
          background: var(--hs-bg);
          color: var(--hs-tx);
          font-family: inherit;
          transition: background .3s, color .3s;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Layout ── */
        .hs-wrap   { max-width: 75rem; margin: 0 auto; width: 100%; }
        .hs-sec    { padding: clamp(3rem,8vw,5.5rem) clamp(1rem,5vw,2rem); }
        .hs-alt    { background: var(--hs-bgs); transition: background .3s; }
        .hs-center { display: flex; flex-direction: column; align-items: center; text-align: center; }

        /* ── Typography ── */
        .hs-label  {
          display: inline-flex; align-items: center; gap: .35rem;
          background: var(--hs-ca); border: 1px solid var(--hs-cb); border-radius: 9999px;
          color: var(--hs-b); font-size: clamp(.6rem,1.4vw,.72rem); font-weight: 600;
          letter-spacing: .12em; padding: .2rem .65rem; margin-bottom: .6rem;
          transition: background .3s, border-color .3s, color .3s;
        }
        .hs-h2     {
          font-size: clamp(1.25rem,3.6vw,1.95rem); font-weight: 700;
          color: var(--hs-tx); margin: 0 0 .4rem; line-height: 1.2;
          font-family: var(--font-heading, inherit);
          transition: color .3s;
        }
        .hs-accent { color: var(--hs-b); transition: color .3s; }
        .hs-rule   {
          width: 2.5rem; height: 2px; border-radius: 9999px;
          background: linear-gradient(90deg, var(--hs-b), transparent);
          margin-top: .4rem;
        }
        .hs-rule-c { margin: .4rem auto 0; }
        .hs-num    { color: var(--hs-b); font-weight: 700; font-size: clamp(.68rem,1.5vw,.78rem); transition: color .3s; }
        .hs-emoji  { font-size: clamp(1.4rem,3.2vw,1.9rem); }
        .hs-card-h { font-weight: 700; color: var(--hs-tx); font-size: clamp(.78rem,1.9vw,.9rem); font-family: var(--font-heading, inherit); transition: color .3s; }
        .hs-card-p { color: var(--hs-mt); font-size: clamp(.7rem,1.7vw,.8rem); line-height: 1.65; transition: color .3s; }

        /* ── Card ── */
        .hs-card   {
          background: var(--hs-cd); border: 1px solid var(--hs-ce); border-radius: 1rem;
          transition: transform .2s, border-color .2s, background .3s;
        }
        .hs-card:hover { transform: translateY(-3px); border-color: var(--hs-cb); }
        .hs-pad    { padding: clamp(.9rem,2.6vw,1.3rem); display: flex; flex-direction: column; gap: .55rem; }

        /* ── Chip ── */
        .hs-chip   {
          display: inline-flex; align-items: center; gap: .35rem; border-radius: 9999px;
          font-weight: 600; letter-spacing: .06em; border: 1px solid var(--hs-cb);
          background: var(--hs-ca); color: var(--hs-b);
          padding: .25rem .75rem; font-size: clamp(.62rem,1.4vw,.74rem); margin-bottom: 1rem;
          transition: background .3s, border-color .3s, color .3s;
        }

        /* ── Buttons ── */
        .hs-btn-p  {
          display: inline-flex; align-items: center; gap: .45rem;
          background: var(--hs-b); color: #fff; border: none; border-radius: .7rem;
          font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px var(--hs-shadow);
          transition: transform .18s, box-shadow .18s, background .3s;
          font-size: clamp(.75rem,1.9vw,.9rem);
          padding: clamp(10px,2.2vw,13px) clamp(18px,3.5vw,28px); text-decoration: none;
        }
        .hs-btn-p:hover { transform: translateY(-2px); box-shadow: 0 8px 30px var(--hs-shadow2); }
        .hs-btn-s  {
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: var(--hs-b); border: 1px solid var(--hs-cb);
          border-radius: .7rem; font-weight: 600; cursor: pointer;
          transition: background .18s, transform .18s, color .3s, border-color .3s;
          font-size: clamp(.75rem,1.9vw,.9rem);
          padding: clamp(10px,2.2vw,13px) clamp(18px,3.5vw,28px); text-decoration: none;
        }
        .hs-btn-s:hover { background: var(--hs-ca); transform: translateY(-2px); }
        .hs-btn-row{ display: flex; flex-wrap: wrap; gap: .65rem; margin-top: 1.5rem; }

        /* ── Hero ── */
        .hs-hero {
          position: relative; overflow: hidden;
          min-height: 100svh; display: flex; align-items: center;
          padding: clamp(5rem,10vw,7rem) clamp(1rem,5vw,2rem) clamp(3rem,7vw,5rem);
          background: var(--hs-bgs); transition: background .3s;
        }
        .hs-orb {
          position: absolute; border-radius: 9999px; pointer-events: none;
          filter: blur(90px); opacity: var(--hs-orb-op); background: var(--hs-b);
          width: clamp(220px,44vw,500px); height: clamp(220px,44vw,500px);
          top: -4rem; right: -4rem; transition: opacity .3s;
        }
        .hs-grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          opacity: 1; background-image: linear-gradient(var(--hs-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--hs-grid) 1px, transparent 1px);
          background-size: clamp(36px,5vw,52px) clamp(36px,5vw,52px);
        }
        .hs-hero-inner {
          display: grid; grid-template-columns: 1fr;
          gap: clamp(2rem,5vw,3.5rem); align-items: center;
        }
        @media (min-width: 820px) { .hs-hero-inner { grid-template-columns: 1fr 1fr; } }
        .hs-hero-left  { display: flex; flex-direction: column; }
        .hs-hero-h1    {
          font-size: clamp(2.8rem,8vw,5.5rem); font-weight: 800;
          line-height: 1; margin: 0 0 .5rem; font-family: var(--font-heading, inherit);
        }
        .hs-grad       {
          display: block;
          background: linear-gradient(135deg, var(--hs-b) 0%, var(--hs-b2) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hs-hero-sub   { display: block; color: var(--hs-tx); margin-top: .1rem; transition: color .3s; }
        .hs-hero-tag   { color: var(--hs-mt); margin: .75rem 0 0; font-size: clamp(.8rem,2vw,.95rem); transition: color .3s; }

        /* ── Vision card ── */
        .hs-vision         { padding: clamp(1.2rem,3vw,1.8rem); }
        .hs-vision-label   { color: var(--hs-b); font-weight: 600; font-size: .85rem; margin-bottom: .6rem; transition: color .3s; }
        .hs-vision-body    { color: var(--hs-mt); font-size: clamp(.78rem,1.9vw,.9rem); line-height: 1.7; margin: 0 0 1.2rem; transition: color .3s; }
        .hs-stats          { display: flex; gap: 1rem; border-top: 1px solid var(--hs-ce); padding-top: 1rem; transition: border-color .3s; }
        .hs-stat           { display: flex; flex-direction: column; }
        .hs-stat-v         { font-size: clamp(1.1rem,3vw,1.5rem); font-weight: 700; color: var(--hs-b); transition: color .3s; }
        .hs-stat-l         { font-size: .7rem; color: var(--hs-mt); transition: color .3s; }

        /* ── Problem ── */
        .hs-two-col   { display: grid; grid-template-columns: 1fr; gap: clamp(1.5rem,4vw,3rem); align-items: center; }
        @media (min-width: 700px) { .hs-two-col { grid-template-columns: 1fr 1fr; } }
        .hs-prob-list { display: flex; flex-direction: column; gap: .55rem; margin-top: clamp(1rem,2.5vw,1.5rem); }
        .hs-prob-item {
          display: flex; align-items: center; gap: .75rem;
          background: var(--hs-cd); border: 1px solid var(--hs-ce); border-radius: .7rem;
          padding: .8rem 1rem; font-size: clamp(.75rem,1.9vw,.88rem); color: var(--hs-tx);
          transition: border-color .2s, background .3s, color .3s;
        }
        .hs-prob-item:hover { border-color: var(--hs-cb); }
        .hs-prob-n    { color: var(--hs-b); font-weight: 700; font-size: .78rem; flex-shrink: 0; transition: color .3s; }
        .hs-belief    { padding: clamp(1.2rem,3vw,2rem); text-align: center; }
        .hs-belief-icon { font-size: 2rem; margin-bottom: .75rem; }
        .hs-belief-lbl  { color: var(--hs-b); font-weight: 600; margin-bottom: .5rem; font-size: .85rem; transition: color .3s; }
        .hs-belief-txt  { color: var(--hs-mt); font-size: clamp(.78rem,1.9vw,.9rem); line-height: 1.7; transition: color .3s; }

        /* ── Grids ── */
        .hs-4col { display: grid; grid-template-columns: 1fr; gap: clamp(.7rem,2.2vw,1rem); }
        @media (min-width: 560px) { .hs-4col { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 900px) { .hs-4col { grid-template-columns: repeat(4,1fr); } }
        .hs-3col { display: grid; grid-template-columns: 1fr; gap: clamp(.7rem,2.2vw,1rem); width: 100%; }
        @media (min-width: 560px) { .hs-3col { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 820px) { .hs-3col { grid-template-columns: repeat(3,1fr); } }

        /* ── Needs ── */
        .hs-need { padding: clamp(.9rem,2.4vw,1.25rem); display: flex; align-items: flex-start; gap: .85rem; }

        /* ── Philosophy ── */
        .hs-phil-p { color: var(--hs-mt); font-size: clamp(.78rem,1.9vw,.9rem); line-height: 1.75; max-width: 46rem; margin: .75rem auto 2rem; transition: color .3s; }
        .hs-zero   { padding: clamp(1rem,2.8vw,1.5rem); text-align: center; display: flex; flex-direction: column; align-items: center; gap: .45rem; }
        .hs-zero-n  { font-size: clamp(1.8rem,4vw,2.4rem); font-weight: 800; color: var(--hs-b); opacity: .22; line-height: 1; transition: color .3s; }
        .hs-zero-en { font-weight: 700; color: var(--hs-tx); font-size: clamp(.82rem,2vw,.95rem); transition: color .3s; }
        .hs-zero-bn { color: var(--hs-mt); font-size: clamp(.72rem,1.7vw,.82rem); transition: color .3s; }

        /* ── Differentiators ── */
        .hs-diff-list { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 1.5rem; }
        .hs-diff-item {
          display: flex; align-items: center; gap: .75rem;
          padding: .8rem 1rem; background: var(--hs-cd); border: 1px solid var(--hs-ce);
          border-radius: .7rem; font-size: clamp(.78rem,1.9vw,.9rem); color: var(--hs-tx);
          transition: border-color .2s, transform .2s, background .3s, color .3s;
        }
        .hs-diff-item:hover { border-color: var(--hs-cb); transform: translateX(4px); }
        .hs-check  {
          flex-shrink: 0; width: 1.4rem; height: 1.4rem; border-radius: 50%;
          background: var(--hs-ca); border: 1px solid var(--hs-cb); color: var(--hs-b);
          display: flex; align-items: center; justify-content: center;
          transition: background .3s, border-color .3s, color .3s;
        }
        .hs-stmt   { border-left: 2px solid var(--hs-b); padding-left: 1rem; transition: border-color .3s; }
        .hs-stmt p { font-size: clamp(.82rem,2vw,.95rem); color: var(--hs-mt); transition: color .3s; }
        .hs-stmt p + p { margin-top: .2rem; }

        /* ── Outcomes ── */
        .hs-outcomes { display: flex; flex-direction: column; gap: .6rem; }
        .hs-outcome  { display: flex; align-items: center; gap: .75rem; font-size: clamp(.75rem,1.9vw,.88rem); color: var(--hs-mt); transition: color .3s; }
        .hs-dot      { flex-shrink: 0; width: .5rem; height: .5rem; border-radius: 9999px; background: var(--hs-b); transition: background .3s; }

        /* ── Who ── */
        .hs-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; margin-top: 1rem; }
        .hs-tag  {
          padding: .45rem 1rem; border-radius: 9999px; border: 1px solid var(--hs-cb);
          background: var(--hs-ca); color: var(--hs-b);
          font-size: clamp(.74rem,1.8vw,.86rem); font-weight: 500;
          transition: background .18s, transform .18s, color .3s, border-color .3s; cursor: default;
        }
        .hs-tag:hover { background: var(--hs-cb); transform: translateY(-2px); }

        /* ── Footer ── */
        .hs-footer     {
          position: relative; overflow: hidden; text-align: center;
          background: var(--hs-footer-bg);
          padding: clamp(3.5rem,9vw,6rem) clamp(1rem,5vw,2rem);
        }
        .hs-footer-orb {
          position: absolute; border-radius: 9999px; pointer-events: none;
          filter: blur(100px); opacity: .16; background: var(--hs-b);
          width: clamp(200px,50vw,500px); height: clamp(200px,50vw,500px);
          top: 50%; left: 50%; transform: translate(-50%,-50%);
        }
        .hs-footer-h   { font-size: clamp(1.6rem,5vw,3rem); font-weight: 800; color: var(--hs-footer-h); margin: 0 0 1.25rem; font-family: var(--font-heading, inherit); }
        .hs-footer-pledge { color: var(--hs-footer-tx); line-height: 1.9; max-width: 38rem; font-size: clamp(.8rem,2vw,.95rem); margin: 0 auto 1.25rem; }
        .hs-footer-q   { color: var(--hs-footer-tx2); font-size: clamp(.78rem,1.9vw,.9rem); line-height: 1.75; max-width: 36rem; margin: 0 auto 2rem; }
        .hs-footer-btn { padding: clamp(12px,2.5vw,15px) clamp(24px,4vw,36px); font-size: clamp(.82rem,2vw,.95rem); }
        .hs-copy       { display: flex; align-items: center; gap: .4rem; justify-content: center; color: var(--hs-copy); font-size: clamp(.6rem,1.4vw,.72rem); margin-top: 2rem; }

        /* ── XS phone ── */
        @media (max-width: 380px) {
          .hs-btn-p, .hs-btn-s { width: 100%; justify-content: center; }
          .hs-btn-row { flex-direction: column; }
          .hs-hero-h1 { font-size: 2.4rem; }
          .hs-stats   { flex-wrap: wrap; gap: .6rem; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition-duration: .01ms !important; }
        }
      `}</style>
    </main>
  );
}