import { useGameStore } from '~/store/gameStore';
import type { ActiveScreen } from '~/store/gameStore';

const NAV_ITEMS: { id: ActiveScreen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Guild Hall', icon: '🏰' },
  { id: 'roster', label: 'Roster', icon: '⚔️' },
  { id: 'missions', label: 'Mission Board', icon: '📋' },
  { id: 'inventory', label: 'Inventory', icon: '🎒' },
  { id: 'workshop', label: 'Workshop', icon: '🔨' },
  { id: 'hiring', label: 'Hiring', icon: '🧑‍🤝‍🧑' },
  { id: 'expeditions', label: 'Expeditions', icon: '🗺️' },
];

export function NavBar() {
  const { activeScreen, setScreen, guild, pendingEvents } = useGameStore();

  return (
    <nav className="bg-stone-900 border-b border-stone-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-bold text-lg tracking-wide">
          🏴 {guild.name}
        </span>
        {pendingEvents.length > 0 && (
          <span className="bg-amber-500 text-stone-950 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {pendingEvents.length}
          </span>
        )}
      </div>
      <div className="flex gap-1 flex-wrap">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeScreen === item.id
                ? 'bg-amber-600 text-white'
                : 'text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-4 text-sm text-stone-300">
        <span>💰 {guild.resources.gold}g</span>
        <span>⭐ {guild.resources.renown} renown</span>
        <span>🧴 {guild.resources.supplies} supplies</span>
      </div>
    </nav>
  );
}
