import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { MercCard } from '~/components/MercCard';
import type { Mercenary } from '~/types/mercenary';

export function MercenaryRoster() {
  const { mercenaries, updateMercenary } = useGameStore();
  const [selected, setSelected] = useState<Mercenary | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-1">⚔️ Mercenary Roster</h1>
      <p className="text-stone-400 text-sm mb-6">
        {mercenaries.length} guild members on the books.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mercenaries.map((merc) => (
          <MercCard
            key={merc.id}
            merc={merc}
            selected={selected?.id === merc.id}
            onClick={() => setSelected(selected?.id === merc.id ? null : merc)}
          />
        ))}
      </div>

      {selected && (
        <div className="mt-6 bg-stone-800 rounded-xl border border-stone-700 p-5">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl">{selected.portrait}</span>
            <div>
              <h2 className="text-xl font-bold text-stone-100">{selected.name}</h2>
              <p className="text-stone-400 text-sm">{selected.title}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {(['strength', 'agility', 'intellect', 'presence'] as const).map((stat) => (
              <div key={stat} className="bg-stone-900 rounded p-2 text-center">
                <div className="text-lg font-bold text-amber-400">{selected.stats[stat]}</div>
                <div className="text-xs text-stone-500 capitalize">{stat.slice(0, 3)}</div>
              </div>
            ))}
          </div>

          {/* Traits */}
          <div className="mb-4">
            <h4 className="text-stone-400 text-xs uppercase tracking-wider mb-2">Traits</h4>
            <div className="space-y-1">
              {selected.traits.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="text-xs bg-stone-700 text-stone-200 px-2 py-1 rounded">{t.name}</span>
                  <span className="text-xs text-stone-500">{t.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relationships */}
          {selected.relationships.length > 0 && (
            <div className="mb-4">
              <h4 className="text-stone-400 text-xs uppercase tracking-wider mb-2">Relationships</h4>
              <div className="flex gap-2 flex-wrap">
                {selected.relationships.map((rel) => {
                  const other = mercenaries.find((m) => m.id === rel.mercId);
                  const sentimentColor =
                    rel.sentiment === 'friend'
                      ? 'text-green-400'
                      : rel.sentiment === 'rival'
                      ? 'text-red-400'
                      : 'text-stone-400';
                  return other ? (
                    <span key={rel.mercId} className={`text-xs ${sentimentColor}`}>
                      {rel.sentiment === 'friend' ? '💚' : rel.sentiment === 'rival' ? '⚡' : '—'}{' '}
                      {other.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Status actions */}
          {(selected.isInjured || selected.isFatigued) && (
            <div className="border-t border-stone-700 pt-3">
              <button
                onClick={() => {
                  const updated = { ...selected, isInjured: false, isFatigued: false };
                  updateMercenary(updated);
                  setSelected(updated);
                }}
                className="text-sm bg-stone-700 hover:bg-stone-600 text-stone-200 px-3 py-1.5 rounded transition-colors"
              >
                🏥 Recuperate (clear status)
              </button>
            </div>
          )}

          <div className="text-xs text-stone-600 mt-3">
            Missions completed: {selected.missionsCompleted}
          </div>
        </div>
      )}
    </div>
  );
}
