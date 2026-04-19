"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  Handshake,
  Rocket,
  ShieldCheck,
  Trophy,
  Zap,
  Sparkles,
  Globe2,
  BookOpen,
  Star,
  Quote,
} from "lucide-react";

/* ── data ── */
const whyCards = [
  {
    title: "Real Mentorship",
    titleBn: "সত্যিকারের মেন্টরশিপ",
    desc: "অভিজ্ঞ উদ্যোক্তাদের সরাসরি গাইডলাইন ও ব্যক্তিগত পরামর্শ।",
    icon: Users,
  },
  {
    title: "Accountability",
    titleBn: "জবাবদিহিতা",
    desc: "আপনার কাজের প্রগ্রেস ট্র্যাক করার সুশৃঙ্খল সিস্টেম।",
    icon: Target,
  },
  {
    title: "Skill Development",
    titleBn: "দক্ষতা উন্নয়ন",
    desc: "সেলস, মার্কেটিং ও লিডারশিপ ট্রেনিং প্রোগ্রাম।",
    icon: Lightbulb,
  },
  {
    title: "Collaboration",
    titleBn: "সহযোগিতা",
    desc: "একই লক্ষ্য নিয়ে কাজ করা মানুষের শক্তিশালী নেটওয়ার্ক।",
    icon: Handshake,
  },
  {
    title: "Funding Support",
    titleBn: "বিনিয়োগ সহায়তা",
    desc: "যোগ্য উদ্যোক্তাদের জন্য সরাসরি বিনিয়োগ সহায়তা।",
    icon: TrendingUp,
  },
];

const missionItems = [
  "নিজের সক্ষমতা আবিষ্কার করতে পারে",
  "মানসিকভাবে শক্ত ও আত্মবিশ্বাসী হতে পারে",
  "বাস্তব দক্ষতা অর্জন করে নিজের ব্যবসা শুরু করতে পারে",
  "নৈতিকতা ও সততার সাথে ব্যবসা পরিচালনা করতে পারে",
  "নিজের পাশাপাশি অন্যদের জন্য কর্মসংস্থান তৈরি করতে পারে",
];

const visionItems = [
  "প্রতিটি এলাকায় দক্ষ উদ্যোক্তা তৈরি হবে",
  "বেকারত্ব কমে গিয়ে কর্মসংস্থান বৃদ্ধি পাবে",
  "ছোট উদ্যোগ বড় প্রতিষ্ঠানে পরিণত হবে",
  "তরুণরা চাকরির অপেক্ষা না করে নিজেই সুযোগ তৈরি করবে",
  "নৈতিক ব্যবসার মাধ্যমে সমাজে ইতিবাচক পরিবর্তন আসবে",
];

const fairBadges = ["পণ্য প্রদর্শনী", "বিনিয়োগকারী সংযোগ", "বাস্তব অভিজ্ঞতা"];

const tags = ["Mentorship", "Community", "Opportunity", "Discipline", "Execution"];

/* ── fluid helper (same as founder page) ── */
const f = (min: string, mid: string, max: string) =>
  `clamp(${min}, ${mid}, ${max})`;

