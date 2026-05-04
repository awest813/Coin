import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { MercCard } from '~/components/MercCard';
import { ItemCard } from '~/components/ItemCard';
import { bondScoreToSentiment } from '~/simulation/bondSim';
import type { Mercenary, EquipmentSlot } from '~/types/mercenary';

const SLOTS: { slot: EquipmentSlot; label: string; icon: string }[] = [
  { slot: 'weapon', label: 'Weapon', icon: '⚔️' },
  { slot: 'armor', label: 'Armor', icon: '🛡️' },
  { slot: 'accessory', label: 'Accessory', icon: '💍' },
];

const SLOT_CATEGORIES: Record<EquipmentSlot, string[]> = {
  weapon: ['weapon'],
  armor: ['armor'],
  accessory: ['accessory'],
};

const SENTIMENT_ICON: Record<string, string> = {
  friend: '💚',
  rival: '⚡',
  neutral: '—',
  bonded: '🔗',
  friendly: '💚',
  close: '💛',
};

const SENTIMENT_COLOR: Record<string, string> = {
  friend: 'text-green-400',
  rival: 'text-red-400',
  neutral: 'text-stone-400',
  bonded: 'text-purple-400',
  friendly: 'text-green-400',
  close: 'text-yellow-400',
};

export function MercenaryRoster() {
  const { mercenaries, updateMercenary, items, guild, equipItem, unequipItem } = useGameStore();
  const [selected, setSelected] = useState<Mercenary | null>(null);
  const [equipSlot, setEquipSlot] = useState<EquipmentSlot | null>(null);

  // Keep selected in sync with store updates
  const selectedLive = selected ? mercenaries.find((m) => m.id === selected.id) ?? null : null;

  const inventoryItems = guild.inventoryItemIds
    .map((id) => items[id])
    .filter(Boolean);

  function handleEquipFromSlot(slot: EquipmentSlot) {
    setEquipSlot(equipSlot === slot ? null : slot);
  }

  function handleSelectItem(itemId: string) {
    if (!selectedLive || !equipSlot) return;
    equipItem(selectedLive.id, equipSlot, itemId);
    setEquipSlot(null);
  }

  function handleUnequip(slot: EquipmentSlot) {
    if (!selectedLive) return;
    unequipItem(selectedLive.id, slot);
  }

  const filteredInventory = equipSlot
    ? guild.inventoryItemIds
        .filter((id, idx, arr) => arr.indexOf(id) === idx) // unique
        .filter((id) => {
          const item = items[id];
          return item && SLOT_CATEGORIES[equipSlot].includes(item.category);
        })
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">⚔️</span>
            Personnel Roster
          </h1>
          <p className="text-stone-400 mt-2 max-w-md italic font-serif leading-relaxed">
            "Every face has a story, every story has a price. Keep your ledger clean."
          </p>
        </div>
        <div className="stat-badge glass">
          <span className="text-stone-500 mr-1 uppercase text-[10px] tracking-widest font-bold">Total Personnel</span>
          <span className="text-primary font-bold">{mercenaries.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mercenaries.map((merc) => (
          <MercCard
            key={merc.id}
            merc={merc}
            selected={selectedLive?.id === merc.id}
            onClick={() => {
              setSelected(selectedLive?.id === merc.id ? null : merc);
              setEquipSlot(null);
            }}
          />
        ))}
      </div>

      {selectedLive && (
        <div className="mt-12 premium-card bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Avatar & Lore */}
            <div className="lg:w-1/3 space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform duration-700">
                  {selectedLive.portrait}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white font-heading tracking-tight">{selectedLive.name}</h2>
                    {selectedLive.isLegendary && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[8px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                        Legendary
                      </span>
                    )}
                  </div>
                  <p className={`${selectedLive.isLegendary ? 'text-amber-500/80' : 'text-primary'} text-[10px] font-black uppercase tracking-[0.2em]`}>{selectedLive.title}</p>
                  <div className="mt-2 stat-badge bg-white/5 border-white/5 text-[9px] text-stone-500">
                    {selectedLive.missionsCompleted} Deployments Complete
                  </div>
                </div>
              </div>

              {(selectedLive.background || selectedLive.uniqueTrait) && (
                <div className={`p-6 glass-dark rounded-[2rem] border ${selectedLive.isLegendary ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-white/5'}`}>
                   {selectedLive.uniqueTrait && (
                     <div className="mb-4 pb-4 border-b border-white/5">
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                           Unique Trait
                        </div>
                        <p className="text-white text-sm font-bold">{selectedLive.uniqueTrait}</p>
                     </div>
                   )}
                  <p className="text-stone-400 text-sm italic font-serif leading-relaxed">
                    &ldquo;{selectedLive.background}&rdquo;
                  </p>
                </div>
              )}

              {/* Status Section */}
              {(selectedLive.isInjured || selectedLive.isFatigued) && (
                <div className="p-6 glass rounded-[2rem] border-rose-500/20 bg-rose-500/5 space-y-4">
                  <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Medical Alert</h4>
                  <div className="flex gap-2">
                    {selectedLive.isInjured && (
                      <span className="stat-badge bg-rose-950/50 text-rose-400 border-rose-900/50 text-[9px]">🩹 CRITICAL INJURY</span>
                    )}
                    {selectedLive.isFatigued && (
                      <span className="stat-badge bg-amber-950/50 text-amber-400 border-amber-900/50 text-[9px]">😓 EXTREME FATIGUE</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const updated = { ...selectedLive, isInjured: false, isFatigued: false };
                      updateMercenary(updated);
                    }}
                    className="w-full py-2 bg-rose-600 text-white text-[10px] font-black uppercase rounded-xl haptic-click shadow-lg shadow-rose-900/20"
                  >
                    Authorize Recovery Protocols
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Stats & Gear */}
            <div className="flex-1 space-y-8">
              {/* Core Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { key: 'strength', label: 'STR', desc: 'Increases combat success and physical tasks.' },
                  { key: 'agility', label: 'AGI', desc: 'Increases stealth, speed, and reaction time.' },
                  { key: 'intellect', label: 'INT', desc: 'Required for ruins, magic, and complex puzzles.' },
                  { key: 'presence', label: 'PRS', desc: 'Influences social outcomes, leadership, and morale.' }
                ].map((stat) => (
                  <div key={stat.key} className="glass-dark rounded-2xl p-4 text-center border border-white/5 hover:border-primary/30 transition-all group relative cursor-help" title={stat.desc}>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{selectedLive.stats[stat.key as keyof typeof selectedLive.stats]}</div>
                    <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Dynamics & Bonds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Vital Rhythms</h4>
                  <div className="space-y-4 glass-dark p-6 rounded-[2rem] border border-white/5">
                    {[
                      { label: 'Morale', value: selectedLive.morale, color: 'bg-yellow-500' },
                      { label: 'Loyalty', value: selectedLive.loyalty, color: 'bg-blue-500' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-stone-500 uppercase tracking-tighter">
                          <span>{label} Stability</span>
                          <span>{value}/10</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-1.5 shadow-inner">
                          <div
                            className={`${color} h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
                            style={{ width: `${value * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Social Dynamics</h4>
                  <div className="glass-dark p-6 rounded-[2rem] border border-white/5 min-h-[140px]">
                    {Object.keys(selectedLive.bondScores ?? {}).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedLive.bondScores ?? {})
                          .filter(([, s]) => s !== 0)
                          .map(([otherId, score]) => {
                            const other = mercenaries.find((m) => m.id === otherId);
                            if (!other) return null;
                            const sentiment = bondScoreToSentiment(score);
                            return (
                              <span
                                key={otherId}
                                className={`stat-badge text-[10px] ${SENTIMENT_COLOR[sentiment] ?? 'text-stone-300'}`}
                                title={`Bond score: ${score.toFixed(1)}`}
                              >
                                {SENTIMENT_ICON[sentiment] ?? '—'} {other.name}
                                <span className="text-stone-500 ml-1">({score > 0 ? '+' : ''}{score.toFixed(1)})</span>
                              </span>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-stone-600 text-[10px] italic font-serif">No established bonds in the guild.</p>
                    )}
                  </div>
                </div>

                {/* Training Program Section */}
                <div className="space-y-4 md:col-span-2">
                  <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Barracks: Training Program</h4>
                  <div className={`glass rounded-[2rem] p-6 border-2 transition-all ${selectedLive.isTraining ? 'border-primary/40 bg-primary/5' : 'border-white/5'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-stone-300 uppercase tracking-tight">
                            {selectedLive.isTraining ? 'Active Drill: Improving Stat' : 'Idle: Waiting for Orders'}
                          </span>
                          {selectedLive.isTraining && (
                            <span className="text-[10px] font-black text-primary animate-pulse uppercase">
                              Consuming Supplies
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {(['strength', 'agility', 'intellect', 'presence'] as const).map(stat => (
                            <button
                              key={stat}
                              onClick={() => useGameStore.getState().toggleTraining(selectedLive.id, stat)}
                              disabled={selectedLive.isTraining && selectedLive.trainingStat !== stat}
                              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all haptic-click ${
                                selectedLive.trainingStat === stat 
                                  ? 'bg-primary text-stone-950 border-primary' 
                                  : 'bg-white/5 text-stone-500 border-white/5 hover:border-white/10'
                              } ${selectedLive.isTraining && selectedLive.trainingStat !== stat ? 'opacity-30' : ''}`}
                            >
                              {stat.slice(0, 3)}
                            </button>
                          ))}
                        </div>

                        {selectedLive.isTraining && (
                          <div className="space-y-1.5 pt-2">
                             <div className="flex justify-between text-[9px] font-black text-stone-500 uppercase">
                               <span>Drill Progress</span>
                               <span>{Math.floor(selectedLive.trainingProgress ?? 0)}%</span>
                             </div>
                             <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden">
                               <div 
                                 className="h-full bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-300"
                                 style={{ width: `${selectedLive.trainingProgress ?? 0}%` }}
                               />
                             </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => useGameStore.getState().toggleTraining(selectedLive.id)}
                        disabled={selectedLive.isInjured || selectedLive.isFatigued}
                        className={`w-full sm:w-40 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all haptic-click ${
                          selectedLive.isTraining 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-primary text-stone-950 shadow-lg shadow-primary/20'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {selectedLive.isTraining ? 'Stop Drill' : 'Start Training'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Grid */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Combat Loadout</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {SLOTS.map(({ slot, label, icon }) => {
                    const itemId = selectedLive.equipment[slot];
                    const item = itemId ? items[itemId] : null;
                    const isPickingThisSlot = equipSlot === slot;
                    return (
                      <div
                        key={slot}
                        className={`glass rounded-2xl p-4 transition-all duration-500 border-2 ${
                          isPickingThisSlot
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                            : 'border-white/5 bg-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em] mb-3">{icon} {label}</div>
                        {item ? (
                          <div className="space-y-3">
                            <div className="text-xs text-white font-bold truncate">{item.name}</div>
                            {item.statBonus && (
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(item.statBonus).map(([k, v]) => (
                                  <span key={k} className="text-[8px] font-black bg-white/5 px-1.5 py-0.5 rounded text-primary">
                                    {v > 0 ? '+' : ''}{v} {k.slice(0, 3).toUpperCase()}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2 pt-2 border-t border-white/5">
                              <button
                                onClick={() => handleEquipFromSlot(slot)}
                                className="flex-1 text-[9px] font-black uppercase py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 haptic-click"
                              >
                                Swap
                              </button>
                              <button
                                onClick={() => handleUnequip(slot)}
                                className="flex-1 text-[9px] font-black uppercase py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 haptic-click"
                              >
                                Eject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <div className="text-stone-600 italic text-[10px] font-serif mb-3">Vacant</div>
                            <button
                              onClick={() => handleEquipFromSlot(slot)}
                              className="w-full text-[9px] font-black uppercase py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all haptic-click"
                            >
                              Equip
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedLive && inventoryItems.length === 0 && (
                <p className="text-stone-600 text-xs mt-4 italic text-center">
                  No items in inventory to equip. Complete missions to earn loot.
                </p>
              )}

              {/* Item picker overlay logic */}
              {equipSlot && (
                <div className="glass rounded-[2rem] border-primary/30 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-primary font-black uppercase text-[10px] tracking-[0.3em]">
                      Armory Interface: {equipSlot}
                    </h4>
                    <button
                      onClick={() => setEquipSlot(null)}
                      className="text-[10px] font-bold text-stone-500 hover:text-white transition-colors uppercase tracking-widest haptic-click"
                    >
                      Close [x]
                    </button>
                  </div>
                  {filteredInventory.length === 0 ? (
                    <div className="py-12 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                      <p className="text-stone-600 text-xs italic font-serif">
                        No compatible {equipSlot} hardware in inventory.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredInventory.map((id) => {
                        const item = items[id];
                        return item ? (
                          <button
                            key={id}
                            onClick={() => handleSelectItem(id)}
                            className="text-left glass-dark rounded-2xl border border-white/5 hover:border-primary/50 hover:bg-primary/5 p-4 transition-all haptic-click"
                          >
                            <ItemCard item={item} />
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
