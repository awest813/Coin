import { useGameStore } from '~/store/gameStore';
import type { ActiveScreen } from '~/store/gameStore';

const NAV_ITEMS: { id: ActiveScreen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Guild Hall', icon: '🏰' },
  { id: 'roster', label: 'Roster', icon: '⚔️' },
  { id: 'missions', label: 'Missions', icon: '📋' },
  { id: 'inventory', label: 'Inventory', icon: '🎒' },
  { id: 'workshop', label: 'Workshop', icon: '🔨' },
  { id: 'hiring', label: 'Hiring', icon: '🧑‍🤝‍🧑' },
  { id: 'expeditions', label: 'Expeditions', icon: '🗺️' },
];

export function NavBar() {
  const { activeScreen, setScreen, guild, pendingEvents } = useGameStore();

  return (
    <nav className="bg-stone-900 border-b border-stone-700 sticky top-0 z-50 shadow-lg shadow-black/50">
      {/* Top row: guild name + resources */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-lg tracking-wide" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
            🏴 {guild.name}
          </span>
          {pendingEvents.length > 0 && (
            <span className="bg-amber-500 text-stone-950 text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {pendingEvents.length}
            </span>
          )}
        </div>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1 bg-stone-800 rounded px-2 py-0.5 text-amber-300 font-semibold">
            💰 <span>{guild.resources.gold}</span><span className="text-stone-500 text-xs ml-0.5">g</span>
          </span>
          <span className="flex items-center gap-1 bg-stone-800 rounded px-2 py-0.5 text-yellow-300 font-semibold">
            ⭐ <span>{guild.resources.renown}</span><span className="text-stone-500 text-xs ml-0.5">rnw</span>
          </span>
          <span className="flex items-center gap-1 bg-stone-800 rounded px-2 py-0.5 text-green-300 font-semibold">
            🧴 <span>{guild.resources.supplies}</span><span className="text-stone-500 text-xs ml-0.5">sup</span>
          </span>
        </div>
      </div>
      {/* Bottom row: navigation */}
      <div className="px-2 py-1 flex gap-0.5 flex-wrap">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-150 ${
              activeScreen === item.id
                ? 'bg-amber-700 text-white shadow-md shadow-amber-900/50'
                : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
            }`}
            style={activeScreen === item.id ? { fontFamily: "'Cinzel', Georgia, serif" } : undefined}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
