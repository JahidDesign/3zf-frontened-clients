"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  Handshake,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";

const f = (min: string, mid: string, max: string) => `clamp(${min}, ${mid}, ${max})`;

const previewCards = [
  { title: "Real Mentorship",   titleBn: "সত্যিকারের মেন্টরশিপ", icon: Users     },
  { title: "Accountability",    titleBn: "জবাবদিহিতা",           icon: Target    },
  { title: "Skill Development", titleBn: "দক্ষতা উন্নয়ন",        icon: Lightbulb },
  { title: "Collaboration",     titleBn: "সহযোগিতা",             icon: Handshake },
  { title: "Funding Support",   titleBn: "বিনিয়োগ সহায়তা",      icon: TrendingUp },
];

const tags = ["Mentorship", "Community", "Opportunity", "Discipline", "Execution"];

export default function EntrepreneurPreview() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:    "var(--color-bg-secondary)",
        paddingTop:    f("2.5rem","7vw","4rem"),
        paddingBottom: f("2.5rem","7vw","4rem"),
        paddingLeft:   f("1rem","4vw","1.5rem"),
        paddingRight:  f("1rem","4vw","1.5rem"),
      }}
    >
      {/* bg effects */}
      <div className="absolute inset-0 gradient-brand opacity-[0.04] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-brand) 1px, transparent 1px)," +
            "linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)",
          backgroundSize: `${f("36px","6vw","56px")} ${f("36px","6vw","56px")}`,
        }}
      />
      <div
        className="absolute hidden sm:block rounded-full pointer-events-none blur-3xl opacity-[0.06]"
        style={{
          background: "var(--color-brand)",
          width: f("160px","32vw","300px"), height: f("160px","32vw","300px"),
          top: "4rem", right: "-2rem",
        }}
      />

      <div className="relative mx-auto w-full" style={{ maxWidth: "72rem" }}>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="grid grid-cols-1 lg:grid-cols-2 items-center"
          style={{ gap: f("2rem","5vw","4rem"), marginBottom: f("2rem","5vw","3.5rem") }}
        >
          {/* LEFT */}
          <div className="flex flex-col" style={{ gap: f("0.8rem","2.2vw","1.1rem") }}>
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
              <h2 className="font-heading font-bold leading-tight mb-1" style={{ color: "var(--color-text)" }}>
                <span
                  className="bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent block"
                  style={{ fontSize: f("1.5rem","5vw","2.75rem") }}
                >
                  HARMONY
                </span>
                <span className="block" style={{ fontSize: f("0.95rem","3.2vw","1.75rem"), marginTop: "0.2rem" }}>
                  Entrepreneur Association
                </span>
              </h2>
              <div className="w-10 h-0.5 rounded-full bg-gradient-to-r from-violet-600 to-transparent" />
            </div>

            <p
              className="leading-relaxed"
              style={{ color: "var(--color-text-secondary)", fontSize: f("0.78rem","1.9vw","0.9rem") }}
            >
              হারমনি উদ্যোক্তা এসোসিয়েশন একটি কমিউনিটি-ড্রিভেন প্ল্যাটফর্ম যেখানে শূন্য থেকে শুরু করে বাস্তব উদ্যোক্তা হওয়ার সুযোগ পাবেন।
            </p>

            {/* tags */}
            <div className="flex flex-wrap" style={{ gap: f("5px","1.3vw","7px") }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center rounded-full border"
                  style={{
                    background: "rgba(124,58,237,0.06)",
                    borderColor: "rgba(124,58,237,0.18)",
                    color: "var(--color-text-secondary)",
                    gap: "5px",
                    padding: `${f("3px","0.9vw","4px")} ${f("9px","1.8vw","13px")}`,
                    fontSize: f("0.62rem","1.4vw","0.72rem"),
                    fontWeight: 500,
                  }}
                >
                  <ShieldCheck style={{ width: "10px", height: "10px", color: "var(--color-brand)", flexShrink: 0 }} />
                  {tag}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row" style={{ gap: f("0.5rem","2vw","0.75rem") }}>
              <Link
                href="/association"
                className="btn-primary flex items-center justify-center w-full sm:w-auto"
                style={{
                  gap: "0.45rem",
                  fontSize: f("0.72rem","1.9vw","0.875rem"),
                  padding: `${f("9px","2.2vw","12px")} ${f("16px","3.5vw","28px")}`,
                }}
              >
                Start Your Journey Today
                <ArrowRight style={{ width: "0.9rem", height: "0.9rem", flexShrink: 0 }} />
              </Link>
              <Link
                href="/about"
                className="btn-secondary w-full sm:w-auto"
                style={{
                  fontSize: f("0.72rem","1.9vw","0.875rem"),
                  padding: `${f("9px","2.2vw","12px")} ${f("16px","3.5vw","28px")}`,
                }}
              >
                আরও জানুন
              </Link>
            </div>
          </div>

          {/* RIGHT — blurred preview hint */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              className="card relative overflow-hidden flex flex-col items-center justify-center gap-3"
              style={{
                background: "rgba(124,58,237,0.06)",
                borderColor: "rgba(124,58,237,0.2)",
                height: f("160px","28vw","240px"),
              }}
            >
              <div
                className="absolute rounded-full blur-3xl opacity-20"
                style={{ background: "var(--color-brand)", width: "55%", height: "55%", top: "22%", left: "22%" }}
              />

              {/* lock hint */}
              <div
                className="relative z-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(124,58,237,0.12)",
                  border: "1.5px solid rgba(124,58,237,0.2)",
                  width: f("40px","6vw","50px"), height: f("40px","6vw","50px"),
                }}
              >
                <Lock style={{ color: "var(--color-brand)", width: f("18px","3vw","22px"), height: f("18px","3vw","22px") }} />
              </div>

              <p
                className="font-heading font-bold relative z-10 text-center"
                style={{
                  color: "var(--color-brand)",
                  fontSize: f("0.85rem","2.8vw","1.4rem"),
                  lineHeight: 1.3,
                  padding: `0 ${f("1rem","3vw","1.5rem")}`,
                }}
              >
                সদস্যদের জন্য এক্সক্লুসিভ
                <span
                  className="block"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: f("0.6rem","1.4vw","0.72rem"),
                    fontWeight: 400,
                    marginTop: "0.4rem",
                  }}
                >
                  লগইন করুন এবং সম্পূর্ণ সুবিধা উপভোগ করুন
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── PREVIEW CARDS (blurred / teaser) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          {/* section label */}
          <div className="flex items-center justify-between" style={{ marginBottom: f("0.9rem","2.5vw","1.25rem") }}>
            <div>
              <h3
                className="font-heading font-bold"
                style={{ color: "var(--color-text)", fontSize: f("0.9rem","2.5vw","1.2rem") }}
              >
                কেন আমরা{" "}
                <span style={{ color: "var(--color-brand)" }}>আলাদা?</span>
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: f("0.65rem","1.6vw","0.75rem"), marginTop: "2px" }}>
                অনেক সংগঠন শুধু কথা বলে, আমরা কাজে বিশ্বাসী।
              </p>
            </div>
            <Link
              href="/association"
              className="btn-secondary flex items-center flex-shrink-0"
              style={{
                gap: "5px",
                fontSize: f("0.62rem","1.4vw","0.72rem"),
                padding: `${f("6px","1.5vw","8px")} ${f("10px","2vw","14px")}`,
              }}
            >
              সব দেখুন
              <ArrowRight style={{ width: "12px", height: "12px" }} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: f("0.55rem","1.8vw","0.85rem") }}>
            {previewCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
              >
                <Link
                  href="/association"
                  className="card flex flex-col items-center text-center hover:-translate-y-0.5 transition-all duration-200 group"
                  style={{
                    gap: f("0.5rem","1.5vw","0.65rem"),
                    padding: f("0.85rem","2.5vw","1.1rem"),
                    borderColor: "rgba(124,58,237,0.12)",
                  }}
                >
                  <div
                    className="rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(124,58,237,0.1)",
                      width: f("32px","5vw","40px"), height: f("32px","5vw","40px"),
                      transition: "background 0.2s",
                    }}
                  >
                    <card.icon
                      style={{
                        color: "var(--color-brand)",
                        width: f("13px","2.2vw","16px"), height: f("13px","2.2vw","16px"),
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--color-text)", fontSize: f("0.68rem","1.6vw","0.78rem"), marginBottom: "2px" }}>
                      {card.title}
                    </p>
                    <p style={{ color: "var(--color-brand)", fontSize: f("0.58rem","1.2vw","0.65rem"), fontWeight: 500 }}>
                      {card.titleBn}
                    </p>
                  </div>
                  <Lock
                    className="opacity-30 group-hover:opacity-60 transition-opacity"
                    style={{ color: "var(--color-text-muted)", width: "10px", height: "10px" }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}