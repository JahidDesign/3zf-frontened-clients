"use client";

import React from "react";
import {
  Heart, Lightbulb, CloudRain, Globe,
  Leaf, TrendingUp, Sun, Users, ShieldCheck, ChevronRight, Zap,
} from "lucide-react";
import "./harmony.css";


/* ══════════════════════════════════════════════
   ICON COLORS
══════════════════════════════════════════════ */
const ICON_COLORS = [
  "linear-gradient(135deg,#e05d7a,#c0392b)",
  "linear-gradient(135deg,#f0c040,#ca8a04)",
  "linear-gradient(135deg,#3b9edd,#1d6fa4)",
  "linear-gradient(135deg,#9b59b6,#6c3483)",
  "linear-gradient(135deg,#2ecc71,#1a7a45)",
  "linear-gradient(135deg,#3498db,#1f5a8b)",
  "linear-gradient(135deg,#f39c12,#d68910)",
];

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const philosophies = [
  { letter: "H", title: "Humanity Aid",        bnTitle: "মানবিক সহায়তা",         description: "দুর্বল, অসহায় ও বিপদগ্রস্ত মানুষের পাশে উপকরণ ও মানসিক সমর্থনে দাঁড়ানো।",                          icon: <Heart size={22} /> },
  { letter: "A", title: "Awareness",            bnTitle: "সামাজিক সচেতনতা",        description: "নৈতিকতা, শিক্ষা, স্বাস্থ্য ও অধিকার সম্পর্কে সচেতনতা বৃদ্ধি।",                                          icon: <Lightbulb size={22} /> },
  { letter: "R", title: "Relief",               bnTitle: "দুর্যোগকালীন ত্রাণ",     description: "বন্যা, শীত বা যেকোনো দুর্যোগে সবার আগে মানুষের কাছে পৌঁছে যাওয়া।",                                    icon: <CloudRain size={22} /> },
  { letter: "M", title: "Mutual Cooperation",   bnTitle: "প্রবাসী সহযোগিতা",       description: "প্রবাসীদের পারিবারিক সাপোর্ট, প্রতারণা প্রতিরোধ ও মানবিক সহায়তা।",                                    icon: <Globe size={22} /> },
  { letter: "O", title: "Oxygen for Nature",    bnTitle: "পরিবেশ রক্ষা",           description: "বৃক্ষরোপণ ও প্লাস্টিকমুক্ত ক্যাম্পেইনের মাধ্যমে প্রকৃতি সুরক্ষা।",                                    icon: <Leaf size={22} /> },
  { letter: "N", title: "Nurturing",            bnTitle: "টেকসই উন্নয়ন",          description: "কর্মসংস্থান সৃষ্টি ও যুবদের দক্ষতা উন্নয়নের মাধ্যমে স্বাবলম্বী করা।",                                  icon: <TrendingUp size={22} /> },
  { letter: "Y", title: "Yearning",             bnTitle: "সুন্দর আগামীর আকাঙ্ক্ষা", description: "ন্যায় ও সম্প্রীতিকে কেন্দ্র করে একটি উন্নত বাংলাদেশের স্বপ্ন।",                                      icon: <Sun size={22} /> },
];

const tasks = [
  "গ্রামভিত্তিক কমিউনিটি টিম",
  "ফিল্ড ভলান্টিয়ার নেটওয়ার্ক",
  "জরুরি রেসপন্স টিম",
  "যুব নেতৃত্ব দল",
  "নারী সাপোর্ট গ্রুপ",
  "প্রবাসী সাপোর্ট টিম",
];

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */
export default function HarmonyAbout() {
  return (
    <>
      <div className="ha-root">

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
                <span className="ha-h1-white">Organization</span>
              </h1>
               <div className="ha-chip">
                <Zap size={13} />
                 HARMONY অর্থ সম্প্রীতি
              </div>
              <p className="ha-quote">
                একজন মানুষ পরিবর্তিত হলে, একটি পরিবার বদলায়।
                একটি পরিবার বদলালে, একটি সমাজ বদলায়।
                আর সমাজ বদলালে—একটি বাংলাদেশ বদলে যায়।
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

        {/* ── PHILOSOPHY ── */}
        <section className="ha-philo">
          <div className="ha-section-head">
            <h2>HARMONY-এর <span>৭টি মূল দর্শন</span></h2>
            <div className="ha-line" />
          </div>

          <div className="ha-grid">
            {philosophies.map((item, i) => (
              <div key={i} className="philo-card">
                <div
                  className="philo-icon"
                  style={{ background: ICON_COLORS[i] }}
                >
                  {item.icon}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <span className="philo-letter">{item.letter}</span>
                  <span className="philo-title">{item.title}</span>
                </div>

                <div className="philo-bn">{item.bnTitle}</div>
                <p className="philo-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW WE WORK ── */}
        <section className="ha-work">
          <div className="ha-work-inner">
            {/* Left list */}
            <div>
              <h2>Harmony <span>কীভাবে কাজ করে?</span></h2>
              <div className="task-list">
                {tasks.map((t, i) => (
                  <div key={i} className="task-item">
                    <div className="task-dot" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right promo */}
            <div style={{ position: "relative" }}>
              <div className="ha-promo">
                <Users size={120} className="ha-promo-bg-icon" />
                <h3><span>সম্প্রীতি + সেবা</span> + পরিবর্তন</h3>
                <p>
                  প্রতিটি মানুষকে আত্মনির্ভর করে তোলাই Harmony-এর অঙ্গীকার।
                  আমরা বিশ্বাস করি—ঐক্য ও সম্প্রীতির সম্মিলিত শক্তিই পারে একটি সমাজকে টেকসই অগ্রগতির পথে নিয়ে যেতে।
                </p>
                <button className="ha-promo-btn">
                  আমাদের সাথে যুক্ত হোন
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="ha-promo-outline" />
            </div>
          </div>
        </section>

      </div>
    </>
  );
}