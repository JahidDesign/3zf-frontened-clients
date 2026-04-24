// ============================================================
// Association page
// ============================================================
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Target, DollarSign, Calendar, Users, Handshake, Award, ArrowRight } from 'lucide-react';
import MainNavbar from '@/components/layout/Navbar';
import MainFooter from '@/components/layout/Footer';

const NAV_ITEMS = ['Members', 'Mission', 'Funding', 'Events', 'Leaderboard', 'Partners'];
const STATS = [
  { icon: Users, value: '1,200+', label: 'Active Members' },
  { icon: Calendar, value: '45+', label: 'Projects Completed' },
  { icon: DollarSign, value: '৳25L+', label: 'Funds Raised' },
  { icon: Award, value: '12+', label: 'Awards Won' },
];
const MISSIONS = [
  { icon: Heart, title: 'Community Welfare', desc: 'Supporting underprivileged communities through education, healthcare, and skill development programs.' },
  { icon: Target, title: 'Zero Poverty', desc: 'Working towards eliminating poverty through sustainable livelihood programs and microfinance initiatives.' },
  { icon: Handshake, title: 'Unity & Harmony', desc: 'Fostering unity among diverse communities through cultural programs and interfaith dialogues.' },
];
const PARTNERS = ['UN Development Programme', 'BRAC', 'Grameen Foundation', 'ActionAid', 'CARE Bangladesh', 'Plan International'];

 function AssociationPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
      <MainNavbar />
      <div className="pt-[var(--navbar-height)]">
        <div className="gradient-brand text-white py-16 px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Harmony Association</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto">
            Empowering communities through unity, knowledge, and sustainable development since 2020
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {NAV_ITEMS.map(item => (
              <button key={item}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm">
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card text-center py-6">
                <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-heading text-2xl font-bold" style={{ color: 'var(--color-brand)' }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
          {/* Mission */}
          <section>
            <h2 className="font-heading text-3xl font-bold mb-2 text-center" style={{ color: 'var(--color-text)' }}>Our Mission</h2>
            <p className="text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>Three pillars driving everything we do</p>
            <div className="grid md:grid-cols-3 gap-5">
              {MISSIONS.map((m, i) => (
                <motion.div key={m.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="card text-center">
                  <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
                    <m.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>{m.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Funding */}
          <section className="card">
            <h2 className="font-heading text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Funding & Transparency</h2>
            <div className="space-y-4">
              {[['Education Programs', 35], ['Healthcare', 25], ['Livelihood', 20], ['Infrastructure', 12], ['Admin', 8]].map(([label, pct]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-text)' }}>{label}</span>
                    <span className="font-semibold" style={{ color: 'var(--color-brand)' }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full rounded-full gradient-brand" />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/organisation/donate" className="btn-primary mt-6 inline-flex items-center gap-2 px-6 py-3">
              <Heart className="w-4 h-4" /> Donate Now <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* Partners */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text)' }}>Our Partners</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PARTNERS.map(p => (
                <div key={p} className="card text-center py-4">
                  <Handshake className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-brand)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{p}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}
export default AssociationPage;
