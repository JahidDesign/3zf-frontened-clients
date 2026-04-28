import { useState } from "react";

/* ── SVG Icons ── */
const ArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const Zap = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const Users = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const Star = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const Globe = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const Award = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const Heart = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* ── Styles ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #07030f;
    --surface:     #100820;
    --surface2:    #160d2a;
    --surface3:    #1c1133;
    --gold:        #a78bfa;
    --gold-light:  #c4b5fd;
    --gold-dim:    #6d28d9;
    --gold-border: rgba(167,139,250,0.22);
    --gold-glow:   rgba(167,139,250,0.09);
    --text:        #f0ecff;
    --text-soft:   #a89ec0;
    --text-muted:  #5e5380;
    --border:      rgba(60,30,100,0.85);
    --r:           14px;
    --r-lg:        22px;
  }

  html { scroll-behavior: smooth; }

  .ah-root {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    overflow-x: hidden;
    width: 100%;
  }

  /* ════════════════════════════
     HERO SECTION
  ════════════════════════════ */
  .ah-hero {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(80px, 12vw, 130px) clamp(16px, 5vw, 40px) clamp(60px, 10vw, 100px);
    width: 100%;
  }

  /* Grid background */
  .ah-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(109,40,217,0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(109,40,217,0.2) 1px, transparent 1px);
    background-size: clamp(34px, 5vw, 60px) clamp(34px, 5vw, 60px);
    mask-image: radial-gradient(ellipse 90% 80% at 50% 40%, black 10%, transparent 80%);
    pointer-events: none;
  }

  /* Glows */
  .ah-glow-c {
    position: absolute; top: -220px; left: 50%; transform: translateX(-50%);
    width: min(1000px, 130vw); height: 700px;
    background: radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, transparent 62%);
    pointer-events: none;
  }
  .ah-glow-l {
    position: absolute; top: 30%; left: -180px;
    width: 500px; height: 500px;
    background: radial-gradient(ellipse at center, rgba(76,29,149,0.28) 0%, transparent 65%);
    pointer-events: none;
  }
  .ah-glow-r {
    position: absolute; bottom: 0; right: -180px;
    width: 450px; height: 450px;
    background: radial-gradient(ellipse at center, rgba(109,40,217,0.22) 0%, transparent 65%);
    pointer-events: none;
  }

  /* Decorative diagonal stripe */
  .ah-stripe {
    position: absolute; top: 0; right: 0;
    width: clamp(280px, 42vw, 540px);
    height: 100%;
    background: linear-gradient(135deg, transparent 55%, rgba(167,139,250,0.04) 55%);
    pointer-events: none;
  }

  /* Floating particles */
  .ah-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .ah-particle {
    position: absolute; border-radius: 50%;
    background: var(--gold); opacity: 0;
    animation: particleDrift 9s ease-in-out infinite;
  }
  .ah-particle:nth-child(1)  { width:3px; height:3px; left:12%; top:20%; animation-delay:0s; animation-duration:8s; }
  .ah-particle:nth-child(2)  { width:2px; height:2px; left:28%; top:70%; animation-delay:1.5s; animation-duration:10s; }
  .ah-particle:nth-child(3)  { width:4px; height:4px; left:55%; top:15%; animation-delay:3s; animation-duration:7s; }
  .ah-particle:nth-child(4)  { width:2px; height:2px; left:72%; top:60%; animation-delay:4.5s; animation-duration:11s; }
  .ah-particle:nth-child(5)  { width:3px; height:3px; left:88%; top:30%; animation-delay:2s; animation-duration:9s; }
  .ah-particle:nth-child(6)  { width:2px; height:2px; left:40%; top:85%; animation-delay:6s; animation-duration:8s; }

  @keyframes particleDrift {
    0%   { opacity: 0; transform: translateY(0) scale(0.5); }
    20%  { opacity: 0.55; }
    80%  { opacity: 0.2; }
    100% { opacity: 0; transform: translateY(-80px) scale(1.4); }
  }

  .ah-hero-inner {
    position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto; width: 100%;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: clamp(32px, 6vw, 72px);
    align-items: center;
  }
  @media (max-width: 860px) {
    .ah-hero-inner { grid-template-columns: 1fr; gap: clamp(28px, 5vw, 48px); }
    .ah-right { order: -1; }
  }

  /* ── LEFT COLUMN ── */
  .ah-chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--surface2), var(--surface));
    border: 1px solid var(--gold-dim);
    border-radius: 999px;
    padding: 5px clamp(12px, 3vw, 18px);
    font-size: clamp(0.58rem, 1.4vw, 0.68rem); font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--gold); margin-bottom: clamp(18px, 3vw, 28px);
    animation: fUp 0.5s ease both;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 90vw;
  }

  .ah-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5.5vw, 4.4rem);
    font-weight: 900; line-height: 1.08; letter-spacing: -0.02em;
    margin-bottom: clamp(18px, 3vw, 26px);
    animation: fUp 0.6s 0.08s ease both;
    overflow-wrap: break-word;
  }
  .ah-h1-white { display: block; color: var(--text); }
  .ah-h1-gold {
    display: block;
    background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ah-lead {
    font-size: clamp(0.84rem, 1.7vw, 1rem);
    color: var(--text-soft); line-height: 1.88; font-weight: 300;
    margin-bottom: clamp(24px, 4vw, 36px);
    animation: fUp 0.65s 0.16s ease both;
  }
  .ah-lead strong { color: var(--text); font-weight: 600; }

  /* Stats strip */
  .ah-stats {
    display: flex; flex-wrap: wrap; gap: clamp(18px, 4vw, 36px);
    margin-bottom: clamp(28px, 5vw, 40px);
    animation: fUp 0.7s 0.22s ease both;
  }
  .ah-stat { }
  .ah-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.5rem, 3.5vw, 2.2rem);
    font-weight: 900; line-height: 1;
    background: linear-gradient(135deg, #c4b5fd, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }
  .ah-stat-label {
    font-size: clamp(0.65rem, 1.2vw, 0.72rem); font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-muted); margin-top: 4px;
  }
  .ah-stat-div {
    width: 1px; height: clamp(32px, 5vw, 44px);
    background: var(--border); align-self: center;
  }

  /* Buttons */
  .ah-btn-row {
    display: flex; flex-wrap: wrap; gap: 12px;
    animation: fUp 0.72s 0.28s ease both;
  }
  .ah-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: clamp(11px, 2vw, 14px) clamp(20px, 4vw, 30px);
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: #f0ecff;
    font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: clamp(0.8rem, 1.8vw, 0.9rem); letter-spacing: 0.03em;
    border: none; border-radius: var(--r); cursor: pointer;
    box-shadow: 0 4px 24px rgba(139,92,246,0.35);
    transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
    white-space: nowrap; flex-shrink: 0;
  }
  .ah-btn-primary:hover { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(139,92,246,0.5); }

  .ah-btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: clamp(10px, 2vw, 13px) clamp(18px, 3.5vw, 28px);
    background: transparent; color: var(--gold-light);
    font-family: 'Outfit', sans-serif;
    font-weight: 600; font-size: clamp(0.8rem, 1.8vw, 0.9rem);
    border: 1px solid var(--gold-border); border-radius: var(--r); cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    white-space: nowrap; flex-shrink: 0;
  }
  .ah-btn-outline:hover { background: var(--gold-glow); border-color: rgba(167,139,250,0.45); }

  /* ── RIGHT COLUMN ── */
  .ah-right { animation: fUp 0.75s 0.1s ease both; }

  /* Main card */
  .ah-card-main {
    background: linear-gradient(145deg, var(--surface2), var(--surface));
    border: 1px solid var(--gold-border);
    border-radius: var(--r-lg);
    padding: clamp(24px, 4vw, 40px);
    position: relative; overflow: hidden;
    margin-bottom: clamp(14px, 2.5vw, 20px);
  }
  .ah-card-main::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.1), transparent 65%);
    pointer-events: none;
  }
  .ah-card-main::after {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 60%; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }

  .ah-card-label {
    font-size: clamp(0.6rem, 1.2vw, 0.66rem); font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold-dim); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .ah-card-label::before {
    content: ''; display: inline-block;
    width: 18px; height: 1.5px;
    background: var(--gold-dim); border-radius: 2px;
  }

  .ah-card-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.1rem, 2.8vw, 1.5rem); font-weight: 900;
    color: var(--text); margin-bottom: 10px;
    line-height: 1.2;
  }
  .ah-card-title span {
    background: linear-gradient(135deg, #c4b5fd, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ah-card-body {
    font-size: clamp(0.8rem, 1.4vw, 0.88rem);
    color: var(--text-soft); line-height: 1.75; font-weight: 300;
    margin-bottom: 24px;
  }

  /* Feature rows */
  .ah-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .ah-feature {
    display: flex; align-items: center; gap: 12px;
    background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.12);
    border-radius: 10px; padding: clamp(10px, 1.8vw, 13px) clamp(12px, 2vw, 16px);
    transition: background 0.2s, border-color 0.2s;
    cursor: default;
  }
  .ah-feature:hover { background: var(--gold-glow); border-color: var(--gold-border); }
  .ah-feature-icon {
    width: clamp(32px, 5vw, 38px); height: clamp(32px, 5vw, 38px);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    color: var(--gold); flex-shrink: 0; background: rgba(139,92,246,0.08);
    border: 1px solid rgba(139,92,246,0.15);
  }
  .ah-feature-text { }
  .ah-feature-title {
    font-size: clamp(0.78rem, 1.4vw, 0.84rem); font-weight: 600;
    color: var(--text); margin-bottom: 2px;
  }
  .ah-feature-desc {
    font-size: clamp(0.7rem, 1.2vw, 0.76rem);
    color: var(--text-muted); font-weight: 300;
  }

  /* Progress bar */
  .ah-progress-wrap { margin-bottom: 6px; }
  .ah-progress-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px;
  }
  .ah-progress-label {
    font-size: clamp(0.7rem, 1.2vw, 0.76rem); font-weight: 600;
    color: var(--text-soft); letter-spacing: 0.06em;
  }
  .ah-progress-pct {
    font-size: clamp(0.72rem, 1.2vw, 0.78rem); font-weight: 700;
    color: var(--gold);
  }
  .ah-progress-bg {
    height: 5px; border-radius: 99px;
    background: rgba(139,92,246,0.12); overflow: hidden;
  }
  .ah-progress-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(to right, #6d28d9, #a78bfa);
    animation: growBar 1.6s 0.6s ease both;
    transform-origin: left;
  }
  @keyframes growBar {
    from { width: 0; }
    to   { width: var(--fill, 72%); }
  }

  /* Mini cards row */
  .ah-mini-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: clamp(10px, 2vw, 14px);
  }
  .ah-mini {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r); padding: clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px);
    transition: border-color 0.2s, transform 0.2s;
  }
  .ah-mini:hover { border-color: var(--gold-border); transform: translateY(-3px); }

  .ah-mini-icon { color: var(--gold); margin-bottom: 10px; }
  .ah-mini-num {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.2rem, 2.8vw, 1.6rem); font-weight: 900;
    color: var(--text); line-height: 1; letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .ah-mini-label {
    font-size: clamp(0.64rem, 1.1vw, 0.7rem); font-weight: 600;
    color: var(--text-muted); letter-spacing: 0.09em; text-transform: uppercase;
  }

  /* Trust badges */
  .ah-trust {
    display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(6px, 1.5vw, 10px);
    margin-top: clamp(20px, 3.5vw, 32px);
    animation: fUp 0.8s 0.34s ease both;
  }
  .ah-trust-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 999px; padding: clamp(5px, 1vw, 7px) clamp(12px, 2.5vw, 16px);
    font-size: clamp(0.66rem, 1.2vw, 0.72rem); font-weight: 500;
    color: var(--text-muted); white-space: nowrap;
    transition: border-color 0.2s, color 0.2s;
  }
  .ah-trust-badge:hover { border-color: var(--gold-border); color: var(--gold-light); }
  .ah-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex-shrink: 0; opacity: 0.8; }

  /* ── Stars ── */
  .ah-stars {
    display: flex; gap: 3px; margin-bottom: 14px;
    color: var(--gold);
  }

  /* ── Divider line at section bottom ── */
  .ah-bottom-line {
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 70%; height: 1px;
    background: linear-gradient(to right, transparent, var(--border), transparent);
  }

  @keyframes fUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .ah-stats { gap: 14px; }
    .ah-stat-div { display: none; }
    .ah-btn-row { flex-direction: column; align-items: stretch; }
    .ah-btn-primary, .ah-btn-outline { justify-content: center; }
    .ah-mini-row { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 360px) {
    .ah-mini-row { grid-template-columns: 1fr; }
    .ah-trust { gap: 6px; }
  }
