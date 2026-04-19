"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
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
  { year: "২০১৮", label: "3ZF দর্শনের সূচনা",          icon: Sparkles },
  { year: "২০২০", label: "Harmony-এর যাত্রা শুরু",      icon: Globe2   },
  { year: "২০২২", label: "৬৪ জেলায় বিস্তার পরিকল্পনা", icon: Users    },
  { year: "২০২৪", label: "জ্ঞান ও উদ্যোক্তা কার্যক্রম", icon: BookOpen },
];

const values = [
  { title: "সুদমুক্ত অর্থনীতি",    desc: "ন্যায়ভিত্তিক আর্থিক ব্যবস্থার মাধ্যমে শোষণমুক্ত সমাজ।" },
  { title: "শোষণমুক্ত সমাজ",       desc: "মানুষের মর্যাদা ও অধিকার নিশ্চিত করা।"                  },
  { title: "অজ্ঞতামুক্ত জনগোষ্ঠী", desc: "জ্ঞান ও দক্ষতায় আলোকিত প্রজন্ম গড়ে তোলা।"            },
];

const badges = [
  { icon: ShieldCheck, label: "বিশ্বস্ত নেতৃত্ব"   },
  { icon: Globe2,      label: "জাতীয় দৃষ্টিভঙ্গি" },
  { icon: Star,        label: "অনুপ্রেরণামূলক"      },
  { icon: Users,       label: "কমিউনিটি-কেন্দ্রিক" },
];

/* ── helpers ── */
const fluid = (min: string, mid: string, max: string) =>
  `clamp(${min}, ${mid}, ${max})`;

