import type { Item } from '~/types/item';

interface Props {
  item: Item;
  count?: number;
  durability?: number;
}

const RARITY_STYLES: Record<string, { text: string; border: string; bg: string; glow?: string }> = {
  common: { text: 'text-stone-300', border: 'border-stone-600', bg: 'bg-stone-800' },
  uncommon: { text: 'text-green-400', border: 'border-green-800/60', bg: 'bg-stone-800' },
  rare: { text: 'text-blue-400', border: 'border-blue-800/60', bg: 'bg-stone-800', glow: 'shadow-blue-900/30' },
  legendary: { text: 'text-purple-400', border: 'border-purple-700/70', bg: 'bg-stone-800', glow: 'shadow-purple-900/40' },
};

const CATEGORY_ICONS: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  consumable: '🧪',
  trophy: '🏆',
};

export function ItemCard({ item, count }: Props) {
  const rs = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.common;

  return (
    <div className={`rounded border ${rs.border} ${rs.bg} p-3 ${rs.glow ? `shadow-md ${rs.glow}` : ''}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl shrink-0">{CATEGORY_ICONS[item.category] ?? '📦'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-semibold font-heading text-sm ${rs.text}`}>
              {item.name}
            </span>
            {count && count > 1 && (
              <span className="text-xs bg-stone-700 text-stone-300 px-1.5 rounded-full">×{count}</span>
            )}
            <span className={`text-[10px] ${rs.text} opacity-70 capitalize`}>{item.rarity}</span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5 leading-snug">{item.description}</p>
          {item.flavorText && (
            <p className="text-xs text-stone-500 italic mt-0.5 font-body-italic">
              &ldquo;{item.flavorText}&rdquo;
            </p>
          )}
          {item.statBonus && Object.keys(item.statBonus).length > 0 && (
            <p className="text-xs text-amber-400 mt-0.5 font-semibold">
              {Object.entries(item.statBonus)
                .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`)
                .join(', ')}
            </p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-stone-700/60 text-stone-400 px-1.5 py-0.5 rounded-full">
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
          {durability !== undefined && durability < 100 && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[8px] font-black uppercase text-stone-500">
                <span>Condition</span>
                <span className={durability < 30 ? 'text-rose-500' : ''}>{durability}%</span>
              </div>
              <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${durability < 30 ? 'bg-rose-500' : 'bg-primary'}`}
                  style={{ width: `${durability}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-stone-500 mt-1">💰 {item.value}g sale value</p>
        </div>
      </div>
    </div>
  );
}
