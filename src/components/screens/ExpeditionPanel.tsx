import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { EXPEDITION_TEMPLATES } from '~/data/expeditions';
import { MATERIALS_MAP } from '~/data/materials';
import { ITEMS_MAP } from '~/data/items';
import type { ExpeditionTemplate } from '~/types/expedition';
import type { Guild } from '~/types/guild';
import type { Mercenary } from '~/types/mercenary';

function OutcomeBadge({ outcome }: { outcome: 'success' | 'partial' | 'failure' }) {
  const styles = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    partial: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    failure: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`stat-badge text-[9px] font-black uppercase tracking-widest ${styles[outcome]}`}>
      {outcome}
    </span>
  );
}

function ExpeditionCard({
  template,
  onStart,
  isLocked,
  lockReason,
  guild,
  mercenaries,
}: {
  template: ExpeditionTemplate;
  onStart: (mercIds: string[], consumables: string[]) => void;
  isLocked: boolean;
  lockReason: string;
  guild: Guild;
  mercenaries: Mercenary[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedMercIds, setSelectedMercIds] = useState<string[]>([]);
  const [selectedConsumables, setSelectedConsumables] = useState<string[]>([]);

  const availableMercs = mercenaries.filter((m) => !m.isInjured);
  const consumableItems = guild.inventoryItemIds
    .filter((id: string) => ITEMS_MAP[id]?.category === 'consumable')
    .reduce<Record<string, number>>((acc: Record<string, number>, id: string) => {
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {});

  function toggleMerc(mercId: string) {
    setSelectedMercIds((prev) =>
      prev.includes(mercId) ? prev.filter((id) => id !== mercId) : [...prev, mercId]
    );
  }

  function toggleConsumable(itemId: string) {
    setSelectedConsumables((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }

  return (
    <div className={`premium-card p-0 overflow-hidden transition-all duration-500 ${isLocked ? 'opacity-50 grayscale-[0.5]' : ''}`}>
      <div
        className={`p-6 cursor-pointer group transition-colors ${expanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
        onClick={() => !isLocked && setExpanded((e) => !e)}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-1">{template.region}</div>
            <h3 className="text-xl font-bold font-heading text-white tracking-tight group-hover:text-primary transition-colors">{template.name}</h3>
            <p className="text-stone-400 text-sm italic font-serif mt-2 leading-relaxed">&ldquo;{template.description}&rdquo;</p>
          </div>
          <div className="text-right shrink-0 space-y-1">
            <div className="text-lg font-black text-primary">💰 {template.reward.gold}g</div>
            <div className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">⭐ +{template.reward.renown} renown</div>
            <div className="stat-badge glass mt-2">{template.durationLabel}</div>
          </div>
        </div>
        
        {isLocked && (
          <div className="mt-4 flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
            <span>🔒 Locked: {lockReason}</span>
          </div>
        )}
        
        {!isLocked && (
          <div className="mt-6 flex items-center justify-center text-[10px] font-black text-stone-500 uppercase tracking-widest group-hover:text-stone-300 transition-colors">
            {expanded ? '▲ Close Preparations' : '▼ Assign Expedition Party'}
          </div>
        )}
      </div>

      {expanded && !isLocked && (
        <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-500 border-t border-white/5 bg-black/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stages */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Planned Stages</h4>
              <div className="space-y-2">
                {template.stages.map((s, i) => (
                  <div key={i} className="glass-dark rounded-xl px-4 py-3 text-xs flex items-center gap-3 border border-white/5">
                    <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center font-bold text-primary">{i + 1}</span>
                    <div>
                      <div className="text-stone-200 font-bold">{s.label}</div>
                      <div className="text-[9px] text-stone-500 font-black uppercase tracking-tighter mt-0.5">{s.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Possible rewards */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Intel: Potential Yield</h4>
              <div className="grid grid-cols-2 gap-2">
                {template.reward.possibleMaterials.map((matId) => {
                  const mat = MATERIALS_MAP[matId];
                  return mat ? (
                    <div key={matId} className="glass-dark border border-white/5 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-xl">{mat.icon}</span>
                      <span className="text-[10px] font-bold text-stone-400 truncate">{mat.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Party assignment */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Select Operatives</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableMercs.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMerc(m.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all haptic-click ${
                    selectedMercIds.includes(m.id)
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                      : 'border-white/5 bg-white/5 text-stone-400 hover:border-white/10'
                  }`}
                >
                  <span className="text-3xl">{m.portrait}</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter truncate ${selectedMercIds.includes(m.id) ? 'text-white' : 'text-stone-500'}`}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Consumables */}
          {Object.keys(consumableItems).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Support Hardware</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(consumableItems).map(([itemId, qty]: [string, number]) => {
                  const item = ITEMS_MAP[itemId];
                  if (!item) return null;
                  return (
                    <button
                      key={itemId}
                      onClick={() => toggleConsumable(itemId)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all haptic-click ${
                        selectedConsumables.includes(itemId)
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-white/5 bg-white/5 text-stone-500 hover:border-white/10'
                      }`}
                    >
                      {item.icon} {item.name} <span className="opacity-50 ml-1">x{qty}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (selectedMercIds.length === 0) return;
              onStart(selectedMercIds, selectedConsumables);
              setExpanded(false);
            }}
            disabled={selectedMercIds.length === 0}
            className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.3em] transition-all haptic-click ${
              selectedMercIds.length > 0
                ? 'bg-primary text-stone-950 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98]'
                : 'bg-white/5 text-stone-600 border border-white/5 cursor-not-allowed'
            }`}
          >
            {selectedMercIds.length === 0
              ? 'Authorize Deployment (0 Personnel)'
              : `Commence Expedition (${selectedMercIds.length} Operatives)`}
          </button>
        </div>
      )}
    </div>
  );
}

export function ExpeditionPanel() {
  const {
    guild,
    mercenaries,
    activeExpedition,
    lastExpeditionResult,
    showExpeditionResult,
    startExpedition,
    advanceExpeditionStage,
    dismissExpeditionResult,
    setScreen,
  } = useGameStore();

  function isLocked(template: ExpeditionTemplate): [boolean, string] {
    if (template.requiredRenown && guild.resources.renown < template.requiredRenown) {
      return [true, `Requires ${template.requiredRenown} renown`];
    }
    if (template.requiredContracts && guild.completedContracts < template.requiredContracts) {
      return [true, `Requires ${template.requiredContracts} completed contracts`];
    }
    if (!guild.unlockedRegions.includes(template.region)) {
      return [true, `Region "${template.region}" not yet unlocked`];
    }
    return [false, ''];
  }

  const activeTemplate = activeExpedition
    ? EXPEDITION_TEMPLATES.find((t) => t.id === activeExpedition.templateId)
    : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">🗺️</span>
            Expeditions
          </h1>
          <p className="text-stone-400 mt-2 max-w-md italic font-serif leading-relaxed">
            "The world is vast, and the guild's reach is long. Map the unknown, reclaim the forgotten."
          </p>
        </div>
        <div className="stat-badge glass">
          <span className="text-stone-500 mr-2 uppercase text-[10px] tracking-widest font-bold">Regions Cataloged</span>
          <span className="text-primary font-black">{guild.unlockedRegions.length}</span>
        </div>
      </header>

      {/* Active Expedition */}
      {activeExpedition && activeTemplate && (
        <section className="animate-in zoom-in-95 duration-500">
          <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] px-1 mb-4">Tactical Feed: Active Deployment</h2>
          <div className="premium-card p-0 overflow-hidden shadow-primary/10 border-primary/20">
            <div className="p-8 border-b border-white/5 bg-primary/5">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-bold font-heading text-white tracking-tight">{activeTemplate.name}</h3>
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-1">{activeTemplate.region} Command</p>
                </div>
                <div className="stat-badge glass bg-stone-950/40 text-stone-400">
                  Progression Stage {activeExpedition.currentStageIndex + 1} / {activeTemplate.stages.length}
                </div>
              </div>

              {/* Stage progress visualization */}
              <div className="flex gap-3 mb-8">
                {activeTemplate.stages.map((s, i) => {
                  const result = activeExpedition.stageResults[i];
                  const isCurrent = i === activeExpedition.currentStageIndex;
                  const isDone = i < activeExpedition.currentStageIndex;
                  return (
                    <div key={i} className="flex-1 relative">
                       <div className={`h-1.5 rounded-full mb-3 transition-all duration-1000 ${
                         isDone ? 'bg-primary' : isCurrent ? 'bg-primary animate-pulse' : 'bg-white/10'
                       }`} />
                       <div className={`text-[9px] font-black uppercase tracking-tighter text-center ${
                         isCurrent ? 'text-primary' : isDone ? 'text-stone-400' : 'text-stone-600'
                       }`}>
                         {s.label}
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Past stage results - Narrative log */}
              {activeExpedition.stageResults.length > 0 && (
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Chronicle of Action</h4>
                   <div className="space-y-3">
                    {activeExpedition.stageResults.map((sr) => (
                      <div key={sr.stageIndex} className="glass-dark rounded-[1.5rem] p-6 border border-white/5 animate-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <OutcomeBadge outcome={sr.outcome} />
                            <span className="text-white font-bold text-xs">
                              {activeTemplate.stages[sr.stageIndex]?.label}
                            </span>
                          </div>
                          <span className="text-[9px] text-stone-600 font-mono">STAGE_{sr.stageIndex + 1}_LOG</span>
                        </div>
                        <p className="text-stone-400 text-xs italic font-serif leading-relaxed mb-4">"{sr.narrative}"</p>
                        
                        {(sr.goldBonus > 0 || sr.materialsFound.length > 0) && (
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                            {sr.goldBonus > 0 && <span className="stat-badge text-[9px] text-primary">💰 +{sr.goldBonus}g</span>}
                            {sr.materialsFound.map((mf) => {
                              const mat = MATERIALS_MAP[mf.materialId];
                              return mat ? (
                                <span key={mf.materialId} className="stat-badge text-[9px] text-emerald-400">
                                  {mat.icon} {mat.name} x{mf.quantity}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current stage briefing */}
              <div className="glass-dark rounded-[2rem] p-8 border-2 border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl font-heading uppercase rotate-12">Current Objective</div>
                <div className="font-black text-primary text-[10px] uppercase tracking-[0.3em] mb-2">Stage Ingress: {activeExpedition.currentStageIndex + 1}</div>
                <div className="text-xl font-bold text-white mb-2 font-heading">{activeTemplate.stages[activeExpedition.currentStageIndex]?.label}</div>
                <p className="text-stone-400 text-sm italic font-serif max-w-2xl leading-relaxed">
                  {activeTemplate.stages[activeExpedition.currentStageIndex]?.description}
                </p>
              </div>

              {/* Action */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex -space-x-4">
                  {activeExpedition.assignedMercIds.map((mercId) => {
                    const merc = mercenaries.find((m) => m.id === mercId);
                    return merc ? (
                      <div key={mercId} className="w-12 h-12 rounded-full bg-stone-900 border-2 border-primary/30 flex items-center justify-center text-2xl shadow-xl z-10 hover:z-20 hover:-translate-y-1 transition-all cursor-help" title={merc.name}>
                        {merc.portrait}
                      </div>
                    ) : null;
                  })}
                </div>
                <button
                  onClick={() => {
                    advanceExpeditionStage();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 w-full py-5 rounded-2xl bg-primary text-stone-950 font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all haptic-click"
                >
                  {activeExpedition.currentStageIndex === activeTemplate.stages.length - 1
                    ? 'Execute Final Resolution'
                    : `Advance to Strategic Point ${activeExpedition.currentStageIndex + 2}`}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Expedition Result Modal (Premium Overhaul) */}
      {showExpeditionResult && lastExpeditionResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="glass rounded-[3rem] p-12 max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[120px] -translate-y-1/2" />
             
             <div className="relative z-10 text-center space-y-8">
               <div className="stat-badge glass inline-block mx-auto">MISSION REPORT: COMPLETE</div>
               
               <div className="space-y-2">
                 <h2 className="text-5xl font-black font-heading text-white tracking-tighter">Glory Awaits</h2>
                 <p className="text-stone-400 italic font-serif">"The ledger reflects your leadership. The spoils reflect your power."</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="glass-dark p-6 rounded-[2rem] border border-white/5 loot-pop" style={{ animationDelay: '0.1s' }}>
                    <div className="text-4xl mb-2 drop-shadow-lg">💰</div>
                    <div className="text-3xl font-black text-primary">+{lastExpeditionResult.goldEarned}g</div>
                    <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">Sovereign Debt Repaid</div>
                  </div>
                  <div className="glass-dark p-6 rounded-[2rem] border border-white/5 loot-pop" style={{ animationDelay: '0.2s' }}>
                    <div className="text-4xl mb-2 drop-shadow-lg">⭐</div>
                    <div className="text-3xl font-black text-yellow-500">+{lastExpeditionResult.renownEarned}</div>
                    <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-1">Guild Status Ascended</div>
                  </div>
               </div>

               {(lastExpeditionResult.materialsEarned.length > 0 || lastExpeditionResult.itemsEarned.length > 0) && (
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Inventory Accretion</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {lastExpeditionResult.materialsEarned.map((me) => {
                        const mat = MATERIALS_MAP[me.materialId];
                        return mat ? (
                          <div key={me.materialId} className="glass-dark px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 loot-pop" style={{ animationDelay: '0.3s' }}>
                            <span className="text-xl">{mat.icon}</span>
                            <span className="text-xs font-bold text-stone-300">{mat.name} x{me.quantity}</span>
                          </div>
                        ) : null;
                      })}
                      {lastExpeditionResult.itemsEarned.map((itemId, i) => {
                        const item = ITEMS_MAP[itemId];
                        return item ? (
                          <div key={i} className="glass-dark px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-2 loot-pop" style={{ animationDelay: '0.4s' }}>
                            <span className="text-xl">🎒</span>
                            <span className="text-xs font-bold text-primary">{item.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                 </div>
               )}

               <button
                 onClick={dismissExpeditionResult}
                 className="premium-button w-full py-5 text-xs font-black uppercase tracking-[0.4em] haptic-click"
               >
                 Close Report & Re-arm
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Available Expeditions List */}
      {!activeExpedition && (
        <section className="space-y-8">
          <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] px-1">Regional Contracts</h2>
          <div className="grid grid-cols-1 gap-6">
            {EXPEDITION_TEMPLATES.map((template) => {
              const [locked, lockReason] = isLocked(template);
              return (
                <ExpeditionCard
                  key={template.id}
                  template={template}
                  onStart={(mercIds, consumables) =>
                    startExpedition(template.id, mercIds, consumables)
                  }
                  isLocked={locked}
                  lockReason={lockReason}
                  guild={guild}
                  mercenaries={mercenaries}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
    </div>
  );
}
