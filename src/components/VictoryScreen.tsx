import React from 'react';
import { useGameStore } from '~/store/gameStore';

export const VictoryScreen: React.FC = () => {
  const { guild } = useGameStore();

  return (
    <div className="fixed inset-0 z-[200] bg-stone-950 flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 blur-[200px] rounded-full animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <div className="relative z-10 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
        <div className="space-y-4">
           <div className="text-8xl mb-8 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">🏰</div>
           <h1 className="text-8xl font-black font-heading text-white tracking-tighter text-glow">
             SOVEREIGN <span className="text-primary">RECLAIMED</span>
           </h1>
           <p className="text-stone-400 font-serif italic text-2xl max-w-2xl mx-auto">
             "The Banner of Coin flies over the seat of the world. Your names are carved into the very stone of history."
           </p>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto w-full">
           <div className="glass p-8 rounded-3xl border border-white/10">
              <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-2">Final Rank</div>
              <div className="text-3xl font-black text-white">{guild.guildRank}</div>
              <div className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">Keep Warden</div>
           </div>
           <div className="glass p-8 rounded-3xl border border-white/10">
              <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-2">Total Wealth</div>
              <div className="text-3xl font-black text-white">{guild.resources.gold}g</div>
              <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Industrial Power</div>
           </div>
           <div className="glass p-8 rounded-3xl border border-white/10">
              <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-2">Contracts</div>
              <div className="text-3xl font-black text-white">{guild.completedContracts}</div>
              <div className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-1">Legendary Record</div>
           </div>
        </div>

        <div className="pt-12">
          <button 
            onClick={() => window.location.reload()}
            className="px-16 py-6 bg-white text-stone-950 text-xl font-black uppercase tracking-[0.4em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
          >
            Start New Legacy
          </button>
        </div>
      </div>
    </div>
  );
};
