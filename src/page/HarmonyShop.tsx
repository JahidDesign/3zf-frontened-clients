import React from "react";
import {
  ShieldCheck
} from "lucide-react";
import "./harmonyshop.css"
/* ── Icons ── */
const ArrowRight = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const Zap = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const Check = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);



/* ── Data ── */
const howItems = [
  {
    num: "০১",
    title: "নির্ধারিত ও স্বচ্ছ প্রফিট মার্জিন",
    desc: "অযৌক্তিক মূল্য নয়। নির্ধারিত ও যুক্তিসঙ্গত মার্জিন। এতে ভোক্তা সুরক্ষিত, ব্যবসা টেকসই।",
  },
  {
    num: "০২",
    title: "স্থানীয় উৎপাদক অগ্রাধিকার",
    desc: "উৎপাদক থেকে সরাসরি সংগ্রহ। মধ্যস্বত্ব কমলে মূল্য কমে, আয় বাড়ে।",
  },
  {
    num: "০৩",
    title: "কমিউনিটি কর্মসংস্থান কাঠামো",
    desc: "প্রতি উপজেলা ভিত্তিক সুপারভাইজার ও মার্কেটিং এক্সিকিউটিভ নিয়োগ। এটি শুধু দোকান নয়, একটি অর্থনৈতিক প্ল্যাটফর্ম।",
  },
  {
    num: "০৪",
    title: "ডিজিটাল স্বচ্ছতা",
    desc: "ইনভেন্টরি, বিক্রয় ও হিসাব—সবকিছু ট্র্যাকযোগ্য। স্বচ্ছতা ছাড়া ইনসাফ সম্ভব নয়।",
  },
];

const diffItems = [
  "মুনাফা-কেন্দ্রিক নয়, ভারসাম্য-কেন্দ্রিক",
  "সামাজিক প্রভাব ও ব্যবসার সমন্বয়",
  "স্থানীয় পুঁজি স্থানীয় উন্নয়নে",
  "পরিকল্পিত সম্প্রসারণ কাঠামো",
];

const proofPillars = [
  { num: "০১", title: " ন্যায্য মূল্য", desc: "স্বচ্ছ মার্জিন, নির্ধারিত মূল্য — কোনো অস্পষ্টতা নেই।" },
  { num: "০২", title: "  সমান সুযোগ", desc: "উদ্যোক্তা থেকে ভোক্তা — সবার জন্য একই মঞ্চ।" },
  { num: "০৩", title: "স্বচ্ছ তথ্য ", desc: "ডিজিটাল ট্র্যাকিং নিশ্চিত করে সম্পূর্ণ জবাবদিহিতা।" },
];

const outcomes = [
  "একজন উদ্যোক্তা বাজার পায়",
  "একজন যুবক কর্মসংস্থান পায়",
  "একজন ভোক্তা ন্যায্য মূল্য পায়",
];

const offerItems = [
  { icon: "🥬", title: "দৈনন্দিন প্রয়োজনীয় পণ্য", desc: "বিশ্বস্ত উৎস থেকে সংগ্রহ করা মানসম্মত খাদ্য ও নিত্যপ্রয়োজনীয় পণ্য।" },
  { icon: "🏪", title: "স্থানীয় উদ্যোক্তা কর্নার", desc: "স্থানীয় উৎপাদকদের জন্য বিশেষ প্রদর্শনী ও বিক্রয় সুবিধা।" },
  { icon: "💼", title: "কর্মসংস্থান সুযোগ", desc: "মার্কেটিং এক্সিকিউটিভ, সুপারভাইজার এবং ব্যবস্থাপনা পর্যায়ে কাজের সুযোগ।" },
  { icon: "📊", title: "স্বচ্ছ সিস্টেম", desc: "ডিজিটাল ইনভেন্টরি, হিসাব এবং অপারেশনাল ট্র্যাকিং ব্যবস্থা।" },
];

