"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Quote,
  Star,
  Zap,
  Sparkles,
  Globe2,
  BookOpen,
  Users,
  ShieldCheck,
} from "lucide-react";

/* ── data ── */
const milestones = [
  { year: "২০২৫", label: "3ZF দর্শনের সূচনা",          icon: Sparkles },
  { year: "২০২৬", label: "Harmony-এর যাত্রা শুরু",      icon: Globe2   },
  { year: "২০২৭", label: "৬৪ জেলায় বিস্তার পরিকল্পনা", icon: Users    },
  { year: "২০২৮", label: "জ্ঞান ও উদ্যোক্তা কার্যক্রম", icon: BookOpen },
];

const values = [
  {
    title: "সুদমুক্ত অর্থনীতি",
    desc:  "ন্যায়ভিত্তিক আর্থিক ব্যবস্থার মাধ্যমে শোষণমুক্ত সমাজ।",
  },
  {
    title: "শোষণমুক্ত সমাজ",
    desc:  "মানুষের মর্যাদা ও অধিকার নিশ্চিত করা।",
  },
  {
    title: "অজ্ঞতামুক্ত জনগোষ্ঠী",
    desc:  "জ্ঞান ও দক্ষতায় আলোকিত প্রজন্ম গড়ে তোলা।",
  },
];

const badges = [
  { icon: ShieldCheck, label: "বিশ্বস্ত নেতৃত্ব"   },
  { icon: Globe2,      label: "জাতীয় দৃষ্টিভঙ্গি" },
  { icon: Star,        label: "অনুপ্রেরণামূলক"      },
  { icon: Users,       label: "কমিউনিটি-কেন্দ্রিক" },
];

const quoteParas = [
  <>
    প্রকৃত স্বাধীনতা তখনই প্রতিষ্ঠিত হয়, যখন সমাজ হয় সুদমুক্ত, শোষণমুক্ত এবং
    অজ্ঞতামুক্ত। এই বিশ্বাস ও উপলব্ধি থেকেই{" "}
    <span style={{ color: "var(--color-brand)", fontWeight: 600 }}>
      Three Zeros of Freedom (3ZF)
    </span>{" "}
    ধারণার সূচনা।
  </>,
  <>
    3ZF এমন একটি সমাজের স্বপ্ন দেখে, যেখানে অর্থনীতি হবে ন্যায়ভিত্তিক, মানুষ হবে
    মর্যাদাপূর্ণ জীবনের অধিকারী, এবং জ্ঞান হবে উন্নতির প্রধান শক্তি।
  </>,
  <>
    এই লক্ষ্য বাস্তবায়নের জন্য 3ZF শুধু একটি ধারণা নয়, বরং একটি সচেতন সামাজিক
    উদ্যোগ — যার উদ্দেশ্য একটি ন্যায্য, মানবিক ও জ্ঞানসমৃদ্ধ সমাজ গড়ে তোলা।
  </>,
];

/* ── Framer variants ── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 22 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const fadeX = (dir: number, delay = 0) => ({
  initial:    { opacity: 0, x: dir * 28 },
  animate:    { opacity: 1, x: 0         },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ═══════════════════════════════════════════════ */
