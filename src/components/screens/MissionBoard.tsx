import { useState } from 'react';
import { useGameStore, maxConcurrentMissions } from '~/store/gameStore';
import { MercCard } from '~/components/MercCard';
import { MissionCard } from '~/components/MissionCard';
import { MISSION_TEMPLATES } from '~/data/missions';
import { simulateMission } from '~/simulation/missionSim';
import { getRoomEffect } from '~/simulation/missionSim';
import { ITEMS_MAP } from '~/data/items';
import type { MissionTemplate } from '~/types/mission';

// Material drop hint per tag
const TAG_MATERIAL_HINTS: Record<string, string> = {
  combat: '🔩 iron scraps / 🐂 hide',
  exploration: '🌿 herbs / 🖋️ ancient ink',
  ruin: '🦴 bone fragments / 🖋️ ancient ink',
  hunt: '🐺 wolf pelt / 🦴 bone',
};

type AssignStep = 'mercs' | 'consumables';

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

export function MissionBoard() {
  const { mercenaries, activeMissions, addActiveMission, applyMissionResult, guild, items } =
    useGameStore();
  const [selectedMission, setSelectedMission] = useState<MissionTemplate | null>(null);
  const [selectedMercIds, setSelectedMercIds] = useState<string[]>([]);
  const [selectedConsumables, setSelectedConsumables] = useState<string[]>([]);
  const [assignStep, setAssignStep] = useState<AssignStep>('mercs');

  const deployedMercIds = new Set(activeMissions.flatMap((am) => am.assignedMercIds));
  const availableMercs = mercenaries.filter((m) => !m.isInjured && !deployedMercIds.has(m.id));

  const forgeRoom = guild.rooms.find((r) => r.id === 'room_forge');
  const forgeLevel = forgeRoom ? getRoomEffect(forgeRoom, 'forgeLevel') : 1;

  const missionCap = maxConcurrentMissions(guild.guildRank);
  const atMissionCap = activeMissions.length >= missionCap;

  const consumableItems = guild.inventoryItemIds
    .filter((id) => (items[id] ?? ITEMS_MAP[id])?.category === 'consumable')
    .reduce<Record<string, number>>((acc, id) => {
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {});

  function toggleMerc(id: string) {
    setSelectedMercIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleConsumable(itemId: string) {
    setSelectedConsumables((prev) =>
      prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
    );
  }

  function handleSendParty() {
    if (!selectedMission || selectedMercIds.length === 0) return;
    addActiveMission({
      missionRunId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      templateId: selectedMission.id,
      assignedMercIds: selectedMercIds,
      startedAt: new Date().toISOString(),
      consumablesAssigned: selectedConsumables,
    });
    setSelectedMission(null);
    setSelectedMercIds([]);
    setSelectedConsumables([]);
    setAssignStep('mercs');
  }

  function handleResolve(missionRunId: string) {
    const activeMission = activeMissions.find((am) => am.missionRunId === missionRunId);
    if (!activeMission) return;
    const template = MISSION_TEMPLATES.find((t) => t.id === activeMission.templateId);
    if (!template) return;
    const mercs = mercenaries.filter((m) => activeMission.assignedMercIds.includes(m.id));
    const seed = `${activeMission.startedAt}-${guild.resources.renown}`;
    const result = simulateMission(mercs, template, seed, { 
      forgeLevel, 
      consumableItemIds: activeMission.consumablesAssigned ?? [],
      unlockedArtifactIds: guild.unlockedArtifactIds,
      activePerkIds: Array.from(Object.values(guild.regionalInfluence).flatMap(ri => ri.unlockedPerks))
    });

    const matDrops: Record<string, number> = {};
    for (const tag of template.tags) {
      const matSeed = seed + tag;
      let h = 2166136261;
      for (let i = 0; i < matSeed.length; i++) {
        h ^= matSeed.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      const r = (h >>> 0) / 0xffffffff;
      const matPools: Record<string, string[]> = {
        combat: ['iron_scraps', 'tanned_hide'],
        exploration: ['herbs_bundle', 'ancient_ink'],
        ruin: ['bone_fragment', 'ancient_ink'],
        hunt: ['wolf_pelt', 'bone_fragment'],
      };
      const pool = matPools[tag];
      if (pool && r < (result.outcome === 'success' ? 0.4 : result.outcome === 'partial' ? 0.2 : 0)) {
        const matId = pool[Math.floor(r * pool.length)];
        matDrops[matId] = (matDrops[matId] ?? 0) + 1;
      }
    }

    applyMissionResult({ ...result, missionRunId, materialsEarned: matDrops });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">📋</span>
            Contract Board
          </h1>
          <p className="text-stone-400 mt-2 max-w-md italic font-serif leading-relaxed">
            "Gold is the only true language in these parts. Pick your battles wisely."
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex gap-4">
            <div className="stat-badge glass">
              <span className="text-stone-500 mr-1 uppercase text-[10px] tracking-widest font-bold">Active</span>
              <span className="text-primary font-bold">{activeMissions.length} / {missionCap}</span>
            </div>
            {guild.guildRank < 4 && (
              <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest self-center">
                Rank {guild.guildRank >= 2 ? '4' : '2'}+ for more slots
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Active Missions (Banners) */}
      {activeMissions.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xs font-black text-stone-600 uppercase tracking-[0.3em] px-1">Current Deployments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeMissions.map((am) => {
              const template = MISSION_TEMPLATES.find((t) => t.id === am.templateId);
              const remaining = Math.max(0, Math.floor((new Date(am.endTime).getTime() - useGameStore.getState().currentTime) / 1000));
              const isDone = remaining <= 0;
              const total = template?.durationSeconds ?? 1;
              const progress = Math.min(100, ((total - remaining) / total) * 100);

              return (
                <div key={am.missionRunId} className="premium-card relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">⚔️</div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{template?.name}</h3>
                        <div className="flex gap-2">
                           {template?.tags.map(tag => (
                             <span key={tag} className="text-[9px] uppercase tracking-widest font-bold text-stone-500 border border-white/5 px-1.5 py-0.5 rounded-md">
                               {tag}
                             </span>
                           ))}
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono font-black ${isDone ? 'text-primary animate-pulse' : 'text-stone-400'}`}>
                        {isDone ? 'READY' : `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-[10px] text-stone-500 font-bold uppercase tracking-tighter">
                        <span>Personnel Deployed</span>
                        <span>{am.assignedMercIds.length} Mercs</span>
                      </div>
                      <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolve(am.missionRunId)}
                      disabled={!isDone}
                      className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all haptic-click ${
                        isDone 
                        ? 'bg-primary text-stone-950 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.95]' 
                        : 'bg-white/5 text-stone-600 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {isDone ? 'Complete Mission' : 'Deployment in Progress'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Available Missions */}
      <section className="space-y-6">
        <h2 className="text-xs font-black text-stone-600 uppercase tracking-[0.3em] px-1">Available Contracts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MISSION_TEMPLATES.map((mission) => {
            const alreadyActive = activeMissions.some((am) => am.templateId === mission.id);
            const disabled = atMissionCap || alreadyActive;

            return (
              <div key={mission.id} className={`group transition-opacity duration-300 ${disabled ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
                <MissionCard
                  mission={mission}
                  onAssign={() => {
                    setSelectedMission(mission);
                    setSelectedMercIds([]);
                    setSelectedConsumables([]);
                    setAssignStep('mercs');
                  }}
                  disabled={disabled}
                />
                <div className="mt-2 flex items-center justify-between px-2">
                  <div className="text-[10px] text-stone-500 flex gap-2 italic font-serif">
                    {mission.tags.map(tag => TAG_MATERIAL_HINTS[tag]).filter(Boolean).slice(0, 1).map(hint => (
                      <span key={hint}>Expected loot: {hint}</span>
                    ))}
                  </div>
                  {alreadyActive && <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active</span>}
                  {!alreadyActive && atMissionCap && <span className="text-[10px] font-bold text-stone-700 uppercase tracking-widest animate-shake">Slots Full</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Assignment Modal (Overlay) */}
      {selectedMission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
            <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-2xl font-bold text-white font-heading">Prepare Party</h3>
                <p className="text-stone-400 text-sm">{selectedMission.name}</p>
              </div>
              
              {/* Projected Success Panel */}
              <div className="flex gap-6 items-center px-6 py-3 bg-black/40 rounded-2xl border border-white/5">
                <div className="text-right">
                  <div className="text-[9px] text-stone-500 font-bold uppercase tracking-widest">Projected Success</div>
                  <div className={`text-xl font-black ${selectedMercIds.length === 0 ? 'text-stone-700' : 'text-primary'}`}>
                    {(() => {
                      if (selectedMercIds.length === 0) return '---';
                      const mercs = mercenaries.filter(m => selectedMercIds.includes(m.id));
                      const sim = simulateMission(mercs, selectedMission, 'preview', { 
                        forgeLevel, 
                        consumableItemIds: selectedConsumables,
                        unlockedArtifactIds: guild.unlockedArtifactIds,
                        activePerkIds: Array.from(Object.values(guild.regionalInfluence).flatMap(ri => ri.unlockedPerks)),
                        activePolicyIds: guild.activePolicyIds
                      });
                      const margin = sim.partyScore - selectedMission.difficulty;
                      if (margin >= 4) return 'EXCELLENT';
                      if (margin >= 0) return 'LIKELY';
                      return 'RISKY';
                    })()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className={`w-3 h-3 rounded-full ${assignStep === 'mercs' ? 'bg-primary' : 'bg-white/20'}`} />
                  <div className={`w-3 h-3 rounded-full ${assignStep === 'consumables' ? 'bg-primary' : 'bg-white/20'}`} />
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {/* Active Modifiers & Synergies Hint */}
              <div className="flex flex-col gap-4 mb-8">
                {(guild.unlockedArtifactIds.length > 0 || guild.activePolicyIds.length > 0) && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in duration-500">
                    <span className="text-xl icon-premium">🏺</span>
                    <div className="flex-1">
                      <div className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Active Global Modifiers</div>
                      <div className="text-[11px] text-stone-400 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {guild.unlockedArtifactIds.map(id => (
                          <span key={id} className="text-amber-400/80 font-bold">Artifact: {id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                        ))}
                        {guild.activePolicyIds.map(id => (
                          <span key={id} className="text-primary/80 font-bold italic">Policy: {id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detected Synergies */}
                {selectedMercIds.length >= 2 && (
                   <div className="p-5 glass-dark border border-white/5 rounded-2xl animate-in slide-in-from-right-4 duration-500">
                      <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-3">Detected Synergies</div>
                      <div className="flex flex-wrap gap-3">
                         {(() => {
                            const mercs = mercenaries.filter(m => selectedMercIds.includes(m.id));
                            const sim = simulateMission(mercs, selectedMission, 'synergy-preview');
                            if (!sim.synergies || sim.synergies.length === 0) return <span className="text-[10px] text-stone-600 italic">No synergies detected in current formation.</span>;
                            return sim.synergies.map(s => (
                               <div key={s.name} className="flex flex-col p-3 bg-white/5 rounded-xl border border-white/5 max-w-[200px]">
                                  <div className="flex justify-between items-center mb-1">
                                     <span className="text-xs font-black text-white text-glow">{s.name}</span>
                                     <span className="text-[10px] font-black text-primary">+{s.scoreBonus}</span>
                                  </div>
                                  <p className="text-[9px] text-stone-500 leading-tight">{s.description}</p>
                               </div>
                            ));
                         })()}
                      </div>
                   </div>
                )}
              </div>

              {assignStep === 'mercs' ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-stone-200 font-bold uppercase text-xs tracking-widest">Select Personnel</h4>
                    <span className="stat-badge text-primary">{selectedMercIds.length} Assigned</span>
                  </div>
                  
                  {availableMercs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableMercs.map((merc) => (
                        <div 
                          key={merc.id} 
                          onClick={() => toggleMerc(merc.id)}
                          className={`cursor-pointer transition-all ${selectedMercIds.includes(merc.id) ? 'scale-[0.98]' : ''}`}
                        >
                          <MercCard 
                            merc={merc} 
                            compact 
                            selected={selectedMercIds.includes(merc.id)} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center glass-dark rounded-3xl border border-dashed border-white/10">
                      <p className="text-stone-500 italic">No mercenaries available for deployment.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                   <h4 className="text-stone-200 font-bold uppercase text-xs tracking-widest">Supplies & Consumables</h4>
                   {Object.keys(consumableItems).length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {Object.entries(consumableItems).map(([itemId, qty]) => {
                         const item = items[itemId] ?? ITEMS_MAP[itemId];
                         const isSelected = selectedConsumables.includes(itemId);
                         return (
                           <div 
                            key={itemId}
                            onClick={() => toggleConsumable(itemId)}
                            className={`glass-dark p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/10'}`}
                           >
                             <div className="text-2xl">{item.icon}</div>
                             <div className="flex-1">
                               <div className="flex justify-between">
                                 <span className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-stone-200'}`}>{item.name}</span>
                                 <span className="text-[10px] text-stone-500 font-bold">x{qty}</span>
                               </div>
                               <p className="text-[10px] text-stone-500 italic">{item.description}</p>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   ) : (
                     <div className="py-20 text-center glass-dark rounded-3xl border border-dashed border-white/10">
                       <p className="text-stone-500 italic">Your supply crates are empty. Craft items at the Forge.</p>
                     </div>
                   )}
                </div>
              )}
            </div>

            <footer className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
              <button 
                onClick={() => setSelectedMission(null)}
                className="px-6 py-3 rounded-xl text-stone-500 hover:text-white transition-colors font-bold text-sm"
              >
                Abandon
              </button>
              
              <div className="flex-1" />

              {assignStep === 'mercs' ? (
                <button
                  onClick={() => setAssignStep('consumables')}
                  disabled={selectedMercIds.length === 0}
                  className="premium-button min-w-[200px] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue to Supplies →
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setAssignStep('mercs')}
                    className="px-6 py-3 rounded-xl bg-white/5 text-stone-300 hover:bg-white/10 transition-all font-bold text-sm border border-white/10"
                  >
                    ← Personnel
                  </button>
                  <button
                    onClick={handleSendParty}
                    className="premium-button min-w-[200px]"
                  >
                    Deploy Party ⚔️
                  </button>
                </>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