const needItems = [
  { icon: "🥬", title: "১. খাদ্য নিরাপত্তা", desc: "নিয়ন্ত্রিত ও স্বচ্ছ প্রফিট মার্জিনের মাধ্যমে প্রয়োজনীয় খাদ্যপণ্য ন্যায্যমূল্যে সরবরাহ। মধ্যস্বত্বভোগী কমলে খাদ্যের দাম স্থিতিশীল হয়।" },
  { icon: "👕", title: "২. বস্ত্র ও নিত্যপ্রয়োজনীয় পণ্য", desc: "স্থানীয় উৎপাদকদের জন্য নির্দিষ্ট প্রদর্শনী ও বিক্রয় প্ল্যাটফর্ম। স্থানীয় উৎপাদন বাড়ে, দাম কমে, বাজার স্থিতিশীল হয়।" },
  { icon: "🏠", title: "৩. বাসস্থান নিরাপত্তা", desc: "কমিউনিটি কর্মসংস্থান কাঠামো স্থিতিশীল আয় নিশ্চিত করে। স্থিতিশীল আয় মানে স্থিতিশীল পরিবার ও নিরাপদ বাসস্থান।" },
  { icon: "📚", title: "৪. শিক্ষা সক্ষমতা", desc: "যেখানে আয় নিয়মিত, সেখানে শিক্ষা ব্যয় সম্ভব। শোষণমুক্ত বাজার পরিবারকে দীর্ঘমেয়াদি পরিকল্পনা করতে সক্ষম করে।" },
  { icon: "🏥", title: "৫. স্বাস্থ্য সুরক্ষা", desc: "অযৌক্তিক মূল্যবৃদ্ধি কমলে পরিবার স্বাস্থ্য ব্যয় বহন করতে পারে। আর্থিক চাপ কমলে চিকিৎসা অবহেলা কমে।" },
];

const whoTags = ["উদ্যোক্তা", "সচেতন ভোক্তা", "বিনিয়োগকারী", "সমাজ পরিবর্তনের অংশীদার"];

