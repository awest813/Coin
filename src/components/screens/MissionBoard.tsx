import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { MercCard } from '~/components/MercCard';
import { MissionCard } from '~/components/MissionCard';
import { MISSION_TEMPLATES } from '~/data/missions';
import { simulateMission } from '~/simulation/missionSim';
import { getRoomEffect } from '~/simulation/missionSim';
import type { MissionTemplate } from '~/types/mission';

export function MissionBoard() {
  const { mercenaries, activeMission, setActiveMission, applyMissionResult, guild } =
    useGameStore();
  const [selectedMission, setSelectedMission] = useState<MissionTemplate | null>(null);
  const [selectedMercIds, setSelectedMercIds] = useState<string[]>([]);

  const availableMercs = mercenaries.filter((m) => !m.isInjured);

  const forgeRoom = guild.rooms.find((r) => r.id === 'room_forge');
  const forgeLevel = forgeRoom ? getRoomEffect(forgeRoom, 'forgeLevel') : 1;

  function toggleMerc(id: string) {
    setSelectedMercIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSendParty() {
    if (!selectedMission || selectedMercIds.length === 0) return;
    const mission = selectedMission;
    setActiveMission({
      templateId: mission.id,
      assignedMercIds: selectedMercIds,
      startedAt: new Date().toISOString(),
    });
    setSelectedMission(null);
    setSelectedMercIds([]);
  }

  function handleResolve() {
    if (!activeMission) return;
    const template = MISSION_TEMPLATES.find((t) => t.id === activeMission.templateId);
    if (!template) return;
    const mercs = mercenaries.filter((m) => activeMission.assignedMercIds.includes(m.id));
    const seed = `${activeMission.startedAt}-${guild.resources.renown}`;
    const result = simulateMission(mercs, template, seed, { forgeLevel });
    applyMissionResult(result);
  }

  const activeTemplate = activeMission
    ? MISSION_TEMPLATES.find((t) => t.id === activeMission.templateId)
    : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-1">📋 Mission Board</h1>
      <p className="text-stone-400 text-sm mb-6">
        Active contracts available to the guild.
      </p>

      {/* Active mission banner */}
      {activeMission && (
        <div className="mb-6 bg-amber-900/30 border border-amber-700 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-amber-300 font-semibold">Mission in Progress</h3>
              <p className="text-stone-400 text-sm mt-0.5">
                {activeMission.assignedMercIds.length} merc{activeMission.assignedMercIds.length !== 1 ? 's' : ''} deployed on &ldquo;
                {activeTemplate?.name}&rdquo;
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
              <p className="text-stone-500 text-xs mt-1">
                Sent: {new Date(activeMission.startedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleResolve}
              className="shrink-0 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
            >
              Resolve Mission
            </button>
          </div>
        </div>
      )}

      {/* Mission list */}
      {!activeMission && (
        <>
          <div className="space-y-4 mb-6">
            {MISSION_TEMPLATES.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onAssign={() => {
                  setSelectedMission(mission);
                  setSelectedMercIds([]);
                }}
                disabled={!!activeMission}
              />
            ))}
          </div>

          {/* Party assignment */}
          {selectedMission && (
            <div className="bg-stone-800 rounded-xl border border-stone-600 p-5">
              <h3 className="text-stone-200 font-semibold mb-1">
                Assigning Party for: {selectedMission.name}
              </h3>
              <p className="text-stone-500 text-xs mb-4">
                Select one or more available mercenaries. More mercs = higher party score. Relationships matter.
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
                <p className="text-red-400 text-sm italic">All mercs are injured. No one available.</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSendParty}
                  disabled={selectedMercIds.length === 0}
                  className="flex-1 py-2 rounded bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
                >
                  Send {selectedMercIds.length > 0 ? `(${selectedMercIds.length})` : 'Party'}
                </button>
                <button
                  onClick={() => setSelectedMission(null)}
                  className="px-4 py-2 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
