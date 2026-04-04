import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { ItemCard } from '~/components/ItemCard';
import type { EquipmentSlot } from '~/types/mercenary';
import type { Item } from '~/types/item';

const CATEGORY_TO_SLOT: Record<string, EquipmentSlot | null> = {
  weapon: 'weapon',
  armor: 'armor',
  accessory: 'accessory',
  consumable: null,
  trophy: null,
};

interface EquipTarget {
  itemId: string;
  slot: EquipmentSlot;
}

export function InventoryPanel() {
  const { guild, items, mercenaries, sellItem, equipItem } = useGameStore();
  const { inventoryItemIds } = guild;
  const [equipTarget, setEquipTarget] = useState<EquipTarget | null>(null);

  // Count duplicates
  const counts: Record<string, number> = {};
  for (const id of inventoryItemIds) {
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const uniqueIds = [...new Set(inventoryItemIds)];

  function handleSell(item: Item) {
    if (confirm(`Sell "${item.name}" for ${item.value}g?`)) {
      sellItem(item.id);
    }
  }

  function handleEquip(itemId: string) {
    const item = items[itemId];
    if (!item) return;
    const slot = CATEGORY_TO_SLOT[item.category];
    if (!slot) return;
    setEquipTarget({ itemId, slot });
  }

  function handleEquipToMerc(mercId: string) {
    if (!equipTarget) return;
    equipItem(mercId, equipTarget.slot, equipTarget.itemId);
    setEquipTarget(null);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-1">🎒 Inventory</h1>
      <p className="text-stone-400 text-sm mb-6">
        {inventoryItemIds.length === 0
          ? 'The stash is empty. Complete missions to acquire loot.'
          : `${inventoryItemIds.length} item${inventoryItemIds.length !== 1 ? 's' : ''} in the stash.`}
      </p>

      {/* Equip merc picker */}
      {equipTarget && (
        <div className="mb-6 bg-stone-800 border border-amber-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-amber-400 font-medium text-sm">
              Equip {items[equipTarget.itemId]?.name} — choose a mercenary
            </h3>
            <button
              onClick={() => setEquipTarget(null)}
              className="text-xs text-stone-500 hover:text-stone-300"
            >
              ✕ Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {mercenaries.map((merc) => {
              const currentItemId = merc.equipment[equipTarget.slot];
              const currentItem = currentItemId ? items[currentItemId] : null;
              return (
                <button
                  key={merc.id}
                  onClick={() => handleEquipToMerc(merc.id)}
                  className="text-left rounded border border-stone-600 hover:border-amber-500 bg-stone-900 hover:bg-stone-800 p-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{merc.portrait}</span>
                    <div>
                      <div className="text-xs font-medium text-stone-200">{merc.name}</div>
                      <div className="text-xs text-stone-500">{merc.title}</div>
                    </div>
                  </div>
                  {currentItem ? (
                    <div className="text-xs text-stone-500 mt-1 truncate">
                      Current: {currentItem.name} → will be returned
                    </div>
                  ) : (
                    <div className="text-xs text-stone-600 mt-1">Slot empty</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {uniqueIds.length === 0 ? (
        <div className="text-center text-stone-600 py-16 italic">
          Nothing here yet. Send a party on a mission.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {uniqueIds.map((id) => {
            const item = items[id];
            if (!item) return null;
            const slot = CATEGORY_TO_SLOT[item.category];
            const equippable = slot !== null;
            return (
              <div key={id} className="rounded border border-stone-700 bg-stone-800 flex flex-col">
                <div className="flex-1">
                  <ItemCard item={item} count={counts[id]} />
                </div>
                <div className="flex gap-2 px-3 pb-3">
                  {equippable && (
                    <button
                      onClick={() => handleEquip(id)}
                      className="flex-1 py-1 text-xs rounded bg-amber-800 hover:bg-amber-700 text-white transition-colors"
                    >
                      Equip
                    </button>
                  )}
                  <button
                    onClick={() => handleSell(item)}
                    className="flex-1 py-1 text-xs rounded bg-stone-700 hover:bg-stone-600 text-stone-300 transition-colors"
                  >
                    Sell {item.value}g
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
