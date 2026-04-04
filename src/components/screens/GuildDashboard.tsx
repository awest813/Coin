import { useGameStore } from '~/store/gameStore';

export function GuildDashboard() {
  const { guild, mercenaries, activeMission, resetSave, setScreen, upgradeRoom } = useGameStore();
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">🏰 {guild.name}</h1>
        <p className="text-stone-400 text-sm">
          A mercenary guild with a reputation — or the beginning of one.
        </p>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Gold', value: `${guild.resources.gold}g`, icon: '💰', color: 'text-amber-400' },
          { label: 'Renown', value: guild.resources.renown, icon: '⭐', color: 'text-yellow-400' },
          { label: 'Supplies', value: guild.resources.supplies, icon: '🧴', color: 'text-green-400' },
        ].map((r) => (
          <div key={r.label} className="bg-stone-800 rounded-lg border border-stone-700 p-4 text-center">
            <div className="text-2xl mb-1">{r.icon}</div>
            <div className={`text-xl font-bold ${r.color}`}>{r.value}</div>
            <div className="text-stone-400 text-xs">{r.label}</div>
          </div>
        ))}
      </div>

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
        <h2 className="text-stone-200 font-semibold mb-3">Guild Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guild.rooms.map((room) => {
            const atMax = room.level >= room.maxLevel;
            const currentLevelData = room.levels[room.level - 1];
            const cost = atMax ? null : currentLevelData.upgradeCost;
            const affordable = canAffordUpgrade(room.id);
            const nextLevelData = atMax ? null : room.levels[room.level];

            return (
              <div key={room.id} className="bg-stone-800 rounded-lg border border-stone-700 p-4">
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
                      Upgrade cost: {cost!.gold}g · {cost!.supplies} supplies · {cost!.renown} renown
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
