import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { REGION_DATA, getAllActivePerks } from '~/data/regions';
import type { RegionData } from '~/data/regions';
import type { RegionalInfluence } from '~/types/guild';

const BIOME_ICONS: Record<string, string> = {
  forest: '🌲',
  marsh: '🌿',
  mountain: '⛰️',
  city: '🏙️',
  tundra: '❄️',
};

const BIOME_COLORS: Record<string, { bg: string; border: string; glow: string; bar: string }> = {
  forest:   { bg: 'bg-emerald-900/20',  border: 'border-emerald-500/20', glow: 'rgba(16,185,129,0.15)', bar: 'bg-emerald-500' },
  marsh:    { bg: 'bg-teal-900/20',     border: 'border-teal-500/20',    glow: 'rgba(20,184,166,0.15)',  bar: 'bg-teal-500'   },
  mountain: { bg: 'bg-slate-900/20',    border: 'border-slate-400/20',   glow: 'rgba(100,116,139,0.2)', bar: 'bg-slate-400'  },
  city:     { bg: 'bg-violet-900/20',   border: 'border-violet-500/20',  glow: 'rgba(139,92,246,0.15)', bar: 'bg-violet-500' },
  tundra:   { bg: 'bg-sky-900/20',      border: 'border-sky-400/20',     glow: 'rgba(56,189,248,0.15)', bar: 'bg-sky-400'    },
};

