import { useGameStore } from '~/store/gameStore';
import { ARTIFACTS } from '~/data/artifacts';
import { MATERIALS_MAP } from '~/data/materials';

export function Reliquary() {
  const { guild, forgeArtifact } = useGameStore();
  const { unlockedArtifactIds, materials, resources } = guild;

  const canForge = (artifactId: string) => {
    if (unlockedArtifactIds.includes(artifactId)) return false;
    const art = ARTIFACTS.find(a => a.id === artifactId);
    if (!art) return false;
    
    if (resources.gold < art.cost.gold) return false;
    if (resources.renown < art.cost.renown) return false;
    
    for (const [matId, qty] of Object.entries(art.cost.materials)) {
      if ((materials[matId] ?? 0) < qty) return false;
    }
    
    return true;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">The Master Forge</span>
          </div>
          <h1 className="text-6xl font-black font-heading text-white tracking-tighter text-glow">
            Reliquary of Coin
          </h1>
          <p className="text-stone-500 max-w-2xl italic font-serif text-lg leading-relaxed">
            "These are not mere trinkets. They are the echoes of a thousand victories, forged in the fires of ambition and cooled in the blood of our enemies."
          </p>
        </div>

        <div className="flex gap-8 items-center glass-dark px-8 py-5 rounded-[2rem] border border-white/5">
           <div className="text-right">
              <div className="text-[10px] text-stone-600 font-black uppercase tracking-[0.2em] mb-1">Restoration Status</div>
              <div className="text-3xl font-black text-white font-mono">
                {Math.floor((unlockedArtifactIds.length / ARTIFACTS.length) * 100)}%
              </div>
           </div>
           <div className="w-px h-10 bg-white/5" />
           <div className="flex -space-x-3">
               {ARTIFACTS.map(a => (
                <div 
                  key={a.id} 
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-500 ${
                    unlockedArtifactIds.includes(a.id) 
                      ? 'border-amber-500/50 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                      : 'border-white/5 bg-stone-900/50 opacity-40'
                  }`}
                >
                  {unlockedArtifactIds.includes(a.id) ? a.icon : '❓'}
                </div>
              ))}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {ARTIFACTS.map((art) => {
          const isUnlocked = unlockedArtifactIds.includes(art.id);
          const craftable = canForge(art.id);

          return (
            <div 
              key={art.id} 
              className={`group relative glass-dark rounded-[3.5rem] border-2 p-10 transition-all duration-700 flex flex-col ${
                isUnlocked 
                ? 'border-amber-500/30 bg-amber-500/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_60px_rgba(245,158,11,0.05)]' 
                : craftable
                ? 'border-amber-500/20 bg-amber-500/[0.01] animate-pulse-subtle cursor-pointer'
                : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Background Glow Effect */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none" />
              )}
              
              {isUnlocked && (
                <div className="absolute top-8 right-10">
                  <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest shimmer-effect">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Operational
                  </span>
                </div>
              )}

              <div className="relative z-10 flex-1 space-y-10">
                <div className="flex items-center gap-8">
                  <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl transition-transform duration-700 group-hover:scale-105 ${
                    isUnlocked ? 'bg-amber-500/10 border-2 border-amber-500/20 text-glow' : 'bg-white/5 border border-white/5 grayscale opacity-40'
                  }`}>
                    {art.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black font-heading text-white tracking-tight">{art.name}</h3>
                    <div className="flex gap-2">
                       {art.modifiers.map((mod, i) => (
                         <span key={i} className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] bg-amber-500/10 px-3 py-1 rounded-lg">
                           {mod.type.replace('_', ' ')}
                         </span>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-stone-300 text-lg font-medium leading-relaxed italic border-l-2 border-amber-500/30 pl-6">
                    "{art.lore}"
                  </p>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-lg">
                    {art.description}
                  </p>
                </div>

                {!isUnlocked && (
                  <div className="space-y-5 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Required Forging Materials</h4>
                       <div className="h-px flex-1 mx-6 bg-white/5" />
                    </div>
                    <div className="flex flex-wrap gap-3">
                       <ResourceTag 
                         icon="💰" 
                         label={`${art.cost.gold}g`} 
                         met={resources.gold >= art.cost.gold} 
                         current={resources.gold} 
                       />
                       <ResourceTag 
                         icon="⭐" 
                         label={`${art.cost.renown} Renown`} 
                         met={resources.renown >= art.cost.renown} 
                         current={resources.renown} 
                       />
                       {Object.entries(art.cost.materials).map(([matId, qty]) => {
                         const mat = MATERIALS_MAP[matId];
                         const have = materials[matId] ?? 0;
                         return (
                           <ResourceTag 
                             key={matId}
                             icon={mat?.icon ?? '📦'} 
                             label={`${qty} ${mat?.name ?? matId}`} 
                             met={have >= qty} 
                             current={have} 
                           />
                         );
                       })}
                    </div>
                  </div>
                )}
              </div>

              {!isUnlocked && (
                <button
                  onClick={() => forgeArtifact(art.id)}
                  disabled={!craftable}
                  className={`mt-10 w-full py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.5em] transition-all haptic-click overflow-hidden relative group ${
                    craftable
                      ? 'bg-amber-500 text-stone-950 shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-95'
                      : 'bg-white/5 text-stone-700 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span className="relative z-10">{craftable ? 'Commence Forging' : 'Resources Insufficient'}</span>
                  {craftable && (
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourceTag({ icon, label, met, current }: { icon: string; label: string; met: boolean; current: number }) {
  return (
    <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 transition-colors ${
      met ? 'bg-white/5 border-white/10 text-stone-300' : 'bg-rose-500/5 border-rose-500/10 text-rose-500/60'
    }`}>
      <span className="text-base">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] font-black tracking-tight">{label}</span>
        <span className="text-[8px] opacity-40 font-mono font-bold">Stock: {Math.floor(current)}</span>
      </div>
    </div>
  );
}
