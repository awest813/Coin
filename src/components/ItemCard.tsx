import type { Item } from '~/types/item';

interface Props {
  item: Item;
  count?: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-stone-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  legendary: 'text-purple-400',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-stone-700',
  uncommon: 'border-green-900/50',
  rare: 'border-blue-900/50',
  legendary: 'border-purple-900/50',
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
    <div className={`rounded border ${RARITY_BORDER[item.rarity]} bg-stone-800 p-3`}>
      <div className="flex items-start gap-2">
        <span className="text-xl">{CATEGORY_ICONS[item.category] ?? '📦'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-medium text-sm ${RARITY_COLORS[item.rarity]}`}>
              {item.name}
            </span>
            {count && count > 1 && (
              <span className="text-xs bg-stone-700 text-stone-300 px-1.5 rounded-full">×{count}</span>
            )}
            <span className={`text-xs ${RARITY_COLORS[item.rarity]} opacity-60 capitalize`}>
              {item.rarity}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
          {item.flavorText && (
            <p className="text-xs text-stone-600 italic mt-0.5">{item.flavorText}</p>
          )}
          {item.statBonus && (
            <p className="text-xs text-amber-400 mt-0.5">
              {Object.entries(item.statBonus)
                .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`)
                .join(', ')}
            </p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs bg-stone-700/60 text-stone-400 px-1.5 py-0.5 rounded-full">
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-stone-500 mt-1">💰 {item.value}g</p>
        </div>
      </div>
    </div>
  );
}
