import { useGameStore, getGuildRankName, getNextRankThreshold } from '~/store/gameStore';
import { GuildScene } from '~/babylon/GuildScene';

const RANK_THRESHOLDS = [0, 5, 15, 30, 50];

export function GuildDashboard() {
  const {
    guild,
    mercenaries,
    activeMission,
    resetSave,
    setScreen,
    upgradeRoom,
    pendingEvents,
    dismissEvent,
    resolveEventChoice,
  } = useGameStore();
  const availableMercs = mercenaries.filter((m) => !m.isInjured && !m.isFatigued);
  const injuredMercs = mercenaries.filter((m) => m.isInjured);
  const fatiguedMercs = mercenaries.filter((m) => m.isFatigued && !m.isInjured);

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
    <div className="max-w-4xl mx-auto">
      {/* 3-D isometric diorama */}
      <div className="relative bg-stone-950 border-b border-stone-800">
        <GuildScene />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-6 text-[11px] text-stone-400 pointer-events-none select-none">
          <span>🛏️ Barracks → Roster</span>
          <span>🍺 Common Room → Dashboard</span>
          <span>🔨 Forge → Workshop</span>
        </div>
      </div>

      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-1 font-heading">
          🏰 {guild.name}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-stone-300 text-sm font-medium">
            Rank {guild.guildRank}: {getGuildRankName(guild.guildRank)}
          </span>
          <span className="text-stone-500 text-xs">{guild.completedContracts} contracts completed</span>
        </div>
        {/* Rank progress bar */}
        {guild.guildRank < 5 && (
          <div className="mt-2 max-w-xs">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>{RANK_THRESHOLDS[guild.guildRank - 1]} contracts</span>
              <span>{getNextRankThreshold(guild.guildRank)} contracts (Rank {guild.guildRank + 1})</span>
            </div>
            <div className="bg-stone-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  background: 'linear-gradient(to right, #d97706, #fbbf24)',
                  width: `${Math.min(100, ((guild.completedContracts - RANK_THRESHOLDS[guild.guildRank - 1]) /
                    (getNextRankThreshold(guild.guildRank) - RANK_THRESHOLDS[guild.guildRank - 1])) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Gold', value: `${guild.resources.gold}g`, icon: '💰', color: 'text-amber-400' },
          { label: 'Renown', value: guild.resources.renown, icon: '⭐', color: 'text-yellow-400' },
          { label: 'Supplies', value: guild.resources.supplies, icon: '🧴', color: 'text-green-400' },
        ].map((r) => (
          <div key={r.label} className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg border border-stone-700 p-4 text-center hover:border-stone-500 transition-colors">
            <div className="text-3xl mb-1">{r.icon}</div>
            <div className={`text-xl font-bold font-heading ${r.color}`}>{r.value}</div>
            <div className="text-stone-400 text-xs uppercase tracking-wider mt-0.5">{r.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Events */}
      {pendingEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-stone-200 font-semibold mb-3">
            📢 Pending Events
            <span className="ml-2 bg-amber-500 text-stone-950 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {pendingEvents.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pendingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="bg-stone-800 border border-amber-800 rounded-lg p-4">
                <div className="font-medium text-amber-400 mb-1">{event.title}</div>
                <p className="text-stone-300 text-sm mb-3">{event.text}</p>
                {event.choices ? (
                  <div className="flex flex-wrap gap-2">
                    {event.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => resolveEventChoice(event.id, i)}
                        className="px-3 py-1.5 bg-stone-700 hover:bg-amber-700 text-stone-200 text-xs rounded transition-colors"
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                ) : event.autoOutcome ? (
                  <button
                    onClick={() => resolveEventChoice(event.id, -1)}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded transition-colors"
                  >
                    {event.autoOutcome.label}
                  </button>
                ) : (
                  <button
                    onClick={() => dismissEvent(event.id)}
                    className="text-xs text-stone-500 hover:text-stone-300"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            ))}
            {pendingEvents.length > 3 && (
              <p className="text-stone-500 text-xs">+{pendingEvents.length - 3} more events pending</p>
            )}
          </div>
        </div>
      )}

      {/* Unlocked Regions */}
      {guild.unlockedRegions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-stone-200 font-semibold mb-2">🗺️ Unlocked Regions</h2>
          <div className="flex flex-wrap gap-2">
            {guild.unlockedRegions.map((region) => (
              <span key={region} className="px-3 py-1 bg-stone-800 border border-stone-700 rounded text-stone-300 text-sm">
                {region}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-stone-800 rounded-lg border border-stone-700 p-4">
          <h3 className="text-stone-200 font-semibold mb-2">Guild Roster</h3>
          <div className="text-stone-400 text-sm space-y-1">
            <div>Total mercs: <span className="text-stone-200">{mercenaries.length}</span></div>
            <div>Ready: <span className="text-green-400">{availableMercs.length}</span></div>
            {fatiguedMercs.length > 0 && (
              <div>Fatigued: <span className="text-yellow-400">{fatiguedMercs.length}</span></div>
            )}
            {injuredMercs.length > 0 && (
              <div>Injured: <span className="text-red-400">{injuredMercs.length}</span></div>
            )}
          </div>
          <button
            onClick={() => setScreen('roster')}
            className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline"
          >
            View Roster →
          </button>
        </div>

        <div className="bg-stone-800 rounded-lg border border-stone-700 p-4">
          <h3 className="text-stone-200 font-semibold mb-2">Active Contracts</h3>
          {activeMission ? (
            <div className="text-sm text-stone-400">
              <div className="text-stone-200">Mission in progress...</div>
              <div className="text-xs text-stone-500 mt-1">
                {activeMission.assignedMercIds.length} merc{activeMission.assignedMercIds.length !== 1 ? 's' : ''} deployed
              </div>
            </div>
          ) : (
            <div className="text-stone-500 text-sm italic">No active missions.</div>
          )}
          <button
            onClick={() => setScreen('missions')}
            className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline"
          >
            {activeMission ? 'Check Status →' : 'View Mission Board →'}
          </button>
        </div>
      </div>

      {/* Rooms */}
      <div className="mb-6">
        <h2 className="text-stone-200 font-semibold mb-3 font-heading">⚒ Guild Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guild.rooms.map((room) => {
            const atMax = room.level >= room.maxLevel;
            const currentLevelData = room.levels[room.level - 1];
            const cost = atMax ? null : currentLevelData.upgradeCost;
            const affordable = canAffordUpgrade(room.id);
            const nextLevelData = atMax ? null : room.levels[room.level];

            return (
              <div key={room.id} className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-lg border border-stone-700 p-4 hover:border-stone-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{room.icon}</span>
                    <div>
                      <div className="font-medium text-stone-200">{room.name}</div>
                      <div className="text-xs text-stone-500">Lvl {room.level}/{room.maxLevel}</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-400 mb-3">{currentLevelData.description}</p>

                {/* Effects */}
                <div className="text-xs text-stone-500 mb-3 space-y-0.5">
                  {Object.entries(currentLevelData.effects).map(([key, val]) => (
                    <div key={key} className="text-emerald-500">
                      {effectLabel(room.id, key, val)}
                    </div>
                  ))}
                </div>

                {atMax ? (
                  <div className="text-xs text-amber-500 font-medium">✨ Fully Upgraded</div>
                ) : (
                  <>
                    {nextLevelData && (
                      <div className="text-xs text-stone-500 italic mb-2">
                        Next: {nextLevelData.description}
                      </div>
                    )}
                    <div className="text-xs text-stone-400 mb-2">
                      Upgrade cost: {cost?.gold ?? 0}g · {cost?.supplies ?? 0} supplies · {cost?.renown ?? 0} renown
                    </div>
                    <button
                      onClick={() => upgradeRoom(room.id)}
                      disabled={!affordable}
                      className="w-full py-1.5 rounded text-xs font-medium transition-colors
                        bg-amber-800 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                    >
                      {affordable ? `Upgrade to Lvl ${room.level + 1}` : 'Cannot Afford'}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="border-t border-stone-700 pt-4">
        <button
          onClick={() => {
            if (confirm('Reset all save data? This cannot be undone.')) {
              resetSave();
            }
          }}
          className="text-xs text-stone-600 hover:text-red-400 transition-colors"
        >
          Reset Save Data
        </button>
      </div>
      </div> {/* end inner p-6 */}
    </div>
  );
}

function effectLabel(roomId: string, key: string, val: number): string {
  if (roomId === 'room_barracks') {
    if (key === 'rosterCap') return `Roster cap: ${val} mercs`;
    if (key === 'recoveryBonus') return val > 0 ? `+${val} injury recovery speed` : 'Standard recovery';
  }
  if (roomId === 'room_tavern') {
    if (key === 'moraleBonus') return val > 0 ? `+${val} morale after missions` : 'Morale stable';
    if (key === 'eventChance') return val > 0 ? `+${val} event frequency` : 'Standard event rate';
  }
  if (roomId === 'room_forge') {
    if (key === 'lootBonus') return val > 0 ? `+${val} extra loot on success` : 'Standard loot';
    if (key === 'forgeLevel') return `Forge level ${val}`;
  }
  return `${key}: ${val}`;
}
