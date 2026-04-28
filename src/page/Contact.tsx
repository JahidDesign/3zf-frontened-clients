"use client";

import React, { useState } from "react";
import {
  MapPin, Phone, Mail, Send, ArrowRight,
  CheckCircle, Clock, Globe
} from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #030e08;
    --surface: #0b1f12;
    --surface2: #0f2a17;
    --gold: #e8b84b;
    --gold-light: #f5d07a;
    --gold-dim: #a07828;
    --gold-glow: rgba(232,184,75,0.12);
    --gold-border: rgba(232,184,75,0.22);
    --text: #eef4f0;
    --text-soft: #9ab8a6;
    --text-muted: #5a7a66;
    --border: rgba(30,65,40,0.8);
    --border2: rgba(30,65,40,0.5);
    --r: 12px;
    --r-lg: 20px;
    --r-xl: 24px;
    --px: clamp(16px, 4vw, 48px);
  }

  html { scroll-behavior: smooth; }

  .c-page {
    position: relative;
    min-height: 100vh;
    background: var(--bg);
    overflow-x: hidden;
    font-family: 'Outfit', sans-serif;
    color: var(--text);
  }

  /* ── Background ── */
  .c-grid {
    position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(30,65,40,0.22) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,65,40,0.22) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 90% 90% at 50% 40%, black 20%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 40%, black 20%, transparent 100%);
    pointer-events: none;
  }
  .c-glow-tl {
    position: fixed; top: -220px; left: -150px; z-index: 0;
    width: clamp(280px, 50vw, 600px); height: clamp(280px, 50vw, 600px);
    background: radial-gradient(ellipse at center, rgba(232,184,75,0.06) 0%, transparent 65%);
    pointer-events: none;
  }
  .c-glow-br {
    position: fixed; bottom: -200px; right: -100px; z-index: 0;
    width: clamp(240px, 40vw, 500px); height: clamp(240px, 40vw, 500px);
    background: radial-gradient(ellipse at center, rgba(13,80,40,0.18) 0%, transparent 65%);
    pointer-events: none;
  }

  .c-inner { position: relative; z-index: 1; width: 100%; }

  /* ══════════════════════
     HERO
  ══════════════════════ */
  .c-hero {
    padding: clamp(48px, 8vw, 96px) var(--px) clamp(36px, 6vw, 72px);
    max-width: 1200px; margin: 0 auto;
    text-align: center; width: 100%;
  }

  .c-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    margin-bottom: 18px;
  }
  .c-hero-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 10px rgba(232,184,75,0.6);
    animation: pulse-dot 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.5; transform:scale(1.4); }
  }
  .c-hero-eyebrow-text {
    font-size: clamp(0.6rem, 1.8vw, 0.72rem);
    font-weight: 600; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--gold);
  }

  .c-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 7vw, 3.8rem);
    font-weight: 900; line-height: 1.06;
    margin-bottom: 16px;
  }
  .c-hero-title-gold {
    background: linear-gradient(120deg, #f5d07a 0%, #e8b84b 50%, #b87c10 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .c-hero-rule {
    width: 48px; height: 2px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    margin: 0 auto 18px;
  }
  .c-hero-sub {
    font-size: clamp(0.84rem, 2.2vw, 1.02rem);
    font-weight: 300; line-height: 1.75;
    color: var(--text-soft);
    max-width: 560px; margin: 0 auto 28px;
  }

  .c-hero-pills {
    display: flex; flex-wrap: wrap;
    justify-content: center; gap: 8px;
  }
  .c-hero-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: clamp(7px, 1.5vw, 9px) clamp(12px, 2.5vw, 18px);
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 999px;
    font-size: clamp(0.68rem, 1.8vw, 0.78rem);
    font-weight: 500; color: var(--text-soft);
    transition: border-color .2s, color .2s;
    white-space: nowrap;
  }
  .c-hero-pill:hover { border-color: var(--gold-border); color: var(--gold-light); }

  /* Divider */
  .c-divider {
    max-width: 1200px; margin: 0 auto;
    padding: 0 var(--px);
    border: none; border-top: 1px solid var(--border2);
  }

  /* ══════════════════════
     MAIN GRID
  ══════════════════════ */
  .c-main {
    max-width: 1200px; margin: 0 auto;
    padding: clamp(28px, 5vw, 56px) var(--px) clamp(48px, 8vw, 96px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(20px, 3vw, 36px);
    align-items: start;
  }

  /* ── LEFT ── */
  .c-left { display: flex; flex-direction: column; gap: clamp(12px, 2vw, 20px); }

  .c-map-wrap {
    position: relative;
    border-radius: var(--r-xl); overflow: hidden;
    border: 1px solid var(--border); background: var(--surface);
  }
  .c-map-wrap::before {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 55%; height: 1px; z-index: 2;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }
  .c-map-frame {
    width: 100%;
    height: clamp(175px, 28vw, 300px);
    border: none; display: block;
    filter: invert(0.88) hue-rotate(140deg) saturate(0.55) brightness(0.75);
    transition: filter .3s;
  }
  .c-map-wrap:hover .c-map-frame {
    filter: invert(0.85) hue-rotate(138deg) saturate(0.65) brightness(0.82);
  }
  .c-map-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(3,14,8,0.88) 0%, transparent 100%);
    padding: 20px 16px 13px;
    display: flex; align-items: flex-end; justify-content: space-between;
  }
  .c-map-label {
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--gold-light); opacity: 0.85;
  }
  .c-map-open {
    font-size: 0.67rem; color: var(--text-muted);
    display: flex; align-items: center; gap: 4px;
    text-decoration: none; transition: color .2s; white-space: nowrap;
  }
  .c-map-open:hover { color: var(--gold); }

  .c-info-grid { display: flex; flex-direction: column; gap: 9px; }
  .c-info-card {
    display: flex; align-items: flex-start; gap: 13px;
    padding: clamp(11px, 2vw, 16px) clamp(12px, 2vw, 18px);
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r);
    transition: border-color .2s, background .2s, transform .15s;
    text-decoration: none; color: inherit; cursor: default;
  }
  .c-info-card.link { cursor: pointer; }
  .c-info-card:hover { border-color: var(--gold-border); background: var(--surface2); transform: translateX(3px); }
  .c-info-icon {
    width: clamp(30px, 5vw, 38px); height: clamp(30px, 5vw, 38px);
    border-radius: 10px;
    background: var(--gold-glow); border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .c-info-body { flex: 1; min-width: 0; }
  .c-info-label {
    font-size: 0.63rem; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 3px;
  }
  .c-info-value {
    font-size: clamp(0.8rem, 1.6vw, 0.9rem);
    font-weight: 500; color: var(--gold-light);
    line-height: 1.45; word-break: break-word;
  }
  .c-info-sub {
    font-size: 0.7rem; color: var(--text-muted);
    font-weight: 300; margin-top: 2px;
  }

  .c-hours {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); flex-wrap: wrap;
  }
  .c-hours-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #4caf50; box-shadow: 0 0 7px rgba(76,175,80,0.6);
    flex-shrink: 0;
  }
  .c-hours-text {
    font-size: clamp(0.7rem, 1.5vw, 0.8rem);
    color: var(--text-soft); line-height: 1.5;
  }
  .c-hours-text strong { color: var(--text); font-weight: 600; }

  /* ── RIGHT: Form ── */
  .c-form-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl);
    padding: clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px);
    position: relative; overflow: hidden;
  }
  .c-form-card::before {
    content: '';
    position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
    width: 50%; height: 1px;
    background: linear-gradient(to right, transparent, var(--gold-dim), transparent);
  }
  .c-form-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 55% 35% at 50% 0%, rgba(232,184,75,0.04) 0%, transparent 70%);
    pointer-events: none;
  }

  .c-form-head { margin-bottom: clamp(16px, 3vw, 26px); }
  .c-form-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.2rem, 3vw, 1.65rem);
    font-weight: 900; color: var(--gold-light);
    margin-bottom: 7px; line-height: 1.2;
  }
  .c-form-desc {
    font-size: clamp(0.76rem, 1.5vw, 0.84rem);
    font-weight: 300; color: var(--text-muted); line-height: 1.6;
  }

  .c-form {
    display: flex; flex-direction: column;
    gap: clamp(11px, 2vw, 16px);
    position: relative; z-index: 1;
  }

  .c-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(10px, 2vw, 14px);
  }

  .c-field { display: flex; flex-direction: column; gap: 6px; }
  .c-label {
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-muted);
  }

  .c-input, .c-textarea, .c-select {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r);
    padding: clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 14px);
    font-family: 'Outfit', sans-serif;
    font-size: clamp(0.84rem, 1.6vw, 0.88rem);
    font-weight: 400; color: var(--text);
    outline: none; width: 100%;
    transition: border-color .2s, background .2s, box-shadow .2s;
    -webkit-appearance: none;
    touch-action: manipulation;
  }
  /* Prevent iOS auto-zoom (font-size must be ≥16px) */
  @supports (-webkit-touch-callout: none) {
    .c-input, .c-textarea, .c-select { font-size: 16px; }
  }
  .c-input::placeholder, .c-textarea::placeholder { color: var(--text-muted); }
  .c-input:focus, .c-textarea:focus, .c-select:focus {
    border-color: var(--gold-border);
    background: var(--surface2);
    box-shadow: 0 0 0 3px rgba(232,184,75,0.08);
  }
  .c-textarea { resize: vertical; min-height: clamp(96px, 16vw, 128px); line-height: 1.6; }
  .c-select { cursor: pointer; color: var(--text-soft); }
  .c-select option { background: var(--surface2); color: var(--text); }

  .c-submit {
    display: inline-flex; align-items: center;
    justify-content: center; gap: 9px;
    background: linear-gradient(135deg, #e8b84b 0%, #b87c10 100%);
    color: #030e08;
    font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: clamp(0.84rem, 1.6vw, 0.9rem);
    letter-spacing: 0.03em;
    padding: clamp(12px, 2vw, 14px) 28px;
    border-radius: var(--r); border: none;
    cursor: pointer; width: 100%;
    box-shadow: 0 4px 22px rgba(232,184,75,0.22);
    transition: filter .2s, transform .15s, box-shadow .2s;
    margin-top: 4px;
    -webkit-tap-highlight-color: transparent;
  }
  .c-submit:hover:not(:disabled) {
    filter: brightness(1.1); transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(232,184,75,0.32);
  }
  .c-submit:active:not(:disabled) { transform: translateY(0); }
  .c-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Success */
  .c-success {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 13px;
    padding: clamp(28px, 6vw, 52px) 20px;
    text-align: center; position: relative; z-index: 1;
  }
  .c-success-icon { color: var(--gold); animation: pop-in .4s ease; }
  @keyframes pop-in {
    0% { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  .c-success-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.15rem, 3.5vw, 1.45rem);
    font-weight: 900; color: var(--gold-light);
  }
  .c-success-msg {
    font-size: clamp(0.8rem, 1.6vw, 0.88rem);
    color: var(--text-muted); line-height: 1.65; max-width: 280px;
  }
  .c-success-reset {
    font-size: 0.76rem; color: var(--text-muted);
    background: none; border: 1px solid var(--border);
    border-radius: 999px; padding: 8px 20px;
    cursor: pointer; font-family: 'Outfit', sans-serif;
    transition: border-color .2s, color .2s;
    -webkit-tap-highlight-color: transparent;
  }
  .c-success-reset:hover { border-color: var(--gold-border); color: var(--gold-light); }

  /* ══════════════════════════════════════
     RESPONSIVE BREAKPOINTS — all devices
  ══════════════════════════════════════ */

  /* Large desktop (≥1280px) — slightly wider left col */
  @media (min-width: 1280px) {
    .c-main { grid-template-columns: 1fr 1.08fr; }
  }

  /* Tablet landscape (≤1024px) */
  @media (max-width: 1024px) {
    .c-main { gap: 22px; }
  }

  /* Tablet portrait (≤860px) — stack single column */
  @media (max-width: 860px) {
    .c-main {
      grid-template-columns: 1fr;
      gap: 22px;
    }
    /* Form first, map/info below on tablet & mobile */
    .c-left     { order: 2; }
    .c-form-card { order: 1; }
    .c-map-frame { height: clamp(200px, 40vw, 280px); }
  }

  /* Mobile large (≤600px) */
  @media (max-width: 600px) {
    /* Pills: 2 per row */
    .c-hero-pill {
      flex: 1 1 calc(50% - 8px);
      justify-content: center;
      max-width: 210px;
    }
    /* Form side-by-side fields collapse */
    .c-field-row { grid-template-columns: 1fr; }
  }

  /* Mobile medium (≤480px) */
  @media (max-width: 480px) {
    .c-hero-pill { flex: 1 1 100%; max-width: 260px; }
    .c-map-frame { height: 195px; }
  }

  /* Mobile small (≤360px) */
  @media (max-width: 360px) {
    :root { --px: 14px; }
    .c-hero-title   { font-size: 1.75rem; }
    .c-hero-pill    { font-size: 0.64rem; padding: 7px 10px; }
    .c-form-card    { border-radius: var(--r-lg); }
    .c-map-wrap     { border-radius: var(--r-lg); }
    .c-map-frame    { height: 174px; }
    .c-info-icon    { width: 28px; height: 28px; border-radius: 7px; }
    .c-info-value   { font-size: 0.8rem; }
  }

  /* Very small (≤320px) */
  @media (max-width: 320px) {
    :root { --px: 12px; }
    .c-hero-title { font-size: 1.55rem; }
    .c-hero-sub   { font-size: 0.8rem; }
    .c-map-frame  { height: 155px; }
  }
`;

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", subject: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="c-page">
        <div className="c-grid" />
        <div className="c-glow-tl" />
        <div className="c-glow-br" />

        <div className="c-inner">

          {/* ── HERO ── */}
          <section className="c-hero">
            <div className="c-hero-eyebrow">
              <span className="c-hero-dot" />
              <span className="c-hero-eyebrow-text">Get In Touch</span>
            </div>

            <h1 className="c-hero-title">
              <span className="c-hero-title-gold">Contact</span> Us
            </h1>

            <div className="c-hero-rule" />

            <p className="c-hero-sub">
              We&apos;d love to hear from you. Whether you want to join the movement,
              ask a question, or partner with 3ZF — reach out and we&apos;ll respond within 24 hours.
            </p>

            <div className="c-hero-pills">
              <div className="c-hero-pill">
                <MapPin size={13} color="var(--gold)" />
                Dhaka, Bangladesh
              </div>
              <div className="c-hero-pill">
                <Phone size={13} color="var(--gold)" />
                +880 1XXX-XXXXXX
              </div>
              <div className="c-hero-pill">
                <Mail size={13} color="var(--gold)" />
                info@3zf.org
              </div>
              <div className="c-hero-pill">
                <Globe size={13} color="var(--gold)" />
                48 Districts Active
              </div>
            </div>
          </section>

          <hr className="c-divider" />

          {/* ── MAIN GRID ── */}
          <div className="c-main">

            {/* LEFT — Map + Info */}
            <div className="c-left">
              <div className="c-map-wrap">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233668.3519575334!2d90.27923679453124!3d23.780573025439077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1708000000000!5m2!1sen!2sbd"
                  className="c-map-frame"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="3ZF Location — Dhaka, Bangladesh"
                />
                <div className="c-map-overlay">
                  <span className="c-map-label">📍 Our Location</span>
                  <a
                    href="https://maps.google.com/?q=Dhaka,Bangladesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="c-map-open"
                  >
                    Open Maps <ArrowRight size={11} />
                  </a>
                </div>
              </div>

              <div className="c-info-grid">
                <div className="c-info-card">
                  <div className="c-info-icon">
                    <MapPin size={14} color="var(--gold)" />
                  </div>
                  <div className="c-info-body">
                    <div className="c-info-label">Office Address</div>
                    <div className="c-info-value">Mhadhppur, Hobiganj</div>
                    <div className="c-info-sub">Osman Khan Buliding — Head Office</div>
                  </div>
                </div>

                <a href="wap:+8801849280681" className="c-info-card link">
                  <div className="c-info-icon">
                    <Phone size={14} color="var(--gold)" />
                  </div>
                  <div className="c-info-body">
                    <div className="c-info-label">Phone Number</div>
                    <div className="c-info-value">+880 1849280681</div>
                    <div className="c-info-sub">Sat – Thu, 9:00 AM – 6:00 PM</div>
                  </div>
                </a>

                <a href="mailto:info@3zf.org" className="c-info-card link">
                  <div className="c-info-icon">
                    <Mail size={14} color="var(--gold)" />
                  </div>
                  <div className="c-info-body">
                    <div className="c-info-label">Email Address</div>
                    <div className="c-info-value">info@3zf.org</div>
                    <div className="c-info-sub">We reply within 24 hours</div>
                  </div>
                </a>
              </div>

              <div className="c-hours">
                <span className="c-hours-dot" />
                <span className="c-hours-text">
                  <strong>Open Now</strong> · Sat – Thu &nbsp;·&nbsp; 9:00 AM – 6:00 PM BST
                </span>
              </div>
            </div>

            {/* RIGHT — Contact Form */}
            <div className="c-form-card">
              {submitted ? (
                <div className="c-success">
                  <CheckCircle size={48} className="c-success-icon" />
                  <div className="c-success-title">Message Sent!</div>
                  <p className="c-success-msg">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button className="c-success-reset" onClick={resetForm}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="c-form-head">
                    <div className="c-form-title">Send a Message</div>
                    <div className="c-form-desc">
                      Fill in the form and our team will be in touch shortly.
                    </div>
                  </div>

                  <form className="c-form" onSubmit={handleSubmit}>
                    <div className="c-field-row">
                      <div className="c-field">
                        <label className="c-label" htmlFor="name">Full Name</label>
                        <input
                          id="name" name="name" type="text"
                          className="c-input"
                          placeholder="Your full name"
                          value={form.name} onChange={handleChange}
                          required autoComplete="name"
                        />
                      </div>
                      <div className="c-field">
                        <label className="c-label" htmlFor="phone">Phone</label>
                        <input
                          id="phone" name="phone" type="tel"
                          className="c-input"
                          placeholder="+880 1XXX-XXXXXX"
                          value={form.phone} onChange={handleChange}
                          autoComplete="tel" inputMode="tel"
                        />
                      </div>
                    </div>

                    <div className="c-field">
                      <label className="c-label" htmlFor="email">Email Address</label>
                      <input
                        id="email" name="email" type="email"
                        className="c-input"
                        placeholder="you@example.com"
                        value={form.email} onChange={handleChange}
                        required autoComplete="email" inputMode="email"
                      />
                    </div>

                    <div className="c-field">
                      <label className="c-label" htmlFor="subject">Subject</label>
                      <select
                        id="subject" name="subject"
                        className="c-select"
                        value={form.subject} onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Select a topic…</option>
                        <option value="join">Join the Movement</option>
                        <option value="partnership">Partnership / Collaboration</option>
                        <option value="donation">Donation Enquiry</option>
                        <option value="volunteer">Volunteer Opportunity</option>
                        <option value="media">Media &amp; Press</option>
                        <option value="general">General Enquiry</option>
                      </select>
                    </div>

                    <div className="c-field">
                      <label className="c-label" htmlFor="message">Message</label>
                      <textarea
                        id="message" name="message"
                        className="c-textarea"
                        placeholder="Tell us how we can help you…"
                        value={form.message} onChange={handleChange}
                        required
                      />
                    </div>

                    <button type="submit" className="c-submit" disabled={loading}>
                      {loading
                        ? <><Clock size={15} /> Sending…</>
                        : <><Send size={15} /> Send Message</>
                      }
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}