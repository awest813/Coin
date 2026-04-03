import { useGameStore } from '~/store/gameStore';
import { ItemCard } from '~/components/ItemCard';

export function InventoryPanel() {
  const { guild, items } = useGameStore();
  const { inventoryItemIds } = guild;

  // Count duplicates
  const counts: Record<string, number> = {};
  for (const id of inventoryItemIds) {
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const uniqueIds = [...new Set(inventoryItemIds)];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-400 mb-1">🎒 Inventory</h1>
      <p className="text-stone-400 text-sm mb-6">
        {inventoryItemIds.length === 0
          ? 'The stash is empty. Complete missions to acquire loot.'
          : `${inventoryItemIds.length} item${inventoryItemIds.length !== 1 ? 's' : ''} in the stash.`}
      </p>

      {uniqueIds.length === 0 ? (
        <div className="text-center text-stone-600 py-16 italic">
          Nothing here yet. Send a party on a mission.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {uniqueIds.map((id) => {
            const item = items[id];
            return item ? (
              <ItemCard key={id} item={item} count={counts[id]} />
            ) : null;
          })}
        </div>
      )}

      {/* TODO Phase 1: equip items to mercs, sell items for gold */}
      {uniqueIds.length > 0 && (
        <p className="text-stone-600 text-xs mt-6 italic">
          Equipping and selling items coming in Phase 1.
        </p>
      )}
    </div>
  );
}
