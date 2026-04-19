'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Wheat, Home, BookOpen } from 'lucide-react'

export default function HarmonyShop() {

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
      desc: "প্রতি উপজেলা ভিত্তিক সুপারভাইজার ও মার্কেটিং এক্সিকিউটিভ নিয়োগ।",
    },
    {
      num: "০৪",
      title: "ডিজিটাল স্বচ্ছতা",
      desc: "ইনভেন্টরি, বিক্রয় ও হিসাব—সবকিছু ট্র্যাকযোগ্য।",
    },
  ]

  const diffItems = [
    "মুনাফা-কেন্দ্রিক নয়, ভারসাম্য-কেন্দ্রিক",
    "সামাজিক প্রভাব ও ব্যবসার সমন্বয়",
    "স্থানীয় পুঁজি স্থানীয় উন্নয়নে",
    "পরিকল্পিত সম্প্রসারণ কাঠামো",
  ]

  const proofPillars = [
    { num: "০১", title: "ন্যায্য মূল্য", desc: "স্বচ্ছ মার্জিন, নির্ধারিত মূল্য" },
    { num: "০২", title: "সমান সুযোগ", desc: "উদ্যোক্তা থেকে ভোক্তা — সবার জন্য একই মঞ্চ" },
    { num: "০৩", title: "স্বচ্ছ তথ্য", desc: "ডিজিটাল ট্র্যাকিং নিশ্চিত করে জবাবদিহিতা" },
  ]

  const outcomes = [
    "একজন উদ্যোক্তা বাজার পায়",
    "একজন যুবক কর্মসংস্থান পায়",
    "একজন ভোক্তা ন্যায্য মূল্য পায়",
  ]

  const offerItems = [
    { title: "দৈনন্দিন পণ্য", desc: "বিশ্বস্ত উৎস থেকে মানসম্মত খাদ্য ও নিত্যপ্রয়োজনীয় পণ্য" },
    { title: "উদ্যোক্তা কর্নার", desc: "স্থানীয় উৎপাদকদের বিক্রয় সুবিধা" },
    { title: "কর্মসংস্থান", desc: "মার্কেটিং ও ব্যবস্থাপনা পর্যায়ে সুযোগ" },
    { title: "স্বচ্ছ সিস্টেম", desc: "ডিজিটাল ইনভেন্টরি ও ট্র্যাকিং" },
  ]

  const needItems = [
    "খাদ্য নিরাপত্তা",
    "বস্ত্র ও নিত্যপ্রয়োজনীয় পণ্য",
    "বাসস্থান নিরাপত্তা",
    "শিক্ষা সক্ষমতা",
    "স্বাস্থ্য সুরক্ষা",
  ]

  const whoTags = ["উদ্যোক্তা", "সচেতন ভোক্তা", "বিনিয়োগকারী", "সমাজ পরিবর্তনের অংশীদার"]

  return (
    <main className="bg-[var(--color-bg-secondary)]">

      {/* HERO */}
      <section className="min-h-screen flex items-center px-4 py-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">

          <div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-transparent bg-clip-text">
              Harmony Shop
            </h1>

            <p className="mt-4 text-gray-500">
              এটি একটি দোকান নয় — এটি একটি অর্থনৈতিক আন্দোলন
            </p>

            <div className="mt-6 flex gap-3">
              <button className="btn-primary px-6 py-3 flex items-center gap-2">
                Join Community <ArrowRight size={16}/>
              </button>
              <button className="btn-secondary px-6 py-3">
                Become Seller
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3 text-violet-600">Core Vision</h3>
            <p className="text-sm text-gray-500">
              ন্যায্য মূল্য, কর্মসংস্থান ও কমিউনিটি অংশীদারিত্বের মাধ্যমে একটি ভারসাম্যপূর্ণ অর্থনীতি।
            </p>
          </div>

        </div>
      </section>

      {/* WHY */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

          <div>
            <h2 className="text-2xl font-bold mb-6">সমস্যা</h2>
            {[
              "মধ্যস্বত্বভোগী মূল্যবৃদ্ধি",
              "ক্ষুদ্র উদ্যোক্তার সীমাবদ্ধতা",
              "অস্বচ্ছ বাজার"
            ].map((item, i) => (
              <div key={i} className="card p-4 mb-3 text-sm">
                {item}
              </div>
            ))}
          </div>

          <div className="card p-6">
            <p className="text-violet-600 font-medium mb-2">আমাদের বিশ্বাস</p>
            <p className="text-sm text-gray-500">
              ন্যায্য মূল্য ও স্বচ্ছতা থাকলে একটি ইনসাফভিত্তিক সমাজ গড়া সম্ভব।
            </p>
          </div>

        </div>
      </section>

      {/* HOW */}
      <section className="py-20 px-4 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
          {howItems.map((item, i) => (
            <div key={i} className="card p-5">
              <div className="text-violet-600 font-bold">{item.num}</div>
              <h3 className="font-semibold mt-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">3ZF Philosophy</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {["Zero Interest","Zero Exploitation","Zero Ignorance"].map((z,i)=>(
            <div key={i} className="card p-6">{z}</div>
          ))}
        </div>
      </section>

      {/* DIFFERENT */}
      <section className="py-20 px-4 bg-[var(--color-bg)]">
        <div className="max-w-5xl mx-auto">
          {diffItems.map((item,i)=>(
            <div key={i} className="card p-4 mb-3">{item}</div>
          ))}
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-20 px-4 text-center">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
          {proofPillars.map((p,i)=>(
            <div key={i} className="card p-5">
              <h3>{p.title}</h3>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>

        {outcomes.map((o,i)=>(
          <p key={i} className="text-sm text-gray-500">{o}</p>
        ))}
      </section>

      {/* OFFER */}
      <section className="py-20 px-4 bg-[var(--color-bg)]">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {offerItems.map((item,i)=>(
            <div key={i} className="card p-5">
              <h3>{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEEDS */}
      <section className="py-20 px-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {needItems.map((item,i)=>(
            <div key={i} className="card p-5">{item}</div>
          ))}
        </div>
      </section>

      {/* WHO */}
      <section className="py-20 px-4 text-center bg-[var(--color-bg)]">
        <h2 className="mb-6 text-2xl font-bold">আপনি কোথায়?</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {whoTags.map(tag=>(
            <span key={tag} className="px-4 py-2 border rounded-full text-sm">{tag}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <h2 className="text-3xl font-bold mb-4">ন্যায্য বাজার গড়া সম্ভব</h2>
        <button className="bg-white text-violet-600 px-6 py-3 rounded-xl">
          Join Now
        </button>
      </section>

    </main>
  )
}