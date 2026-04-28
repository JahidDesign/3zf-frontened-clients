"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Globe } from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600&display=swap');

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

  html { scroll-behavior: smooth; }

  .h-section {
    position: relative;
    min-height: 100vh;
    background: var(--bg);
    overflow: hidden;
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    display: flex;
    align-items: center;
  }

  .h-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(30,65,40,0.28) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,65,40,0.28) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 85% 85% at 50% 45%, black 25%, transparent 100%);
  }
  .h-glow-c {
    position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
    width: 900px; height: 700px;
    background: radial-gradient(ellipse at center, rgba(232,184,75,0.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .h-glow-r {
    position: absolute; top: 10%; right: -180px;
    width: 480px; height: 480px;
    background: radial-gradient(ellipse at center, rgba(13,80,40,0.22) 0%, transparent 65%);
    pointer-events: none;
  }

  .h-container {
    position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto;
    padding: 80px 48px;
    width: 100%;
  }

  .h-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 72px;
    align-items: center;
  }

  /* LEFT */
  .h-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    margin-bottom: 30px;
  }
  .h-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 8px rgba(232,184,75,0.5);
  }
  .h-eyebrow-text {
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold);
  }

  .h-title {
    font-family: "Outfit", sans-serif;
    line-height: 1.05;
    margin-bottom: 10px;
  }

  .h-title-3zf {
    display: block;
    font-family: 'Open Sans', serif;
    font-weight: 900;
    font-size: clamp(3.5rem, 8vw, 5.5rem);
    background: linear-gradient(120deg, #f5d07a 0%, #e8b84b 50%, #b87c10 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.04em;
    line-height: 1;
    margin-bottom: 8px;
  }

  .h-title-sub {
    display: block;
    font-size: clamp(1.1rem, 3vw, 1.8rem);
    font-weight: 700;
    color: var(--text);
    line-height: 1.2;
  }

  .h-sub {
    font-size: clamp(0.72rem, 1.2vw, 0.82rem);
    font-weight: 400; letter-spacing: 0.06em;
    color: var(--text-muted); margin-bottom: 22px; margin-top: 8px;
  }

  .h-rule {
    width: 40px; height: 2px;
    background: linear-gradient(to right, var(--gold), transparent);
    margin-bottom: 22px;
  }

  .h-tagline {
    font-size: clamp(0.88rem, 1.3vw, 1.02rem);
    font-style: italic; font-weight: 300;
    color: var(--gold-dim); margin-bottom: 22px; line-height: 1.65;
  }

  .h-desc {
    font-size: clamp(0.83rem, 1.1vw, 0.91rem);
    line-height: 1.85; font-weight: 300;
    color: var(--text-soft); margin-bottom: 30px; max-width: 450px;
  }

  .h-pillars { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
  .h-pillar {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 14px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); cursor: default;
    transition: border-color 0.2s, background 0.2s;
  }
  .h-pillar:hover { border-color: var(--gold-border); background: var(--surface2); }
  .h-pillar-ico {
    width: 34px; height: 34px; border-radius: 8px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.95rem; flex-shrink: 0;
  }
  .h-pillar-body { flex: 1; }
  .h-pillar-en { font-weight: 600; font-size: 0.9rem; color: var(--gold-light); line-height: 1.2; }
  .h-pillar-bn { font-size: 0.76rem; color: var(--text-muted); margin-top: 2px; font-weight: 300; }
  .h-pillar-num {
    font-family: 'Playfair Display', serif;
    font-size: 0.66rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.1em;
  }

  .h-cta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  .h-btn-p {
    display: inline-flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #e8b84b 0%, #b87c10 100%);
    color: #030e08;
    font-family: 'Outfit', sans-serif;
    font-weight: 600; font-size: 0.88rem; letter-spacing: 0.03em;
    padding: 13px 26px; border-radius: var(--r);
    border: none; cursor: pointer;
    box-shadow: 0 4px 20px rgba(232,184,75,0.22);
    transition: filter 0.2s, transform 0.15s;
  }
  .h-btn-p:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .h-btn-s {
    display: inline-flex; align-items: center;
    background: transparent; color: var(--text-soft);
    font-family: 'Outfit', sans-serif;
    font-weight: 500; font-size: 0.86rem;
    padding: 12px 22px; border-radius: var(--r);
    border: 1px solid var(--border); cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .h-btn-s:hover { border-color: var(--gold-border); color: var(--gold-light); }

  .h-stats { display: flex; gap: 22px; margin-top: 28px; flex-wrap: wrap; }
  .h-stat { display: flex; flex-direction: column; gap: 2px; }
  .h-stat-n {
    font-family: 'Playfair Display', serif;
    font-size: 1.35rem; font-weight: 700;
    color: var(--gold-light); line-height: 1;
  }
  .h-stat-l { font-size: 0.69rem; font-weight: 400; color: var(--text-muted); letter-spacing: 0.06em; }
  .h-stat-div { width: 1px; background: var(--border); align-self: stretch; }

  /* RIGHT */
  .h-right { display: flex; flex-direction: column; gap: 18px; }

  .h-logo-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 36px 28px;
    display: flex; flex-direction: column;
    align-items: center; gap: 18px;
    position: relative; overflow: hidden;
  }
  .h-logo-card::before {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 55%; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }
  .h-logo-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,184,75,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .h-video {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); overflow: hidden;
  }
  .h-video-wrap { position: relative; aspect-ratio: 16/9; }
  .h-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
  .h-video-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(3,14,8,0.65) 0%, transparent 55%);
    display: flex; align-items: flex-end; padding: 14px; pointer-events: none;
  }
  .h-video-lbl {
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gold-light); opacity: 0.8;
  }

  .h-trust { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .h-trust-badge {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 11px 14px;
    font-size: 0.8rem; font-weight: 500; color: var(--text-soft);
  }

  /* =====================
     RESPONSIVE BREAKPOINTS
     ===================== */

  /* Tablet landscape */
  @media (max-width: 1024px) {
    .h-container { padding: 70px 36px; }
    .h-layout { gap: 48px; }
    .h-title-3zf { font-size: clamp(3rem, 7vw, 4.5rem); }
  }

  /* Tablet portrait — stack columns */
  @media (max-width: 900px) {
    .h-container { padding: 60px 28px; }
    .h-layout {
      grid-template-columns: 1fr;
      gap: 44px;
    }
    .h-title-3zf { font-size: clamp(4rem, 12vw, 6rem); }
    .h-title-sub { font-size: clamp(1.3rem, 4vw, 2.2rem); }
    .h-desc { max-width: 100%; }
    .h-stats { gap: 20px; }
  }

  /* Mobile large */
  @media (max-width: 600px) {
    .h-container { padding: 48px 18px 56px; }
    .h-layout { gap: 36px; }

    /* BIG 3ZF on small screens */
    .h-title-3zf {
      font-size: clamp(5rem, 22vw, 7.5rem);
      letter-spacing: 0.06em;
    }
    .h-title-sub { font-size: clamp(1rem, 5vw, 1.6rem); }

    .h-pillars { gap: 7px; }
    .h-pillar { padding: 10px 12px; }
    .h-pillar-en { font-size: 0.85rem; }
    .h-pillar-bn { font-size: 0.72rem; }

    .h-cta { flex-direction: column; align-items: stretch; }
    .h-btn-p, .h-btn-s { justify-content: center; width: 100%; }

    .h-stats { gap: 14px; }
    .h-stat-n { font-size: 1.15rem; }

    .h-glow-r { display: none; }
    .h-trust { grid-template-columns: 1fr; }
  }

  /* Mobile small */
  @media (max-width: 380px) {
    .h-title-3zf { font-size: 4.8rem; }
    .h-title-sub { font-size: 1rem; }
    .h-container { padding: 40px 14px 48px; }
  }
`;

function LogoEmblem({ size = 108 }) {
  const ticks = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="eg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d07a" />
          <stop offset="55%" stopColor="#e8b84b" />
          <stop offset="100%" stopColor="#9a6b10" />
        </linearGradient>
        <linearGradient id="eg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f2a17" />
          <stop offset="100%" stopColor="#061209" />
        </linearGradient>
        <linearGradient id="eg3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(232,184,75,0.0)" />
          <stop offset="100%" stopColor="rgba(232,184,75,0.1)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#eg2)" stroke="url(#eg1)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="48" fill="url(#eg3)" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(232,184,75,0.15)" strokeWidth="0.8" strokeDasharray="3 4" />
      <path id="topArc" d="M 18,50 A 32,32 0 0,1 82,50" fill="none" />
      <text fontSize="6.5" fill="#a07828" fontFamily="Outfit, sans-serif" fontWeight="600" letterSpacing="3">
        <textPath href="#topArc" startOffset="14%">FOUNDATION · 2025</textPath>
      </text>
      <path id="botArc" d="M 22,54 A 28,28 0 0,0 78,54" fill="none" />
      <text fontSize="5.2" fill="#6a5018" fontFamily="Outfit, sans-serif" fontWeight="500" letterSpacing="1.5">
        <textPath href="#botArc" startOffset="2%">ZERO HUNGER · ZERO POVERTY · ZERO UNEMPLOYMENT</textPath>
      </text>
      <text x="50" y="54" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="900" fontSize="24" fill="url(#eg1)" letterSpacing="2">3ZF</text>
      <circle cx="35" cy="64" r="2.2" fill="#e8b84b" opacity="0.5" />
      <circle cx="50" cy="64" r="2.2" fill="#e8b84b" opacity="0.8" />
      <circle cx="65" cy="64" r="2.2" fill="#e8b84b" opacity="0.5" />
      {ticks.map((deg, i) => {
        const rad = (deg - 90) * Math.PI / 180;
        const x1 = 50 + 46 * Math.cos(rad), y1 = 50 + 46 * Math.sin(rad);
        const x2 = 50 + 43 * Math.cos(rad), y2 = 50 + 43 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e8b84b" strokeWidth="1.2" opacity="0.35" />;
      })}
    </svg>
  );
}

export default function Hero() {
  const pillars = [
    { icon: "🌾", en: "Zero Interest",     bn: "সুদমুক্ত",      num: "01" },
    { icon: "🏠", en: "Zero Exploitation", bn: "শোষণমুক্ত",    num: "02" },
    { icon: "💼", en: "Zero Ignorance",    bn: "অজ্ঞতামুক্ত",  num: "03" },
  ];

  return (
    <>
      <style>{styles}</style>
      <section className="h-section">
        <div className="h-grid" />
        <div className="h-glow-c" />
        <div className="h-glow-r" />

        <div className="h-container">
          <div className="h-layout">

            {/* LEFT */}
            <div>
              <h1 className="h-title">
                <span className="h-title-3zf">3ZF</span>
                <span className="h-title-sub">Three Zeros of Freedom</span>
              </h1>
              <p className="h-sub">Zero Interest · Zero Exploitation · Zero Ignorance</p>
              <div className="h-rule" />

              <p className="h-tagline">
                একটি সুন্দর ভবিষ্যতের দিকে — Towards a Brighter Future
              </p>

              <p className="h-desc">
                3ZF is a justice-driven economic and social movement built on three transformative principles — Zero Interest, Zero Exploitation, and Zero Ignorance.
                Together, we work towards financial freedom, social dignity, and knowledge-based empowerment for all.
              </p>

              <div className="h-pillars">
                {pillars.map((p, i) => (
                  <div key={i} className="h-pillar">
                    <div className="h-pillar-ico">{p.icon}</div>
                    <div className="h-pillar-body">
                      <div className="h-pillar-en">{p.en}</div>
                      <div className="h-pillar-bn">{p.bn}</div>
                    </div>
                    <span className="h-pillar-num">{p.num}</span>
                  </div>
                ))}
              </div>

              <div className="h-cta">
                <button className="h-btn-p">
                  Join the Movement <ArrowRight size={16} />
                </button>
                <button className="h-btn-s">Learn More</button>
              </div>

              <div className="h-stats">
                <div className="h-stat">
                  <span className="h-stat-n">10K+</span>
                  <span className="h-stat-l">Members</span>
                </div>
                <div className="h-stat-div" />
                <div className="h-stat">
                  <span className="h-stat-n">48</span>
                  <span className="h-stat-l">Districts</span>
                </div>
                <div className="h-stat-div" />
                <div className="h-stat">
                  <span className="h-stat-n">3</span>
                  <span className="h-stat-l">Core Pillars</span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="h-right">
              <div className="h-video">
                <div className="h-video-wrap">
                  <iframe
                    src="https://www.youtube.com/embed/cqb6aO_BYsc"
                    className="h-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="3ZF Foundation"
                  />
                  <div className="h-video-overlay">
                    <span className="h-video-lbl">Our Story</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}