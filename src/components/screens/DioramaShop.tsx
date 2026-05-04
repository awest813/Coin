import { useGameStore } from '~/store/gameStore';
import { DIORAMA_PROPS } from '~/types/customization';
import type { WeatherId } from '~/types/guild';

export function DioramaShop() {
  const { guild, unlockProp, setWeather } = useGameStore();
  const { unlockedPropIds, resources, currentWeather } = guild;

  const WEATHERS: { id: WeatherId; name: string; icon: string; desc: string }[] = [
    { id: 'clear', name: 'Standard Clarity', icon: '☀️', desc: 'The default operational environment.' },
    { id: 'rain', name: 'Crying Skies', icon: '🌧️', desc: 'A somber mood for the heavy-hearted.' },
    { id: 'snow', name: 'The Pale Breath', icon: '❄️', desc: 'A cold silence blankets the enclave.' },
    { id: 'night', name: 'Void Watch', icon: '🌙', desc: 'The guild operates under the stars.' },
    { id: 'storm', name: 'Tempest Fury', icon: '⛈️', desc: 'Unleash the full power of the elements.' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full">
            <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
            <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">Atmospheric Sanctum</span>
          </div>
          <h1 className="text-6xl font-black font-heading text-white tracking-tighter text-glow">
            Hall Aesthetics
          </h1>
          <p className="text-stone-500 max-w-2xl italic font-serif text-lg leading-relaxed">
            "Your guild hall is not just a building; it is a statement. Shape the air, the stone, and the very light to reflect your legend."
          </p>
        </div>

        <div className="stat-badge glass-dark px-8 py-5 border-white/5">
           <div className="text-right">
              <div className="text-[10px] text-stone-600 font-black uppercase tracking-[0.2em] mb-1">Guild Renown</div>
              <div className="text-3xl font-black text-primary text-glow">{resources.renown} ⭐</div>
           </div>
        </div>
      </header>

      {/* Atmospheric Selection */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
           <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.4em]">Environmental Ley-lines</h2>
           <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {WEATHERS.map((w) => (
            <button
              key={w.id}
              onClick={() => setWeather(w.id)}
              className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 haptic-click overflow-hidden ${
                currentWeather === w.id
                  ? 'bg-sky-500/10 border-sky-500/40 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`text-5xl mb-4 transition-transform duration-500 group-hover:scale-110 ${currentWeather === w.id ? 'text-glow' : 'opacity-40 grayscale'}`}>
                {w.icon}
              </div>
              <div className={`text-xs font-black uppercase tracking-widest mb-1 ${currentWeather === w.id ? 'text-white' : 'text-stone-600'}`}>
                {w.name}
              </div>
              <p className="text-[9px] text-stone-500 leading-tight italic font-serif">{w.desc}</p>
              
              {currentWeather === w.id && (
                <div className="absolute inset-0 bg-sky-500/5 shimmer-effect pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Grand Hall Additions */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
           <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.4em]">Grand Hall Installations</h2>
           <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {DIORAMA_PROPS.map((prop) => {
            const isUnlocked = unlockedPropIds.includes(prop.id);
            const canAfford = resources.renown >= prop.costRenown;

            return (
              <div 
                key={prop.id} 
                className={`relative glass-dark rounded-[3.5rem] border-2 p-10 transition-all duration-700 ${
                  isUnlocked 
                  ? 'border-emerald-500/30 bg-emerald-500/[0.01]' 
                  : 'border-white/5'
                }`}
              >
                <div className="flex items-start gap-10">
                  <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner transition-all duration-1000 ${
                    isUnlocked ? 'bg-emerald-500/10 border-2 border-emerald-500/20 text-glow' : 'bg-white/5 border border-white/5 grayscale opacity-30'
                  }`}>
                    {prop.icon}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-black font-heading text-white tracking-tight">{prop.name}</h3>
                      {isUnlocked && (
                        <span className="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          Installed
                        </span>
                      )}
                    </div>
                    <p className="text-stone-400 text-lg italic font-serif leading-relaxed">"{prop.description}"</p>
                    
                    {!isUnlocked && (
                      <button
                        onClick={() => unlockProp(prop.id)}
                        disabled={!canAfford}
                        className={`mt-6 w-full py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all haptic-click ${
                          canAfford
                            ? 'bg-white text-stone-950 hover:bg-primary shadow-2xl hover:scale-[1.01]'
                            : 'bg-white/5 text-stone-600 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? `Commission for ${prop.costRenown} Renown` : `Requires ${prop.costRenown} Renown`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
