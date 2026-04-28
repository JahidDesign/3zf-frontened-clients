"use client";
import React, { useState, useEffect } from "react";
import { Trophy, Users,ShieldCheck, ChevronRight, LayoutGrid } from "lucide-react";

interface Tournament {
  id: string;
  title: string;
  game: string;
  prizePool: string;
  status: "LIVE" | "UPCOMING" | "COMPLETED";
  participants: number;
  startTime: string;
  color: string;
}

export default function TournamentZone() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/data/tournaments.json");
        const data = await res.json();
        setTournaments(data.tournaments);
      } catch (err) {
        console.error("Error loading tournament data", err);
      } finally {
        setTimeout(() => setLoading(false), 1000); // Smooth transition
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0114] text-white selection:bg-[#7B39ED]">
      
      {/* ========== HERO SECTION (Centered & Large) ========== */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7B39ED]/10 via-transparent to-transparent -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#7B39ED]" />
            <span className="text-[#7B39ED] font-black text-xs tracking-[0.3em] uppercase">Pro League</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#7B39ED]" />
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
            TOURNAMENT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">ZONE</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 font-medium max-w-2xl mx-auto leading-relaxed">
            The ultimate arena for the Harmony community. Compete in high-stakes 
            tournaments, climb the leaderboard, and claim your glory.
          </p>
        </div>
      </section>

      {/* ========== STATS GRID (Items Center) ========== */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
          {[
            { label: "Active Players", value: "24.5K", icon: <Users size={20} /> },
            { label: "Total Prize Pool", value: "$150,000", icon: <Trophy size={20} /> },
            { label: "Tournaments", value: "1,204", icon: <LayoutGrid size={20} /> },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-10 px-6 hover:bg-white/[0.02] transition-colors">
              <div className="text-[#7B39ED] mb-3">{stat.icon}</div>
              <span className="text-3xl font-black mb-1">{stat.value}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========== LISTINGS ========== */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black tracking-tight">FEATURED EVENTS</h2>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7B39ED]" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-white/5 rounded-[40px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tournaments.map((t) => (
              <div 
                key={t.id} 
                className="group relative bg-[#160B21] border border-white/10 rounded-[40px] p-8 transition-all duration-500 hover:border-[#7B39ED]/50 hover:bg-[#1c0e2a] flex flex-col items-center text-center"
              >
                {/* Status Badge */}
                <div className={`mb-6 px-4 py-1.5 rounded-full text-[10px] font-black border flex items-center gap-2 ${
                  t.status === 'LIVE' ? 'border-red-500/50 text-red-500 bg-red-500/10' : 'border-white/20 text-white/60'
                }`}>
                  {t.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                  {t.status}
                </div>

                <div className="w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-[#7B39ED]/20 to-transparent flex items-center justify-center text-[#7B39ED] group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={40} />
                </div>

                <h3 className="text-2xl font-black mb-2 tracking-tight">{t.title}</h3>
                <p className="text-[#FACC15] font-bold text-xs uppercase tracking-widest mb-8">{t.game}</p>

                <div className="w-full grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] text-white/40 font-bold uppercase mb-1">Prize</span>
                    <span className="font-black text-sm">{t.prizePool}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <span className="text-[10px] text-white/40 font-bold uppercase mb-1">Slots</span>
                    <span className="font-black text-sm">{t.participants}</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-white text-black font-black text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FACC15] transition-all active:scale-95">
                  JOIN TOURNAMENT
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}