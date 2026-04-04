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
    success: 'bg-green-900 text-green-300',
    partial: 'bg-yellow-900 text-yellow-300',
    failure: 'bg-red-900 text-red-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[outcome]}`}>
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
    <div className={`bg-stone-800 border rounded-lg ${isLocked ? 'border-stone-700 opacity-60' : 'border-amber-800'}`}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => !isLocked && setExpanded((e) => !e)}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-stone-200">{template.name}</div>
            <div className="text-xs text-amber-500">{template.region} · {template.durationLabel}</div>
            <p className="text-sm text-stone-400 mt-1">{template.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-amber-400 font-bold">{template.reward.gold}g</div>
            <div className="text-stone-400 text-xs">+{template.reward.renown} renown</div>
            <div className="text-stone-500 text-xs">{template.stages.length} stages</div>
          </div>
        </div>
        {isLocked && <div className="mt-2 text-orange-400 text-xs">🔒 {lockReason}</div>}
        {!isLocked && (
          <div className="mt-2 text-stone-500 text-xs">{expanded ? '▲ collapse' : '▼ assign party'}</div>
        )}
      </div>

      {expanded && !isLocked && (
        <div className="border-t border-stone-700 p-4 space-y-4">
          {/* Stages */}
          <div>
            <div className="text-xs font-semibold text-stone-400 mb-2">Stages</div>
            <div className="flex gap-2 flex-wrap">
              {template.stages.map((s, i) => (
                <div key={i} className="bg-stone-700 rounded px-2 py-1 text-xs text-stone-300">
                  <span className="font-medium">{i + 1}.</span> {s.label}
                  <span className="text-stone-500 ml-1">({s.type})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Possible rewards */}
          <div>
            <div className="text-xs font-semibold text-stone-400 mb-1">Possible Materials</div>
            <div className="flex flex-wrap gap-1">
              {template.reward.possibleMaterials.map((matId) => {
                const mat = MATERIALS_MAP[matId];
                return mat ? (
                  <span key={matId} className="text-xs bg-stone-700 text-stone-300 px-2 py-0.5 rounded">
                    {mat.icon} {mat.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Party assignment */}
          <div>
            <div className="text-xs font-semibold text-stone-400 mb-2">Assign Mercenaries</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableMercs.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded border text-sm transition-colors ${
                    selectedMercIds.includes(m.id)
                      ? 'border-amber-600 bg-amber-900/30 text-stone-200'
                      : 'border-stone-600 text-stone-400 hover:border-stone-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-amber-500"
                    checked={selectedMercIds.includes(m.id)}
                    onChange={() => toggleMerc(m.id)}
                  />
                  <span>{m.portrait} {m.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Consumables */}
          {Object.keys(consumableItems).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-stone-400 mb-2">Assign Consumables (optional)</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(consumableItems).map(([itemId, qty]: [string, number]) => {
                  const item = ITEMS_MAP[itemId];
                  if (!item) return null;
                  return (
                    <label
                      key={itemId}
                      className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded border text-xs transition-colors ${
                        selectedConsumables.includes(itemId)
                          ? 'border-amber-600 bg-amber-900/30 text-stone-200'
                          : 'border-stone-600 text-stone-400 hover:border-stone-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-amber-500"
                        checked={selectedConsumables.includes(itemId)}
                        onChange={() => toggleConsumable(itemId)}
                      />
                      {item.name} x{qty}
                    </label>
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
            className={`w-full py-2 rounded font-medium text-sm transition-colors ${
              selectedMercIds.length > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-stone-700 text-stone-500 cursor-not-allowed'
            }`}
          >
            {selectedMercIds.length === 0
              ? 'Select at least one mercenary'
              : `Launch Expedition (${selectedMercIds.length} mercs)`}
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-6">🗺️ Expeditions</h1>

      {/* Active Expedition */}
      {activeExpedition && activeTemplate && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-stone-300 mb-3">⚡ Active Expedition</h2>
          <div className="bg-stone-800 border border-amber-700 rounded-lg p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-bold text-amber-400 text-xl">{activeTemplate.name}</div>
                <div className="text-stone-400 text-sm">{activeTemplate.region}</div>
              </div>
              <div className="text-stone-400 text-sm">
                Stage {activeExpedition.currentStageIndex + 1} / {activeTemplate.stages.length}
              </div>
            </div>

            {/* Stage progress */}
            <div className="flex gap-2 mb-4">
              {activeTemplate.stages.map((s, i) => {
                const result = activeExpedition.stageResults[i];
                return (
                  <div key={i} className="flex-1 text-center">
                    <div className={`rounded p-2 text-xs ${
                      i < activeExpedition.currentStageIndex
                        ? result?.outcome === 'success'
                          ? 'bg-green-900 text-green-300'
                          : result?.outcome === 'partial'
                          ? 'bg-yellow-900 text-yellow-300'
                          : 'bg-red-900 text-red-300'
                        : i === activeExpedition.currentStageIndex
                        ? 'bg-amber-800 text-amber-200 font-bold'
                        : 'bg-stone-700 text-stone-500'
                    }`}>
                      {i + 1}. {s.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Past stage results */}
            {activeExpedition.stageResults.length > 0 && (
              <div className="space-y-2 mb-4">
                {activeExpedition.stageResults.map((sr) => (
                  <div key={sr.stageIndex} className="bg-stone-700 rounded p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <OutcomeBadge outcome={sr.outcome} />
                      <span className="text-stone-300 font-medium">
                        {activeTemplate.stages[sr.stageIndex]?.label}
                      </span>
                    </div>
                    <p className="text-stone-400 text-xs italic">{sr.narrative}</p>
                    {sr.goldBonus > 0 && (
                      <div className="text-xs text-yellow-400 mt-1">+{sr.goldBonus}g bonus</div>
                    )}
                    {sr.materialsFound.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {sr.materialsFound.map((mf) => {
                          const mat = MATERIALS_MAP[mf.materialId];
                          return mat ? (
                            <span key={mf.materialId} className="text-xs bg-stone-600 px-1.5 rounded text-stone-300">
                              {mat.icon} {mat.name} x{mf.quantity}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Current stage info */}
            <div className="bg-stone-700 rounded p-3 mb-4">
              <div className="font-medium text-stone-200 text-sm mb-1">
                Current Stage: {activeTemplate.stages[activeExpedition.currentStageIndex]?.label}
              </div>
              <p className="text-stone-400 text-xs">
                {activeTemplate.stages[activeExpedition.currentStageIndex]?.description}
              </p>
            </div>

            {/* Party */}
            <div className="flex flex-wrap gap-2 mb-4">
              {activeExpedition.assignedMercIds.map((mercId) => {
                const merc = mercenaries.find((m) => m.id === mercId);
                return merc ? (
                  <span key={mercId} className="bg-stone-700 px-2 py-1 rounded text-sm text-stone-300">
                    {merc.portrait} {merc.name}
                  </span>
                ) : null;
              })}
            </div>

            <button
              onClick={advanceExpeditionStage}
              className="w-full py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors"
            >
              {activeExpedition.currentStageIndex === activeTemplate.stages.length - 1
                ? '⚔️ Resolve Final Stage'
                : `▶ Advance to Stage ${activeExpedition.currentStageIndex + 2}`}
            </button>
          </div>
        </section>
      )}

      {/* Expedition Result */}
      {showExpeditionResult && lastExpeditionResult && (
        <section className="mb-8">
          <div className="bg-stone-800 border border-green-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-300">📜 Expedition Complete</h2>
              <button onClick={dismissExpeditionResult} className="text-stone-500 hover:text-stone-300 text-sm">
                ✕ Dismiss
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <OutcomeBadge outcome={lastExpeditionResult.totalOutcome} />
              <span className="text-yellow-400 font-bold">+{lastExpeditionResult.goldEarned}g</span>
              <span className="text-blue-400">+{lastExpeditionResult.renownEarned} renown</span>
            </div>
            {lastExpeditionResult.materialsEarned.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {lastExpeditionResult.materialsEarned.map((me) => {
                  const mat = MATERIALS_MAP[me.materialId];
                  return mat ? (
                    <span key={me.materialId} className="text-xs bg-stone-700 px-2 py-0.5 rounded text-stone-300">
                      {mat.icon} {mat.name} x{me.quantity}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {lastExpeditionResult.itemsEarned.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {lastExpeditionResult.itemsEarned.map((itemId, i) => {
                  const item = ITEMS_MAP[itemId];
                  return item ? (
                    <span key={i} className="text-xs bg-amber-900 px-2 py-0.5 rounded text-amber-300">
                      🎒 {item.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {lastExpeditionResult.bondChanges.length > 0 && (
              <div className="text-xs text-stone-400 space-y-0.5">
                {lastExpeditionResult.bondChanges.map((bc, i) => {
                  const m1 = mercenaries.find((m) => m.id === bc.mercId1);
                  const m2 = mercenaries.find((m) => m.id === bc.mercId2);
                  if (!m1 || !m2) return null;
                  return (
                    <div key={i}>
                      💞 {m1.name} & {m2.name} bond {bc.delta > 0 ? '+' : ''}{bc.delta.toFixed(1)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Available Expeditions */}
      {!activeExpedition && (
        <section>
          <h2 className="text-lg font-semibold text-stone-300 mb-3">Available Expeditions</h2>
          <div className="space-y-3">
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
