import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { ITEMS_MAP } from '~/data/items';
import { MATERIALS_MAP } from '~/data/materials';
import { bondScoreToSentiment } from '~/simulation/bondSim';
import { MISSION_TEMPLATES } from '~/data/missions';

const OUTCOME_STYLE = {
  success: { label: '✅ Success!', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700' },
  partial: { label: '⚠️ Partial Success', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700' },
  failure: { label: '❌ Failure', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700' },
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-stone-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  legendary: 'text-purple-400',
};

// Extended result type with Phase 2 fields
interface ExtendedMissionResult {
  templateId: string;
  outcome: 'success' | 'partial' | 'failure';
  partyScore: number;
  difficulty: number;
  narrativeEvents: string[];
  goldEarned: number;
  renownEarned: number;
  suppliesEarned?: number;
  itemsEarned: string[];
  injuredMercIds: string[];
  fatiguedMercIds: string[];
  scoreBreakdown: Array<{
    mercName: string;
    baseScore: number;
    traitBonus: number;
    equipBonus: number;
    relBonus: number;
    statusPenalty: number;
    total: number;
  }>;
  bondChanges?: Array<{ mercId1: string; mercId2: string; delta: number }>;
  materialsEarned?: Record<string, number>;
  synergies?: Array<{ name: string; scoreBonus: number; description: string }>;
}

export function ResultsModal() {
  const { lastResult, showResultModal, dismissResult, mercenaries, setScreen } = useGameStore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!showResultModal || !lastResult) return null;

  const result = lastResult as unknown as ExtendedMissionResult;
  const style = OUTCOME_STYLE[result.outcome];

  const bondChanges = result.bondChanges ?? [];
  const materialsEarned = result.materialsEarned ?? {};
  const synergies = result.synergies ?? [];
  const hasMaterials = Object.values(materialsEarned).some((q) => q > 0);

  // Find mission name from template ID
  const missionName = MISSION_TEMPLATES.find((t) => t.id === result.templateId)?.name;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
      <div className={`glass-dark rounded-[2.5rem] max-w-2xl w-full shadow-2xl border ${style.border} relative overflow-hidden my-auto`}>
        {/* Decorative background flair */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 opacity-20 blur-[60px] -translate-y-1/2 ${style.bg}`} />
        
        <header className="p-10 text-center relative z-10 border-b border-white/5 bg-white/5">
           <p className="text-stone-500 text-[10px] uppercase tracking-[0.4em] font-black mb-2">{missionName || 'Expedition Report'}</p>
           <h2 className={`text-4xl font-bold font-heading tracking-tight ${style.color}`}>{style.label}</h2>
           <div className="mt-4 inline-flex items-center gap-4 text-[10px] font-mono text-stone-500 uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full border border-white/5">
              <span>Score <span className="text-white">{result.partyScore}</span></span>
              <span className="opacity-30">|</span>
              <span>Difficulty <span className="text-white">{result.difficulty}</span></span>
           </div>
        </header>

        <div className="p-10 space-y-10">
          {/* Narrative Section */}
          <section className="space-y-4">
             {result.narrativeEvents.map((text, i) => (
               <p key={i} className={`text-lg leading-relaxed italic font-serif ${i === 0 ? 'text-stone-100' : 'text-stone-400 opacity-60 text-sm'}`}>
                 "{text}"
               </p>
             ))}
          </section>

          {/* Synergies & Modifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {synergies.length > 0 && (
               <section className="animate-in slide-in-from-left-4 duration-700">
                  <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                     <span className="text-xl icon-premium">⚡</span> Tactical Synergies
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                     {synergies.map(s => (
                        <div key={s.name} className="p-4 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden group">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-black text-white text-glow">{s.name}</span>
                              <span className="text-xs font-black text-primary">+{s.scoreBonus}</span>
                           </div>
                           <p className="text-[10px] text-stone-400 leading-tight italic">{s.description}</p>
                        </div>
                     ))}
                  </div>
               </section>
            )}

            <section className="animate-in slide-in-from-right-4 duration-700">
               <h4 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="text-xl icon-premium">💎</span> Strategic Analysis
               </h4>
               <div className="space-y-3">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-stone-300">
                        <span>Success Modifier</span>
                        <span className="text-amber-500">+{(result.partyScore - result.scoreBreakdown.reduce((s, e) => s + e.total, 0) - (result.synergies?.reduce((s, sy) => s + sy.scoreBonus, 0) ?? 0)).toFixed(1)}</span>
                     </div>
                     <p className="text-[8px] text-stone-500 mt-1 italic leading-tight">Combined bonus from active artifacts, regional perks, and guild morale.</p>
                  </div>
                  <div className="flex gap-2">
                     <span className="stat-badge text-[8px] bg-white/5 border-white/5 text-stone-500">
                        📜 Global Rank {Math.floor(result.difficulty / 5) || 1}
                     </span>
                     <span className="stat-badge text-[8px] bg-white/5 border-white/5 text-stone-500">
                        🗺️ Region Bonus Active
                     </span>
                  </div>
               </div>
            </section>
          </div>

          {/* Primary Rewards */}
          <section className="grid grid-cols-3 gap-6">
            <div className="glass p-5 rounded-3xl text-center group hover:bg-white/10 transition-all loot-pop" style={{ animationDelay: '0.1s' }}>
              <div className="text-primary font-black text-2xl">+{result.goldEarned}g</div>
              <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mt-1">Bounty</div>
            </div>
            <div className="glass p-5 rounded-3xl text-center group hover:bg-white/10 transition-all loot-pop" style={{ animationDelay: '0.3s' }}>
              <div className="text-yellow-500 font-black text-2xl">+{result.renownEarned}</div>
              <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mt-1">Renown</div>
            </div>
            {(result.suppliesEarned ?? 0) > 0 && (
              <div className="glass p-5 rounded-3xl text-center group hover:bg-white/10 transition-all loot-pop" style={{ animationDelay: '0.5s' }}>
                <div className="text-emerald-400 font-black text-2xl">+{result.suppliesEarned}</div>
                <div className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mt-1">Supplies</div>
              </div>
            )}
          </section>

          {/* Detailed Findings Grid */}
          {(hasMaterials || result.itemsEarned.length > 0 || bondChanges.length > 0) && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Materials & Items */}
              <div className="space-y-6">
                {hasMaterials && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest">Resources Found</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(materialsEarned).filter(([, q]) => q > 0).map(([id, q]) => {
                         const mat = MATERIALS_MAP[id];
                         return (
                           <span key={id} className="stat-badge text-[10px] bg-white/5 border-white/5 text-stone-300 loot-pop" style={{ animationDelay: '0.7s' }}>
                             {mat?.icon} {mat?.name} <span className="text-primary ml-1">x{q}</span>
                           </span>
                         );
                      })}
                    </div>
                  </div>
                )}
                {result.itemsEarned.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest">Artifacts & Gear</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.itemsEarned.map((id, i) => {
                         const item = ITEMS_MAP[id];
                         return (
                           <span key={i} className={`stat-badge text-[10px] bg-white/5 border-white/10 loot-pop ${RARITY_COLORS[item?.rarity || 'common']}`} style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                             {item?.icon} {item?.name}
                           </span>
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bonds & Relationships */}
              {bondChanges.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest">Dynamics</h4>
                  <div className="space-y-2">
                    {bondChanges.map((bc, i) => {
                      const m1 = mercenaries.find(m => m.id === bc.mercId1);
                      const m2 = mercenaries.find(m => m.id === bc.mercId2);
                      const sentiment = bondScoreToSentiment(m1?.bondScores?.[bc.mercId2] ?? 0);
                      return (
                        <div key={i} className="glass-dark p-3 rounded-xl border border-white/5 flex justify-between items-center">
                          <div className="text-[10px] text-stone-300 font-bold">{m1?.name} & {m2?.name}</div>
                          <div className="flex items-center gap-3">
                             <span className={`text-[10px] font-black ${bc.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                               {bc.delta > 0 ? '+' : ''}{bc.delta.toFixed(1)}
                             </span>
                             <span className="text-[9px] uppercase tracking-tighter text-stone-500 font-bold">{sentiment}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Casualties */}
          {(result.injuredMercIds.length > 0 || result.fatiguedMercIds.length > 0) && (
            <section className="space-y-3">
               <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest">Personnel Status</h4>
               <div className="flex flex-wrap gap-2">
                  {result.injuredMercIds.map(id => (
                    <span key={id} className="stat-badge text-[10px] bg-rose-950/30 text-rose-400 border-rose-900/50">
                       🩹 {mercenaries.find(m => m.id === id)?.name} (INJURED)
                    </span>
                  ))}
                  {result.fatiguedMercIds.map(id => (
                    <span key={id} className="stat-badge text-[10px] bg-amber-950/30 text-amber-400 border-amber-900/50">
                       😓 {mercenaries.find(m => m.id === id)?.name} (FATIGUED)
                    </span>
                  ))}
               </div>
            </section>
          )}

          {/* Breakdown Toggle */}
          <section>
             <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-[10px] font-black uppercase tracking-widest text-stone-600 hover:text-stone-400 transition-colors"
             >
                {showBreakdown ? 'Hide Deployment Metrics ▲' : 'View Deployment Metrics ▼'}
             </button>
             {showBreakdown && (
               <div className="mt-4 glass-dark rounded-3xl p-6 border border-white/5 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    {result.scoreBreakdown.map((entry, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div>
                          <div className="text-xs font-bold text-white">{entry.mercName}</div>
                          <div className="flex gap-3 mt-1">
                             <span className="text-[9px] text-stone-500">Base {entry.baseScore}</span>
                             {entry.traitBonus !== 0 && <span className="text-[9px] text-emerald-500">Trait +{entry.traitBonus}</span>}
                             {entry.relBonus !== 0 && <span className="text-[9px] text-primary">Bond {entry.relBonus > 0 ? '+' : ''}{entry.relBonus}</span>}
                          </div>
                        </div>
                        <div className="text-xs font-black font-mono text-stone-400">{entry.total}</div>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </section>
        </div>

        <footer className="p-10 border-t border-white/5 bg-white/5 flex gap-4">
           <button 
              onClick={() => { dismissResult(); setScreen('roster'); }}
              className="px-8 py-4 rounded-2xl text-stone-400 hover:text-white transition-all font-bold text-sm bg-white/5 border border-white/5 hover:border-white/10"
           >
              Personnel Roster
           </button>
           <button 
              onClick={() => { dismissResult(); setShowBreakdown(false); }}
              className="premium-button flex-1 py-4 text-sm font-black uppercase tracking-[0.2em]"
           >
              Dismiss Report
           </button>
        </footer>
      </div>
    </div>
  );
}
