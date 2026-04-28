import { useState, useEffect, useCallback, useRef } from "react";

const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const Zap = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const SLIDES = [
  {
    tag: "Community",
    label: "500+ Members",
    title: "Build Your Future",
    titleGold: "Together",
    sub: "হারমনি উদ্যোক্তা এসোসিয়েশনে যুক্ত হন এবং সঠিক মেন্টরশিপ ও নেটওয়ার্কের মাধ্যমে এগিয়ে যান।",
    cta: "Join Now",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.18)",
    blob1: "rgba(76,29,149,0.30)",
    blob2: "rgba(109,40,217,0.20)",
  },
  {
    tag: "Funding",
    label: "৳2M+ Disbursed",
    title: "Fuel Your",
    titleGold: "Vision",
    sub: "যোগ্য উদ্যোক্তাদের জন্য বিনিয়োগ সহায়তা, পুরস্কার এবং সরকারি স্বীকৃতির সুযোগ রয়েছে।",
    cta: "Apply Now",
    accent: "#c4b5fd",
    glow: "rgba(196,181,253,0.14)",
    blob1: "rgba(109,40,217,0.25)",
    blob2: "rgba(167,139,250,0.18)",
  },
  {
    tag: "Impact",
    label: "12K+ Lives Touched",
    title: "Create Real",
    titleGold: "Change",
    sub: "আপনার উদ্যোগকে সামাজিক পরিবর্তনের হাতিয়ার বানান — কমিউনিটি ও পরিবেশের জন্য কাজ করুন।",
    cta: "Explore More",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.16)",
    blob1: "rgba(124,58,237,0.28)",
    blob2: "rgba(76,29,149,0.22)",
  },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #07030f;
    --surface:  #100820;
    --surface2: #160d2a;
    --text:     #f0ecff;
    --text-soft:#a89ec0;
    --text-muted:#5e5380;
    --border:   rgba(60,30,100,0.85);
    --gold:     #a78bfa;
    --gold-border: rgba(167,139,250,0.22);
    --r: 14px; --r-lg: 22px;
  }

  .hs-root {
    background: var(--bg);
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    width: 100%;
    overflow: hidden;
  }

  /* ── Slider wrapper ── */
  .hs-slider {
    position: relative;
    width: 100%;
    height: clamp(320px, 52vw, 480px);
    overflow: hidden;
  }

  /* ── Each slide ── */
  .hs-slide {
    position: absolute; inset: 0;
    display: flex; align-items: center;
    padding: 0 clamp(20px, 6vw, 72px);
    opacity: 0;
    transform: translateX(60px);
    transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1),
                transform 0.55s cubic-bezier(0.22,1,0.36,1);
    pointer-events: none;
  }
  .hs-slide--active {
    opacity: 1; transform: translateX(0); pointer-events: auto;
  }
  .hs-slide--exit {
    opacity: 0; transform: translateX(-60px);
  }

  /* Grid background */
  .hs-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(109,40,217,0.18) 1px, transparent 1px),
      linear-gradient(90deg, rgba(109,40,217,0.18) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 75%);
  }

  /* Glow blobs */
  .hs-blob1, .hs-blob2 {
    position: absolute; border-radius: 50%; pointer-events: none;
    transition: background 0.6s ease;
  }
  .hs-blob1 { width: 420px; height: 420px; top: -120px; left: -100px; }
  .hs-blob2 { width: 340px; height: 340px; bottom: -100px; right: -80px; }

  /* Diagonal stripe */
  .hs-stripe {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(135deg, transparent 58%, rgba(167,139,250,0.035) 58%);
  }

  /* Particles */
  .hs-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
  .hs-particle {
    position: absolute; border-radius: 50%;
    background: #a78bfa; opacity: 0;
    animation: hsPart 9s ease-in-out infinite;
  }
  .hs-particle:nth-child(1) { width:3px;height:3px;left:10%;top:25%;animation-delay:0s;animation-duration:8s; }
  .hs-particle:nth-child(2) { width:2px;height:2px;left:30%;top:65%;animation-delay:2s;animation-duration:10s; }
  .hs-particle:nth-child(3) { width:3px;height:3px;left:60%;top:18%;animation-delay:4s;animation-duration:7s; }
  .hs-particle:nth-child(4) { width:2px;height:2px;left:80%;top:55%;animation-delay:1s;animation-duration:11s; }
  @keyframes hsPart {
    0%   { opacity:0; transform:translateY(0) scale(0.5); }
    20%  { opacity:0.5; }
    80%  { opacity:0.15; }
    100% { opacity:0; transform:translateY(-70px) scale(1.3); }
  }

  /* ── Content ── */
  .hs-content {
    position: relative; z-index: 2;
    max-width: 620px;
  }

  .hs-chip {
    display: inline-flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, var(--surface2), var(--surface));
    border: 1px solid rgba(109,40,217,0.5);
    border-radius: 999px; padding: 4px 14px;
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 18px;
    animation: hsIn 0.45s ease both;
  }

  .hs-label {
    display: inline-block;
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted);
    margin-left: 10px;
    animation: hsIn 0.45s 0.04s ease both;
  }

  .hs-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.9rem, 5vw, 3.4rem);
    font-weight: 900; line-height: 1.08; letter-spacing: -0.02em;
    margin-bottom: 14px;
    animation: hsIn 0.5s 0.08s ease both;
  }
  .hs-title-white { display: block; color: var(--text); }
  .hs-title-gold {
    display: block;
    background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #7c3aed 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .hs-sub {
    font-size: clamp(0.8rem, 1.6vw, 0.93rem);
    color: var(--text-soft); line-height: 1.8; font-weight: 300;
    margin-bottom: 28px; max-width: 480px;
    animation: hsIn 0.52s 0.13s ease both;
  }

  .hs-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 26px;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: #f0ecff; font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: 0.86rem; letter-spacing: 0.03em;
    border: none; border-radius: var(--r); cursor: pointer;
    box-shadow: 0 4px 22px rgba(139,92,246,0.38);
    transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
    animation: hsIn 0.54s 0.18s ease both;
  }
  .hs-btn:hover { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(139,92,246,0.5); }

  @keyframes hsIn {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── Controls ── */
  .hs-controls {
    position: absolute; bottom: 24px; right: clamp(20px, 6vw, 72px);
    display: flex; align-items: center; gap: 10px; z-index: 10;
  }

  .hs-arrow {
    width: 38px; height: 38px; border-radius: 50%;
    border: 1px solid var(--gold-border);
    background: rgba(167,139,250,0.07);
    color: var(--gold);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .hs-arrow:hover { background: rgba(167,139,250,0.18); border-color: var(--gold); transform: scale(1.08); }

  /* Dots */
  .hs-dots {
    display: flex; gap: 6px; align-items: center;
  }
  .hs-dot {
    height: 4px; border-radius: 99px;
    background: rgba(167,139,250,0.25);
    transition: width 0.35s ease, background 0.35s ease;
    cursor: pointer; width: 14px;
  }
  .hs-dot--active { width: 28px; background: var(--gold); }

  /* Progress bar */
  .hs-progress {
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: rgba(109,40,217,0.15); z-index: 10;
  }
  .hs-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6d28d9, #a78bfa);
    transition: width 0.1s linear;
  }

  /* Slide counter */
  .hs-counter {
    position: absolute; top: 22px; right: clamp(20px, 6vw, 72px);
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em;
    color: var(--text-muted); z-index: 10;
  }
  .hs-counter span { color: var(--gold); }
`;

const DURATION = 4000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef  = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
 const startRef = useRef<number>(0);
useEffect(() => {
  startRef.current = Date.now();
}, []);

  const goTo = useCallback((idx: number) => {
    setPrev(current);
    setCurrent(idx);
    setProgress(0);
    startRef.current = Date.now();
    setTimeout(() => setPrev(null), 600);
  }, [current]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev_ = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(next, DURATION);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  // Progress bar animation
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [current]);

  const slide = SLIDES[current];

  return (
    <>
      <style>{STYLES}</style>
      <div className="hs-root">
        <div className="hs-slider">

          {/* Shared background layers */}
          <div className="hs-grid" />
          <div className="hs-blob1" style={{ background: `radial-gradient(ellipse at center, ${slide.blob1} 0%, transparent 65%)` }} />
          <div className="hs-blob2" style={{ background: `radial-gradient(ellipse at center, ${slide.blob2} 0%, transparent 65%)` }} />
          <div className="hs-stripe" />
          <div className="hs-particles">
            {[...Array(4)].map((_, i) => <div key={i} className="hs-particle" />)}
          </div>

          {/* Slides */}
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={[
                "hs-slide",
                i === current ? "hs-slide--active" : "",
                i === prev    ? "hs-slide--exit"   : "",
              ].join(" ")}
            >
              <div className="hs-content">
                <div>
                  <div className="hs-chip"><Zap /> {s.tag}</div>
                  <span className="hs-label">{s.label}</span>
                </div>
                <h1 className="hs-title">
                  <span className="hs-title-white">{s.title}</span>
                  <span className="hs-title-gold">{s.titleGold}</span>
                </h1>
                <p className="hs-sub">{s.sub}</p>
                <button className="hs-btn">{s.cta} <ArrowRight /></button>
              </div>
            </div>
          ))}

          {/* Counter */}
          <div className="hs-counter">
            <span>{String(current + 1).padStart(2, "0")}</span> / {String(SLIDES.length).padStart(2, "0")}
          </div>

          {/* Controls */}
          <div className="hs-controls">
            <button className="hs-arrow" onClick={prev_} aria-label="Previous"><ArrowLeft /></button>
            <div className="hs-dots">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`hs-dot${i === current ? " hs-dot--active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button className="hs-arrow" onClick={next} aria-label="Next"><ArrowRight /></button>
          </div>

          {/* Progress bar */}
          <div className="hs-progress">
            <div className="hs-progress-fill" style={{ width: `${progress}%` }} />
          </div>

        </div>
      </div>
    </>
  );
}