"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart, Lightbulb, CloudRain, Globe,
  Leaf, TrendingUp, Sun, Users, ShieldCheck,
  ChevronRight, Zap, ArrowRight, Lock, Globe2, Zap as ZapIcon,
} from "lucide-react";

// swap with your auth hook:
// import { useSession } from "next-auth/react";
// import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

const ICON_COLORS = [
  "from-rose-500 to-red-600",
  "from-yellow-400 to-amber-600",
  "from-sky-400 to-blue-600",
  "from-violet-500 to-purple-700",
  "from-emerald-400 to-green-700",
  "from-blue-400 to-blue-700",
  "from-orange-400 to-amber-600",
];

const philosophies = [
  { letter: "H", title: "Humanity Aid",       bnTitle: "মানবিক সহায়তা",           description: "দুর্বল, অসহায় ও বিপদগ্রস্ত মানুষের পাশে উপকরণ ও মানসিক সমর্থনে দাঁড়ানো।", icon: Heart },
  { letter: "A", title: "Awareness",          bnTitle: "সামাজিক সচেতনতা",         description: "নৈতিকতা, শিক্ষা, স্বাস্থ্য ও অধিকার সম্পর্কে সচেতনতা বৃদ্ধি।",              icon: Lightbulb },
  { letter: "R", title: "Relief",             bnTitle: "দুর্যোগকালীন ত্রাণ",      description: "বন্যা, শীত বা যেকোনো দুর্যোগে সবার আগে মানুষের কাছে পৌঁছে যাওয়া।",        icon: CloudRain },
  { letter: "M", title: "Mutual Cooperation", bnTitle: "প্রবাসী সহযোগিতা",        description: "প্রবাসীদের পারিবারিক সাপোর্ট, প্রতারণা প্রতিরোধ ও মানবিক সহায়তা।",        icon: Globe },
  { letter: "O", title: "Oxygen for Nature",  bnTitle: "পরিবেশ রক্ষা",            description: "বৃক্ষরোপণ ও প্লাস্টিকমুক্ত ক্যাম্পেইনের মাধ্যমে প্রকৃতি সুরক্ষা।",        icon: Leaf },
  { letter: "N", title: "Nurturing",          bnTitle: "টেকসই উন্নয়ন",            description: "কর্মসংস্থান সৃষ্টি ও যুবদের দক্ষতা উন্নয়নের মাধ্যমে স্বাবলম্বী করা।",     icon: TrendingUp },
  { letter: "Y", title: "Yearning",           bnTitle: "সুন্দর আগামীর আকাঙ্ক্ষা", description: "ন্যায় ও সম্প্রীতিকে কেন্দ্র করে একটি উন্নত বাংলাদেশের স্বপ্ন।",         icon: Sun },
];

const tasks = [
  "গ্রামভিত্তিক কমিউনিটি টিম",
  "ফিল্ড ভলান্টিয়ার নেটওয়ার্ক",
  "জরুরি রেসপন্স টিম",
  "যুব নেতৃত্ব দল",
  "নারী সাপোর্ট গ্রুপ",
  "প্রবাসী সাপোর্ট টিম",
];

const stats = [
  { value: "৭টি", label: "মূল দর্শন" },
  { value: "৬টি", label: "কাজের ধারা" },
  { value: "৬৪",  label: "জেলা লক্ষ্য" },
];



