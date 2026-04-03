import type { Item } from '~/types/item';

interface Props {
  item: Item;
  count?: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-stone-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
};

const CATEGORY_ICONS: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  consumable: '🧪',
  trophy: '🏆',
};

export function ItemCard({ item, count }: Props) {
  return (
    <div className="rounded border border-stone-700 bg-stone-800 p-3">
      <div className="flex items-start gap-2">
        <span className="text-xl">{CATEGORY_ICONS[item.category] ?? '📦'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`font-medium text-sm ${RARITY_COLORS[item.rarity]}`}>
              {item.name}
            </span>
            {count && count > 1 && (
              <span className="text-xs bg-stone-700 text-stone-300 px-1.5 rounded-full">x{count}</span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
          {item.statBonus && (
            <p className="text-xs text-amber-400 mt-0.5">
              {Object.entries(item.statBonus)
                .map(([k, v]) => `+${v} ${k}`)
                .join(', ')}
            </p>
          )}
          <p className="text-xs text-stone-500 mt-0.5">💰 {item.value}g value</p>
        </div>
      </div>
    </div>
  );
}
