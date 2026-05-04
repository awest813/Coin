import { useGameStore } from '~/store/gameStore';
import { getRoomEffect } from '~/simulation/missionSim';
import { WEATHER_IDS, type WeatherId } from '~/types/guild';

const FIRE_GLOWS = [
  { id: 'courtyard-fire', x: '51.5%', y: '43%', size: '112px', delay: '0s' },
  { id: 'forge-fire', x: '78%', y: '34%', size: '96px', delay: '0.45s' },
  { id: 'tavern-hearth', x: '34%', y: '64%', size: '82px', delay: '0.9s' },
  { id: 'front-torches', x: '64%', y: '66%', size: '76px', delay: '1.2s' },
  { id: 'left-yard-torches', x: '16%', y: '55%', size: '70px', delay: '0.7s' },
];

const WEATHER_ICON: Record<WeatherId, string> = {
  clear: '☀️',
  rain: '🌧️',
  snow: '❄️',
  night: '🌙',
  storm: '⛈️',
};

export function GuildDashboard() {
  const {
    guild,
    mercenaries,
    activeMissions,
    resetSave,
    setScreen,
    upgradeRoom,
    pendingEvents,
    resolveEventChoice,
  } = useGameStore();

  const availableMercs = mercenaries.filter((m) => !m.isInjured && !m.isFatigued);
  const injuredMercs = mercenaries.filter((m) => m.isInjured);
  const fatiguedMercs = mercenaries.filter((m) => m.isFatigued && !m.isInjured);
  const currentWeather = WEATHER_IDS.includes(guild.currentWeather)
    ? guild.currentWeather
    : 'clear';

  function canAffordUpgrade(roomId: string): boolean {
    const room = guild.rooms.find((r) => r.id === roomId);
    if (!room || room.level >= room.maxLevel) return false;
    const cost = room.levels[room.level - 1].upgradeCost;
    return (
      guild.resources.gold >= cost.gold &&
      guild.resources.supplies >= cost.supplies &&
      guild.resources.renown >= cost.renown
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 3-D Diorama Section */}
      <div className="relative group overflow-hidden rounded-[2.5rem] glass-dark border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]">
        <div className="h-[450px] relative">
          <img
            src="/assets/guild-diorama-pregenerated.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable={false}
          />
          <div className="diorama-light-layer" aria-hidden="true">
            {FIRE_GLOWS.map((glow) => (
              <span
                key={glow.id}
                className="diorama-fire-glow"
                style={{
                  left: glow.x,
                  top: glow.y,
                  width: glow.size,
                  height: glow.size,
                  animationDelay: glow.delay,
                }}
              />
            ))}
          </div>
          <div
            className={`diorama-weather-layer diorama-weather-${currentWeather}`}
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-[3] bg-gradient-to-b from-stone-950/10 via-transparent to-background/80 pointer-events-none" />
          <div className="absolute inset-0 z-[5] ring-1 ring-inset ring-white/5 pointer-events-none" />
          <div className="absolute top-4 right-4 z-[4] sm:hidden glass px-3 py-2 rounded-2xl border border-white/5 flex items-center gap-2 shadow-xl pointer-events-auto">
            <div className="text-xl">{WEATHER_ICON[currentWeather]}</div>
            <div className="text-[9px] text-white font-bold uppercase tracking-widest">{currentWeather}</div>
          </div>
          
          {/* Floating UI overlay on Diorama */}
          <div className="absolute inset-x-0 bottom-0 z-[4] p-8 bg-gradient-to-t from-background via-background/60 to-transparent flex justify-between items-end pointer-events-none">
            <div className="pointer-events-auto">
              <h1 className="text-[clamp(2.15rem,9vw,3rem)] sm:text-5xl font-black font-heading text-white mb-3 tracking-tighter flex items-end gap-3 sm:gap-4 text-glow leading-[0.92] sm:leading-none"><span className="text-primary drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] shrink-0">&#127984;</span><span className="min-w-0 max-w-[10ch] sm:max-w-none">{guild.name}</span></h1>
              <div className="flex gap-4">
                <span className="stat-badge bg-primary/20 text-primary border-primary/30">
                  Rank {guild.guildRank} Guild
                </span>
                <span className="stat-badge text-stone-400">
                  {guild.completedContracts} Contracts Completed
                </span>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end gap-3 pointer-events-auto">
               {/* Weather Indicator */}
               <div className="glass px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-right-4 duration-1000">
                  <div className="text-2xl">{WEATHER_ICON[currentWeather]}</div>
                  <div className="text-right">
                    <div className="text-[8px] text-stone-500 font-black uppercase tracking-[0.2em]">Atmosphere</div>
                    <div className="text-[10px] text-white font-bold uppercase tracking-widest">{currentWeather}</div>
                  </div>
               </div>

               <div className="hidden md:flex gap-3 text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  <span>🛏️ Barracks</span>
                  <span>🍺 Tavern</span>
                  <span>🔨 Forge</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { 
            label: 'Gold', 
            value: `${Math.floor(guild.resources.gold)}g`, 
            icon: '💰', 
            color: 'text-amber-400',
            glow: 'shadow-amber-500/20',
            rate: getRoomEffect(guild.rooms.find(r => r.id === 'room_tavern')!, 'passiveGold'),
            cap: 1000 + guild.guildRank * 1000
          },
          { 
            label: 'Renown', 
            value: guild.resources.renown, 
            icon: '⭐', 
            color: 'text-yellow-400',
            glow: 'shadow-yellow-500/20',
          },
          { 
            label: 'Supplies', 
            value: Math.floor(guild.resources.supplies), 
            icon: '🧴', 
            color: 'text-emerald-400',
            glow: 'shadow-emerald-500/20',
            rate: getRoomEffect(guild.rooms.find(r => r.id === 'room_barracks')!, 'passiveSupplies'),
            cap: 100 + guild.guildRank * 200
          },
        ].map((r) => (
          <div key={r.label} className={`premium-card group shadow-2xl ${r.glow} shimmer-effect`}>
            <div className="flex justify-between items-start mb-4">
              <div className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-500">{r.icon}</div>
              {r.rate !== undefined && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  +{r.rate.toFixed(2)}/s
                </span>
              )}
            </div>
            <div className={`text-3xl font-bold font-sans mb-1 ${r.color}`}>
              {r.value}
            </div>
            <div className="text-stone-500 text-xs uppercase tracking-widest font-semibold">{r.label}</div>
            
            {r.cap !== undefined && (
              <div className="mt-4 space-y-1.5">
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${r.color.replace('text-', 'bg-')}`} 
                    style={{ width: `${Math.min(100, (Number(r.value.toString().replace('g', '')) / r.cap!) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-stone-500 font-medium">
                  <span>Capacity</span>
                  <span>{r.cap} max</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Events & Active Missions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pending Events */}
          {pendingEvents.length > 0 && (
            <div className="glass rounded-2xl p-6 border-l-4 border-l-primary shadow-xl animate-pulse">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-primary text-xl">📢</span> Action Required
                <span className="ml-auto bg-primary text-stone-950 text-[10px] font-black px-2 py-1 rounded-full">
                  {pendingEvents.length}
                </span>
              </h3>
              <div className="space-y-4">
                {pendingEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="glass-dark p-4 rounded-xl border border-white/5">
                    <div className="font-bold text-amber-400 text-sm mb-1">{event.title}</div>
                    <p className="text-stone-400 text-[11px] mb-4 italic leading-relaxed">{event.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.choices?.map((choice, i) => (
                        <button
                          key={i}
                          onClick={() => resolveEventChoice(event.id, i)}
                          className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold rounded-lg transition-all haptic-click active:scale-95"
                        >
                          {choice.label}
                        </button>
                      )) || (
                        <button
                          onClick={() => resolveEventChoice(event.id, -1)}
                          className="w-full px-3 py-2 bg-primary text-stone-950 text-[10px] font-bold rounded-lg transition-all haptic-click active:scale-95"
                        >
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Missions Summary */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-heading">
              <span className="text-primary">⚔️</span> Active Contracts
            </h3>
            {activeMissions.length > 0 ? (
              <div className="space-y-3">
                {activeMissions.map((am) => {
                  const remaining = Math.max(0, Math.floor((new Date(am.endTime).getTime() - useGameStore.getState().currentTime) / 1000));
                  const isDone = remaining <= 0;
                  return (
                    <div key={am.missionRunId} className="glass-dark p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setScreen('missions')}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-stone-300 uppercase tracking-tighter">Mission #{am.missionRunId.slice(-4)}</span>
                        <span className={`text-[10px] font-mono font-bold ${isDone ? 'text-primary animate-pulse' : 'text-stone-500'}`}>
                          {isDone ? 'READY' : `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            style={{ width: isDone ? '100%' : '50%' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => setScreen('missions')}
                  className="w-full mt-4 py-2 text-xs font-bold text-primary hover:text-white transition-colors flex items-center justify-center gap-2 haptic-click"
                >
                  Go to Mission Board <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center bg-black/20 rounded-xl border border-dashed border-white/10">
                <p className="text-stone-600 text-xs italic font-serif">No active contracts. Send mercs from the board.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Room Upgrades & Roster Stats */}
        <div className="lg:col-span-2 space-y-8">
           {/* Roster Quick Look */}
           <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Guild Roster</h3>
                <button 
                  onClick={() => setScreen('roster')}
                  className="stat-badge hover:bg-white/10 transition-colors text-stone-400 haptic-click"
                >
                  View All {mercenaries.length} Mercs →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                {[
                  { label: 'Ready', count: availableMercs.length, color: 'text-emerald-400' },
                  { label: 'Injured', count: injuredMercs.length, color: 'text-rose-400' },
                  { label: 'Fatigued', count: fatiguedMercs.length, color: 'text-amber-400' },
                  { label: 'Deployed', count: activeMissions.flatMap(am => am.assignedMercIds).length, color: 'text-primary' },
                ].map(stat => (
                  <div key={stat.label} className="glass-dark p-4 rounded-2xl text-center border border-white/5">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
           </div>

           {/* Guild Operations (Automation) */}
           {guild.guildRank >= 4 && (
             <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl animate-in slide-in-from-right-8 duration-700">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Guild Operations</h3>
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md">Rank 4+ Unlocked</span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Auto-Deploy */}
                 <div className={`p-6 rounded-2xl border transition-all ${guild.automationSettings.autoDeploy ? 'bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'bg-white/5 border-white/5 grayscale opacity-60'}`}>
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h4 className="text-sm font-bold text-white mb-1">Tactical Auto-Deploy</h4>
                       <p className="text-[10px] text-stone-500 italic font-serif">Sends idle personnel on new contracts automatically.</p>
                     </div>
                     <button 
                       onClick={() => useGameStore.getState().setAutomationSetting('autoDeploy', !guild.automationSettings.autoDeploy)}
                       className={`w-12 h-6 rounded-full relative transition-colors haptic-click ${guild.automationSettings.autoDeploy ? 'bg-primary' : 'bg-stone-700'}`}
                     >
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${guild.automationSettings.autoDeploy ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                   </div>
                 </div>

                 {/* Auto-Refill */}
                 <div className={`p-6 rounded-2xl border transition-all ${guild.guildRank < 5 ? 'opacity-30 grayscale cursor-not-allowed border-white/5' : guild.automationSettings.autoRefill ? 'bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'bg-white/5 border-white/5 grayscale opacity-60'}`}>
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <h4 className="text-sm font-bold text-white">Logistical Auto-Refill</h4>
                         {guild.guildRank < 5 && <span className="text-[8px] bg-stone-800 text-stone-500 px-1 rounded uppercase">Rank 5 Required</span>}
                       </div>
                       <p className="text-[10px] text-stone-500 italic font-serif">Replenishes basic rations and field supplies automatically.</p>
                     </div>
                     <button 
                       disabled={guild.guildRank < 5}
                       onClick={() => useGameStore.getState().setAutomationSetting('autoRefill', !guild.automationSettings.autoRefill)}
                       className={`w-12 h-6 rounded-full relative transition-colors haptic-click ${guild.automationSettings.autoRefill ? 'bg-primary' : 'bg-stone-700'} ${guild.guildRank < 5 ? 'cursor-not-allowed opacity-50' : ''}`}
                     >
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${guild.automationSettings.autoRefill ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Room Overhaul */}
           <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight font-heading">Guild Hall Improvements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guild.rooms.map((room) => (
                  <div key={room.id} className="glass-dark rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        {room.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-bold font-heading text-sm">{room.name}</h4>
                        <div className="flex gap-1 mt-1">
                          {[...Array(room.maxLevel)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-1 w-4 rounded-full ${i < room.level ? 'bg-primary shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'bg-white/10'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-stone-400 text-xs mb-4 min-h-[32px] line-clamp-2 italic font-serif">
                      {room.levels[room.level - 1].description}
                    </p>

                    <div className="space-y-2 mb-6">
                      {Object.entries(room.levels[room.level - 1].effects).map(([k, v]) => (
                        <div key={k} className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                          {effectLabel(room.id, k, v)}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => upgradeRoom(room.id)}
                      disabled={room.level >= room.maxLevel || !canAffordUpgrade(room.id)}
                      className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all haptic-click ${
                        room.level >= room.maxLevel 
                          ? 'bg-stone-800 text-stone-600 cursor-not-allowed' 
                          : canAffordUpgrade(room.id)
                            ? 'bg-primary text-stone-950 hover:scale-[1.02] active:scale-[0.95] shadow-lg shadow-primary/20'
                            : 'bg-white/5 text-stone-500 cursor-not-allowed border border-white/10'
                      }`}
                    >
                      {room.level >= room.maxLevel 
                        ? 'MAX LEVEL' 
                        : canAffordUpgrade(room.id)
                          ? `Upgrade (Lvl ${room.level + 1})`
                          : `Insufficient Funds`}
                    </button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Reset with minimal presence */}
      <div className="pt-12 text-center opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={() => confirm('Wipe all progress? This cannot be undone.') && resetSave()}
          className="text-[10px] text-stone-600 hover:text-rose-500 font-bold uppercase tracking-[0.3em] transition-colors"
        >
          Destructive Reset Save Data
        </button>
      </div>
    </div>
  );
}

function effectLabel(roomId: string, key: string, val: number): string {
  if (roomId === 'room_barracks') {
    if (key === 'rosterCap') return `Roster cap: ${val} mercs`;
    if (key === 'recoveryBonus') return val > 0 ? `+${val} injury recovery speed` : 'Standard recovery';
    if (key === 'passiveSupplies') return `+${val} supplies / sec`;
  }
  if (roomId === 'room_tavern') {
    if (key === 'moraleBonus') return val > 0 ? `+${val} morale after missions` : 'Morale stable';
    if (key === 'eventChance') return val > 0 ? `+${val} event frequency` : 'Standard event rate';
    if (key === 'passiveGold') return `+${val} gold / sec`;
  }
  if (roomId === 'room_forge') {
    if (key === 'lootBonus') return val > 0 ? `+${val} extra loot on success` : 'Standard loot';
    if (key === 'forgeLevel') return `Forge level ${val}`;
  }
  return `${key}: ${val}`;
}
