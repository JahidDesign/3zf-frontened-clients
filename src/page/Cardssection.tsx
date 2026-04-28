import { useState, useEffect, useRef } from "react";

/* ── SVG Icons ── */
const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const Zap = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const Users = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const Globe = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const Award = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const Heart = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const BookOpen = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const TrendingUp = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const Star = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── Animated stat component ── */
function AnimatedStat({
  raw,
  label,
  started,
}: {
  raw: string;
  label: string;
  started: boolean;
}) {
  // Parse prefix (৳), number, suffix (+, K+, M+)
  const match = raw.match(/^([৳]?)(\d+)([KM]?\+?)$/);
  const prefix = match?.[1] ?? "";
  const num    = parseInt(match?.[2] ?? "0");
  const suffix = match?.[3] ?? "";

  // For "K+" display as e.g. 12K+, count up to 12 then append K+
  const count = useCountUp(num, 1800, started);

  return (
    <div>
      <div className="cs-stat-num">
        {prefix}{count}{suffix}
      </div>
      <div className="cs-stat-label">{label}</div>
    </div>
  );
}

/* ── Data ── */
const CARDS = [
  {
    tag: "Community",
    icon: <Users size={22} />,
    title: "আমাদের কমিউনিটিতে যোগ দিন",
    titleEn: "Join Our Network",
    desc: "অভিজ্ঞ উদ্যোক্তা ও মেন্টরদের সাথে সরাসরি সংযোগ স্থাপন করুন এবং আপনার যাত্রাকে ত্বরান্বিত করুন।",
    stat: "00",
    statLabel: "Active Members",
    accent: "#8b5cf6",
    accentDim: "rgba(139,92,246,0.12)",
    accentBorder: "rgba(139,92,246,0.25)",
    badge: "Most Popular",
  },
  {
    tag: "Exposure",
    icon: <Globe size={22} />,
    title: "বিশ্বমঞ্চে নিজেকে তুলে ধরুন",
    titleEn: "Global Exposure",
    desc: "মেলা, ইভেন্ট ও প্রদর্শনীতে আপনার পণ্য ও সেবা উপস্থাপন করুন। সুযোগ আপনার দোরগোড়ায়।",
    stat: "00",
    statLabel: "Events Hosted",
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.10)",
    accentBorder: "rgba(167,139,250,0.22)",
    badge: null,
  },
  {
    tag: "Funding",
    icon: <TrendingUp size={22} />,
    title: "বিনিয়োগ ও স্বীকৃতি পান",
    titleEn: "Funding & Recognition",
    desc: "যোগ্য উদ্যোক্তাদের জন্য বিনিয়োগ সহায়তা, পুরস্কার এবং সরকারি স্বীকৃতির সুযোগ।",
    stat: "00",
    statLabel: "৳ Funds Disbursed",
    accent: "#c4b5fd",
    accentDim: "rgba(196,181,253,0.09)",
    accentBorder: "rgba(196,181,253,0.20)",
    badge: null,
  },
  {
    tag: "Learning",
    icon: <BookOpen size={22} />,
    title: "শিখুন, বাড়ুন, জয়ী হন",
    titleEn: "Learn & Grow",
    desc: "বিশেষজ্ঞ-পরিচালিত ওয়ার্কশপ, অনলাইন কোর্স এবং হাতে-কলমে প্রশিক্ষণের মাধ্যমে দক্ষতা অর্জন করুন।",
    stat: "00+",
    statLabel: "Workshops Done",
    accent: "#7c3aed",
    accentDim: "rgba(124,58,237,0.12)",
    accentBorder: "rgba(124,58,237,0.26)",
    badge: "New",
  },
  {
    tag: "Mentorship",
    icon: <Award size={22} />,
    title: "সেরা মেন্টরদের গাইডেন্স",
    titleEn: "Expert Mentorship",
    desc: "১:১ মেন্টরিং সেশন, গ্রুপ কোচিং এবং শিল্প-বিশেষজ্ঞদের পরামর্শে আপনার দক্ষতা শাণিত করুন।",
    stat: "00+",
    statLabel: "Mentors Available",
    accent: "#6d28d9",
    accentDim: "rgba(109,40,217,0.12)",
    accentBorder: "rgba(109,40,217,0.28)",
    badge: null,
  },
  {
    tag: "Impact",
    icon: <Heart size={22} />,
    title: "পরিবর্তন আনুন সমাজে",
    titleEn: "Social Impact",
    desc: "আপনার উদ্যোগকে সামাজিক পরিবর্তনের হাতিয়ার বানান। কমিউনিটি ও পরিবেশের জন্য কাজ করুন।",
    stat: "0K+",
    statLabel: "Lives Touched",
    accent: "#9061f9",
    accentDim: "rgba(144,97,249,0.10)",
    accentBorder: "rgba(144,97,249,0.22)",
    badge: null,
  },
];