export default function FounderPage() {
  return (
    <section
      className="founder-section"
      style={{
        position:     "relative",
        overflow:     "hidden",
        minHeight:    "100dvh",
        background:   "var(--color-bg-secondary)",
        padding:      "clamp(3.5rem,8vw,5.5rem) clamp(1rem,5vw,2.5rem) clamp(2.5rem,6vw,4.5rem)",
      }}
    >
      {/* ── decorative layers ── */}
      <div className="deco-gradient" />
      <div className="deco-grid"     />
      <div className="deco-orb"      />

      {/* ════════════════════════════════════
          CONTENT WRAPPER
      ════════════════════════════════════ */}
      <div style={{ position: "relative", maxWidth: "75rem", margin: "0 auto", width: "100%" }}>

        {/* ── HERO GRID ── */}
        <div className="hero-grid">

          {/* LEFT — portrait */}
          <motion.div {...fadeX(-1, 0)} className="portrait-col">
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div className="avatar-glow" />
              <div className="avatar-ring" />
              <div className="avatar-frame">
                <img
                  src="/team/ceo.png"
                  alt="Md. Asaduzzaman Sujon"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%237c3aed' width='100' height='100'/%3E%3Ctext x='50' y='62' text-anchor='middle' font-size='38' fill='white' font-family='serif'%3EAS%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>

            {/* Name block */}
            <div style={{ textAlign: "center" }} className="name-block">
              <h2 className="founder-name">Md. Asaduzzaman Sujon</h2>
              <p className="founder-role">প্রতিষ্ঠাতা ও পরিচালক</p>
              <p className="founder-org">
                Three Zeros of Freedom (3ZF) · Harmony Organization
              </p>
            </div>

            {/* Badges */}
            <div className="badges-grid">
              {badges.map((b) => (
                <div key={b.label} className="badge-card">
                  <b.icon className="badge-icon" />
                  <span className="badge-label">{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — message */}
          <motion.div {...fadeX(1, 0.15)} className="message-col">
            {/* Chip */}
            <div className="chip">
              <Zap style={{ width: "0.7rem", height: "0.7rem" }} />
              প্রতিষ্ঠাতার বার্তা
            </div>

            {/* Heading */}
            <div>
              <h1 className="main-heading">
                <span className="heading-gradient">Founder&apos;s</span>
                <span className="heading-sub">Message</span>
              </h1>
              <div className="heading-bar" />
            </div>

            {/* Quote card */}
            <div className="quote-card">
              <Quote className="quote-icon" />
              {quoteParas.map((para, i) => (
                <p key={i} className="quote-para" style={{ marginBottom: i < quoteParas.length - 1 ? "0.85rem" : 0 }}>
                  {para}
                </p>
              ))}

              {/* Signature */}
              <div className="sig-row">
                <div className="sig-avatar">AS</div>
                <div>
                  <p className="sig-name">— Md. Asaduzzaman Sujon</p>
                  <p className="sig-title">Founder, Harmony Organization</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="cta-row">
              <button className="btn-primary">
                আমাদের সাথে যুক্ত হোন
                <ArrowRight style={{ width: "0.9rem", height: "0.9rem", flexShrink: 0 }} />
              </button>
              <button className="btn-secondary">আরও জানুন</button>
            </div>
          </motion.div>
        </div>

        {/* ── 3ZF VALUES ── */}
        <motion.div {...fadeUp(0.25)} className="section-block">
          <h2 className="section-title">
            3ZF-এর{" "}
            <span style={{ color: "var(--color-brand)" }}>তিনটি মূল লক্ষ্য</span>
          </h2>
          <div className="section-bar" />

          <div className="values-grid">
            {values.map((v, i) => (
              <motion.div key={i} {...fadeUp(0.3 + i * 0.1)} className="value-card">
                <div className="value-num">{`0${i + 1}`}</div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── MILESTONES ── */}
        <motion.div {...fadeUp(0.35)} className="section-block">
          <h2 className="section-title">
            যাত্রার{" "}
            <span style={{ color: "var(--color-brand)" }}>মাইলফলক</span>
          </h2>
          <div className="section-bar" />

          <div className="timeline-wrap">
            <div className="timeline-line" />
            <div className="timeline-list">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="milestone-card"
                >
                  <div className="milestone-dot" />
                  <div className="milestone-icon-wrap">
                    <m.icon className="milestone-icon" />
                  </div>
                  <div>
                    <span className="milestone-year">{m.year}</span>
                    <p className="milestone-label">{m.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ════════ STYLES ════════ */}
      <style>{`
        /* ── CSS vars (fallback defaults) ── */
        :root {
          --color-brand:          #7c3aed;
          --color-bg-secondary:   #0f0d18;
          --color-text:           #f1eeff;
          --color-text-secondary: #a89ec4;
          --color-card-bg:        rgba(255,255,255,0.04);
          --color-card-border:    rgba(255,255,255,0.08);
        }

        /* ── Decorative layers ── */
        .deco-gradient {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 60% at 60% 10%, rgba(124,58,237,.12), transparent 70%);
        }
        .deco-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: .035;
          background-image:
            linear-gradient(var(--color-brand) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-brand) 1px, transparent 1px);
          background-size: clamp(36px,5.5vw,56px) clamp(36px,5.5vw,56px);
        }
        .deco-orb {
          position: absolute; border-radius: 9999px; pointer-events: none;
          filter: blur(80px); opacity: .1;
          background: var(--color-brand);
          width: clamp(140px,34vw,340px); height: clamp(140px,34vw,340px);
          top: 6rem; right: -3rem;
        }

        /* ── Hero Grid ── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(2rem,6vw,4rem);
          margin-bottom: clamp(2.5rem,7vw,5rem);
          align-items: start;
        }
        @media (min-width: 900px) {
          .hero-grid { grid-template-columns: 1fr 1.55fr; align-items: center; }
        }

        /* ── Portrait column ── */
        .portrait-col {
          display: flex; flex-direction: column;
          align-items: center;
          gap: clamp(.9rem,2.8vw,1.4rem);
        }
        @media (min-width: 900px) {
          .portrait-col { align-items: flex-start; }
        }

        /* Avatar */
        .avatar-glow {
          position: absolute; inset: 0; border-radius: 9999px;
          filter: blur(28px); opacity: .28; transform: scale(1.25);
          background: var(--color-brand);
        }
        .avatar-ring {
          position: absolute; border-radius: 9999px;
          border: 2px dashed rgba(124,58,237,.3);
          inset: -9px;
        }
        .avatar-frame {
          position: relative; border-radius: 9999px; overflow: hidden;
          border: 3px solid var(--color-brand);
          width:  clamp(96px,20vw,176px);
          height: clamp(96px,20vw,176px);
        }

        /* Name block */
        .name-block { text-align: center; }
        @media (min-width: 900px) { .name-block { text-align: left; } }

        .founder-name {
          font-family: var(--font-heading, Georgia, serif);
          font-weight: 700; margin: 0 0 .25rem;
          color: var(--color-text);
          font-size: clamp(.95rem,2.8vw,1.4rem);
        }
        .founder-role {
          margin: 0 0 .2rem; letter-spacing: .12em; font-weight: 600;
          color: var(--color-brand);
          font-size: clamp(.62rem,1.6vw,.82rem);
        }
        .founder-org {
          margin: 0; color: var(--color-text-secondary);
          font-size: clamp(.58rem,1.4vw,.7rem);
        }

        /* Badges */
        .badges-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(.45rem,1.8vw,.7rem);
          width: 100%; max-width: min(100%, 18rem);
        }
        .badge-card {
          display: flex; align-items: center;
          gap: clamp(5px,1.4vw,9px);
          padding: clamp(7px,1.8vw,10px) clamp(8px,2vw,12px);
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          border-radius: .6rem;
        }
        .badge-icon {
          color: var(--color-brand); flex-shrink: 0;
          width:  clamp(12px,2.4vw,15px);
          height: clamp(12px,2.4vw,15px);
        }
        .badge-label {
          color: var(--color-text-secondary); font-weight: 500;
          font-size: clamp(.58rem,1.4vw,.7rem); line-height: 1.3;
        }

        /* ── Message column ── */
        .message-col {
          display: flex; flex-direction: column;
          gap: clamp(.85rem,2.4vw,1.2rem);
        }

        /* Chip */
        .chip {
          display: inline-flex; align-items: center; width: fit-content;
          gap: .375rem; border-radius: 9999px; font-weight: 600;
          letter-spacing: .06em; border: 1px solid rgba(124,58,237,.28);
          background: rgba(124,58,237,.08); color: var(--color-brand);
          padding: .25rem clamp(.55rem,1.4vw,.75rem);
          font-size: clamp(.6rem,1.4vw,.74rem);
        }

        /* Heading */
        .main-heading { margin: 0; font-weight: 700; line-height: 1.12; }
        .heading-gradient {
          display: block;
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: clamp(1.55rem,5.2vw,2.9rem);
        }
        .heading-sub {
          display: block; color: var(--color-text); margin-top: .2rem;
          font-size: clamp(.95rem,3.2vw,1.8rem);
        }
        .heading-bar {
          width: 2.5rem; height: 2px; border-radius: 9999px; margin-top: .5rem;
          background: linear-gradient(90deg, #7c3aed, transparent);
        }

        /* Quote card */
        .quote-card {
          position: relative; overflow: hidden; border-radius: 1rem;
          background: rgba(124,58,237,.05);
          border: 1px solid rgba(124,58,237,.2);
          padding: clamp(.9rem,3.2vw,1.5rem);
        }
        .quote-icon {
          position: absolute; top: .75rem; right: .75rem; opacity: .07;
          color: var(--color-brand);
          width:  clamp(28px,5.5vw,54px);
          height: clamp(28px,5.5vw,54px);
        }
        .quote-para {
          color: var(--color-text-secondary); line-height: 1.75;
          font-size: clamp(.7rem,1.85vw,.87rem);
        }

        /* Signature */
        .sig-row {
          display: flex; align-items: center; gap: .6rem;
          margin-top: clamp(.85rem,2.4vw,1.2rem);
          padding-top: clamp(.65rem,1.8vw,.95rem);
          border-top: 1px solid rgba(124,58,237,.15);
        }
        .sig-avatar {
          border-radius: 9999px; background: var(--color-brand);
          color: #fff; font-weight: 700; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          width:  clamp(26px,5vw,34px);
          height: clamp(26px,5vw,34px);
          font-size: clamp(.52rem,1.3vw,.68rem);
        }
        .sig-name {
          margin: 0; font-weight: 600; color: var(--color-text);
          font-size: clamp(.6rem,1.4vw,.74rem);
        }
        .sig-title {
          margin: 0; color: var(--color-text-secondary);
          font-size: clamp(.56rem,1.3vw,.68rem);
        }

        /* CTA */
        .cta-row {
          display: flex; flex-wrap: wrap;
          gap: clamp(.45rem,1.8vw,.7rem);
        }
        .cta-row .btn-primary,
        .cta-row .btn-secondary {
          flex: 1 1 clamp(130px, 40%, 200px);
          display: flex; align-items: center; justify-content: center;
          gap: .4rem; border-radius: .65rem; font-weight: 600; cursor: pointer;
          transition: transform .18s, box-shadow .18s;
          font-size: clamp(.7rem,1.8vw,.87rem);
          padding: clamp(9px,2vw,13px) clamp(14px,3vw,24px);
          min-width: 0;
        }
        .cta-row .btn-primary {
          background: var(--color-brand); color: #fff; border: none;
          box-shadow: 0 4px 18px rgba(124,58,237,.35);
        }
        .cta-row .btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,.5); }
        .cta-row .btn-secondary {
          background: transparent; color: var(--color-brand);
          border: 1px solid rgba(124,58,237,.4);
        }
        .cta-row .btn-secondary:hover { background: rgba(124,58,237,.08); transform: translateY(-2px); }

        /* ── Section scaffolding ── */
        .section-block { margin-bottom: clamp(2.5rem,7vw,5rem); }
        .section-title {
          font-weight: 700; margin: 0 0 .35rem;
          color: var(--color-text);
          font-size: clamp(1rem,3vw,1.45rem);
        }
        .section-bar {
          width: 2.5rem; height: 2px; border-radius: 9999px;
          background: linear-gradient(90deg, #7c3aed, transparent);
          margin-bottom: clamp(1.1rem,3.2vw,1.9rem);
        }

        /* Values grid */
        .values-grid {
          display: grid; grid-template-columns: 1fr;
          gap: clamp(.6rem,2vw,.95rem);
        }
        @media (min-width: 560px) {
          .values-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .value-card {
          display: flex; flex-direction: column;
          gap: clamp(.5rem,1.6vw,.7rem);
          padding: clamp(.85rem,2.6vw,1.2rem);
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          border-radius: .85rem;
          transition: transform .2s;
        }
        .value-card:hover { transform: translateY(-3px); }
        .value-num {
          border-radius: .5rem; background: var(--color-brand);
          color: #fff; font-weight: 700; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          width:  clamp(26px,5vw,34px);
          height: clamp(26px,5vw,34px);
          font-size: clamp(.58rem,1.3vw,.75rem);
        }
        .value-title {
          margin: 0; font-weight: 700; color: var(--color-text);
          font-size: clamp(.76rem,1.9vw,.87rem);
        }
        .value-desc {
          margin: 0; color: var(--color-text-secondary); line-height: 1.65;
          font-size: clamp(.66rem,1.6vw,.75rem);
        }

        /* Timeline */
        .timeline-wrap { position: relative; }
        .timeline-line {
          position: absolute; left: 1.1rem; top: 1.25rem; bottom: 1.25rem;
          width: 1px; background: rgba(124,58,237,.2);
          display: none;
        }
        @media (min-width: 560px) {
          .timeline-line { display: block; }
        }
        .timeline-list {
          display: flex; flex-direction: column;
          gap: clamp(.5rem,1.7vw,.85rem);
        }
        @media (min-width: 560px) {
          .timeline-list { padding-left: 3rem; }
        }
        .milestone-card {
          position: relative; display: flex; align-items: center;
          gap: clamp(.6rem,2vw,.95rem);
          padding: clamp(.5rem,1.7vw,.75rem) clamp(.65rem,2vw,.95rem);
          background: var(--color-card-bg);
          border: 1px solid var(--color-card-border);
          border-radius: .75rem;
          transition: transform .2s;
        }
        .milestone-card:hover { transform: translateX(4px); }
        .milestone-dot {
          position: absolute; display: none;
          border-radius: 9999px; border: 2px solid var(--color-brand);
          background: var(--color-bg-secondary);
          width: .75rem; height: .75rem;
          left: -1.9rem; top: 50%; transform: translateY(-50%);
        }
        @media (min-width: 560px) {
          .milestone-dot { display: block; }
        }
        .milestone-icon-wrap {
          border-radius: .65rem; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(124,58,237,.12);
          width:  clamp(28px,5vw,38px);
          height: clamp(28px,5vw,38px);
        }
        .milestone-icon {
          color: var(--color-brand);
          width:  clamp(12px,2.3vw,15px);
          height: clamp(12px,2.3vw,15px);
        }
        .milestone-year {
          display: block; font-weight: 700; font-variant-numeric: tabular-nums;
          color: var(--color-brand);
          font-size: clamp(.6rem,1.4vw,.72rem);
        }
        .milestone-label {
          margin: 0; font-weight: 500; color: var(--color-text);
          font-size: clamp(.72rem,1.9vw,.87rem);
        }

        /* ── Extra-small phones (<380px) ── */
        @media (max-width: 379px) {
          .badges-grid { grid-template-columns: 1fr 1fr; }
          .heading-gradient { font-size: 1.45rem; }
          .heading-sub      { font-size: .9rem;   }
          .cta-row .btn-primary,
          .cta-row .btn-secondary { flex: 1 1 100%; }
        }

        /* ── Tablet (600–899px) ── */
        @media (min-width: 600px) and (max-width: 899px) {
          .portrait-col { flex-direction: row; align-items: flex-start; flex-wrap: wrap; justify-content: center; }
          .name-block, .badges-grid { text-align: left; }
          .badges-grid { max-width: 100%; }
        }

        /* ── Large desktop (≥1400px) ── */
        @media (min-width: 1400px) {
          .hero-grid { grid-template-columns: 1fr 1.7fr; }
        }
      `}</style>
    </section>
  );
}