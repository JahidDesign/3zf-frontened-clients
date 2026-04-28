"use client";

import React from "react";
import Image from "next/image";
import {
  Quote,
  Award,
  Heart,
  ShieldCheck,
  Zap,
  Star,
  Activity,
  Target,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatItem {
  label: string;
  value: string;
  sublabel?: string;
}

const STATS: StatItem[] = [
  { label: "Founded", value: "3ZF & Harmony", sublabel: "Initiatives" },
  { label: "Focus",   value: "Ethical Economy", sublabel: "Area" },
  { label: "Leading", value: "Modern Hospital", sublabel: "Healthcare" },
];

const PILLARS = [
  {
    icon: <Target size={14} />,
    title: "Zero Interest",
    body: "সুদমুক্ত অর্থনীতি ছাড়া সামাজিক ন্যায্যতা সম্ভব নয়।",
  },
  {
    icon: <Heart size={14} />,
    title: "Zero Exploitation",
    body: "শোষণমুক্ত সমাজই মানুষের প্রকৃত নিরাপত্তা দেয়।",
  },
  {
    icon: <Award size={14} />,
    title: "Zero Ignorance",
    body: "অজ্ঞতামুক্ত জাতিই আগামীর সমৃদ্ধ বাংলাদেশের কারিগর।",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FounderManifesto() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700;9..40,800&display=swap');

        .fm-root {
          --bg-base:        #030e08;
          --bg-card:        #0b1f12;
          --bg-elevated:    #0f2a18;
          --border:         #1e4128;
          --border-soft:    rgba(30, 65, 40, 0.6);
          --gold:           #e8b84b;
          --gold-dim:       rgba(232, 184, 75, 0.12);
          --gold-glow:      rgba(232, 184, 75, 0.06);
          --green-muted:    #6a9a7a;
          --text-primary:   #eef4f0;
          --text-secondary: rgba(238, 244, 240, 0.6);
          --text-muted:     rgba(238, 244, 240, 0.35);
          --font-display:   'Playfair Display', Georgia, serif;
          --font-body:      'DM Sans', sans-serif;

          padding: 6rem 1.5rem;
          background: var(--bg-base);
          color: var(--text-primary);
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }

        /* Orbs */
        .fm-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }
        .fm-orb-1 {
          width: 560px; height: 560px;
          top: -180px; left: -180px;
          background: radial-gradient(circle, rgba(232,184,75,0.07) 0%, transparent 65%);
          animation: fmOrb1 20s ease-in-out infinite alternate;
        }
        .fm-orb-2 {
          width: 480px; height: 480px;
          bottom: -160px; right: -160px;
          background: radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 65%);
          animation: fmOrb2 26s ease-in-out infinite alternate;
        }
        @keyframes fmOrb1 {
          from { transform: translate(0,0); }
          to   { transform: translate(50px, 35px); }
        }
        @keyframes fmOrb2 {
          from { transform: translate(0,0); }
          to   { transform: translate(-40px,-55px); }
        }

        /* Noise */
        .fm-noise {
          position: absolute; inset: 0; opacity: 0.025; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* Grid */
        .fm-container {
          max-width: 1240px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr;
          gap: 3rem; align-items: center; position: relative; z-index: 1;
        }
        @media (min-width: 1024px) {
          .fm-container { grid-template-columns: 0.85fr 1.15fr; gap: 5rem; }
        }

        /* Fade-up */
        @keyframes fmFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fm-anim { opacity: 0; animation: fmFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .fm-d1 { animation-delay: 0.1s; }
        .fm-d2 { animation-delay: 0.2s; }
        .fm-d3 { animation-delay: 0.32s; }
        .fm-d4 { animation-delay: 0.44s; }
        .fm-d5 { animation-delay: 0.56s; }
        .fm-d6 { animation-delay: 0.68s; }
        .fm-d7 { animation-delay: 0.78s; }

        /* Image column */
        .fm-image-col { position: relative; display: flex; flex-direction: column; gap: 1.25rem; }

        .fm-image-frame {
          position: relative; aspect-ratio: 4/5;
          border-radius: 20px; overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(232,184,75,0.1);
        }
        .fm-image-frame::before {
          content: ''; position: absolute; top: 0; left: 16px; right: 16px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(232,184,75,0.5), transparent); z-index: 5;
        }
        .fm-img { object-fit: cover; transition: transform 0.8s cubic-bezier(0.22,1,0.36,1); }
        .fm-image-frame:hover .fm-img { transform: scale(1.04); }
        .fm-image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(3,14,8,0.85) 0%, rgba(3,14,8,0.2) 40%, transparent 65%);
        }

        /* Badge */
        .fm-badge {
          position: absolute; bottom: -14px; right: -10px;
          background: linear-gradient(135deg, #e8b84b 0%, #c99420 60%, #b07c0e 100%);
          color: #0c1a0e; padding: 1rem 1.2rem; border-radius: 16px;
          font-weight: 800; font-family: var(--font-body);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(232,184,75,0.3);
          z-index: 10; text-align: center; line-height: 1.15;
        }
        .fm-badge::after {
          content: ''; position: absolute; inset: 0; border-radius: 16px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%); pointer-events: none;
        }
        .fm-badge-year  { font-size: 1.8rem; display: block; }
        .fm-badge-label { font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }

        /* Image tags */
        .fm-image-tags { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.75rem; }

        /* Tag pill */
        .fm-tag {
          display: inline-flex; align-items: center; gap: 0.45rem;
          background: rgba(19,45,30,0.7); border: 1px solid var(--border);
          padding: 0.38rem 0.9rem; border-radius: 100px; font-size: 0.8rem;
          color: var(--green-muted); white-space: nowrap;
          transition: border-color 0.2s, color 0.2s;
        }
        .fm-tag:hover { border-color: rgba(232,184,75,0.3); color: var(--text-primary); }

        /* Content column */
        .fm-content-col { display: flex; flex-direction: column; gap: 1.75rem; }

        /* Label */
        .fm-label {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--gold); text-transform: uppercase; letter-spacing: 0.18em;
          font-size: 0.68rem; font-weight: 800;
          border: 1px solid rgba(232,184,75,0.2); background: rgba(232,184,75,0.06);
          padding: 5px 12px; border-radius: 100px;
        }

        /* Heading */
        .fm-heading {
          font-family: var(--font-display); font-size: clamp(2rem,4vw,3.4rem);
          font-weight: 900; line-height: 1.08; letter-spacing: -0.01em; margin: 0.5rem 0 0;
        }
        .fm-heading em { font-style: italic; color: var(--gold); }

        /* Role tags */
        .fm-role-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.85rem; }

        /* Quote card */
        .fm-quote-card {
          position: relative;
          background: linear-gradient(135deg, rgba(11,31,18,0.9) 0%, rgba(15,42,24,0.6) 100%);
          border: 1px solid var(--border); border-left: 3px solid var(--gold);
          padding: 1.75rem 2rem; border-radius: 0 16px 16px 0; overflow: hidden;
        }
        .fm-quote-card::before {
          content: ''; position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(232,184,75,0.07) 0%, transparent 70%); pointer-events: none;
        }
        .fm-quote-icon { color: rgba(232,184,75,0.12); margin-bottom: 0.75rem; }
        .fm-quote-text {
          font-size: 1rem; line-height: 1.9; color: rgba(238,244,240,0.78);
          font-style: italic; font-family: var(--font-display); font-weight: 700; margin: 0;
        }

        /* Pillars */
        .fm-pillars { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.85rem; }
        .fm-pillar {
          padding: 1.2rem 1.25rem;
          background: rgba(11,31,18,0.6); border: 1px solid var(--border); border-radius: 14px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s; cursor: default;
        }
        .fm-pillar:hover { border-color: rgba(232,184,75,0.35); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
        .fm-pillar-title { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.88rem; color: var(--gold); margin: 0 0 0.45rem; }
        .fm-pillar-body  { font-size: 0.78rem; color: var(--text-muted); line-height: 1.6; margin: 0; }

        /* Harmony block */
        .fm-harmony {
          background: rgba(11,31,18,0.5); border: 1px solid var(--border-soft);
          border-radius: 14px; padding: 1.4rem 1.6rem;
        }
        .fm-harmony-title {
          font-family: var(--font-display); font-style: italic; font-size: 1.15rem;
          color: var(--gold); margin: 0 0 0.5rem; display: flex; align-items: center; gap: 8px;
        }
        .fm-harmony-body { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.75; margin: 0; }

        /* Stats */
        .fm-stats { display: flex; flex-wrap: wrap; gap: 1.25rem 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .fm-stat-value { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.2rem; }
        .fm-stat-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }

        /* CTA */
        .fm-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #e8b84b 0%, #c99420 55%, #b07c0e 100%);
          color: #0c1a0e; font-weight: 700; font-size: 0.9rem; font-family: var(--font-body);
          letter-spacing: 0.03em; padding: 0.8rem 1.8rem; border-radius: 100px; border: none; cursor: pointer;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(232,184,75,0.25);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .fm-cta::after {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%); pointer-events: none;
        }
        .fm-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(232,184,75,0.35); }
        .fm-cta:active { transform: translateY(0); }
      `}</style>

      <section className="fm-root">
        <div className="fm-orb fm-orb-1" aria-hidden />
        <div className="fm-orb fm-orb-2" aria-hidden />
        <div className="fm-noise"         aria-hidden />

        <div className="fm-container">

          {/* ── Left: Image ─────────────────────────── */}
          <div className="fm-image-col fm-anim fm-d1">
            <div className="fm-image-frame">
              <Image
                src="/team/ceo.png"
                alt="Md. Asaduzzaman Sujan — Founder"
                fill priority
                className="fm-img"
              />
              <div className="fm-image-overlay" aria-hidden />
            </div>

            <div className="fm-badge" aria-label="15+ Years of Vision">
              <span className="fm-badge-year">15+</span>
              <span className="fm-badge-label">Years of Vision</span>
            </div>

            <div className="fm-image-tags">
              <span className="fm-tag">
                <Activity size={13} style={{ color: "#f87171" }} aria-hidden />
                Modern Hospital & Diagnostic Center
              </span>
              <span className="fm-tag">
                <Heart size={13} style={{ color: "#f472b6" }} aria-hidden />
                Founder of Harmony
              </span>
            </div>
          </div>

          {/* ── Right: Content ───────────────────────── */}
          <div className="fm-content-col">

            {/* Label + Heading */}
            <div className="fm-anim fm-d2">
              <span className="fm-label"><Zap size={11} /> Founder Manifesto</span>
              <h1 className="fm-heading">
                Md. Asaduzzaman <em>Sujan</em>
              </h1>
              <div className="fm-role-tags">
                <span className="fm-tag"><ShieldCheck size={12} /> Humanitarian</span>
                <span className="fm-tag"><Zap size={12} /> Social Reformer</span>
                <span className="fm-tag"><Star size={12} /> Visionary</span>
              </div>
            </div>

            {/* Quote */}
            <div className="fm-anim fm-d3">
              <div className="fm-quote-card">
                <Quote className="fm-quote-icon" size={40} aria-hidden />
                <p className="fm-quote-text">
                  আমি বিশ্বাস করি— একজন মানুষের পরিবর্তনও একটি সমাজের পরিবর্তনের শুরু করতে পারে।
                  3ZF (Three Zeros of Freedom) কোনো সাধারণ প্ল্যাটফর্ম নয়, এটি একটি ন্যায়ভিত্তিক ও
                  সম্প্রীতিপূর্ণ বাংলাদেশ গড়ার অঙ্গীকার।
                </p>
              </div>
            </div>

            {/* Pillars */}
            <div className="fm-pillars fm-anim fm-d4">
              {PILLARS.map((p) => (
                <div key={p.title} className="fm-pillar">
                  <p className="fm-pillar-title">{p.icon}{p.title}</p>
                  <p className="fm-pillar-body">{p.body}</p>
                </div>
              ))}
            </div>

            {/* Harmony */}
            <div className="fm-harmony fm-anim fm-d5">
              <p className="fm-harmony-title">
                <Heart size={16} style={{ color: "#e8b84b" }} aria-hidden />
                Harmony = সম্প্রীতির দর্শন
              </p>
              <p className="fm-harmony-body">
                Harmony মানে মানুষে মানুষে একতা, সহযোগিতা এবং দায়িত্ববোধ। সম্প্রীতি ছাড়া কোনো
                সমাজ টিকে থাকতে পারে না। আমরা সমাজকে একটি পরিবারে পরিণত করতে চাই।
              </p>
            </div>

            {/* Stats */}
            <div className="fm-stats fm-anim fm-d6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="fm-stat-value">{stat.value}</p>
                  <p className="fm-stat-label">{stat.sublabel ?? stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="fm-anim fm-d7">
              <button className="fm-cta" type="button">
                Join the Movement <ArrowRight size={16} aria-hidden />
              </button>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}