"use client";

import React, { useState } from "react";
import { ArrowRight, MapPin, Clock, Users, ChevronRight } from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #030e08;
    --surface: #0b1f12;
    --surface2: #0f2a17;
    --surface3: #122e1a;
    --gold: #e8b84b;
    --gold-light: #f5d07a;
    --gold-dim: #a07828;
    --gold-glow: rgba(232,184,75,0.12);
    --gold-glow2: rgba(232,184,75,0.06);
    --gold-border: rgba(232,184,75,0.2);
    --gold-border2: rgba(232,184,75,0.35);
    --text: #eef4f0;
    --text-soft: #9ab8a6;
    --text-muted: #5a7a66;
    --border: rgba(30,65,40,0.8);
    --border2: rgba(40,80,55,0.6);
    --r: 12px;
    --r-lg: 20px;
    --r-xl: 28px;
  }

  .ev-section {
    position: relative;
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    overflow: hidden;
    padding: 80px 0 100px;
  }

  /* Background grid */
  .ev-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(30,65,40,0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,65,40,0.2) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
    pointer-events: none;
  }

  /* Top glow */
  .ev-glow-top {
    position: absolute; top: -300px; left: 50%; transform: translateX(-50%);
    width: 1000px; height: 700px;
    background: radial-gradient(ellipse at center, rgba(232,184,75,0.06) 0%, transparent 65%);
    pointer-events: none;
  }
  .ev-glow-left {
    position: absolute; top: 30%; left: -200px;
    width: 500px; height: 500px;
    background: radial-gradient(ellipse at center, rgba(13,80,40,0.18) 0%, transparent 65%);
    pointer-events: none;
  }

  .ev-container {
    position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto;
    padding: 0 48px;
  }

  /* ── HEADER ── */
  .ev-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 52px; gap: 24px; flex-wrap: wrap;
  }
  .ev-header-left {}

  .ev-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .ev-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 8px rgba(232,184,75,0.5);
  }
  .ev-eyebrow-text {
    font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold);
  }

  .ev-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: clamp(2rem, 4vw, 3rem);
    color: var(--text);
    line-height: 1.1;
    margin-bottom: 10px;
  }
  .ev-title span {
    background: linear-gradient(120deg, #f5d07a 0%, #e8b84b 60%, #b87c10 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ev-subtitle {
    font-size: 0.88rem; font-weight: 300;
    color: var(--text-muted); line-height: 1.6;
    max-width: 400px;
  }

  /* Filter tabs */
  .ev-filters {
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  }
  .ev-filter-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 999px;
    font-family: 'Outfit', sans-serif;
    font-size: 0.8rem; font-weight: 500; letter-spacing: 0.03em;
    cursor: pointer; border: 1px solid var(--border2);
    background: var(--surface); color: var(--text-soft);
    transition: all 0.2s;
  }
  .ev-filter-btn:hover {
    border-color: var(--gold-border); color: var(--gold-light);
    background: var(--surface2);
  }
  .ev-filter-btn.active {
    background: linear-gradient(135deg, rgba(232,184,75,0.18) 0%, rgba(184,124,16,0.12) 100%);
    border-color: var(--gold-border2); color: var(--gold-light);
  }
  .ev-filter-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--gold); opacity: 0;
    transition: opacity 0.2s;
  }
  .ev-filter-btn.active .ev-filter-dot { opacity: 1; }

  /* ── FEATURED EVENT ── */
  .ev-featured {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--r-xl);
    overflow: hidden;
    margin-bottom: 32px;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .ev-featured::before {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 40%; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }

  .ev-featured-visual {
    position: relative;
    background: var(--surface2);
    min-height: 340px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .ev-featured-visual-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 70% at 30% 40%, rgba(232,184,75,0.09) 0%, transparent 65%),
      linear-gradient(135deg, #0b1f12 0%, #061209 100%);
  }
  .ev-featured-visual-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(232,184,75,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,184,75,0.06) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .ev-featured-emblem {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  }
  .ev-featured-date-chip {
    position: absolute; bottom: 20px; right: 20px;
    background: rgba(3,14,8,0.85);
    border: 1px solid var(--gold-border);
    border-radius: 10px; padding: 10px 14px;
    text-align: center;
  }
  .ev-featured-date-day {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 900;
    color: var(--gold-light); line-height: 1;
  }
  .ev-featured-date-mon {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted); margin-top: 2px;
  }

  .ev-featured-content {
    padding: 40px 36px;
    display: flex; flex-direction: column; justify-content: center; gap: 20px;
  }
  .ev-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--gold);
    padding: 4px 10px; border-radius: 999px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
  }
  .ev-featured-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: clamp(1.3rem, 2.2vw, 1.7rem);
    color: var(--text); line-height: 1.25;
  }
  .ev-featured-desc {
    font-size: 0.87rem; line-height: 1.8;
    color: var(--text-soft); font-weight: 300;
  }

  .ev-meta { display: flex; flex-direction: column; gap: 9px; }
  .ev-meta-row {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.82rem; color: var(--text-muted);
  }
  .ev-meta-row svg { color: var(--gold-dim); flex-shrink: 0; }
  .ev-meta-row strong { color: var(--text-soft); font-weight: 500; }

  .ev-featured-cta {
    display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  }
  .ev-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #e8b84b 0%, #b87c10 100%);
    color: #030e08; font-family: 'Outfit', sans-serif;
    font-weight: 600; font-size: 0.85rem; letter-spacing: 0.02em;
    padding: 11px 22px; border-radius: var(--r);
    border: none; cursor: pointer;
    box-shadow: 0 4px 18px rgba(232,184,75,0.2);
    transition: filter 0.2s, transform 0.15s;
  }
  .ev-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .ev-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    background: transparent; color: var(--text-soft);
    font-family: 'Outfit', sans-serif;
    font-weight: 500; font-size: 0.83rem;
    padding: 10px 18px; border-radius: var(--r);
    border: 1px solid var(--border2); cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .ev-btn-ghost:hover { border-color: var(--gold-border); color: var(--gold-light); }

  /* ── GRID ── */
  .ev-grid-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-bottom: 32px;
  }

  .ev-card {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    overflow: hidden;
    display: flex; flex-direction: column;
    transition: border-color 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .ev-card:hover {
    border-color: var(--gold-border);
    transform: translateY(-3px);
  }
  .ev-card:hover .ev-card-arrow { opacity: 1; transform: translateX(0); }

  .ev-card-top {
    position: relative;
    background: var(--surface2);
    height: 140px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .ev-card-top-bg {
    position: absolute; inset: 0;
  }
  .ev-card-top-bg.green {
    background: radial-gradient(ellipse at 30% 40%, rgba(13,80,40,0.5) 0%, transparent 70%);
  }
  .ev-card-top-bg.gold {
    background: radial-gradient(ellipse at 70% 30%, rgba(232,184,75,0.12) 0%, transparent 70%);
  }
  .ev-card-top-bg.blue {
    background: radial-gradient(ellipse at 50% 60%, rgba(20,60,80,0.5) 0%, transparent 70%);
  }

  .ev-card-icon {
    position: relative; z-index: 1;
    width: 52px; height: 52px;
    border-radius: 14px;
    background: var(--gold-glow);
    border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
  }
  .ev-card-number {
    position: absolute; top: 12px; left: 14px;
    font-family: 'Playfair Display', serif;
    font-size: 3.5rem; font-weight: 900; line-height: 1;
    color: rgba(232,184,75,0.06);
    pointer-events: none; user-select: none;
  }
  .ev-card-date-badge {
    position: absolute; top: 12px; right: 12px;
    background: rgba(3,14,8,0.8); border: 1px solid var(--border2);
    border-radius: 8px; padding: 6px 10px; text-align: center;
  }
  .ev-card-date-day {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem; font-weight: 900;
    color: var(--gold-light); line-height: 1;
  }
  .ev-card-date-mon {
    font-size: 0.6rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted);
  }

  .ev-card-body { padding: 20px 20px 22px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .ev-card-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gold-dim);
  }
  .ev-card-title {
    font-family: 'Outfit', sans-serif; font-weight: 600;
    font-size: 0.97rem; color: var(--text); line-height: 1.35;
  }
  .ev-card-meta { display: flex; flex-direction: column; gap: 5px; margin-top: 4px; }
  .ev-card-meta-row {
    display: flex; align-items: center; gap: 7px;
    font-size: 0.76rem; color: var(--text-muted);
  }
  .ev-card-meta-row svg { color: var(--gold-dim); }

  .ev-card-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--border);
    background: var(--surface2);
  }
  .ev-card-seats {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.76rem; color: var(--text-muted);
  }
  .ev-card-seats svg { color: var(--text-muted); }
  .ev-card-arrow {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    color: var(--gold);
    opacity: 0; transform: translateX(-4px);
    transition: opacity 0.2s, transform 0.2s;
  }

  /* ── UPCOMING LIST ── */
  .ev-list-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .ev-list-title {
    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text-muted);
    display: flex; align-items: center; gap: 8px;
  }
  .ev-list-title::before {
    content: ''; display: block;
    width: 18px; height: 1px; background: var(--text-muted);
  }

  .ev-list { display: flex; flex-direction: column; gap: 10px; }
  .ev-list-item {
    display: flex; align-items: center; gap: 18px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 16px 20px;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
  }
  .ev-list-item:hover { border-color: var(--gold-border); background: var(--surface2); }

  .ev-list-date {
    min-width: 48px; text-align: center; flex-shrink: 0;
  }
  .ev-list-date-day {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 900;
    color: var(--gold-light); line-height: 1;
  }
  .ev-list-date-mon {
    font-size: 0.64rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted);
  }

  .ev-list-divider { width: 1px; height: 36px; background: var(--border2); flex-shrink: 0; }

  .ev-list-info { flex: 1; min-width: 0; }
  .ev-list-info-title {
    font-weight: 600; font-size: 0.9rem; color: var(--text); margin-bottom: 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ev-list-info-meta {
    display: flex; gap: 16px; flex-wrap: wrap;
    font-size: 0.76rem; color: var(--text-muted);
  }
  .ev-list-info-meta span { display: flex; align-items: center; gap: 5px; }
  .ev-list-info-meta svg { color: var(--gold-dim); }

  .ev-list-arrow { color: var(--text-muted); flex-shrink: 0; transition: color 0.2s; }
  .ev-list-item:hover .ev-list-arrow { color: var(--gold); }

  /* ── RESPONSIVE ── */

  /* Tablet landscape */
  @media (max-width: 1100px) {
    .ev-container { padding: 0 36px; }
    .ev-grid-cards { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  }

  /* Tablet portrait — stack featured */
  @media (max-width: 900px) {
    .ev-container { padding: 0 28px; }
    .ev-section { padding: 64px 0 80px; }
    .ev-header { flex-direction: column; align-items: flex-start; gap: 20px; }
    .ev-filters { width: 100%; }
    .ev-featured { grid-template-columns: 1fr; }
    .ev-featured-visual { min-height: 200px; }
    .ev-featured-content { padding: 28px 28px; gap: 16px; }
    .ev-featured-title { font-size: 1.3rem; }
    .ev-grid-cards { grid-template-columns: repeat(2, 1fr); }
    .ev-list-info-title { white-space: normal; }
  }

  /* Mobile large */
  @media (max-width: 640px) {
    .ev-container { padding: 0 16px; }
    .ev-section { padding: 48px 0 64px; }
    .ev-title { font-size: 1.8rem; }
    .ev-subtitle { font-size: 0.83rem; max-width: 100%; }
    .ev-filters { gap: 6px; }
    .ev-filter-btn { padding: 7px 12px; font-size: 0.75rem; }
    .ev-featured { border-radius: var(--r-lg); }
    .ev-featured-visual { min-height: 160px; }
    .ev-featured-content { padding: 20px 18px; gap: 14px; }
    .ev-featured-title { font-size: 1.15rem; }
    .ev-featured-desc { font-size: 0.82rem; }
    .ev-featured-cta { flex-direction: column; }
    .ev-btn-primary, .ev-btn-ghost { width: 100%; justify-content: center; }
    .ev-grid-cards { grid-template-columns: 1fr; gap: 14px; }
    .ev-card-top { height: 110px; }
    .ev-list-item { padding: 14px 14px; gap: 12px; }
    .ev-list-date-day { font-size: 1.25rem; }
    .ev-list-info-title { font-size: 0.85rem; }
    .ev-list-info-meta { gap: 8px; font-size: 0.72rem; }
    .ev-list-divider { height: 28px; }
  }

  /* Mobile small */
  @media (max-width: 400px) {
    .ev-container { padding: 0 12px; }
    .ev-section { padding: 40px 0 56px; }
    .ev-title { font-size: 1.55rem; }
    .ev-filters { gap: 5px; }
    .ev-filter-btn { padding: 6px 10px; font-size: 0.72rem; }
    .ev-featured-content { padding: 16px 14px; gap: 12px; }
    .ev-featured-title { font-size: 1rem; }
    .ev-list-item { padding: 12px 12px; }
    .ev-list-info-meta span:last-child { display: none; }
  }
`;

const events = [
  {
    id: 1,
    tag: "Conference",
    icon: "🌾",
    color: "green",
    title: "Zero Interest Finance Summit 2025",
    desc: "A national conference bringing together economists, scholars, and community leaders to discuss interest-free financial models and their implementation across Bangladesh.",
    date: { day: "15", mon: "Aug" },
    time: "9:00 AM – 6:00 PM",
    location: "Dhaka International Trade Fair, Dhaka",
    seats: "500 Seats",
    type: "reg",
    featured: true,
  },
  {
    id: 2,
    tag: "Workshop",
    icon: "📚",
    color: "gold",
    title: "Financial Literacy for Rural Communities",
    date: { day: "22", mon: "Aug" },
    time: "10:00 AM – 2:00 PM",
    location: "Sylhet District Hall",
    seats: "120 Seats",
    type: "free",
  },
  {
    id: 3,
    tag: "Training",
    icon: "💼",
    color: "blue",
    title: "Youth Entrepreneurship & Ethics Bootcamp",
    date: { day: "05", mon: "Sep" },
    time: "8:30 AM – 5:00 PM",
    location: "Chittagong Commerce College",
    seats: "80 Seats",
    type: "reg",
  },
  {
    id: 4,
    tag: "Seminar",
    icon: "🏠",
    color: "green",
    title: "Exploitative Lending & Community Rights",
    date: { day: "18", mon: "Sep" },
    time: "2:00 PM – 5:00 PM",
    location: "Rajshahi Public Library",
    seats: "200 Seats",
    type: "free",
  },
];

const upcomingList = [
  { day: "28", mon: "Sep", title: "District Coordinator Meeting — Mymensingh", location: "Mymensingh Town Hall", time: "11:00 AM", chip: "free" },
  { day: "10", mon: "Oct", title: "3ZF Annual Membership Drive — Online", location: "Zoom (Virtual)", time: "6:00 PM", chip: "free" },
  { day: "25", mon: "Oct", title: "Islamic Finance Principles Lecture Series", location: "Islamic Foundation, Dhaka", time: "3:30 PM", chip: "reg" },
  { day: "12", mon: "Nov", title: "Zero Hunger Awareness March — Rangpur", location: "Rangpur Central Park", time: "8:00 AM", chip: "free" },
];

const filters = ["All Events", "Conferences", "Workshops", "Seminars", "Online"];

// Decorative emblem for featured visual
function SmallEmblem() {
  return (
    <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ee1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d07a" />
          <stop offset="100%" stopColor="#9a6b10" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="url(#ee1)" strokeWidth="1" strokeDasharray="4 5" opacity="0.4" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(232,184,75,0.15)" strokeWidth="0.8" />
      <text x="50" y="56" textAnchor="middle" fontFamily="Playfair Display, serif" fontWeight="900" fontSize="20" fill="url(#ee1)" letterSpacing="1.5">3ZF</text>
      <circle cx="35" cy="64" r="1.8" fill="#e8b84b" opacity="0.4" />
      <circle cx="50" cy="64" r="1.8" fill="#e8b84b" opacity="0.7" />
      <circle cx="65" cy="64" r="1.8" fill="#e8b84b" opacity="0.4" />
    </svg>
  );
}

export default function Events() {
  const [activeFilter, setActiveFilter] = useState("All Events");
  const featured = events[0];
  const gridEvents = events.slice(1);

  return (
    <>
      <style>{styles}</style>
      <section className="ev-section">
        <div className="ev-grid" />
        <div className="ev-glow-top" />
        <div className="ev-glow-left" />

        <div className="ev-container">

          {/* Header */}
          <div className="ev-header">
            <div className="ev-header-left">
              <div className="ev-eyebrow">
                <div className="ev-eyebrow-dot" />
                <span className="ev-eyebrow-text">3ZF Events & Programs</span>
              </div>
              <h2 className="ev-title">Upcoming <span>Events</span></h2>
              <p className="ev-subtitle">
                Join us at workshops, summits, and community gatherings across Bangladesh — driving real change together.
              </p>
            </div>
            <div className="ev-filters">
              {filters.map(f => (
                <button
                  key={f}
                  className={`ev-filter-btn${activeFilter === f ? " active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  <span className="ev-filter-dot" />
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Event */}
          <div className="ev-featured">
            <div className="ev-featured-visual">
              <div className="ev-featured-visual-bg" />
              <div className="ev-featured-visual-grid" />
              <div className="ev-featured-emblem">
                <SmallEmblem />
              </div>
              <div className="ev-featured-date-chip">
                <div className="ev-featured-date-day">{featured.date.day}</div>
                <div className="ev-featured-date-mon">{featured.date.mon} '25</div>
              </div>
            </div>

            <div className="ev-featured-content">
              <div>
                <span className="ev-tag">{featured.icon} {featured.tag}</span>
              </div>
              <h3 className="ev-featured-title">{featured.title}</h3>
              <p className="ev-featured-desc">{featured.desc}</p>
              <div className="ev-meta">
                <div className="ev-meta-row">
                  <Clock size={14} />
                  <span>{featured.time}</span>
                </div>
                <div className="ev-meta-row">
                  <MapPin size={14} />
                  <strong>{featured.location}</strong>
                </div>
                <div className="ev-meta-row">
                  <Users size={14} />
                  <span>{featured.seats} Available</span>
                </div>
              </div>
              <div className="ev-featured-cta">
                <button className="ev-btn-primary">
                  Register Now <ArrowRight size={15} />
                </button>
                <button className="ev-btn-ghost">
                  View Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="ev-grid-cards">
            {gridEvents.map((ev, i) => (
              <div key={ev.id} className="ev-card">
                <div className="ev-card-top">
                  <div className={`ev-card-top-bg ${ev.color}`} />
                  <div className="ev-card-number">{String(i + 2).padStart(2, "0")}</div>
                  <div className="ev-card-icon">{ev.icon}</div>
                  <div className="ev-card-date-badge">
                    <div className="ev-card-date-day">{ev.date.day}</div>
                    <div className="ev-card-date-mon">{ev.date.mon}</div>
                  </div>
                </div>
                <div className="ev-card-body">
                  <div className="ev-card-tag">◆ {ev.tag}</div>
                  <div className="ev-card-title">{ev.title}</div>
                  <div className="ev-card-meta">
                    <div className="ev-card-meta-row"><Clock size={12} /> {ev.time}</div>
                    <div className="ev-card-meta-row"><MapPin size={12} /> {ev.location}</div>
                  </div>
                </div>
                <div className="ev-card-footer">
                  <div className="ev-card-seats"><Users size={12} /> {ev.seats}</div>
                  <div className="ev-card-arrow"><ChevronRight size={13} /></div>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming List */}
          <div>
            <div className="ev-list-header">
              <div className="ev-list-title">More Upcoming Events</div>
              <button className="ev-btn-ghost" style={{ fontSize: "0.78rem", padding: "7px 14px" }}>
                View All <ChevronRight size={13} />
              </button>
            </div>
            <div className="ev-list">
              {upcomingList.map((item, i) => (
                <div key={i} className="ev-list-item">
                  <div className="ev-list-date">
                    <div className="ev-list-date-day">{item.day}</div>
                    <div className="ev-list-date-mon">{item.mon}</div>
                  </div>
                  <div className="ev-list-divider" />
                  <div className="ev-list-info">
                    <div className="ev-list-info-title">{item.title}</div>
                    <div className="ev-list-info-meta">
                      <span><Clock size={11} /> {item.time}</span>
                      <span><MapPin size={11} /> {item.location}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="ev-list-arrow" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}