`;

const FEATURES = [
  {
    icon: <Users size={18} />,
    title: "Community-Driven Growth",
    desc: "অভিজ্ঞ মেন্টর ও উদ্যোক্তাদের সাথে সরাসরি সংযোগ",
  },
  {
    icon: <Globe size={18} />,
    title: "Real-World Exposure",
    desc: "মেলা ও ইভেন্টে পণ্য প্রদর্শনের সুযোগ",
  },
  {
    icon: <Award size={18} />,
    title: "Funding & Recognition",
    desc: "যোগ্য উদ্যোক্তাদের জন্য বিনিয়োগ সহায়তা",
  },
];

const PROGRESS_ITEMS = [
  { label: "Members Goal", pct: 72, fill: "72%" },
  { label: "Projects Funded", pct: 58, fill: "58%" },
];

export default function AssociationHero() {
  const [activeProgress, setActiveProgress] = useState(0);

  return (
    <>
      <style>{styles}</style>
      <div className="ah-root">
        <section className="ah-hero">
          {/* Background layers */}
          <div className="ah-grid" />
          <div className="ah-glow-c" />
          <div className="ah-glow-l" />
          <div className="ah-glow-r" />
          <div className="ah-stripe" />
          <div className="ah-particles">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="ah-particle" />
            ))}
          </div>

          <div className="ah-hero-inner">
            {/* ── LEFT ── */}
            <div className="ah-left">
              <div className="ah-chip">
                <Zap size={12} /> Harmony Entrepreneur Association
              </div>

              <h1 className="ah-h1">
                <span className="ah-h1-white">Build Your Future</span>
                <span className="ah-h1-gold">With a Community</span>
                <span className="ah-h1-white">Behind You</span>
              </h1>

              <p className="ah-lead">
                হারমনি উদ্যোক্তা এসোসিয়েশনে যুক্ত হন এবং{" "}
                <strong>সঠিক মেন্টরশিপ, নেটওয়ার্ক ও সুযোগের</strong> মাধ্যমে
                আপনার উদ্যোক্তা স্বপ্নকে বাস্তবে রূপ দিন।
              </p>

              {/* Stats */}
              <div className="ah-stats">
                {[
                  { num: "500+", label: "Members" },
                  null,
                  { num: "80+", label: "Projects" },
                  null,
                  { num: "৳2M+", label: "Funded" },
                ].map((item, i) =>
                  item === null ? (
                    <div key={i} className="ah-stat-div" />
                  ) : (
                    <div key={i} className="ah-stat">
                      <div className="ah-stat-num">{item.num}</div>
                      <div className="ah-stat-label">{item.label}</div>
                    </div>
                  )
                )}
              </div>

              {/* Buttons */}
              <div className="ah-btn-row">
                <button className="ah-btn-primary">
                  Join the Association <ArrowRight size={17} />
                </button>
                <button className="ah-btn-outline">Learn More</button>
              </div>

              {/* Trust badges */}
              <div className="ah-trust">
                {[
                  "100% Transparent",
                  "Real Mentorship",
                  "Action Oriented",
                  "Ethical Business",
                ].map((t) => (
                  <div key={t} className="ah-trust-badge">
                    <div className="ah-trust-dot" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="ah-right">
              {/* Main feature card */}
              <div className="ah-card-main">
                <div className="ah-card-label">Why Join Us</div>

                <div className="ah-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} />)}
                </div>

                <div className="ah-card-title">
                  আপনার উদ্যোক্তা যাত্রার{" "}
                  <span>সেরা সঙ্গী</span>
                </div>
                <div className="ah-card-body">
                  একা লড়াই না করে একটি শক্তিশালী কমিউনিটির শক্তি নিয়ে এগিয়ে যান।
                </div>

                {/* Features */}
                <div className="ah-features">
                  {FEATURES.map((f, i) => (
                    <div key={i} className="ah-feature">
                      <div className="ah-feature-icon">{f.icon}</div>
                      <div className="ah-feature-text">
                        <div className="ah-feature-title">{f.title}</div>
                        <div className="ah-feature-desc">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "8px" }}
                >
                  {PROGRESS_ITEMS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveProgress(i)}
                      style={{
                        flex: 1,
                        padding: "5px 0",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderBottom: `2px solid ${
                          activeProgress === i
                            ? "var(--gold)"
                            : "var(--border)"
                        }`,
                        color:
                          activeProgress === i
                            ? "var(--gold-light)"
                            : "var(--text-muted)",
                        fontSize: "clamp(0.66rem, 1.1vw, 0.72rem)",
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        fontFamily: "'Outfit', sans-serif",
                        transition: "border-color 0.2s, color 0.2s",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="ah-progress-wrap">
                  <div className="ah-progress-header">
                    <span className="ah-progress-label">
                      {PROGRESS_ITEMS[activeProgress].label}
                    </span>
                    <span className="ah-progress-pct">
                      {PROGRESS_ITEMS[activeProgress].pct}%
                    </span>
                  </div>
                  <div className="ah-progress-bg">
                    <div
                      className="ah-progress-fill"
                      key={activeProgress}
                      style={
                        {
                          "--fill": PROGRESS_ITEMS[activeProgress].fill,
                          width: PROGRESS_ITEMS[activeProgress].fill,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Mini stats row */}
              <div className="ah-mini-row">
                <div className="ah-mini">
                  <div className="ah-mini-icon">
                    <Heart size={18} />
                  </div>
                  <div className="ah-mini-num">350+</div>
                  <div className="ah-mini-label">Volunteers</div>
                </div>
                <div className="ah-mini">
                  <div className="ah-mini-icon">
                    <Award size={18} />
                  </div>
                  <div className="ah-mini-num">12K+</div>
                  <div className="ah-mini-label">Lives Touched</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ah-bottom-line" />
        </section>
      </div>
    </>
  );
}