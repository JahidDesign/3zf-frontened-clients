import { useState } from "react";

/* ── SVG Icons ── */
const Users = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const Lightbulb = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
);
const Target = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const TrendingUp = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const Handshake = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
);
const ShieldCheck = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const Rocket = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const ArrowRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const Zap = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const Trophy = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
    <path d="M7 4H4a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h1"/>
    <path d="M17 4h3a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-1"/>
    <rect x="7" y="2" width="10" height="9" rx="2"/>
  </svg>
);

/* ── Styles ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #030e08;
    --surface:     #0b1f12;
    --surface2:    #0f2a17;
    --surface3:    #132d1e;
    --gold:        #e8b84b;
    --gold-light:  #f5d07a;
    --gold-dim:    #a07828;
    --gold-border: rgba(232,184,75,0.2);
    --gold-glow:   rgba(232,184,75,0.08);
    --text:        #eef4f0;
    --text-soft:   #9ab8a6;
    --text-muted:  #5a7a66;
    --border:      rgba(30,65,40,0.8);
    --r:           14px;
    --r-lg:        22px;
  }

  html { scroll-behavior: smooth; }

  .ea-root {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    width: 100%;
  }

  /* ── WRAP ── */
  .ea-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 clamp(14px, 4vw, 32px);
    width: 100%;
  }

  /* ── SECTION BASE ── */
  .ea-section {
    padding: clamp(50px, 8vw, 88px) 0;
    border-bottom: 1px solid var(--border);
    position: relative;
    width: 100%;
  }
  .ea-section-alt { background: var(--surface); }

  /* ── SECTION HEAD ── */
  .ea-head { text-align: center; margin-bottom: clamp(36px, 6vw, 60px); }
  .ea-head-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: clamp(0.6rem, 1.5vw, 0.68rem); font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 14px;
  }
  .ea-head-label::before {
    content: ''; display: inline-block;
    width: 22px; height: 1.5px;
    background: var(--gold); border-radius: 2px;
  }
  .ea-head h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.5rem, 4vw, 2.8rem);
    font-weight: 900; color: var(--text);
    line-height: 1.1; margin-bottom: 10px;
  }
  .ea-head h2 span {
    background: linear-gradient(120deg, #f5d07a, #e8b84b, #b87c10);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ea-head p { color: var(--text-muted); font-size: clamp(0.8rem, 1.5vw, 0.9rem); font-style: italic; }
  .ea-line {
    width: 56px; height: 2px;
    background: linear-gradient(to right, var(--gold), transparent);
    margin: 16px auto 0; border-radius: 2px;
  }

  /* ══════════════════════════════════
     HERO
  ══════════════════════════════════ */
  .ea-hero {
    position: relative; overflow: hidden;
    padding: clamp(60px, 10vw, 110px) clamp(14px, 4vw, 32px) clamp(50px, 8vw, 90px);
    border-bottom: 1px solid var(--border);
    text-align: center;
    width: 100%;
  }

  .ea-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(30,65,40,0.25) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,65,40,0.25) 1px, transparent 1px);
    background-size: clamp(30px, 5vw, 56px) clamp(30px, 5vw, 56px);
    mask-image: radial-gradient(ellipse 85% 75% at 50% 35%, black 20%, transparent 80%);
    pointer-events: none;
  }
  .ea-hero-glow {
    position: absolute; top: -180px; left: 50%; transform: translateX(-50%);
    width: min(900px, 100vw); height: 600px;
    background: radial-gradient(ellipse at center, rgba(232,184,75,0.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .ea-hero-glow-r {
    position: absolute; top: 20%; right: -200px;
    width: 500px; height: 500px;
    background: radial-gradient(ellipse at center, rgba(13,80,40,0.2) 0%, transparent 65%);
    pointer-events: none;
  }

  .ea-hero-inner { position: relative; z-index: 1; max-width: 820px; margin: 0 auto; width: 100%; }

  .ea-chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--surface2), var(--surface));
    border: 1px solid var(--gold-dim);
    border-radius: 999px;
    padding: 5px clamp(12px, 3vw, 18px);
    font-size: clamp(0.6rem, 1.5vw, 0.7rem); font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 28px;
    animation: fUp 0.5s ease both;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90vw;
  }

  .ea-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 5.5vw, 4.4rem);
    font-weight: 900; line-height: 1.1;
    margin-bottom: 22px;
    animation: fUp 0.6s 0.1s ease both;
    color: var(--text);
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  .ea-hero-gold {
    display: block;
    background: linear-gradient(135deg, #f5d07a 0%, #e8b84b 50%, #b87c10 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ea-lead {
    font-size: clamp(0.85rem, 1.8vw, 1.05rem);
    color: var(--text-soft); line-height: 1.82;
    margin-bottom: 40px; font-weight: 300;
    animation: fUp 0.65s 0.2s ease both;
    word-break: keep-all;
  }
  .ea-lead strong { color: var(--text); font-weight: 600; }

  .ea-btn-row {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
    animation: fUp 0.7s 0.3s ease both;
    padding: 0 4px;
  }

  .ea-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: clamp(10px, 2vw, 13px) clamp(18px, 4vw, 28px);
    background: linear-gradient(135deg, #e8b84b, #b87c10);
    color: #030e08;
    font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: clamp(0.78rem, 1.8vw, 0.88rem); letter-spacing: 0.03em;
    border: none; border-radius: var(--r); cursor: pointer;
    box-shadow: 0 4px 22px rgba(232,184,75,0.25);
    transition: filter 0.2s, transform 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ea-btn-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }

  .ea-btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: clamp(9px, 2vw, 12px) clamp(16px, 3.5vw, 26px);
    background: transparent; color: var(--gold-light);
    font-family: 'Outfit', sans-serif;
    font-weight: 600; font-size: clamp(0.78rem, 1.8vw, 0.88rem);
    border: 1px solid var(--gold-border); border-radius: var(--r); cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ea-btn-outline:hover { background: var(--gold-glow); border-color: rgba(232,184,75,0.4); }

  /* ══════════════════════════════════
     ABOUT
  ══════════════════════════════════ */
  .ea-about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(28px, 5vw, 64px); align-items: center;
  }
  @media (max-width: 900px) { .ea-about-grid { grid-template-columns: 1fr; gap: clamp(24px, 4vw, 40px); } }

  .ha-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 5.2rem);
    font-weight: 800; line-height: 1.05; letter-spacing: -.02em;
    margin-bottom: 24px;
    animation: fUp .65s .1s ease both;
    word-break: keep-all;
    overflow-wrap: break-word;
  }
  .ha-h1-gold {
    display: block;
    background: linear-gradient(140deg, #f0c040 0%, #fde68a 45%, #ca8a04 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ha-h1-white { display: block; color: var(--text); }

  .ea-about-body {
    font-size: clamp(0.85rem, 1.6vw, 0.93rem); line-height: 1.85; font-weight: 300;
    color: var(--text-soft); margin-bottom: 26px;
    word-break: keep-all;
  }

  .ea-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
  .ea-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 999px; padding: clamp(4px, 1vw, 5px) clamp(10px, 2vw, 14px);
    font-size: clamp(0.72rem, 1.5vw, 0.78rem); font-weight: 500; color: var(--text-soft);
    transition: border-color 0.2s, color 0.2s;
  }
  .ea-tag:hover { border-color: var(--gold-border); color: var(--gold-light); }
  .ea-tag-icon { color: var(--gold); display: flex; }

  .ea-blockquote {
    background: var(--surface2);
    border-left: 3px solid var(--gold-dim);
    border-radius: 0 12px 12px 0;
    padding: clamp(14px, 2.5vw, 18px) clamp(14px, 3vw, 22px);
    font-style: italic; font-size: clamp(0.82rem, 1.5vw, 0.92rem); line-height: 1.75;
    color: var(--text-soft);
    word-break: keep-all;
  }

  .ea-tile {
    background: linear-gradient(135deg, var(--surface2), var(--surface));
    border: 1px solid var(--gold-border);
    border-radius: var(--r-lg);
    height: clamp(120px, 20vw, 200px);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-weight: 700;
    font-size: clamp(1rem, 2.5vw, 1.3rem);
    color: var(--gold-light);
    position: relative; overflow: hidden;
    transition: transform 0.2s;
    width: 100%;
  }
  .ea-tile:hover { transform: translateY(-4px); }
  .ea-tile::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,184,75,0.06), transparent);
  }

  /* ══════════════════════════════════
     MISSION / VISION
  ══════════════════════════════════ */
  .ea-mv-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: clamp(14px, 3vw, 22px);
  }
  @media (max-width: 680px) { .ea-mv-grid { grid-template-columns: 1fr; } }

  .ea-mv-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: clamp(22px, 4vw, 36px) clamp(18px, 3.5vw, 32px);
    transition: border-color 0.2s, transform 0.2s;
  }
  .ea-mv-card:hover { border-color: var(--gold-border); transform: translateY(-3px); }

  .ea-mv-icon {
    width: clamp(42px, 6vw, 52px); height: clamp(42px, 6vw, 52px); border-radius: 14px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold); margin-bottom: 20px;
    flex-shrink: 0;
  }

  .ea-mv-card h3 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1rem, 2.5vw, 1.25rem); font-weight: 700;
    color: var(--text); margin-bottom: 18px;
  }

  .ea-mv-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .ea-mv-item {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: clamp(0.8rem, 1.5vw, 0.9rem);
    color: var(--text-soft); line-height: 1.6; font-weight: 300;
    word-break: keep-all;
  }
  .ea-mv-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--gold); flex-shrink: 0; margin-top: 7px;
    box-shadow: 0 0 6px rgba(232,184,75,0.4);
  }

  /* ══════════════════════════════════
     WHY DIFFERENT
  ══════════════════════════════════ */
  .ea-why-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(clamp(160px, 28vw, 220px), 1fr));
    gap: clamp(12px, 2vw, 18px);
  }
  @media (max-width: 400px) {
    .ea-why-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  }

  .ea-why-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: clamp(18px, 3vw, 28px) clamp(16px, 2.5vw, 24px);
    transition: border-color 0.2s, transform 0.2s, background 0.2s;
  }
  .ea-why-card:hover { border-color: var(--gold-border); transform: translateY(-4px); background: var(--surface3); }

  .ea-why-icon {
    width: clamp(40px, 6vw, 50px); height: clamp(40px, 6vw, 50px); border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; margin-bottom: 18px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.35);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .ea-why-card:hover .ea-why-icon { transform: scale(1.08); }

  .ea-why-card h4 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(0.88rem, 2vw, 1rem); font-weight: 700;
    color: var(--gold-light); margin-bottom: 8px;
  }
  .ea-why-card p {
    font-size: clamp(0.76rem, 1.4vw, 0.84rem);
    line-height: 1.7; color: var(--text-muted); font-weight: 300;
    word-break: keep-all;
  }

  /* ══════════════════════════════════
     FUNDING
  ══════════════════════════════════ */
  .ea-funding {
    background: linear-gradient(135deg, var(--surface2), var(--surface));
    border: 1px solid var(--gold-border);
    border-radius: var(--r-lg);
    padding: clamp(32px, 6vw, 64px) clamp(18px, 5vw, 48px);
    text-align: center;
    position: relative; overflow: hidden;
    width: 100%;
  }

  .ea-funding::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(232,184,75,0.08), transparent 65%);
    pointer-events: none;
  }
  .ea-funding::after {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 50%; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }

  .ea-funding-icon { color: var(--gold); margin-bottom: 20px; position: relative; z-index: 1; }

  .ea-funding h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.3rem, 3.5vw, 2.4rem);
    font-weight: 900; color: var(--text);
    margin-bottom: 16px; position: relative; z-index: 1;
    word-break: keep-all;
  }
  .ea-funding h2 span {
    background: linear-gradient(135deg, #f5d07a, #e8b84b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ea-funding p {
    font-size: clamp(0.85rem, 1.8vw, 1rem);
    color: var(--text-soft); font-weight: 300;
    margin-bottom: 32px; position: relative; z-index: 1; line-height: 1.7;
    word-break: keep-all;
  }
  .ea-funding p strong { color: var(--gold-light); font-weight: 600; }

  .ea-badges {
    display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(8px, 2vw, 12px);
    position: relative; z-index: 1;
  }
  .ea-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(232,184,75,0.08); border: 1px solid var(--gold-border);
    border-radius: 999px; padding: clamp(6px, 1.5vw, 8px) clamp(14px, 3vw, 20px);
    font-size: clamp(0.76rem, 1.5vw, 0.84rem); font-weight: 500; color: var(--text-soft);
    white-space: nowrap;
  }
  .ea-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

  /* ══════════════════════════════════
     FOUNDER
  ══════════════════════════════════ */
  .ea-founder { text-align: center; max-width: 680px; margin: 0 auto; width: 100%; }

  .ea-avatar {
    width: clamp(60px, 10vw, 76px); height: clamp(60px, 10vw, 76px);
    border-radius: 50%;
    background: linear-gradient(135deg, var(--surface2), var(--surface));
    border: 2.5px solid var(--gold-dim);
    margin: 0 auto 20px;
    box-shadow: 0 0 20px rgba(232,184,75,0.12);
    display: block;
  }

  .ea-founder-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1rem, 2.5vw, 1.1rem); font-weight: 700;
    color: var(--text); margin-bottom: 24px;
  }

  .ea-founder-quote {
    font-size: clamp(0.85rem, 1.6vw, 1.02rem);
    font-style: italic; line-height: 1.85;
    color: var(--text-soft); font-weight: 300;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: clamp(30px, 5vw, 36px) clamp(18px, 4vw, 32px) clamp(22px, 4vw, 30px);
    margin-bottom: 20px; position: relative;
    word-break: keep-all;
    text-align: left;
  }
  .ea-founder-quote::before {
    content: '"';
    font-family: 'Playfair Display', serif;
    font-size: clamp(3.5rem, 8vw, 5rem); color: var(--gold-dim);
    position: absolute; top: -14px; left: clamp(14px, 3vw, 22px);
    line-height: 1;
  }

  .ea-founder-sig {
    display: block;
    background: linear-gradient(140deg, #f0c040 0%, #fde68a 45%, #ca8a04 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    font-style: normal; font-weight: 700;
    text-align: right; margin-top: 12px;
    font-family: 'Playfair Display', serif;
    font-size: clamp(0.85rem, 1.8vw, 1rem);
  }

  .ea-founder-tag {
    font-size: clamp(0.7rem, 1.5vw, 0.75rem); font-weight: 600;
    color: var(--gold-dim); letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0 10px;
    word-break: keep-all;
  }

  /* ══════════════════════════════════
     FOOTER CTA
  ══════════════════════════════════ */
  .ea-footer {
    padding: clamp(50px, 8vw, 88px) clamp(14px, 4vw, 20px);
    text-align: center;
    position: relative; overflow: hidden;
    width: 100%;
  }
  .ea-footer::before {
    content: '';
    position: absolute; bottom: -80px; left: 50%; transform: translateX(-50%);
    width: min(700px, 100vw); height: 400px;
    background: radial-gradient(ellipse at center, rgba(232,184,75,0.06), transparent 65%);
    pointer-events: none;
  }

  .ea-footer-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; }

  .ea-footer h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.4rem, 3.5vw, 2.4rem);
    font-weight: 900; color: var(--text); margin-bottom: 14px;
    line-height: 1.2; word-break: keep-all;
  }

  .ea-footer-sub {
    color: var(--text-muted); font-size: clamp(0.85rem, 1.6vw, 0.95rem);
    font-style: italic; margin-bottom: 36px;
  }

  .ea-footer-copy {
    margin-top: 48px; font-size: clamp(0.68rem, 1.4vw, 0.74rem); color: var(--text-muted);
    display: flex; align-items: center; justify-content: center; gap: 7px;
    flex-wrap: wrap;
  }

  @keyframes fUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ══════════════════════════════════
     EXTRA MOBILE POLISH
  ══════════════════════════════════ */
  @media (max-width: 360px) {
    .ea-chip { font-size: 0.58rem; padding: 5px 12px; letter-spacing: 0.08em; }
    .ea-btn-row { flex-direction: column; align-items: stretch; }
    .ea-btn-primary, .ea-btn-outline { justify-content: center; }
    .ea-why-grid { grid-template-columns: 1fr; }
    .ea-badges { gap: 8px; }
  }