const STYLES = `
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

  .cs-root {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    overflow-x: hidden;
    width: 100%;
  }

  .cs-glow-l {
    position: fixed; top: 20%; left: -200px;
    width: 500px; height: 500px; pointer-events: none;
    background: radial-gradient(ellipse, rgba(76,29,149,0.22) 0%, transparent 70%);
  }
  .cs-glow-r {
    position: fixed; bottom: 10%; right: -200px;
    width: 450px; height: 450px; pointer-events: none;
    background: radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 70%);
  }

  .cs-section {
    position: relative;
    padding: clamp(64px, 10vw, 110px) clamp(16px, 5vw, 40px);
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Header */
  .cs-header {
    text-align: center;
    margin-bottom: clamp(40px, 6vw, 64px);
    position: relative; z-index: 1;
  }
  .cs-chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, var(--surface2), var(--surface));
    border: 1px solid var(--gold-dim);
    border-radius: 999px; padding: 5px 18px;
    font-size: 0.66rem; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 20px;
    animation: csUp 0.5s ease both;
  }
  .cs-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4.5vw, 3.2rem);
    font-weight: 900; line-height: 1.1; letter-spacing: -0.02em;
    margin-bottom: 16px;
    animation: csUp 0.55s 0.08s ease both;
  }
  .cs-title-white { color: var(--text); }
  .cs-title-gold {
    background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #7c3aed 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .cs-subtitle {
    font-size: clamp(0.84rem, 1.6vw, 0.98rem);
    color: var(--text-soft); line-height: 1.8; font-weight: 300;
    max-width: 560px; margin: 0 auto;
    animation: csUp 0.6s 0.14s ease both;
  }
  .cs-header-line {
    width: 48px; height: 2px; border-radius: 2px; margin: 20px auto 0;
    background: linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-dim));
    animation: csUp 0.65s 0.18s ease both;
  }

  /* Grid */
  .cs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(14px, 2.5vw, 22px);
    position: relative; z-index: 1;
  }
  @media (max-width: 960px) { .cs-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 580px) { .cs-grid { grid-template-columns: 1fr; } }

  /* Card */
  .cs-card {
    background: linear-gradient(145deg, var(--surface2), var(--surface));
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: clamp(22px, 3.5vw, 32px);
    position: relative; overflow: hidden;
    cursor: pointer;
    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    animation: csUp 0.6s ease both;
    display: flex; flex-direction: column;
  }
  .cs-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(109,40,217,0.22), 0 4px 16px rgba(109,40,217,0.12);
  }
  .cs-card::after {
    content: '';
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 0; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    transition: width 0.35s ease;
  }
  .cs-card:hover::after { width: 80%; }

  .cs-card-glow {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 70% 50% at 50% 0%, var(--card-glow, rgba(139,92,246,0.08)), transparent 65%);
    opacity: 0; transition: opacity 0.3s;
  }
  .cs-card:hover .cs-card-glow { opacity: 1; }

  .cs-badge {
    position: absolute; top: 16px; right: 16px;
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--bg);
    background: linear-gradient(135deg, #a78bfa, #7c3aed);
    border-radius: 999px; padding: 3px 10px;
    box-shadow: 0 2px 10px rgba(139,92,246,0.4);
  }
  .cs-badge--new { background: linear-gradient(135deg, #c4b5fd, #8b5cf6); }

  .cs-tag {
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.16em;
    text-transform: uppercase; margin-bottom: 16px;
    display: flex; align-items: center; gap: 7px;
  }
  .cs-tag::before {
    content: ''; display: inline-block;
    width: 14px; height: 1.5px; border-radius: 2px;
    background: currentColor; opacity: 0.7;
  }

  .cs-icon-wrap {
    width: clamp(42px, 6vw, 50px); height: clamp(42px, 6vw, 50px);
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px; flex-shrink: 0;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .cs-card:hover .cs-icon-wrap {
    box-shadow: 0 4px 18px var(--card-glow, rgba(139,92,246,0.2));
  }

  .cs-card-en {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;
  }
  .cs-card-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(0.95rem, 1.8vw, 1.15rem);
    font-weight: 700; line-height: 1.3;
    color: var(--text); margin-bottom: 12px;
  }
  .cs-card-desc {
    font-size: clamp(0.76rem, 1.3vw, 0.82rem);
    color: var(--text-soft); line-height: 1.78; font-weight: 300;
    flex: 1; margin-bottom: 22px;
  }

  .cs-divider {
    height: 1px; margin-bottom: 18px;
    background: linear-gradient(to right, transparent, rgba(109,40,217,0.4), transparent);
  }

  .cs-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: auto;
  }

  /* Stat number — count-up lives here */
  .cs-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.4rem, 2.8vw, 1.7rem);
    font-weight: 900; line-height: 1; letter-spacing: -0.02em;
    background: linear-gradient(135deg, #c4b5fd, #a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    /* smooth number changes */
    font-variant-numeric: tabular-nums;
    min-width: 3ch;
  }
  .cs-stat-label {
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.09em;
    text-transform: uppercase; color: var(--text-muted); margin-top: 3px;
  }

  .cs-cta {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid var(--gold-border);
    background: var(--gold-glow);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold); flex-shrink: 0;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .cs-card:hover .cs-cta {
    background: rgba(167,139,250,0.18); border-color: var(--gold);
    transform: scale(1.1);
  }

  .cs-stars {
    display: flex; gap: 2px; margin-bottom: 12px;
    color: var(--gold);
  }

  /* CTA strip */
  .cs-strip {
    margin-top: clamp(40px, 6vw, 64px);
    background: linear-gradient(135deg, var(--surface2), var(--surface3));
    border: 1px solid var(--gold-border);
    border-radius: var(--r-lg);
    padding: clamp(28px, 4.5vw, 44px) clamp(24px, 5vw, 48px);
    display: flex; align-items: center; justify-content: space-between;
    gap: 24px; flex-wrap: wrap;
    position: relative; overflow: hidden; z-index: 1;
  }
  .cs-strip::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 0% 50%, rgba(139,92,246,0.1), transparent 65%);
    pointer-events: none;
  }
  .cs-strip-left { position: relative; z-index: 1; }
  .cs-strip-label {
    font-size: 0.66rem; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--gold-dim); margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .cs-strip-label::before {
    content: ''; display: inline-block;
    width: 16px; height: 1.5px; background: var(--gold-dim); border-radius: 2px;
  }
  .cs-strip-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 900; color: var(--text); line-height: 1.15;
  }
  .cs-strip-title span {
    background: linear-gradient(135deg, #c4b5fd, #a78bfa);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .cs-strip-right {
    display: flex; gap: 12px; flex-wrap: wrap;
    position: relative; z-index: 1;
  }
  .cs-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: #f0ecff; font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: 0.88rem; letter-spacing: 0.03em;
    border: none; border-radius: var(--r); cursor: pointer;
    box-shadow: 0 4px 24px rgba(139,92,246,0.35);
    transition: filter 0.2s, transform 0.15s, box-shadow 0.2s; white-space: nowrap;
  }
  .cs-btn-primary:hover { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(139,92,246,0.5); }
  .cs-btn-outline {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 26px; background: transparent; color: var(--gold-light);
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.88rem;
    border: 1px solid var(--gold-border); border-radius: var(--r); cursor: pointer;
    transition: background 0.2s, border-color 0.2s; white-space: nowrap;
  }
  .cs-btn-outline:hover { background: var(--gold-glow); border-color: rgba(167,139,250,0.45); }

  @keyframes csUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Individual card with its own intersection observer ── */
function Card({ card, index }: { card: typeof CARDS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="cs-card"
      style={{
        animationDelay: `${index * 0.07}s`,
        "--card-glow": card.accentDim,
        "--card-dim": card.accentDim,
        "--card-border": card.accentBorder,
      } as React.CSSProperties}
    >
      <div className="cs-card-glow" />

      {card.badge && (
        <div className={`cs-badge${card.badge === "New" ? " cs-badge--new" : ""}`}>
          {card.badge}
        </div>
      )}

      <div className="cs-tag" style={{ color: card.accent }}>{card.tag}</div>

      <div
        className="cs-icon-wrap"
        style={{ color: card.accent, background: card.accentDim, border: `1px solid ${card.accentBorder}` }}
      >
        {card.icon}
      </div>

      <div className="cs-stars">
        {[...Array(5)].map((_, s) => <Star key={s} size={11} />)}
      </div>

      <div className="cs-card-en">{card.titleEn}</div>
      <div className="cs-card-title">{card.title}</div>
      <div className="cs-card-desc">{card.desc}</div>

      <div className="cs-divider" />

      <div className="cs-card-footer">
        <AnimatedStat raw={card.stat} label={card.statLabel} started={started} />
        <div className="cs-cta" style={{ color: card.accent, borderColor: card.accentBorder }}>
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  );
}

export default function CardsSection() {
  return (
    <>
      <style>{STYLES}</style>
      <div className="cs-root">
        <div className="cs-glow-l" aria-hidden="true" />
        <div className="cs-glow-r" aria-hidden="true" />

        <section className="cs-section">
          {/* Header */}
          <div className="cs-header">
            <h2 className="cs-title">
              <span className="cs-title-white">আমাদের </span>
              <span className="cs-title-gold">সুযোগ ও সেবাসমূহ</span>
            </h2>
            <p className="cs-subtitle">
              Harmony-তে যোগ দিলে আপনি পাবেন একটি সম্পূর্ণ ইকোসিস্টেম —
              শেখার সুযোগ, নেটওয়ার্ক, ফান্ডিং ও সামাজিক প্রভাব।
            </p>
            <div className="cs-header-line" />
          </div>

          {/* Cards */}
          <div className="cs-grid">
            {CARDS.map((card, i) => (
              <Card key={i} card={card} index={i} />
            ))}
          </div>

          {/* CTA strip */}
          <div className="cs-strip">
            <div className="cs-strip-left">
              <div className="cs-strip-label">Ready to start?</div>
              <div className="cs-strip-title">
                আজই যোগ দিন এবং গড়ে তুলুন <span>আপনার ভবিষ্যৎ</span>
              </div>
            </div>
            <div className="cs-strip-right">
              <button className="cs-btn-primary">Join Now <ArrowRight size={16} /></button>
              <button className="cs-btn-outline">Learn More</button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}