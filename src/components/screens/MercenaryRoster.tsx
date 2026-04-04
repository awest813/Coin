import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { MercCard } from '~/components/MercCard';
import { ItemCard } from '~/components/ItemCard';
import type { Mercenary, EquipmentSlot } from '~/types/mercenary';

const SLOTS: { slot: EquipmentSlot; label: string; icon: string }[] = [
  { slot: 'weapon', label: 'Weapon', icon: '⚔️' },
  { slot: 'armor', label: 'Armor', icon: '🛡️' },
  { slot: 'accessory', label: 'Accessory', icon: '💍' },
];

const SLOT_CATEGORIES: Record<EquipmentSlot, string[]> = {
  weapon: ['weapon'],
  armor: ['armor'],
  accessory: ['accessory'],
};

const SENTIMENT_ICON: Record<string, string> = {
  friend: '💚',
  rival: '⚡',
  neutral: '—',
  bonded: '🔗',
};

const SENTIMENT_COLOR: Record<string, string> = {
  friend: 'text-green-400',
  rival: 'text-red-400',
  neutral: 'text-stone-400',
  bonded: 'text-purple-400',
};

export function MercenaryRoster() {
  const { mercenaries, updateMercenary, items, guild, equipItem, unequipItem } = useGameStore();
  const [selected, setSelected] = useState<Mercenary | null>(null);
  const [equipSlot, setEquipSlot] = useState<EquipmentSlot | null>(null);

  // Keep selected in sync with store updates
  const selectedLive = selected ? mercenaries.find((m) => m.id === selected.id) ?? null : null;

  const inventoryItems = guild.inventoryItemIds
    .map((id) => items[id])
    .filter(Boolean);

  function handleEquipFromSlot(slot: EquipmentSlot) {
    setEquipSlot(equipSlot === slot ? null : slot);
  }

  function handleSelectItem(itemId: string) {
    if (!selectedLive || !equipSlot) return;
    equipItem(selectedLive.id, equipSlot, itemId);
    setEquipSlot(null);
  }

  function handleUnequip(slot: EquipmentSlot) {
    if (!selectedLive) return;
    unequipItem(selectedLive.id, slot);
  }

  const filteredInventory = equipSlot
    ? guild.inventoryItemIds
        .filter((id, idx, arr) => arr.indexOf(id) === idx) // unique
        .filter((id) => {
          const item = items[id];
          return item && SLOT_CATEGORIES[equipSlot].includes(item.category);
        })
    : [];

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
            selected={selectedLive?.id === merc.id}
            onClick={() => {
              setSelected(selectedLive?.id === merc.id ? null : merc);
              setEquipSlot(null);
            }}
          />
        ))}
      </div>

      {selectedLive && (
        <div className="mt-6 bg-stone-800 rounded-xl border border-stone-700 p-5">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl">{selectedLive.portrait}</span>
            <div>
              <h2 className="text-xl font-bold text-stone-100">{selectedLive.name}</h2>
              <p className="text-stone-400 text-sm">{selectedLive.title}</p>
              <p className="text-stone-500 text-xs mt-0.5">{selectedLive.missionsCompleted} missions completed</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {(['strength', 'agility', 'intellect', 'presence'] as const).map((stat) => (
              <div key={stat} className="bg-stone-900 rounded p-2 text-center">
                <div className="text-lg font-bold text-amber-400">{selectedLive.stats[stat]}</div>
                <div className="text-xs text-stone-500 capitalize">{stat.slice(0, 3)}</div>
              </div>
            ))}
          </div>

          {/* Morale & Loyalty bars */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Morale', value: selectedLive.morale, color: 'bg-yellow-500' },
              { label: 'Loyalty', value: selectedLive.loyalty, color: 'bg-blue-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>{label}</span>
                  <span>{value}/10</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-1.5">
                  <div
                    className={`${color} h-1.5 rounded-full transition-all`}
                    style={{ width: `${value * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Traits */}
          <div className="mb-4">
            <h4 className="text-stone-400 text-xs uppercase tracking-wider mb-2">Traits</h4>
            <div className="flex flex-wrap gap-2">
              {selectedLive.traits.map((t) => (
                <span
                  key={t.id}
                  className="text-xs bg-stone-700 text-stone-200 px-2 py-1 rounded"
                  title={t.description}
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="mb-4">
            <h4 className="text-stone-400 text-xs uppercase tracking-wider mb-2">Equipment</h4>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map(({ slot, label, icon }) => {
                const itemId = selectedLive.equipment[slot];
                const item = itemId ? items[itemId] : null;
                const isPickingThisSlot = equipSlot === slot;
                return (
                  <div
                    key={slot}
                    className={`rounded border p-2 text-xs transition-colors ${
                      isPickingThisSlot
                        ? 'border-amber-500 bg-amber-950/30'
                        : 'border-stone-600 bg-stone-900'
                    }`}
                  >
                    <div className="text-stone-400 mb-1">{icon} {label}</div>
                    {item ? (
                      <>
                        <div className="text-stone-200 truncate font-medium">{item.name}</div>
                        {item.statBonus && (
                          <div className="text-amber-400 text-xs">
                            {Object.entries(item.statBonus)
                              .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k.slice(0, 3)}`)
                              .join(', ')}
                          </div>
                        )}
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => handleEquipFromSlot(slot)}
                            className="flex-1 text-xs py-0.5 rounded bg-stone-700 hover:bg-stone-600 text-stone-300"
                          >
                            Swap
                          </button>
                          <button
                            onClick={() => handleUnequip(slot)}
                            className="flex-1 text-xs py-0.5 rounded bg-stone-700 hover:bg-red-900 text-stone-300 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-stone-600 italic">Empty</div>
                        <button
                          onClick={() => handleEquipFromSlot(slot)}
                          className="mt-1 w-full text-xs py-0.5 rounded bg-amber-900/50 hover:bg-amber-800/60 text-amber-400"
                        >
                          Equip
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item picker for equipping */}
          {equipSlot && (
            <div className="mb-4 bg-stone-900 rounded-lg border border-amber-700/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-amber-400 text-xs uppercase tracking-wider">
                  Select {equipSlot} from inventory
                </h4>
                <button
                  onClick={() => setEquipSlot(null)}
                  className="text-xs text-stone-500 hover:text-stone-300"
                >
                  ✕ Cancel
                </button>
              </div>
              {filteredInventory.length === 0 ? (
                <p className="text-stone-600 text-xs italic">
                  No {equipSlot} items in inventory.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredInventory.map((id) => {
                    const item = items[id];
                    return item ? (
                      <button
                        key={id}
                        onClick={() => handleSelectItem(id)}
                        className="text-left rounded border border-stone-600 hover:border-amber-500 bg-stone-800 hover:bg-stone-750 p-2 transition-colors"
                      >
                        <ItemCard item={item} />
                      </button>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Relationships */}
          {selectedLive.relationships.length > 0 && (
            <div className="mb-4">
              <h4 className="text-stone-400 text-xs uppercase tracking-wider mb-2">Relationships</h4>
              <div className="flex gap-3 flex-wrap">
                {selectedLive.relationships.map((rel) => {
                  const other = mercenaries.find((m) => m.id === rel.mercId);
                  return other ? (
                    <span
                      key={rel.mercId}
                      className={`text-xs ${SENTIMENT_COLOR[rel.sentiment]}`}
                      title={`${rel.sentiment} with ${other.name}`}
                    >
                      {SENTIMENT_ICON[rel.sentiment]} {other.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Status actions */}
          {(selectedLive.isInjured || selectedLive.isFatigued) && (
            <div className="border-t border-stone-700 pt-3">
              <div className="flex gap-2 mb-2">
                {selectedLive.isInjured && (
                  <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">🩹 Injured</span>
                )}
                {selectedLive.isFatigued && (
                  <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">😓 Fatigued</span>
                )}
              </div>
              <button
                onClick={() => {
                  const updated = { ...selectedLive, isInjured: false, isFatigued: false };
                  updateMercenary(updated);
                }}
                className="text-sm bg-stone-700 hover:bg-stone-600 text-stone-200 px-3 py-1.5 rounded transition-colors"
              >
                🏥 Recuperate (clear status)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty inventory notice when trying to equip */}
      {selectedLive && inventoryItems.length === 0 && (
        <p className="text-stone-600 text-xs mt-4 italic text-center">
          No items in inventory to equip. Complete missions to earn loot.
        </p>
      )}
    </div>
  );
}
