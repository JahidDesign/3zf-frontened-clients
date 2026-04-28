import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  TrendingDown,
  Users,
  Award,
  ArrowRight,
  Zap,
} from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lexend:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #030e08;
    --surface: #0b1f12;
    --surface2: #0f2a17;
    --gold: #e8b84b;
    --gold-light: #f5d07a;
    --gold-dim: #a07828;
    --gold-glow: rgba(232,184,75,0.12);
    --gold-border: rgba(232,184,75,0.2);
    --text: #eef4f0;
    --text-soft: #9ab8a6;
    --text-muted: #5a7a66;
    --border: rgba(30,65,40,0.8);
    --r: 12px;
    --r-lg: 20px;
  }

  .ab-root {
    font-family: 'Lexend', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .ab-wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 48px;
  }

  /* ── HERO ── */
  .ab-hero {
    position: relative;
    overflow: hidden;
    padding: 100px 0 80px;
    background: var(--bg);
  }
  .ab-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(30,65,40,0.25) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,65,40,0.25) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 85% 85% at 50% 40%, black 20%, transparent 100%);
    pointer-events: none;
  }
  .ab-hero-inner {
    position: relative; z-index: 1;
    max-width: 1100px; margin: 0 auto;
    padding: 0 48px;
    text-align: center;
  }
  .ab-hero-inner h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.2rem, 6vw, 4rem);
    font-weight: 900;
    line-height: 1.1;
    margin: 18px 0 14px;
    background: linear-gradient(120deg, #f5d07a 0%, #e8b84b 50%, #b87c10 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ab-hero-bn {
    font-size: clamp(0.9rem, 1.5vw, 1.05rem);
    color: var(--text-muted);
    font-weight: 300;
    margin-bottom: 32px;
  }
  .ab-hero-card {
    max-width: 720px; margin: 0 auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 28px 32px;
    font-size: clamp(0.88rem, 1.3vw, 0.98rem);
    line-height: 1.85;
    color: var(--text-soft);
    font-weight: 300;
    position: relative;
  }
  .ab-hero-card::before {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 50%; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }

  /* ── EYEBROW ── */
  .ab-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 10px;
  }
  .ab-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 8px rgba(232,184,75,0.5);
    flex-shrink: 0;
  }

  /* ── SECTION LABELS ── */
  .ab-section-label {
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 10px;
  }
  .ab-section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    font-weight: 900; color: var(--text);
    line-height: 1.15; margin-bottom: 36px;
  }
  .ab-section-title span {
    background: linear-gradient(120deg, #f5d07a, #e8b84b, #b87c10);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── MISSION & VISION ── */
  .ab-mv {
    padding: 90px 0;
    background: var(--bg);
  }
  .ab-mv-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .ab-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 32px 28px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s;
  }
  .ab-card:hover { border-color: var(--gold-border); }
  .ab-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(232,184,75,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .ab-card-gold {
    border-color: var(--gold-border);
    background: linear-gradient(160deg, #0f2a17 0%, #0b1f12 100%);
  }
  .ab-card-icon {
    width: 44px; height: 44px; border-radius: 10px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold); margin-bottom: 18px;
  }
  .ab-card h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1rem, 1.8vw, 1.2rem);
    font-weight: 700; color: var(--gold-light);
    margin-bottom: 16px; line-height: 1.3;
  }
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
  .ab-vision-note {
    font-size: 0.82rem; color: var(--text-muted);
    font-style: italic; margin-bottom: 16px;
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

  /* ── WHY 3ZF ── */
  .ab-why {
    padding: 90px 0;
    background: var(--surface);
  }
  .ab-why-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .ab-why-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 28px 22px;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }
  .ab-why-card:hover { border-color: var(--gold-border); transform: translateY(-3px); }
  .ab-why-card-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold); margin-bottom: 18px;
  }
  .ab-why-card h3 {
    font-size: clamp(0.9rem, 1.4vw, 1rem);
    font-weight: 600; color: var(--gold-light);
    margin-bottom: 10px; line-height: 1.4;
  }
  .ab-why-card p {
    font-size: clamp(0.8rem, 1vw, 0.87rem);
    color: var(--text-muted); line-height: 1.75; font-weight: 300;
  }

  /* ── HOW WE WORK ── */
  .ab-how {
    padding: 90px 0;
    background: var(--bg);
  }
  .ab-how-card {
    max-width: 760px; margin: 0 auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 36px 32px;
    text-align: center;
    position: relative; overflow: hidden;
  }
  .ab-how-card::before {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 45%; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }
  .ab-how-desc {
    font-size: clamp(0.88rem, 1.3vw, 0.96rem);
    color: var(--text-soft); line-height: 1.85; font-weight: 300;
    margin-bottom: 2px;
  }
  .ab-how-org {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1rem, 2vw, 1.25rem);
    font-weight: 700;
    background: linear-gradient(120deg, #f5d07a, #e8b84b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ab-how-tags {
    display: flex; flex-wrap: wrap; gap: 8px;
    justify-content: center; margin-top: 24px;
  }
  .ab-how-tag {
    font-size: 0.74rem; font-weight: 500;
    letter-spacing: 0.04em;
    padding: 6px 14px; border-radius: 999px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    color: var(--gold-light);
    transition: background 0.2s;
  }
  .ab-how-tag:hover { background: rgba(232,184,75,0.2); }

  /* ── LONG TERM ── */
  .ab-lt {
    padding: 90px 0;
    background: var(--surface);
  }
  .ab-lt-list {
    max-width: 760px; margin: 0 auto;
    display: flex; flex-direction: column; gap: 14px;
  }
  .ab-lt-item {
    display: flex; align-items: center; gap: 16px;
    padding: 18px 22px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r);
    font-size: clamp(0.86rem, 1.2vw, 0.94rem);
    color: var(--text-soft); font-weight: 400;
    transition: border-color 0.2s;
  }
  .ab-lt-item:hover { border-color: var(--gold-border); }
  .ab-lt-bullet {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--gold); flex-shrink: 0;
    box-shadow: 0 0 8px rgba(232,184,75,0.4);
  }

  /* ── CTA ── */
  .ab-cta {
    padding: 100px 0;
    background: var(--bg);
    text-align: center;
    position: relative; overflow: hidden;
  }
  .ab-cta::before {
    content: '';
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 700px; height: 500px;
    background: radial-gradient(ellipse at center, rgba(232,184,75,0.06) 0%, transparent 65%);
    pointer-events: none;
  }
  .ab-cta-inner {
    position: relative; z-index: 1;
    max-width: 600px; margin: 0 auto; padding: 0 24px;
  }
  .ab-cta-inner h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 900; color: var(--text);
    line-height: 1.2; margin-bottom: 18px;
  }
  .ab-cta-inner h2 span {
    background: linear-gradient(120deg, #f5d07a, #e8b84b, #b87c10);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ab-cta-inner p {
    font-size: clamp(0.86rem, 1.2vw, 0.94rem);
    color: var(--text-muted); line-height: 1.85; font-weight: 300;
    margin-bottom: 32px;
  }
  .ab-cta-btn {
    display: inline-flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #e8b84b 0%, #b87c10 100%);
    color: #030e08;
    font-family: 'Lexend', sans-serif;
    font-weight: 600; font-size: 0.9rem; letter-spacing: 0.03em;
    padding: 14px 30px; border-radius: var(--r);
    text-decoration: none;
    box-shadow: 0 4px 24px rgba(232,184,75,0.25);
    transition: filter 0.2s, transform 0.15s;
  }
  .ab-cta-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .ab-wrap { padding: 0 28px; }
    .ab-hero-inner { padding: 0 28px; }
    .ab-mv-grid { grid-template-columns: 1fr; }
    .ab-why-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 600px) {
    .ab-wrap { padding: 0 16px; }
    .ab-hero-inner { padding: 0 16px; }
    .ab-hero { padding: 70px 0 60px; }
    .ab-mv, .ab-why, .ab-how, .ab-lt, .ab-cta { padding: 60px 0; }
    .ab-why-grid { grid-template-columns: 1fr; }
    .ab-how-card { padding: 24px 18px; }
    .ab-hero-card { padding: 20px 18px; }
  }
