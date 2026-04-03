import { useGameStore } from '~/store/gameStore';

export function GuildDashboard() {
  const { guild, mercenaries, activeMission, resetSave, setScreen } = useGameStore();
  const availableMercs = mercenaries.filter((m) => !m.isInjured);
  const injuredMercs = mercenaries.filter((m) => m.isInjured);

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
            <div>Available: <span className="text-green-400">{availableMercs.length}</span></div>
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
                {activeMission.assignedMercIds.length} mercs deployed
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
        <div className="grid grid-cols-2 gap-3">
          {guild.rooms.map((room) => (
            <div key={room.id} className="bg-stone-800 rounded-lg border border-stone-700 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-stone-200">{room.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{room.description}</div>
                </div>
                <div className="text-xs text-stone-400">
                  Lvl {room.level}/{room.maxLevel}
                </div>
              </div>
              {/* TODO Phase 1: room upgrade UI */}
              <div className="mt-2 text-xs text-stone-600 italic">
                Upgrade costs: {room.upgradeCost.gold}g — coming in Phase 1
              </div>
            </div>
          ))}
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
