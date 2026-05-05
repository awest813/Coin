import React from 'react';
import { useGameStore } from '~/store/gameStore';

export const VictoryScreen: React.FC = () => {
  const { guild } = useGameStore();

  return (
    <div className="fixed inset-0 z-[200] bg-stone-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 blur-[200px] rounded-full animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-950/40 to-stone-950" />
      </div>

      <div className="relative z-10 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-4">
           <div className="text-9xl mb-8 drop-shadow-[0_0_50px_rgba(251,191,36,0.8)] animate-float">🏰</div>
           <h1 className="text-[clamp(3rem,10vw,8rem)] font-black font-heading tracking-tighter metallic-gold leading-none">
             SOVEREIGN <br />
             <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">RECLAIMED</span>
           </h1>
           <p className="text-stone-400 font-serif italic text-2xl max-w-2xl mx-auto leading-relaxed mt-6">
             "The Banner of Coin flies over the seat of the world. Your names are carved into the very stone of history."
           </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
           {[
             { label: 'Final Rank', val: guild.guildRank, sub: 'Keep Warden', color: 'text-primary' },
             { label: 'Total Wealth', val: `${Math.floor(guild.resources.gold).toLocaleString()}g`, sub: 'Industrial Power', color: 'text-emerald-400' },
             { label: 'Contracts', val: guild.completedContracts, sub: 'Legendary Record', color: 'text-rose-500' }
           ].map((stat, i) => (
             <div key={i} className="weathered-panel p-10 rounded-[2.5rem] border border-white/5 shadow-2xl group hover:border-primary/40 transition-all duration-700">
                <div className="text-[10px] text-stone-500 font-black uppercase tracking-[0.3em] mb-4 group-hover:text-stone-400 transition-colors">{stat.label}</div>
                <div className={`text-5xl font-black mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-700`}>{stat.val}</div>
                <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">{stat.sub}</div>
             </div>
           ))}
        </div>

        <div className="pt-16">
          <button 
            onClick={() => window.location.reload()}
            className="group relative px-20 py-8 bg-white text-stone-950 text-xl font-black uppercase tracking-[0.5em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_25px_60px_rgba(255,255,255,0.15)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="relative z-10">Start New Legacy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