`;

const ICON_COLORS = [
  "linear-gradient(135deg,#c0392b,#e74c3c)",
  "linear-gradient(135deg,#e8b84b,#a07828)",
  "linear-gradient(135deg,#1d6fa4,#3b9edd)",
  "linear-gradient(135deg,#6c3483,#9b59b6)",
  "linear-gradient(135deg,#1a7a45,#2ecc71)",
];

const whyCards = [
  { title: "Real Mentorship",   desc: "অভিজ্ঞ উদ্যোক্তাদের সরাসরি গাইডলাইন।",              icon: <Users size={22} /> },
  { title: "Accountability",    desc: "আপনার কাজের প্রগ্রেস ট্র্যাক করার সিস্টেম।",       icon: <Target size={22} /> },
  { title: "Skill Development", desc: "সেলস, মার্কেটিং ও লিডারশিপ ট্রেনিং।",               icon: <Lightbulb size={22} /> },
  { title: "Collaboration",     desc: "একই লক্ষ্য নিয়ে কাজ করা মানুষের নেটওয়ার্ক।",     icon: <Handshake size={22} /> },
  { title: "Funding Support",   desc: "যোগ্য উদ্যোক্তাদের জন্য সরাসরি বিনিয়োগ সহায়তা।", icon: <TrendingUp size={22} /> },
];

export default function EntrepreneurAbout() {
  return (
    <>
      <style>{styles}</style>
      <div className="ea-root">

        {/* ── HERO ── */}
           <section className="ea-section">
          <div className="ea-wrap">
            <div className="ea-about-grid">
              <div>
                <h1 className="ha-h1">
                  <span className="ha-h1-gold">HARMONY</span>
                  <span className="ha-h1-white">Entrepreneur Association</span>
                </h1>
                <p className="ea-about-body">
                  হারমনি উদ্যোক্তা এসোসিয়েশন একটি কমিউনিটি-ড্রিভেন উদ্যোক্তা প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো একজন মানুষকে শূন্য থেকে শুরু করে বাস্তব উদ্যোক্তা হিসেবে গড়ে তোলার জন্য প্রয়োজনীয় মানসিকতা, জ্ঞান এবং নেটওয়ার্ক তৈরি করে দেয়া।
                </p>
                <div className="ea-tags">
                  {['Mentorship', 'Community', 'Opportunity', 'Discipline', 'Execution'].map((item) => (
                    <div key={item} className="ea-tag">
                      <span className="ea-tag-icon"><ShieldCheck size={13} /></span> {item}
                    </div>
                  ))}
                </div>
                <div className="ea-blockquote">
                  &quot;আইডিয়া নয়, বাস্তবায়নই সফলতা আনে—একা নয়, একসাথে এগোলে সফলতা দ্রুত আসে।&quot;
                </div>
              </div>
              <div>
                <div className="ea-tile">Action Oriented</div>
              </div>
            </div>
          </div>
        </section>
          {/* ── ABOUT ── */}
        <section className="ea-hero">
          <div className="ea-hero-grid" />
          <div className="ea-hero-glow" />
          <div className="ea-hero-glow-r" />
          <div className="ea-hero-inner">
            <div className="ea-chip"><Zap size={12} /> Harmony Entrepreneur Association</div>
            <h1>
              স্বপ্ন থেকে বাস্তব—
              <span className="ea-hero-gold">একসাথে এগিয়ে যাওয়ার প্ল্যাটফর্ম</span>
            </h1>
            <p className="ea-lead">
              আপনি যদি নিজের ভাগ্য নিজেই গড়তে চান, চাকরির অপেক্ষায় না থেকে নিজের পথ তৈরি করতে চান—
              <strong> হারমনি উদ্যোক্তা এসোসিয়েশন</strong> আপনার জন্য। আমরা শুধু উদ্যোক্তা বানাই না, আমরা মানুষকে আত্মনির্ভরশীল করি।
            </p>
            <div className="ea-btn-row">
              <button className="ea-btn-primary">Start Your Journey Today <ArrowRight size={17} /></button>
              <button className="ea-btn-outline">Learn More</button>
            </div>
          </div>
        </section>
        {/* ── MISSION & VISION ── */}
        <section className="ea-section ea-section-alt">
          <div className="ea-wrap">
            <div className="ea-head">
              <div className="ea-head-label">Our Purpose</div>
              <h2>Mission <span>&amp; Vision</span></h2>
              <div className="ea-line" />
            </div>
            <div className="ea-mv-grid">
              <div className="ea-mv-card">
                <div className="ea-mv-icon"><Target size={26} /></div>
                <h3>Our Mission</h3>
                <ul className="ea-mv-list">
                  {[
                    'নিজের সক্ষমতা আবিষ্কার করতে পারে |',
                    'মানসিকভাবে শক্ত ও আত্মবিশ্বাসী হতে পারে |',
                    'বাস্তব দক্ষতা অর্জন করে নিজের ব্যবসা শুরু করতে পারে |',
                    'নৈতিকতা ও সততার সাথে ব্যবসা পরিচালনা করতে পারে |',
                    'নিজের পাশাপাশি অন্যদের জন্য কর্মসংস্থান তৈরি করতে পারে |',
                  ].map((t, i) => (
                    <li key={i} className="ea-mv-item"><div className="ea-mv-dot" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="ea-mv-card">
                <div className="ea-mv-icon"><Rocket size={26} /></div>
                <h3>Our Vision</h3>
                <ul className="ea-mv-list">
                  {[
                    'প্রতিটি এলাকায় দক্ষ উদ্যোক্তা তৈরি হবে |',
                    'বেকারত্ব কমে গিয়ে কর্মসংস্থান বৃদ্ধি পাবে |',
                    'ছোট উদ্যোগ বড় প্রতিষ্ঠানে পরিণত হবে |',
                    'তরুণরা চাকরির অপেক্ষা না করে নিজেই সুযোগ তৈরি করবে |',
                    'নৈতিক ব্যবসার মাধ্যমে সমাজে ইতিবাচক পরিবর্তন আসবে |',
                  ].map((t, i) => (
                    <li key={i} className="ea-mv-item"><div className="ea-mv-dot" />{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY DIFFERENT ── */}
        <section className="ea-section">
          <div className="ea-wrap">
            <div className="ea-head">
              <div className="ea-head-label">Our Edge</div>
              <h2>Why Harmony E. A. is <span>Different?</span></h2>
              <p>অনেক সংগঠন শুধু কথা বলে, আমরা কাজে বিশ্বাসী।</p>
              <div className="ea-line" />
            </div>
            <div className="ea-why-grid">
              {whyCards.map((item, i) => (
                <div key={i} className="ea-why-card">
                  <div className="ea-why-icon" style={{ background: ICON_COLORS[i] }}>{item.icon}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FUNDING ── */}
        <section className="ea-section ea-section-alt">
          <div className="ea-wrap">
            <div className="ea-funding">
              <div className="ea-funding-icon"><Trophy size={44} /></div>
              <h2>🏆 Entrepreneur Fair &amp; <span>Funding</span></h2>
              <p>
                হারমনি উদ্যোক্তা এসোসিয়েশন নিয়মিত উদ্যোক্তা মেলার আয়োজন করবে, যেখানে—{' '}
                <strong>উদ্যোক্তারা তাদের পণ্য প্রদর্শন করবে</strong>,{' '}
                <strong>ক্রেতা ও বিনিয়োগকারীদের সাথে সংযোগ হবে</strong>{' '}এবং{' '}
                <strong>বাস্তব ব্যবসার অভিজ্ঞতা অর্জন হবে।</strong>
              </p>
              <div className="ea-badges">
                {['পণ্য প্রদর্শনী', 'বিনিয়োগকারী সংযোগ', 'বাস্তব অভিজ্ঞতা'].map((b) => (
                  <div key={b} className="ea-badge"><div className="ea-badge-dot" />{b}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER ── */}
        <section className="ea-section">
          <div className="ea-wrap">
            <div className="ea-founder">
              <img src="/team/ceo.png" alt="Founder" className="ea-avatar" />
              <div className="ea-founder-name">Founder&apos;s Message</div>
              <div className="ea-founder-quote">
                আমি বিশ্বাস করি, একজন মানুষকে যদি সঠিক দিকনির্দেশনা, সঠিক পরিবেশ এবং সঠিক মানুষদের সাথে যুক্ত করা যায়—তাহলে সে নিজের জীবন পরিবর্তন করতে পারে।
                <span className="ea-founder-sig">— Md. Asaduzzaman</span>
              </div>
              <div className="ea-founder-tag">
                হারমনি উদ্যোক্তা এসোসিয়েশন — একটি পরিবর্তন ও ন্যায়ের।
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <footer className="ea-footer">
          <div className="ea-footer-inner">
            <div className="ea-head-label" style={{ justifyContent: 'center', marginBottom: 18 }}>
              Join Today
            </div>
            <h2>আপনি কি সত্যিই আপনার জীবন পরিবর্তন করতে চান?</h2>
            <p className="ea-footer-sub">আজই যুক্ত হোন আমাদের হারমনি পরিবারের সাথে।</p>
            <button className="ea-btn-primary" style={{ fontSize: 'clamp(0.82rem, 1.8vw, 0.95rem)', padding: 'clamp(12px, 2vw, 15px) clamp(22px, 5vw, 36px)' }}>
              Join Harmony Entrepreneur Association <ArrowRight size={18} />
            </button>
          </div>
        </footer>

      </div>
    </>
  );
}