export default function HarmonyAbout() {
  const router = useRouter();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const handleJoinClick = () =>
    router.push(isLoggedIn ? "/community" : "/register");

  return (
    <section
      className="relative overflow-hidden min-h-screen pt-20 pb-16 px-4"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* Tint overlay */}
      <div className="absolute inset-0 gradient-brand opacity-[0.04] pointer-events-none" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-brand) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="max-w-6xl mx-auto w-full relative">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-20">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border"
              style={{
                background:  "rgba(107,70,193,0.08)",
                borderColor: "rgba(107,70,193,0.25)",
                color:       "var(--color-brand)",
              }}
            >
              <Zap className="w-3 h-3" />
              HARMONY অর্থ সম্প্রীতি
            </div>

            <h1 className="font-heading font-bold leading-[1.05] mb-3" style={{ color: "var(--color-text)" }}>
              <span className="block text-6xl md:text-8xl bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
                HARMONY
              </span>
              <span className="block text-2xl md:text-3xl mt-2">Organization</span>
            </h1>

            <p className="text-sm tracking-widest mb-5" style={{ color: "var(--color-text-secondary)" }}>
              সম্প্রীতি · সেবা · পরিবর্তন
            </p>

            <div className="w-10 h-0.5 rounded-full mb-5 bg-gradient-to-r from-violet-600 to-transparent" />

            <blockquote
              className="italic text-sm leading-relaxed mb-8 pl-3 border-l-2"
              style={{
                color:       "var(--color-text-secondary)",
                borderColor: "var(--color-brand-light)",
              }}
            >
              একজন মানুষ পরিবর্তিত হলে, একটি পরিবার বদলায়।
              একটি পরিবার বদলালে, একটি সমাজ বদলায়।
              আর সমাজ বদলালে — একটি বাংলাদেশ বদলে যায়।
            </blockquote>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleJoinClick}
                className="btn-primary text-sm px-7 py-3 flex items-center justify-center gap-2"
              >
                {isLoggedIn ? "কমিউনিটিতে যান" : "নিবন্ধন করুন"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("harmony-philosophy")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="btn-secondary text-sm px-7 py-3"
              >
                আরও জানুন
              </button>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            {/* Info card — uses .card class, no inline background */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ color: "var(--color-brand)" }}>
                <ShieldCheck className="w-4 h-4" />
                3ZF-এর মাঠপর্যায়ের প্ল্যাটফর্ম
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-text-secondary)" }}>
                3ZF দর্শন পথ দেখায় — আর Harmony মানুষের জীবনে সেই পরিবর্তন
                বাস্তবে রূপ দেয়। এটি একটি মানবিক আন্দোলন এবং সমাজ
                পরিবর্তনের প্রতিজ্ঞা।
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {stats.map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-heading text-xl font-bold" style={{ color: "var(--color-brand)" }}>
                      {s.value}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══ PHILOSOPHY ════════════════════════════════════════════════════ */}
        <motion.div
          id="harmony-philosophy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20 scroll-mt-24"
        >
          <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            HARMONY-এর{" "}
            <span style={{ color: "var(--color-brand)" }}>৭টি মূল দর্শন</span>
          </h2>
          <div className="w-10 h-0.5 rounded-full mb-8 bg-gradient-to-r from-violet-600 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {philosophies.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="card flex flex-col gap-2 hover:-translate-y-0.5 transition-transform duration-200 cursor-default"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ICON_COLORS[i]} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold" style={{ color: "var(--color-brand)" }}>{p.letter}</span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{p.title}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-brand-light)" }}>{p.bnTitle}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {p.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ══ HOW WE WORK ═══════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Harmony{" "}
            <span style={{ color: "var(--color-brand)" }}>কীভাবে কাজ করে?</span>
          </h2>
          <div className="w-10 h-0.5 rounded-full mb-8 bg-gradient-to-r from-violet-600 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Task list */}
            <div className="flex flex-col gap-3">
              {tasks.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.07 }}
                  className="card flex items-center gap-3 !py-3 !px-4"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--color-brand)" }} />
                  <span className="text-sm" style={{ color: "var(--color-text)" }}>{t}</span>
                </motion.div>
              ))}
            </div>

            {/* Promo card — brand tint via bg-tertiary, no inline background */}
            <div
              className="card relative overflow-hidden"
              style={{ borderColor: "rgba(107,70,193,0.3)", background: "var(--color-bg-tertiary)" }}
            >
              <Users
                className="absolute -right-5 -bottom-5 opacity-[0.06]"
                style={{ width: 120, height: 120, color: "var(--color-brand)" }}
              />
              <h3 className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>
                <span style={{ color: "var(--color-brand)" }}>সম্প্রীতি + সেবা</span> = পরিবর্তন
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-text-secondary)" }}>
                প্রতিটি মানুষকে আত্মনির্ভর করে তোলাই Harmony-এর অঙ্গীকার।
                আমরা বিশ্বাস করি — ঐক্য ও সম্প্রীতির সম্মিলিত শক্তিই পারে
                একটি সমাজকে টেকসই অগ্রগতির পথে নিয়ে যেতে।
              </p>
              <button
                onClick={handleJoinClick}
                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
              >
                {isLoggedIn ? "কমিউনিটিতে যান" : "নিবন্ধন করুন"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}