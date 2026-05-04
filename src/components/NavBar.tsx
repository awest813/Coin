import { useGameStore } from '~/store/gameStore';
import type { ActiveScreen } from '~/store/gameStore';
import { getAllActivePerks } from '~/data/regions';

const NAV_ITEMS: { id: ActiveScreen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Guild Hall', icon: '🏰' },
  { id: 'roster', label: 'Roster', icon: '⚔️' },
  { id: 'missions', label: 'Missions', icon: '📋' },
  { id: 'inventory', label: 'Inventory', icon: '🎒' },
  { id: 'workshop', label: 'Workshop', icon: '🔨' },
  { id: 'hiring', label: 'Hiring', icon: '🧑‍🤝‍🧑' },
  { id: 'expeditions', label: 'Expeditions', icon: '🗺️' },
  { id: 'worldmap', label: 'Influence', icon: '🌐' },
  { id: 'reliquary', label: 'Reliquary', icon: '🏺' },
  { id: 'chronicles', label: 'Chronicles', icon: '📖' },
  { id: 'customization', label: 'Custom Hall', icon: '🎭' },
  { id: 'policies', label: 'Policies', icon: '📜' },
];

export function NavBar() {
  const { activeScreen, setScreen, guild, pendingEvents, activeMissions } = useGameStore();
  const activePerks = getAllActivePerks(guild.regionalInfluence ?? {});

  return (
    <nav className="sticky top-0 z-[100] w-full px-6 py-5 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="glass rounded-[2rem] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-4 bg-stone-950/60 backdrop-blur-3xl">
        
        {/* Guild Branding */}
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-2xl shadow-[0_8px_20px_rgba(251,191,36,0.2)] border border-primary/30 icon-premium">
            🏴
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-black font-heading tracking-tighter flex items-center gap-3 leading-none text-xl text-glow">
              {guild.name}
              {pendingEvents.length > 0 && (
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              )}
            </h1>
            <span className="text-stone-500 text-[9px] uppercase tracking-[0.4em] font-black mt-2 opacity-60">RANK {guild.guildRank} SOVEREIGN GUILD</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-black/60 p-2 rounded-2xl border border-white/5 gap-1.5 overflow-x-auto no-scrollbar max-w-full glass-dark">
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            const anyMissionReady = activeMissions.some(am => new Date(am.endTime).getTime() <= useGameStore.getState().currentTime);
            
            let showBadge = false;
            if (item.id === 'worldmap' && activePerks.size > 0) showBadge = true;
            if (item.id === 'dashboard' && (pendingEvents.length > 0 || useGameStore.getState().activeHeroQuest)) showBadge = true;
            if (item.id === 'missions' && anyMissionReady) showBadge = true;

            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap flex items-center gap-2.5 haptic-click relative ${
                  isActive 
                  ? 'bg-primary text-stone-950 shadow-[0_4px_15px_rgba(251,191,36,0.3)] scale-[1.02]' 
                  : 'text-stone-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base icon-premium">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-stone-950 animate-pulse flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                    <span className="w-1.5 h-1.5 bg-stone-950 rounded-full" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Resources */}
        <div className="flex gap-6 shimmer-effect px-4 py-2 bg-black/20 rounded-2xl border border-white/5">
           {[
             { label: 'Gold', val: Math.floor(guild.resources.gold), icon: '💰', color: 'text-primary' },
             { label: 'Renown', val: guild.resources.renown, icon: '⭐', color: 'text-yellow-500' },
             { label: 'Supplies', val: Math.floor(guild.resources.supplies), icon: '🧴', color: 'text-emerald-400' },
           ].map(res => (
             <div key={res.label} className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                   <span className="text-sm icon-premium">{res.icon}</span>
                   <span className={`font-mono font-black text-base tracking-tighter ${res.color} text-glow`}>{res.val.toLocaleString()}</span>
                </div>
                <span className="text-[8px] text-stone-600 font-black uppercase tracking-[0.2em] leading-none mt-1">{res.label}</span>
             </div>
           ))}
        </div>
      </div>
    </nav>
  );
}

