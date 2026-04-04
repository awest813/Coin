import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { ItemCard } from '~/components/ItemCard';
import { MATERIALS_MAP } from '~/data/materials';
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

type InventoryTab = 'items' | 'materials';

export function InventoryPanel() {
  const { guild, items, mercenaries, sellItem, equipItem, setScreen } = useGameStore();
  const { inventoryItemIds, materials } = guild;
  const [equipTarget, setEquipTarget] = useState<EquipTarget | null>(null);
  const [activeTab, setActiveTab] = useState<InventoryTab>('items');

  // Count duplicates
  const counts: Record<string, number> = {};
  for (const id of inventoryItemIds) {
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const uniqueIds = [...new Set(inventoryItemIds)];

  const totalMaterials = Object.values(materials).reduce((s, q) => s + q, 0);

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
      <h1 className="text-2xl font-bold text-amber-400 mb-4">🎒 Inventory</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'items' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          Items ({inventoryItemIds.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'materials' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          }`}
        >
          Materials ({totalMaterials})
        </button>
      </div>

      {activeTab === 'materials' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-sm">
              {totalMaterials === 0
                ? 'No materials yet. Complete missions and expeditions to gather them.'
                : `${totalMaterials} total material${totalMaterials !== 1 ? 's' : ''}.`}
            </p>
            <button
              onClick={() => setScreen('workshop')}
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Open Workshop →
            </button>
          </div>
          {totalMaterials === 0 ? (
            <div className="text-center text-stone-600 py-12 italic">
              Nothing here yet. Send parties on missions and expeditions.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(materials)
                .filter(([, qty]) => qty > 0)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([matId, qty]) => {
                  const mat = MATERIALS_MAP[matId];
                  if (!mat) return null;
                  return (
                    <div
                      key={matId}
                      className="bg-stone-800 border border-stone-700 rounded p-3 flex items-center gap-3"
                    >
                      <span className="text-2xl">{mat.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-stone-200">{mat.name}</div>
                        <div className="text-xs text-stone-400">x{qty}</div>
                        <div className="text-xs text-stone-500 capitalize">{mat.rarity}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'items' && (
        <div>
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
      )}
    </div>
  );
}