function RegionCard({
  region,
  influence,
  isUnlocked,
  isSelected,
  onClick,
}: {
  region: RegionData;
  influence: RegionalInfluence | undefined;
  isUnlocked: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const inf = influence ?? { influence: 0, maxInfluence: 50, unlockedPerks: [] };
  const pct = Math.min(100, (inf.influence / inf.maxInfluence) * 100);
  const colors = BIOME_COLORS[region.biome];
  const nextMilestone = region.milestones.find(m => inf.influence < m.threshold);
  const allUnlocked = region.milestones.every(m => inf.influence >= m.threshold);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-[2rem] border p-6 transition-all duration-500 group haptic-click relative overflow-hidden ${
        !isUnlocked
          ? 'opacity-40 grayscale border-white/5 bg-white/[0.02] cursor-not-allowed'
          : isSelected
          ? `${colors.bg} ${colors.border} scale-[1.01] shadow-lg`
          : `bg-white/[0.02] border-white/5 hover:${colors.border} hover:${colors.bg}`
      }`}
      disabled={!isUnlocked}
    >
      {/* Glow pulse for selected */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-[2rem] pointer-events-none"
          style={{ boxShadow: `inset 0 0 40px ${colors.glow}` }}
        />
      )}

      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'} ${isUnlocked ? colors.bg : 'bg-white/5'} border ${isUnlocked ? colors.border : 'border-white/5'}`}>
          {isUnlocked ? region.icon : '🔒'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className={`font-black font-heading text-base tracking-tight ${isUnlocked ? 'text-white' : 'text-stone-600'}`}>
              {region.name}
            </h3>
            {allUnlocked && isUnlocked && (
              <span className="stat-badge text-[8px] text-primary border-primary/20 bg-primary/5 shrink-0">✦ MASTERED</span>
            )}
            {!isUnlocked && (
              <span className="stat-badge text-[8px] text-stone-600 border-white/5 shrink-0">LOCKED</span>
            )}
          </div>

          {isUnlocked && (
            <>
              <p className="text-stone-500 text-[10px] italic font-serif line-clamp-1 mb-3">{region.flavorText}</p>

              {/* Influence Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-stone-500">Influence</span>
                  <span className="text-stone-400">{inf.influence} / {inf.maxInfluence}</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${colors.bar} shadow-sm`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {nextMilestone && (
                  <div className="text-[8px] text-stone-600 font-bold uppercase tracking-wider">
                    Next: {nextMilestone.label} at {nextMilestone.threshold} pts
                  </div>
                )}
              </div>
            </>
          )}
          {!isUnlocked && (
            <p className="text-stone-700 text-[10px] mt-1">Complete missions to unlock this region.</p>
          )}
        </div>
      </div>
    </button>
  );
}

export function WorldMap() {
  const { guild } = useGameStore();
  const [selected, setSelected] = useState<string | null>(REGION_DATA[0].id);

  const activePerks = getAllActivePerks(guild.regionalInfluence ?? {});
  const selectedRegion = REGION_DATA.find(r => r.id === selected);
  const selectedInfluence = selectedRegion
    ? (guild.regionalInfluence ?? {})[selectedRegion.name]
    : undefined;

  // Region Positions for Tactical Map View
  const REGION_POSITIONS: Record<string, { top: string; left: string }> = {
    thornwood: { top: '35%', left: '20%' },
    ashfen_marsh: { top: '65%', left: '25%' },
    grey_mountains: { top: '20%', left: '55%' },
    city_below: { top: '55%', left: '75%' },
    pale_border: { top: '15%', left: '85%' },
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategic Intelligence Hub</span>
          </div>
          <h1 className="text-6xl font-black font-heading text-white tracking-tighter text-glow">
            Continental Influence
          </h1>
          <p className="text-stone-500 max-w-xl italic font-serif text-lg leading-relaxed">
            "Your reach is your power. Secure the frontiers, infiltrate the capitals, and weave the guild into the very fabric of the world."
          </p>
        </div>

        {/* Global Influence Stats */}
        <div className="flex gap-10">
           <div className="text-right">
              <div className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mb-1">Active Mastery</div>
              <div className="text-3xl font-black text-white text-glow">
                {Array.from(Object.values(guild.regionalInfluence)).filter(ri => ri.unlockedPerks.length >= 2).length} <span className="text-stone-700">/ 5</span>
              </div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-stone-500 font-black uppercase tracking-[0.2em] mb-1">Total Perks</div>
              <div className="text-3xl font-black text-primary text-glow">
                {activePerks.size}
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Tactical Map View */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[16/10] bg-black/60 rounded-[3rem] border border-white/10 overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] glass-dark">
             {/* Perspective Grid Overlay */}
             <div className="absolute inset-0 opacity-20 pointer-events-none perspective-grid" />
             
             {/* Map Labels / Topology (Decorative) */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
             
             {/* SVG Connectors */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <path d="M 20% 35% L 25% 65% L 75% 55% L 55% 20% L 20% 35% Z" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 75% 55% L 85% 15% L 55% 20%" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
             </svg>

             {/* Region Nodes */}
             {REGION_DATA.map(r => {
               const pos = REGION_POSITIONS[r.id];
               const isUnlocked = guild.unlockedRegions.includes(r.name);
               const isSelected = selected === r.id;
               const colors = BIOME_COLORS[r.biome];
               const ri = (guild.regionalInfluence ?? {})[r.name];
               const mastered = ri && ri.unlockedPerks.length >= 2;

               return (
                 <button
                   key={r.id}
                   onClick={() => setSelected(r.id)}
                   className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group haptic-click ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                   style={{ top: pos.top, left: pos.left }}
                   disabled={!isUnlocked}
                 >
                   <div className={`w-16 h-16 rounded-[1.25rem] border-2 flex items-center justify-center text-3xl transition-all duration-700 relative ${
                     isSelected 
                     ? `${colors.border} bg-white/10 scale-125 shadow-[0_0_30px_${colors.glow}]` 
                     : mastered 
                     ? 'border-primary bg-primary/5 shimmer-effect' 
                     : 'border-white/10 bg-black/40 group-hover:border-white/30 group-hover:scale-110'
                   }`}>
                     {isUnlocked ? r.icon : '🔒'}
                     {mastered && (
                       <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[10px] text-stone-950 font-black shadow-lg">
                         ★
                       </span>
                     )}
                   </div>
                   <div className={`mt-3 px-3 py-1 rounded-lg border transition-all duration-500 ${
                     isSelected ? 'bg-white/10 border-white/20' : 'bg-black/60 border-transparent'
                   }`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}`}>
                        {r.name}
                      </span>
                   </div>
                 </button>
               );
             })}
          </div>

          {/* Strategic Overview Card */}
          <div className="premium-card p-8 bg-primary/5 border-primary/20">
             <div className="flex gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl text-primary icon-premium">🛰️</div>
                <div className="flex-1">
                   <h3 className="text-xl font-black font-heading text-white mb-2">Regional Synergies</h3>
                   <p className="text-stone-400 text-sm leading-relaxed italic">
                     "Each region provides a unique tactical advantage. By mastering multiple territories, you weave a net of operational perks that make the guild untouchable."
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Intelligence Detail Panel */}
        <div className="lg:col-span-5 space-y-8">
          {selectedRegion && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700" key={selectedRegion.id}>
               <div className={`glass-dark rounded-[3rem] border-2 p-10 relative overflow-hidden transition-all duration-1000 ${BIOME_COLORS[selectedRegion.biome].border} ${BIOME_COLORS[selectedRegion.biome].bg}`}>
                  <div className="absolute top-0 right-0 text-[12rem] opacity-[0.03] leading-none pointer-events-none rotate-12">{selectedRegion.icon}</div>
                  
                  <div className="relative z-10 space-y-8">
                    <header>
                      <div className="flex items-center gap-4 mb-3">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">STRATEGIC REPORT</span>
                         <div className="flex-1 h-[1px] bg-white/10" />
                         <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">{selectedRegion.biome}</span>
                      </div>
                      <h2 className="text-5xl font-black font-heading text-white tracking-tighter text-glow">{selectedRegion.name}</h2>
                      <p className="text-stone-400 text-lg italic font-serif leading-relaxed mt-4">"{selectedRegion.flavorText}"</p>
                    </header>

                    <div className="space-y-6">
                       <div className="flex justify-between items-end">
                          <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Operational Influence</h4>
                          <span className="text-xl font-black font-mono text-white">
                            {selectedInfluence?.influence ?? 0} <span className="text-stone-700">/ {selectedInfluence?.maxInfluence ?? 100}</span>
                          </span>
                       </div>
                       <div className="h-3 bg-black/60 rounded-full border border-white/5 overflow-hidden p-1 shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${BIOME_COLORS[selectedRegion.biome].bar} shadow-[0_0_15px_rgba(251,191,36,0.2)]`}
                            style={{ width: `${Math.min(100, ((selectedInfluence?.influence ?? 0) / (selectedInfluence?.maxInfluence ?? 100)) * 100)}%` }}
                          />
                       </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-4">Milestone Perks</h4>
                       <div className="space-y-4">
                          {selectedRegion.milestones.map((m, i) => {
                            const unlocked = (selectedInfluence?.influence ?? 0) >= m.threshold;
                            return (
                              <div key={i} className={`p-5 rounded-[1.5rem] border transition-all duration-500 flex items-center gap-6 ${
                                unlocked 
                                ? 'bg-primary/10 border-primary/30 shadow-[0_8px_20px_rgba(0,0,0,0.2)]' 
                                : 'bg-black/40 border-white/5 opacity-60'
                              }`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${unlocked ? 'bg-primary text-stone-950 shadow-lg' : 'bg-white/5 text-stone-700'}`}>
                                  {unlocked ? '✦' : i + 1}
                                </div>
                                <div className="flex-1">
                                   <div className={`font-black text-sm uppercase tracking-wider mb-1 ${unlocked ? 'text-white text-glow' : 'text-stone-500'}`}>
                                     {m.label}
                                   </div>
                                   <p className={`text-[11px] leading-relaxed ${unlocked ? 'text-stone-300' : 'text-stone-600'}`}>
                                     {m.description}
                                   </p>
                                </div>
                                {!unlocked && (
                                  <div className="text-right shrink-0">
                                     <div className="text-[9px] font-black text-stone-700 uppercase tracking-widest">REQ</div>
                                     <div className="text-sm font-black font-mono text-stone-600">{m.threshold}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                       </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                       <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-4">Tactical Focus</h4>
                       <div className="flex flex-wrap gap-2">
                          {selectedRegion.relevantTags.map(tag => (
                            <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                              {tag}
                            </span>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