export default function EntrepreneurPage() {
  return (
    <section
      className="relative overflow-hidden min-h-screen"
      style={{
        background: "var(--color-bg-secondary)",
        paddingTop:    f("3.5rem", "8vw",  "5rem"),
        paddingBottom: f("2.5rem", "6vw",  "4rem"),
        paddingLeft:   f("1rem",   "4vw",  "1.5rem"),
        paddingRight:  f("1rem",   "4vw",  "1.5rem"),
      }}
    >
      {/* brand overlay */}
      <div className="absolute inset-0 gradient-brand opacity-[0.04] pointer-events-none" />

      {/* dot-grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-brand) 1px, transparent 1px)," +
            "linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)",
          backgroundSize: `${f("36px","6vw","56px")} ${f("36px","6vw","56px")}`,
        }}
      />

      {/* accent orb */}
      <div
        className="absolute hidden sm:block rounded-full pointer-events-none blur-3xl opacity-[0.07]"
        style={{
          background: "var(--color-brand)",
          width:  f("180px","38vw","360px"),
          height: f("180px","38vw","360px"),
          top: "8rem", right: "-3rem",
        }}
      />

      <div className="relative mx-auto w-full" style={{ maxWidth: "72rem" }}>

        {/* ══════════════════
            HERO / ABOUT
        ══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{ gap: f("2rem","5vw","4rem"), marginBottom: f("2.5rem","7vw","5rem") }}
        >
          {/* LEFT: info */}
          <div className="flex flex-col" style={{ gap: f("0.9rem","2.5vw","1.25rem") }}>
            {/* chip */}
            <div
              className="inline-flex items-center w-fit rounded-full font-semibold tracking-wide border"
              style={{
                background: "rgba(124,58,237,0.08)",
                borderColor: "rgba(124,58,237,0.25)",
                color: "var(--color-brand)",
                gap: "0.375rem",
                padding: `0.25rem ${f("0.6rem","1.5vw","0.75rem")}`,
                fontSize: f("0.62rem","1.5vw","0.75rem"),
              }}
            >
              <Zap style={{ width: "0.7rem", height: "0.7rem" }} />
              Harmony Entrepreneur Association
            </div>

            {/* heading */}
            <div>
              <h1 className="font-heading font-bold leading-tight mb-1" style={{ color: "var(--color-text)" }}>
                <span
                  className="bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent block"
                  style={{ fontSize: f("1.6rem","5.5vw","3rem") }}
                >
                  HARMONY
                </span>
                <span className="block" style={{ fontSize: f("1rem","3.5vw","1.875rem"), marginTop: "0.25rem" }}>
                  Entrepreneur Association
                </span>
              </h1>
              <div className="w-10 h-0.5 rounded-full bg-gradient-to-r from-violet-600 to-transparent" />
            </div>

            {/* body */}
            <p
              className="leading-relaxed"
              style={{
                color: "var(--color-text-secondary)",
                fontSize: f("0.8rem","2vw","0.93rem"),
              }}
            >
              হারমনি উদ্যোক্তা এসোসিয়েশন একটি কমিউনিটি-ড্রিভেন উদ্যোক্তা প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো একজন মানুষকে শূন্য থেকে শুরু করে বাস্তব উদ্যোক্তা হিসেবে গড়ে তোলার জন্য প্রয়োজনীয় মানসিকতা, জ্ঞান এবং নেটওয়ার্ক তৈরি করে দেওয়া।
            </p>

            {/* tags */}
            <div className="flex flex-wrap" style={{ gap: f("6px","1.5vw","8px") }}>
              {tags.map((t) => (
                <div
                  key={t}
                  className="inline-flex items-center rounded-full border"
                  style={{
                    background: "rgba(124,58,237,0.06)",
                    borderColor: "rgba(124,58,237,0.18)",
                    color: "var(--color-text-secondary)",
                    gap: "5px",
                    padding: `${f("4px","1vw","5px")} ${f("10px","2vw","14px")}`,
                    fontSize: f("0.65rem","1.5vw","0.75rem"),
                    fontWeight: 500,
                  }}
                >
                  <ShieldCheck style={{ width: "11px", height: "11px", color: "var(--color-brand)", flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>

            {/* blockquote */}
            <div
              className="card"
              style={{
                borderLeft: "3px solid var(--color-brand)",
                borderRadius: "0 12px 12px 0",
                padding: f("0.85rem","2.5vw","1.1rem"),
                fontSize: f("0.72rem","1.8vw","0.85rem"),
                fontStyle: "italic",
                color: "var(--color-text-secondary)",
                lineHeight: "1.75",
              }}
            >
              "আইডিয়া নয়, বাস্তবায়নই সফলতা আনে—একা নয়, একসাথে এগোলে সফলতা দ্রুত আসে।"
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row" style={{ gap: f("0.5rem","2vw","0.75rem") }}>
              <button
                className="btn-primary flex items-center justify-center w-full sm:w-auto"
                style={{
                  gap: "0.45rem",
                  fontSize: f("0.72rem","1.9vw","0.875rem"),
                  padding: `${f("9px","2.2vw","12px")} ${f("16px","3.5vw","28px")}`,
                }}
              >
                Start Your Journey Today
                <ArrowRight style={{ width: "0.9rem", height: "0.9rem", flexShrink: 0 }} />
              </button>
              <button
                className="btn-secondary w-full sm:w-auto"
                style={{
                  fontSize: f("0.72rem","1.9vw","0.875rem"),
                  padding: `${f("9px","2.2vw","12px")} ${f("16px","3.5vw","28px")}`,
                }}
              >
                আরও জানুন
              </button>
            </div>
          </div>

          {/* RIGHT: decorative tile */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              className="card relative overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(124,58,237,0.06)",
                borderColor: "rgba(124,58,237,0.2)",
                height: f("160px","28vw","260px"),
              }}
            >
              <div
                className="absolute rounded-full blur-3xl opacity-20"
                style={{
                  background: "var(--color-brand)",
                  width: "60%", height: "60%",
                  top: "20%", left: "20%",
                }}
              />
              <p
                className="font-heading font-bold relative z-10 text-center"
                style={{
                  color: "var(--color-brand)",
                  fontSize: f("1.1rem","3.5vw","2rem"),
                  lineHeight: 1.3,
                  padding: f("1rem","3vw","1.5rem"),
                }}
              >
                Action Oriented
                <span
                  className="block"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: f("0.65rem","1.6vw","0.8rem"),
                    fontWeight: 400,
                    marginTop: "0.5rem",
                  }}
                >
                  স্বপ্ন থেকে বাস্তব—একসাথে এগিয়ে যাওয়ার প্ল্যাটফর্ম
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ══════════════════
            MISSION & VISION
        ══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: f("2.5rem","7vw","5rem") }}
        >
          <h2
            className="font-heading font-bold"
            style={{
              color: "var(--color-text)",
              fontSize: f("1.05rem","3.2vw","1.5rem"),
              marginBottom: "0.375rem",
            }}
          >
            Mission{" "}
            <span style={{ color: "var(--color-brand)" }}>&amp; Vision</span>
          </h2>
          <div
            className="rounded-full bg-gradient-to-r from-violet-600 to-transparent"
            style={{ width: "2.5rem", height: "2px", marginBottom: f("1.25rem","3.5vw","2rem") }}
          />

          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{ gap: f("0.8rem","2.5vw","1.25rem") }}
          >
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card flex flex-col"
              style={{
                gap: f("0.7rem","2vw","1rem"),
                padding: f("1rem","3.5vw","1.5rem"),
              }}
            >
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(124,58,237,0.12)",
                  width: f("36px","6vw","46px"), height: f("36px","6vw","46px"),
                }}
              >
                <Target style={{ color: "var(--color-brand)", width: f("16px","2.8vw","20px"), height: f("16px","2.8vw","20px") }} />
              </div>
              <h3
                className="font-bold font-heading"
                style={{ color: "var(--color-text)", fontSize: f("0.85rem","2.2vw","1rem") }}
              >
                Our Mission
              </h3>
              <ul className="flex flex-col" style={{ gap: "10px" }}>
                {missionItems.map((item, i) => (
                  <li key={i} className="flex items-start" style={{ gap: "10px" }}>
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{
                        background: "var(--color-brand)",
                        width: "6px", height: "6px",
                        marginTop: "6px",
                        boxShadow: "0 0 6px rgba(124,58,237,0.5)",
                      }}
                    />
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: f("0.7rem","1.7vw","0.82rem"),
                        lineHeight: 1.65,
                        fontWeight: 300,
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="card flex flex-col"
              style={{
                gap: f("0.7rem","2vw","1rem"),
                padding: f("1rem","3.5vw","1.5rem"),
              }}
            >
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(124,58,237,0.12)",
                  width: f("36px","6vw","46px"), height: f("36px","6vw","46px"),
                }}
              >
                <Rocket style={{ color: "var(--color-brand)", width: f("16px","2.8vw","20px"), height: f("16px","2.8vw","20px") }} />
              </div>
              <h3
                className="font-bold font-heading"
                style={{ color: "var(--color-text)", fontSize: f("0.85rem","2.2vw","1rem") }}
              >
                Our Vision
              </h3>
              <ul className="flex flex-col" style={{ gap: "10px" }}>
                {visionItems.map((item, i) => (
                  <li key={i} className="flex items-start" style={{ gap: "10px" }}>
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{
                        background: "var(--color-brand)",
                        width: "6px", height: "6px",
                        marginTop: "6px",
                        boxShadow: "0 0 6px rgba(124,58,237,0.5)",
                      }}
                    />
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: f("0.7rem","1.7vw","0.82rem"),
                        lineHeight: 1.65,
                        fontWeight: 300,
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* ══════════════════
            WHY DIFFERENT
        ══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginBottom: f("2.5rem","7vw","5rem") }}
        >
          <h2
            className="font-heading font-bold"
            style={{
              color: "var(--color-text)",
              fontSize: f("1.05rem","3.2vw","1.5rem"),
              marginBottom: "0.375rem",
            }}
          >
            Why Harmony E.A. is{" "}
            <span style={{ color: "var(--color-brand)" }}>Different?</span>
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: f("0.68rem","1.7vw","0.78rem"), marginBottom: "0.375rem" }}>
            অনেক সংগঠন শুধু কথা বলে, আমরা কাজে বিশ্বাসী।
          </p>
          <div
            className="rounded-full bg-gradient-to-r from-violet-600 to-transparent"
            style={{ width: "2.5rem", height: "2px", marginBottom: f("1.25rem","3.5vw","2rem") }}
          />

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: f("0.65rem","2.2vw","1rem") }}
          >
            {whyCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="card flex flex-col hover:-translate-y-0.5 transition-all duration-200"
                style={{
                  gap: f("0.55rem","1.8vw","0.75rem"),
                  padding: f("0.9rem","2.8vw","1.25rem"),
                }}
              >
                <div
                  className="rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(124,58,237,0.12)",
                    width: f("34px","5.5vw","42px"), height: f("34px","5.5vw","42px"),
                  }}
                >
                  <card.icon
                    style={{
                      color: "var(--color-brand)",
                      width: f("14px","2.5vw","17px"), height: f("14px","2.5vw","17px"),
                    }}
                  />
                </div>
                <div>
                  <h4
                    className="font-bold"
                    style={{ color: "var(--color-text)", fontSize: f("0.78rem","2vw","0.9rem"), marginBottom: "2px" }}
                  >
                    {card.title}
                  </h4>
                  <p
                    style={{
                      color: "var(--color-brand)",
                      fontSize: f("0.6rem","1.4vw","0.7rem"),
                      fontWeight: 500,
                    }}
                  >
                    {card.titleBn}
                  </p>
                </div>
                <p
                  className="leading-relaxed"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: f("0.68rem","1.6vw","0.75rem"),
                  }}
                >
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════
            ENTREPRENEUR FAIR
        ══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginBottom: f("2.5rem","7vw","5rem") }}
        >
          <div
            className="card relative overflow-hidden text-center"
            style={{
              background: "rgba(124,58,237,0.06)",
              borderColor: "rgba(124,58,237,0.2)",
              padding: `${f("1.5rem","5vw","3rem")} ${f("1rem","4vw","2.5rem")}`,
            }}
          >
            <Trophy
              className="absolute opacity-[0.05]"
              style={{
                color: "var(--color-brand)",
                width: f("70px","13vw","140px"), height: f("70px","13vw","140px"),
                right: "-1rem", bottom: "-1rem",
              }}
            />

            <div
              className="inline-flex items-center justify-center rounded-xl mb-4"
              style={{
                background: "rgba(124,58,237,0.12)",
                width: f("42px","7vw","52px"), height: f("42px","7vw","52px"),
              }}
            >
              <Trophy style={{ color: "var(--color-brand)", width: f("18px","3vw","22px"), height: f("18px","3vw","22px") }} />
            </div>

            <h2
              className="font-heading font-bold"
              style={{
                color: "var(--color-text)",
                fontSize: f("1rem","3.2vw","1.5rem"),
                marginBottom: "0.75rem",
              }}
            >
              🏆 Entrepreneur Fair &amp;{" "}
              <span style={{ color: "var(--color-brand)" }}>Funding</span>
            </h2>

            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: f("0.72rem","1.8vw","0.875rem"),
                lineHeight: 1.7,
                marginBottom: f("1rem","3vw","1.5rem"),
              }}
            >
              হারমনি উদ্যোক্তা এসোসিয়েশন নিয়মিত উদ্যোক্তা মেলার আয়োজন করবে, যেখানে{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 600 }}>উদ্যোক্তারা তাদের পণ্য প্রদর্শন করবে</span>,{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 600 }}>ক্রেতা ও বিনিয়োগকারীদের সাথে সংযোগ হবে</span> এবং{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 600 }}>বাস্তব ব্যবসার অভিজ্ঞতা অর্জন হবে।</span>
            </p>

            <div className="flex flex-wrap justify-center" style={{ gap: f("8px","2vw","12px") }}>
              {fairBadges.map((b) => (
                <div
                  key={b}
                  className="inline-flex items-center rounded-full border"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    borderColor: "rgba(124,58,237,0.25)",
                    color: "var(--color-text-secondary)",
                    gap: "7px",
                    padding: `${f("5px","1.5vw","7px")} ${f("12px","2.5vw","18px")}`,
                    fontSize: f("0.65rem","1.5vw","0.78rem"),
                    fontWeight: 500,
                  }}
                >
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{ background: "var(--color-brand)", width: "5px", height: "5px" }}
                  />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

    
        {/* ══════════════════
            FOOTER CTA
        ══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52 }}
        >
          <div
            className="card relative overflow-hidden text-center"
            style={{
              background: "rgba(124,58,237,0.06)",
              borderColor: "rgba(124,58,237,0.2)",
              padding: `${f("1.5rem","5vw","3rem")} ${f("1rem","4vw","2.5rem")}`,
            }}
          >
            <Users
              className="absolute opacity-[0.05]"
              style={{
                color: "var(--color-brand)",
                width: f("70px","13vw","140px"), height: f("70px","13vw","140px"),
                right: "-1rem", bottom: "-1rem",
              }}
            />

            <div
              className="inline-flex items-center rounded-full font-semibold tracking-wide border"
              style={{
                background: "rgba(124,58,237,0.08)",
                borderColor: "rgba(124,58,237,0.25)",
                color: "var(--color-brand)",
                padding: `0.25rem ${f("0.6rem","1.5vw","0.75rem")}`,
                fontSize: f("0.62rem","1.5vw","0.72rem"),
                marginBottom: f("0.7rem","2vw","1rem"),
              }}
            >
              Join Today
            </div>

            <h2
              className="font-heading font-bold"
              style={{
                color: "var(--color-text)",
                fontSize: f("0.95rem","3vw","1.5rem"),
                marginBottom: "0.5rem",
                lineHeight: "1.35",
              }}
            >
              আপনি কি সত্যিই আপনার জীবন পরিবর্তন করতে চান?
            </h2>

            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: f("0.72rem","1.9vw","0.875rem"),
                marginBottom: f("1rem","3vw","1.75rem"),
              }}
            >
              আজই যুক্ত হোন আমাদের হারমনি পরিবারের সাথে।
            </p>

            <button
              className="btn-primary inline-flex items-center justify-center mx-auto"
              style={{
                gap: "0.45rem",
                fontSize: f("0.68rem","1.8vw","0.875rem"),
                padding: `${f("9px","2.2vw","13px")} ${f("14px","3.5vw","28px")}`,
                maxWidth: "100%",
                whiteSpace: "normal",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              Join Harmony Entrepreneur Association
              <ChevronRight style={{ width: "0.9rem", height: "0.9rem", flexShrink: 0 }} />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}