`;

const About3ZF = () => {
  const whyCards = [
    {
      icon: <TrendingDown size={26} />,
      title: 'সুদের দাসত্ব বন্ধ করতে',
      desc: '3ZF Interest-Free অর্থব্যবস্থার প্রচার করে দরিদ্র্য বিমোচনে কাজ করে।',
    },
    {
      icon: <Users size={26} />,
      title: 'শোষণ ও বৈষম্য কমাতে',
      desc: 'মানুষকে সচেতন ও আত্মনির্ভর করতে আমরা অবিরাম কাজ করে যাচ্ছি।',
    },
    {
      icon: <BookOpen size={26} />,
      title: 'জ্ঞানের অভাব দূর করতে',
      desc: 'Education ও Training-এর মাধ্যমে আমরা সচেতনতা বৃদ্ধি করি।',
    },
  ];

  const tags = [
    'Humanitarian Support', 'Disaster Relief', 'Skill Development',
    'Women Health', 'Community Improvement', 'Environment', 'Youth Empowerment',
  ];

  const ltItems = [
    'Sustainable Development Projects & Ethical Economy',
    'Awareness & Leadership Training',
    'Women Empowerment & Nature-Friendly Initiatives',
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

  return (
    <>
      <style>{styles}</style>
      <div className="ab-root">

        {/* ── Hero ── */}
        <header className="ab-hero">
          <div className="ab-hero-grid" />
          <div className="ab-hero-inner">
            <div className="ab-eyebrow">
              <div className="ab-eyebrow-dot" />
              3ZF Foundation
            </div>
            <h1>About 3ZF<br />Three Zeros of Freedom</h1>
            <p className="ab-hero-bn">আমরা কারা এবং কেন 3ZF প্রতিষ্ঠিত হলো</p>
            <div className="ab-hero-card">
              <p>
                3ZF (Three Zeros of Freedom) হলো একটি মানবিক, সামাজিক ও উন্নয়নমূলক আন্দোলন,
                যার লক্ষ্য একটি সুদমুক্ত (Interest-Free), শোষণমুক্ত (Exploitation-Free) এবং
                জ্ঞানভিত্তিক (Knowledge-Based) সমাজ গঠন।
              </p>
            </div>
          </div>
        </header>

        {/* ── Mission & Vision ── */}
        <section className="ab-mv">
          <div className="ab-wrap" style={{ textAlign: 'center' }}>
            <div className="ab-section-label">Our Purpose</div>
            <h2 className="ab-section-title">Mission &amp; <span>Vision</span></h2>
          </div>
          <div className="ab-wrap">
            <div className="ab-mv-grid">

              {/* Mission */}
              <div className="ab-card">
                <div className="ab-card-icon"><Award size={24} /></div>
                <h2>Our Mission (মিশন)</h2>
                <ul className="ab-mission-list">
                  {missionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Vision */}
              <div className="ab-card ab-card-gold">
                <div className="ab-card-icon"><ShieldCheck size={24} /></div>
                <h2>Our Vision (ভিশন)</h2>
                <p className="ab-vision-note">একটি ভবিষ্যৎ যেখানে—</p>
                <div className="ab-vision-list">
                  {visionItems.map((item, i) => (
                    <div key={i} className="ab-vision-item">{item}</div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Why 3ZF ── */}
        <section className="ab-why">
          <div className="ab-wrap">
            <div className="ab-section-label">Our Purpose</div>
            <h2 className="ab-section-title">Why <span>3ZF?</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: -20, marginBottom: 36 }}>কেন 3ZF প্রয়োজন?</p>
          </div>
          <div className="ab-wrap">
            <div className="ab-why-grid">
              {whyCards.map((card, i) => (
                <div key={i} className="ab-why-card">
                  <div className="ab-why-card-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How We Work ── */}
        <section className="ab-how">
          <div className="ab-wrap" style={{ textAlign: 'center' }}>
            <div className="ab-section-label">Our Method</div>
            <h2 className="ab-section-title">How We <span>Work</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: -20, marginBottom: 36 }}>আমাদের কর্মপদ্ধতি</p>
          </div>
          <div className="ab-wrap">
            <div className="ab-how-card">
              <p className="ab-how-desc">
                3ZF-এর মাঠপর্যায়ের সকল কাজ পরিচালিত হয় আমাদের সহযোগী সংগঠন
              </p>
              <p className="ab-how-desc" style={{ marginBottom: 6 }}>
                <span className="ab-how-org">Harmony Organization</span>
              </p>
              <p className="ab-how-desc">এর মাধ্যমে।</p>
              <div className="ab-how-tags">
                {tags.map((tag) => (
                  <span key={tag} className="ab-how-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Long-Term ── */}
        <section className="ab-lt">
          <div className="ab-wrap" style={{ textAlign: 'center' }}>
            <div className="ab-section-label">Strategy</div>
            <h2 className="ab-section-title">Our Long-Term <span>Approach</span></h2>
          </div>
          <div className="ab-wrap">
            <div className="ab-lt-list">
              {ltItems.map((item, i) => (
                <div key={i} className="ab-lt-item">
                  <div className="ab-lt-bullet" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ab-cta">
          <div className="ab-cta-inner">
            <div className="ab-eyebrow" style={{ justifyContent: 'center', marginBottom: 20 }}>
              <Zap size={13} />
              Join the Movement
            </div>
            <h2>&quot;Be Part of the <span>Change</span>&quot;</h2>
            <p>
              3ZF শুধুমাত্র একটি উদ্যোগ নয়—এটি একটি আন্দোলন, একটি বিশ্বাস, একটি সমাধান।
              আপনার অংশগ্রহণই আমাদের সমাজকে ন্যায্য, স্বচ্ছ ও মানবিক পথে এগিয়ে নেবে।
            </p>
            <a href="/join" className="ab-cta-btn">
              Join the Movement
              <ArrowRight size={18} />
            </a>
          </div>
        </section>

      </div>
    </>
  );
};

export default About3ZF;