/* ── Component ── */
export default function HarmonyShop() {
  return (
    <>
      <div className="hs-root">

        {/* ── HERO ── */}
         <section className="ha-hero">
          <div className="ha-hero-grid" />
          <div className="ha-hero-blob blob-tl" />
          <div className="ha-hero-blob blob-br" />

          <div className="ha-hero-inner">
            {/* Left */}
            <div>
             

              <h1 className="ha-h1">
                <span className="ha-h1-gold">HARMONY</span>
                <span className="txte-sm">Community Shop</span>
              </h1>
               
              <p className="ha-quote">
               এটি একটি দোকান নয়, এটি 3ZF দর্শনের বাস্তব অর্থনৈতিক প্রয়োগ।
               যেখানে ন্যায্য মূল্য, কর্মসংস্থান ও কমিউনিটি অংশীদারিত্ব মিলেই গড়ে ওঠে ভারসাম্যপূর্ণ সমাজ।
              </p>
            </div>

            {/* Right card */}
            <div className="ha-card" style={{ transform: "rotate(2deg)" }}>
              <div className="ha-card-title">
                <ShieldCheck size={20} />
                3ZF-এর মাঠপর্যায়ের প্ল্যাটফর্ম
              </div>
              <p>
                3ZF দর্শন পথ দেখায়— আর Harmony মানুষের জীবনে সেই পরিবর্তন বাস্তবে রূপ দেয়।
                এটি একটি মানবিক আন্দোলন এবং সমাজ পরিবর্তনের প্রতিজ্ঞা।
              </p>
            </div>
          </div>
        </section>
        <section className="hs-hero">
          <div className="hs-hero-grid" />
          <div className="hs-hero-glow" />
          <div className="hs-hero-inner">
            <div className="hs-chip"> Harmmony Community Shop</div>
            <h4 className=" customcss mt-2">
              ভারসাম্যপূর্ণ অর্থনীতির 
              <br className="mb-2" />
              <span className="hs-hero-gold mt-4">কমিউনিটি মডেল</span>
            </h4>
            <p className="hs-hero-sub">শোষণমুক্ত বাজার • সচেতন অংশীদারিত্ব • সম্মিলিত অগ্রগতি</p>
            <div className="hs-hero-card">
              <p>
                একটি সমাজ কি ন্যায্য হতে পারে?<br />
                <em>হ্যাঁ—যদি বাজার ন্যায্য হয়।</em><br />
                হারমনি কমিউনিটি শপ সেই প্রমাণ গড়ে তুলতে কাজ করছে।
              </p>
            </div>
            <div className="hs-btn-row">
              <button className="hs-btn-primary">কমিউনিটিতে যুক্ত হোন <ArrowRight size={16} /></button>
              <button className="hs-btn-outline">উদ্যোক্তা হোন</button>
            </div>
          </div>
        </section>

        {/* ── WHY ── */}
        <section className="hs-sec">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">আমাদের উদ্দেশ্য</div>
              <h2>আমরা কেন <span>আছি?</span></h2>
              <div className="hs-rule" />
            </div>
            <div className="hs-why-grid">
              <div className="hs-why-problems">
                <h3>আজকের বাজারের তিনটি সমস্যা</h3>
                <ul className="hs-prob-list">
                  {["মধ্যস্বত্বভোগী নির্ভর মূল্যবৃদ্ধি", "ক্ষুদ্র উদ্যোক্তার সীমিত প্রবেশাধিকার", "ভোক্তার প্রতি অস্বচ্ছতা"].map((t, i) => (
                    <li key={i} className="hs-prob-item">
                      <div className="hs-prob-num">{i + 1}</div>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="hs-result">
                  ফলাফল: অসাম্য, অনিশ্চয়তা এবং অর্থনৈতিক ভারসাম্যহীনতা।<br />
                  হারমনি কমিউনিটি শপ এই কাঠামো পরিবর্তনের একটি সুসংগঠিত প্রয়াস।
                </div>
              </div>

              <div className="hs-why-belief">
                <p>আমরা বিশ্বাস করি—</p>
                <div className="hs-belief-quote">
                  ন্যায্য মূল্য, স্বচ্ছ লেনদেন এবং কমিউনিটি অংশগ্রহণ নিশ্চিত হলে একটি ইনসাফভিত্তিক সমাজ গড়া সম্ভব।
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW ── */}
        <section className="hs-sec hs-sec-alt">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">কর্মপদ্ধতি</div>
              <h2>ন্যায় ও সুদমুক্ত <span> অর্থনীতি</span></h2>
              <p>কীভাবে সম্ভব?</p>
              <div className="hs-rule" />
            </div>
            <div className="hs-how-grid">
              {howItems.map((item, i) => (
                <div key={i} className="hs-how-card">
                  <div className="hs-how-num">{item.num}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PHILOSOPHY ── */}
        <section className="hs-sec">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">দর্শন</div>
              <h2>আমাদের <span>দর্শন</span></h2>
              <div className="hs-rule" />
            </div>
            <div className="hs-phil-card">
              <p>
                এই উদ্যোগ বৃহত্তর সামাজিক দর্শন <strong style={{ color: "var(--gold-light)" }}>3ZF (Three Zeros of Freedom)</strong>–এর সাথে সামঞ্জস্যপূর্ণ।
                অর্থনীতি যদি সুদমুক্ত, শোষণমুক্ত ও জ্ঞানভিত্তিক হয়—তবেই প্রকৃত স্বাধীনতা সম্ভব।
              </p>
              <div className="hs-zeros">
                {[
                  { en: "Zero Interest",     bn: "সুদমুক্ত অর্থনীতি" },
                  { en: "Zero Exploitation", bn: "শোষণমুক্ত সমাজ" },
                  { en: "Zero Ignorance",    bn: "জ্ঞানভিত্তিক কমিউনিটি" },
                ].map((z, i) => (
                  <div key={i} className="hs-zero-pill">
                    <span className="hs-zero-en">{z.en}</span>
                    <span className="hs-zero-bn">{z.bn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DIFFERENTIATORS ── */}
        <section className="hs-sec hs-sec-alt">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">কেন আলাদা</div>
              <h2>হারমনি শপ কী <span>আলাদা করে?</span></h2>
              <div className="hs-rule" />
            </div>
            <div className="hs-diff-grid">
              {diffItems.map((item, i) => (
                <div key={i} className="hs-diff-item">
                  <div className="hs-diff-check"><Check size={14} /></div>
                  {item}
                </div>
              ))}
            </div>
            <div className="hs-diff-statement">
              <p>এটি একটি দোকান নয়।</p>
              <p><span>এটি একটি সামাজিক অবকাঠামো।</span></p>
            </div>
          </div>
        </section>

        {/* ── PROOF ── */}
        <section className="hs-sec">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">প্রমাণ</div>
              <h2>ন্যায্য সমাজের <span>তিন স্তম্ভ</span></h2>
              <div className="hs-rule" />
            </div>
            <div className="hs-proof-grid">
              {proofPillars.map((p, i) => (
                <div key={i} className="hs-proof-card">
                  <div className="hs-proof-num">{p.num}</div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="hs-proof-outcomes">
              {outcomes.map((o, i) => (
                <div key={i} className="hs-outcome">
                  <div className="hs-outcome-dot" />
                  {o} — সেখানে ইনসাফের ভিত্তি গড়ে ওঠে।
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OFFER ── */}
        <section className="hs-sec hs-sec-alt">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">আমাদের সেবা</div>
              <h2>আমরা কী <span>অফার করি</span></h2>
              <div className="hs-rule" />
            </div>
            <div className="hs-offer-grid">
              {offerItems.map((item, i) => (
                <div key={i} className="hs-offer-card">
                  <span className="hs-offer-icon">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEEDS ── */}
        <section className="hs-sec">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">মৌলিক চাহিদা</div>
              <h2>ন্যায়ভিত্তিক বাজার থেকে <span>মৌলিক চাহিদা পূরণ</span></h2>
              <p>কীভাবে?</p>
              <div className="hs-rule" />
            </div>
            <div className="hs-needs-list">
              {needItems.map((item, i) => (
                <div key={i} className="hs-need-card">
                  <div className="hs-need-icon-wrap">{item.icon}</div>
                  <div className="hs-need-body">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO ── */}
        <section className="hs-sec hs-sec-alt">
          <div className="hs-wrap">
            <div className="hs-head">
              <div className="hs-label">আপনার ভূমিকা</div>
              <h2>আপনি কোথায় <span>থাকবেন?</span></h2>
              <div className="hs-rule" />
            </div>
            <div className="hs-who-card">
              <p>আপনি কি একজন উদ্যোক্তা, সচেতন ভোক্তা, বিনিয়োগকারী, অথবা সমাজ পরিবর্তনের অংশ হতে আগ্রহী ব্যক্তি?</p>
              <div className="hs-who-tags">
                {whoTags.map((tag) => (
                  <span key={tag} className="hs-who-tag">{tag}</span>
                ))}
              </div>
              <p style={{ marginBottom: 0 }}>তাহলে <strong style={{ color: "var(--gold-light)" }}>হারমনি আপনার প্ল্যাটফর্ম।</strong></p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <footer className="hs-cta">
          <div className="hs-cta-inner">
            <div className="hs-label" style={{ justifyContent: "center", marginBottom: 20 }}>
              আহ্বান
            </div>
            <h2>&quot;ন্যায্য বাজার গড়া <span>সম্ভব</span>&quot;</h2>
            <div className="hs-cta-pledge">
              আমরা প্রতিশ্রুতি দিচ্ছি না যে একদিনেই সমাজ বদলে যাবে।<br />
              আমরা প্রমাণ করতে চাই—<br />
              <strong>ন্যায্য বাজার গড়া সম্ভব।</strong><br />
              এবং সেখান থেকেই ন্যায্য সমাজের শুরু।
            </div>
            <p className="hs-cta-question">
              একটি প্রশ্ন নিজেকে করুন:<br />
              <em>আপনি কি শুধু ক্রেতা হতে চান, নাকি একটি ন্যায্য অর্থনীতির অংশ হতে চান?</em>
            </p>
            <button className="hs-btn-primary" style={{ fontSize: "0.95rem", padding: "14px 34px" }}>
              আজই যুক্ত হোন <ArrowRight size={18} />
            </button>
            <div className="hs-footer-copy">
              <Zap size={12} /> © {new Date().getFullYear()} হারমনি কমিউনিটি শপ — 3ZF Foundation. All Rights Reserved.
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}