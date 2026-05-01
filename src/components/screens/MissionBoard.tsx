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

export function MissionBoard() {
  const { mercenaries, activeMissions, addActiveMission, applyMissionResult, guild, items } =
    useGameStore();
  const [selectedMission, setSelectedMission] = useState<MissionTemplate | null>(null);
  const [selectedMercIds, setSelectedMercIds] = useState<string[]>([]);
  const [selectedConsumables, setSelectedConsumables] = useState<string[]>([]);
  const [assignStep, setAssignStep] = useState<AssignStep>('mercs');

  // Mercs currently deployed on any active mission
  const deployedMercIds = new Set(activeMissions.flatMap((am) => am.assignedMercIds));
  // Mercs available for a new mission (not injured and not already deployed)
  const availableMercs = mercenaries.filter((m) => !m.isInjured && !deployedMercIds.has(m.id));

  const forgeRoom = guild.rooms.find((r) => r.id === 'room_forge');
  const forgeLevel = forgeRoom ? getRoomEffect(forgeRoom, 'forgeLevel') : 1;

  const missionCap = maxConcurrentMissions(guild.guildRank);
  const atMissionCap = activeMissions.length >= missionCap;

  // Consumable items in inventory
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
    const mission = selectedMission;
    addActiveMission({
      missionRunId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      templateId: mission.id,
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
    const consumables = activeMission.consumablesAssigned ?? [];
    const result = simulateMission(mercs, template, seed, { forgeLevel, consumableItemIds: consumables });

    // Compute material drops based on mission tags
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

    applyMissionResult({
      ...result,
      missionRunId,
      materialsEarned: matDrops,
    } as typeof result);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-1 font-heading">📋 Mission Board</h1>
      <p className="text-stone-400 text-sm mb-1">
        Active contracts available to the guild.
      </p>
      <p className="text-stone-500 text-xs mb-6">
        Concurrent missions: {activeMissions.length}/{missionCap}
        {guild.guildRank < 4 && (
          <span className="ml-2 text-stone-600">
            (Rank {guild.guildRank >= 2 ? '4' : '2'}+ unlocks more slots)
          </span>
        )}
      </p>

      {/* Active missions banners */}
      {activeMissions.length > 0 && (
        <div className="space-y-4 mb-6">
          {activeMissions.map((activeMission) => {
            const activeTemplate = MISSION_TEMPLATES.find((t) => t.id === activeMission.templateId);
            const assignedMercs = mercenaries.filter((m) =>
              activeMission.assignedMercIds.includes(m.id)
            );
            return (
              <div
                key={activeMission.missionRunId}
                className="bg-gradient-to-br from-amber-950/40 to-stone-900 border border-amber-700 rounded-lg p-4 shadow-md shadow-amber-900/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-amber-300 font-semibold">
                      Mission in Progress: {activeTemplate?.name}
                    </h3>
                    <p className="text-stone-400 text-sm mt-0.5">
                      {assignedMercs.map((m) => m.name).join(', ') || `${activeMission.assignedMercIds.length} mercs deployed`}
                    </p>
                    {activeTemplate && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {activeTemplate.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {activeMission.consumablesAssigned && activeMission.consumablesAssigned.length > 0 && (
                      <div className="text-xs text-stone-400 mt-1">
                        Consumables: {activeMission.consumablesAssigned
                          .map((id) => (items[id] ?? ITEMS_MAP[id])?.name ?? id)
                          .join(', ')}
                      </div>
                    )}
                    <p className="text-stone-500 text-xs mt-1">
                      Sent: {new Date(activeMission.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolve(activeMission.missionRunId)}
                    className="shrink-0 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mission list */}
      <div className="space-y-4 mb-6">
        {MISSION_TEMPLATES.map((mission) => {
          const matHints = [...new Set(mission.tags)]
            .map((t) => TAG_MATERIAL_HINTS[t])
            .filter(Boolean);
          const alreadyActive = activeMissions.some((am) => am.templateId === mission.id);
          const disabled = atMissionCap || alreadyActive;
          return (
            <div key={mission.id}>
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
              {matHints.length > 0 && (
                <div className="px-3 pb-1 text-xs text-stone-500">
                  📦 Possible materials: {matHints.join(' · ')}
                </div>
              )}
              {alreadyActive && (
                <div className="px-3 pb-1 text-xs text-amber-700">⚔️ Already active</div>
              )}
              {!alreadyActive && atMissionCap && (
                <div className="px-3 pb-1 text-xs text-stone-600">
                  Mission slots full — resolve a mission to send more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Party assignment */}
      {selectedMission && (
        <div className="bg-stone-800 rounded-xl border border-stone-600 p-5">
          <h3 className="text-stone-200 font-semibold mb-1">
            Assigning Party for: {selectedMission.name}
          </h3>

          {/* Step tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setAssignStep('mercs')}
              className={`px-3 py-1 rounded text-xs font-medium ${assignStep === 'mercs' ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-300'}`}
            >
              1. Assign Mercs
            </button>
            <button
              onClick={() => setAssignStep('consumables')}
              disabled={selectedMercIds.length === 0}
              className={`px-3 py-1 rounded text-xs font-medium disabled:opacity-40 ${assignStep === 'consumables' ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-300'}`}
            >
              2. Consumables (optional)
            </button>
          </div>

          {assignStep === 'mercs' && (
            <>
              <p className="text-stone-500 text-xs mb-4">
                Select mercenaries. More mercs = higher party score. Relationships matter.
                {deployedMercIds.size > 0 && (
                  <span className="ml-1 text-amber-700">
                    ({deployedMercIds.size} merc{deployedMercIds.size !== 1 ? 's' : ''} already deployed)
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {availableMercs.map((merc) => (
                  <MercCard
                    key={merc.id}
                    merc={merc}
                    compact
                    selected={selectedMercIds.includes(merc.id)}
                    onClick={() => toggleMerc(merc.id)}
                  />
                ))}
              </div>
              {availableMercs.length === 0 && (
                <p className="text-red-400 text-sm italic">
                  No mercs available — all are injured or already deployed.
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setAssignStep('consumables')}
                  disabled={selectedMercIds.length === 0}
                  className="flex-1 py-2 rounded bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
                >
                  Next: Consumables →
                </button>
                <button
                  onClick={() => { setSelectedMission(null); setAssignStep('mercs'); }}
                  className="px-4 py-2 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {assignStep === 'consumables' && (
            <>
              <p className="text-stone-500 text-xs mb-3">
                Assign consumables from your inventory (optional). They will be used up on this mission.
              </p>
              {Object.keys(consumableItems).length === 0 ? (
                <p className="text-stone-500 text-sm italic mb-4">No consumables in inventory. Craft some at the Workshop.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(consumableItems).map(([itemId, qty]) => {
                    const item = items[itemId] ?? ITEMS_MAP[itemId];
                    if (!item) return null;
                    return (
                      <label
                        key={itemId}
                        className={`flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded border text-sm transition-colors ${
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
                        <span className="text-xs text-stone-500 ml-1">({item.description})</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSendParty}
                  disabled={selectedMercIds.length === 0}
                  className="flex-1 py-2 rounded bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
                >
                  ⚔️ Send Party ({selectedMercIds.length} merc{selectedMercIds.length !== 1 ? 's' : ''}{selectedConsumables.length > 0 ? `, ${selectedConsumables.length} consumable${selectedConsumables.length !== 1 ? 's' : ''}` : ''})
                </button>
                <button
                  onClick={() => setAssignStep('mercs')}
                  className="px-4 py-2 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm transition-colors"
                >
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