/* ── component ── */
export default function FounderPage() {
  return (
    <section
      className="relative overflow-hidden min-h-screen"
      style={{
        background: "var(--color-bg-secondary)",
        paddingTop:    fluid("3.5rem", "8vw",  "5rem"),
        paddingBottom: fluid("2.5rem", "6vw",  "4rem"),
        paddingLeft:   fluid("1rem",   "4vw",  "1.5rem"),
        paddingRight:  fluid("1rem",   "4vw",  "1.5rem"),
      }}
    >
      {/* ── Brand overlay ── */}
      <div className="absolute inset-0 gradient-brand opacity-[0.04] pointer-events-none" />

      {/* ── Dot-grid bg ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-brand) 1px, transparent 1px)," +
            "linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)",
          backgroundSize: `${fluid("36px", "6vw", "56px")} ${fluid("36px", "6vw", "56px")}`,
        }}
      />

      {/* ── Accent orb (hidden on xs) ── */}
      <div
        className="absolute hidden sm:block rounded-full pointer-events-none blur-3xl opacity-[0.07]"
        style={{
          background: "var(--color-brand)",
          width:  fluid("180px", "38vw", "360px"),
          height: fluid("180px", "38vw", "360px"),
          top:    "8rem",
          right:  "-3rem",
        }}
      />

      {/* ═══════════════════════════════════════
          CONTENT WRAPPER
      ═══════════════════════════════════════ */}
      <div className="relative mx-auto w-full" style={{ maxWidth: "72rem" }}>

        {/* ════════════════════════════
            HERO GRID
        ════════════════════════════ */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{
            gap:          fluid("2rem", "5vw", "4rem"),
            marginBottom: fluid("2.5rem", "7vw", "5rem"),
          }}
        >

          {/* ── LEFT: portrait ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center lg:items-start"
            style={{ gap: fluid("1rem", "3vw", "1.5rem") }}
          >
            {/* Avatar wrapper */}
            <div className="relative flex-shrink-0">
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-25"
                style={{ background: "var(--color-brand)", transform: "scale(1.2)" }}
              />
              {/* Dashed ring */}
              <div
                className="absolute rounded-full border-2 border-dashed opacity-20"
                style={{ borderColor: "var(--color-brand)", inset: "-8px" }}
              />
              {/* Photo */}
              <div
                className="relative rounded-full overflow-hidden border-4"
                style={{
                  borderColor: "var(--color-brand)",
                  width:  fluid("108px", "22vw", "192px"),
                  height: fluid("108px", "22vw", "192px"),
                }}
              >
                <img
                  src="/team/ceo.png"
                  alt="Md. Asaduzzaman Sujon"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%237c3aed' width='100' height='100'/%3E%3Ctext x='50' y='62' text-anchor='middle' font-size='38' fill='white' font-family='serif'%3EAS%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>

            {/* Name block */}
            <div className="text-center lg:text-left">
              <h2
                className="font-heading font-bold mb-1"
                style={{
                  color:    "var(--color-text)",
                  fontSize: fluid("1rem", "3.2vw", "1.5rem"),
                }}
              >
                Md. Asaduzzaman Sujon
              </h2>
              <p
                className="tracking-widest mb-1"
                style={{
                  color:    "var(--color-brand)",
                  fontSize: fluid("0.65rem", "1.8vw", "0.85rem"),
                }}
              >
                প্রতিষ্ঠাতা ও পরিচালক
              </p>
              <p style={{ color: "var(--color-text-secondary)", fontSize: fluid("0.6rem", "1.5vw", "0.72rem") }}>
                Three Zeros of Freedom (3ZF) · Harmony Organization
              </p>
            </div>

            {/* Badges 2-col */}
            <div
              className="grid grid-cols-2 w-full"
              style={{
                gap:      fluid("0.5rem", "2vw", "0.75rem"),
                maxWidth: "min(100%, 20rem)",
              }}
            >
              {badges.map((b) => (
                <div
                  key={b.label}
                  className="card flex items-center"
                  style={{
                    gap:     fluid("6px", "1.5vw", "10px"),
                    padding: `${fluid("7px", "1.8vw", "10px")} ${fluid("8px", "2vw", "12px")}`,
                  }}
                >
                  <b.icon
                    style={{
                      color:      "var(--color-brand)",
                      width:      fluid("13px", "2.8vw", "16px"),
                      height:     fluid("13px", "2.8vw", "16px"),
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="font-medium leading-tight"
                    style={{
                      color:    "var(--color-text-secondary)",
                      fontSize: fluid("0.6rem", "1.5vw", "0.72rem"),
                    }}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: message ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col"
            style={{ gap: fluid("0.9rem", "2.5vw", "1.25rem") }}
          >
            {/* Chip */}
            <div
              className="inline-flex items-center w-fit rounded-full font-semibold tracking-wide border"
              style={{
                background:  "rgba(124,58,237,0.08)",
                borderColor: "rgba(124,58,237,0.25)",
                color:       "var(--color-brand)",
                gap:         "0.375rem",
                padding:     `0.25rem ${fluid("0.6rem", "1.5vw", "0.75rem")}`,
                fontSize:    fluid("0.62rem", "1.5vw", "0.75rem"),
              }}
            >
              <Zap style={{ width: "0.7rem", height: "0.7rem" }} />
              প্রতিষ্ঠাতার বার্তা
            </div>

            {/* Heading */}
            <div>
              <h1 className="font-heading font-bold leading-tight mb-1" style={{ color: "var(--color-text)" }}>
                <span
                  className="bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent block"
                  style={{ fontSize: fluid("1.6rem", "5.5vw", "3rem") }}
                >
                  Founder&apos;s
                </span>
                <span
                  className="block"
                  style={{ fontSize: fluid("1rem", "3.5vw", "1.875rem"), marginTop: "0.25rem" }}
                >
                  Message
                </span>
              </h1>
              <div className="w-10 h-0.5 rounded-full bg-gradient-to-r from-violet-600 to-transparent" />
            </div>

            {/* Quote card */}
            <div
              className="card relative overflow-hidden"
              style={{
                background:  "rgba(124,58,237,0.05)",
                borderColor: "rgba(124,58,237,0.2)",
                padding:     fluid("1rem", "3.5vw", "1.5rem"),
              }}
            >
              <Quote
                className="absolute opacity-[0.07]"
                style={{
                  top: "0.6rem", right: "0.6rem",
                  width:  fluid("32px", "6vw", "60px"),
                  height: fluid("32px", "6vw", "60px"),
                  color:  "var(--color-brand)",
                }}
              />

              {[
                <>
                  প্রকৃত স্বাধীনতা তখনই প্রতিষ্ঠিত হয়, যখন সমাজ হয় সুদমুক্ত, শোষণমুক্ত এবং অজ্ঞতামুক্ত।
                  এই বিশ্বাস ও উপলব্ধি থেকেই{" "}
                  <span style={{ color: "var(--color-brand)" }} className="font-semibold">
                    Three Zeros of Freedom (3ZF)
                  </span>{" "}
                  ধারণার সূচনা।
                </>,
                "3ZF এমন একটি সমাজের স্বপ্ন দেখে, যেখানে অর্থনীতি হবে ন্যায়ভিত্তিক, মানুষ হবে মর্যাদাপূর্ণ জীবনের অধিকারী, এবং জ্ঞান হবে উন্নতির প্রধান শক্তি।",
                "এই লক্ষ্য বাস্তবায়নের জন্য 3ZF শুধু একটি ধারণা নয়, বরং একটি সচেতন সামাজিক উদ্যোগ — যার উদ্দেশ্য একটি ন্যায্য, মানবিক ও জ্ঞানসমৃদ্ধ সমাজ গড়ে তোলা।",
              ].map((para, i, arr) => (
                <p
                  key={i}
                  className="leading-relaxed"
                  style={{
                    color:        "var(--color-text-secondary)",
                    fontSize:     fluid("0.72rem", "2vw", "0.875rem"),
                    marginBottom: i < arr.length - 1 ? fluid("0.6rem", "2vw", "1rem") : 0,
                  }}
                >
                  {para}
                </p>
              ))}

              {/* Signature */}
              <div
                className="flex items-center"
                style={{
                  marginTop:   fluid("0.9rem", "2.5vw", "1.25rem"),
                  paddingTop:  fluid("0.7rem", "2vw", "1rem"),
                  borderTop:   "1px solid rgba(124,58,237,0.15)",
                  gap:         "0.625rem",
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    background: "var(--color-brand)",
                    width:  fluid("26px", "5.5vw", "34px"),
                    height: fluid("26px", "5.5vw", "34px"),
                    fontSize: fluid("0.55rem", "1.4vw", "0.7rem"),
                  }}
                >
                  AS
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--color-text)", fontSize: fluid("0.62rem", "1.5vw", "0.75rem") }}>
                    — Md. Asaduzzaman Sujon
                  </p>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: fluid("0.58rem", "1.4vw", "0.68rem") }}>
                    Founder, Harmony Organization
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons – stack on mobile */}
            <div
              className="flex flex-col sm:flex-row"
              style={{ gap: fluid("0.5rem", "2vw", "0.75rem") }}
            >
              <button
                className="btn-primary flex items-center justify-center w-full sm:w-auto"
                style={{
                  gap:      "0.45rem",
                  fontSize: fluid("0.72rem", "1.9vw", "0.875rem"),
                  padding:  `${fluid("9px", "2.2vw", "12px")} ${fluid("16px", "3.5vw", "28px")}`,
                }}
              >
                আমাদের সাথে যুক্ত হোন
                <ArrowRight style={{ width: "0.9rem", height: "0.9rem", flexShrink: 0 }} />
              </button>
              <button
                className="btn-secondary w-full sm:w-auto"
                style={{
                  fontSize: fluid("0.72rem", "1.9vw", "0.875rem"),
                  padding:  `${fluid("9px", "2.2vw", "12px")} ${fluid("16px", "3.5vw", "28px")}`,
                }}
              >
                আরও জানুন
              </button>
            </div>
          </motion.div>
        </div>

        {/* ════════════════════════════
            3ZF CORE VALUES
        ════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ marginBottom: fluid("2.5rem", "7vw", "5rem") }}
        >
          <h2
            className="font-heading font-bold"
            style={{
              color:        "var(--color-text)",
              fontSize:     fluid("1.05rem", "3.2vw", "1.5rem"),
              marginBottom: "0.375rem",
            }}
          >
            3ZF-এর{" "}
            <span style={{ color: "var(--color-brand)" }}>তিনটি মূল লক্ষ্য</span>
          </h2>
          <div
            className="rounded-full bg-gradient-to-r from-violet-600 to-transparent"
            style={{ width: "2.5rem", height: "2px", marginBottom: fluid("1.25rem", "3.5vw", "2rem") }}
          />

          <div
            className="grid grid-cols-1 sm:grid-cols-3"
            style={{ gap: fluid("0.65rem", "2.2vw", "1rem") }}
          >
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="card flex flex-col hover:-translate-y-0.5 transition-all duration-200"
                style={{
                  gap:     fluid("0.55rem", "1.8vw", "0.75rem"),
                  padding: fluid("0.9rem", "2.8vw", "1.25rem"),
                }}
              >
                <div
                  className="rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    background: "var(--color-brand)",
                    width:  fluid("26px", "5.5vw", "34px"),
                    height: fluid("26px", "5.5vw", "34px"),
                    fontSize: fluid("0.6rem", "1.4vw", "0.78rem"),
                  }}
                >
                  {`0${i + 1}`}
                </div>
                <h3
                  className="font-bold"
                  style={{
                    color:    "var(--color-text)",
                    fontSize: fluid("0.78rem", "2vw", "0.875rem"),
                  }}
                >
                  {v.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{
                    color:    "var(--color-text-secondary)",
                    fontSize: fluid("0.68rem", "1.7vw", "0.75rem"),
                  }}
                >
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════
            MILESTONES
        ════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{ marginBottom: fluid("2.5rem", "7vw", "5rem") }}
        >
          <h2
            className="font-heading font-bold"
            style={{
              color:        "var(--color-text)",
              fontSize:     fluid("1.05rem", "3.2vw", "1.5rem"),
              marginBottom: "0.375rem",
            }}
          >
            যাত্রার{" "}
            <span style={{ color: "var(--color-brand)" }}>মাইলফলক</span>
          </h2>
          <div
            className="rounded-full bg-gradient-to-r from-violet-600 to-transparent"
            style={{ width: "2.5rem", height: "2px", marginBottom: fluid("1.25rem", "3.5vw", "2rem") }}
          />

          <div className="relative">
            {/* Vertical timeline line – sm and up */}
            <div
              className="absolute hidden sm:block w-px top-5 bottom-5 left-4"
              style={{ background: "rgba(124,58,237,0.2)" }}
            />

            <div
              className="flex flex-col sm:pl-12"
              style={{ gap: fluid("0.55rem", "1.8vw", "0.9rem") }}
            >
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="card flex items-center relative"
                  style={{
                    gap:     fluid("0.65rem", "2.2vw", "1rem"),
                    padding: `${fluid("0.55rem", "1.8vw", "0.75rem")} ${fluid("0.7rem", "2.2vw", "1rem")}`,
                  }}
                >
                  {/* Dot */}
                  <div
                    className="absolute hidden sm:block rounded-full border-2"
                    style={{
                      background:  "var(--color-bg-secondary)",
                      borderColor: "var(--color-brand)",
                      width: "0.75rem", height: "0.75rem",
                      left: "-2.85rem",
                      top: "50%", transform: "translateY(-50%)",
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      width:  fluid("30px", "5.5vw", "38px"),
                      height: fluid("30px", "5.5vw", "38px"),
                    }}
                  >
                    <m.icon
                      style={{
                        color:  "var(--color-brand)",
                        width:  fluid("13px", "2.5vw", "15px"),
                        height: fluid("13px", "2.5vw", "15px"),
                      }}
                    />
                  </div>

                  <div>
                    <span
                      className="font-bold tabular-nums block"
                      style={{
                        color:    "var(--color-brand)",
                        fontSize: fluid("0.62rem", "1.5vw", "0.72rem"),
                      }}
                    >
                      {m.year}
                    </span>
                    <p
                      className="font-medium"
                      style={{
                        color:    "var(--color-text)",
                        fontSize: fluid("0.74rem", "2vw", "0.875rem"),
                      }}
                    >
                      {m.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}