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
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">🎒</span>
            Guild Inventory
          </h1>
          <p className="text-stone-400 mt-2 max-w-md italic font-serif leading-relaxed">
            "Gold is the blood of the guild, and the inventory its iron heart."
          </p>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all haptic-click ${
              activeTab === 'items' ? 'bg-primary text-stone-950 shadow-lg shadow-primary/20' : 'text-stone-500 hover:text-white'
            }`}
          >
            Items ({inventoryItemIds.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all haptic-click ${
              activeTab === 'materials' ? 'bg-primary text-stone-950 shadow-lg shadow-primary/20' : 'text-stone-500 hover:text-white'
            }`}
          >
            Materials ({totalMaterials})
          </button>
        </div>
      </header>

      {activeTab === 'materials' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Raw Resources</h2>
            <button
              onClick={() => setScreen('workshop')}
              className="text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group haptic-click"
            >
              Master Forge <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {totalMaterials === 0 ? (
            <div className="py-24 text-center glass-dark rounded-[2.5rem] border border-dashed border-white/10">
              <p className="text-stone-500 text-sm italic font-serif">Your supply crates are empty. Gather materials from the field.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Object.entries(materials)
                .filter(([, qty]) => qty > 0)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([matId, qty]) => {
                  const mat = MATERIALS_MAP[matId];
                  if (!mat) return null;
                  return (
                    <div
                      key={matId}
                      className="glass-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:border-white/10 transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-500">{mat.icon}</span>
                      <div>
                        <div className="text-[10px] font-black text-stone-300 uppercase tracking-tighter truncate">{mat.name}</div>
                        <div className="text-sm font-bold text-primary">x{qty}</div>
                        <div className="text-[8px] text-stone-600 font-black uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{mat.rarity}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'items' && (
        <section className="space-y-8">
          <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] px-1">Equipment Stash</h2>

          {/* Equip merc picker overlay */}
          {equipTarget && (
            <div className="glass rounded-[2rem] border-primary/30 p-8 shadow-2xl animate-in zoom-in-95 duration-300 bg-stone-950/80 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mb-1">Logistics: Tactical Assignment</h3>
                   <p className="text-white font-bold text-sm">Equip {items[equipTarget.itemId]?.name} to a mercenary</p>
                </div>
                <button
                  onClick={() => setEquipTarget(null)}
                  className="text-[10px] font-black text-stone-500 hover:text-white uppercase tracking-widest haptic-click"
                >
                  Cancel Operation [x]
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mercenaries.map((merc) => {
                  const currentItemId = merc.equipment[equipTarget.slot];
                  const currentItem = currentItemId ? items[currentItemId] : null;
                  return (
                    <button
                      key={merc.id}
                      onClick={() => handleEquipToMerc(merc.id)}
                      className="text-left glass-dark rounded-2xl border border-white/5 hover:border-primary/50 hover:bg-primary/5 p-4 transition-all haptic-click group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{merc.portrait}</div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{merc.name}</div>
                          <div className="text-[9px] text-stone-500 font-black uppercase tracking-tighter">{merc.title}</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5">
                        {currentItem ? (
                          <div className="text-[9px] text-amber-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                            <span className="text-stone-600">Replaces:</span> {currentItem.name}
                          </div>
                        ) : (
                          <div className="text-[9px] text-stone-600 font-black uppercase tracking-widest">Available Slot</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {uniqueIds.length === 0 ? (
            <div className="py-32 text-center glass-dark rounded-[2.5rem] border border-dashed border-white/10">
              <p className="text-stone-500 text-sm italic font-serif">The vault is currently empty. Reclaim glory to reclaim gear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueIds.map((id) => {
                const item = items[id];
                if (!item) return null;
                const slot = CATEGORY_TO_SLOT[item.category];
                const equippable = slot !== null;
                return (
                  <div key={id} className="premium-card flex flex-col h-full group hover:border-white/20 transition-all">
                    <div className="flex-1">
                      <ItemCard item={item} count={counts[id]} />
                    </div>
                    <div className="flex gap-2 mt-6">
                      {equippable && (
                        <button
                          onClick={() => handleEquip(id)}
                          className="flex-[2] py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary text-stone-950 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.95] haptic-click"
                        >
                          Equip
                        </button>
                      )}
                      <button
                        onClick={() => handleSell(item)}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 border border-white/5 haptic-click"
                      >
                        Sell ({item.value}g)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
