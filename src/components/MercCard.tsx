import type { Mercenary } from '~/types/mercenary';

interface Props {
  merc: Mercenary;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function MercCard({ merc, selected, onClick, compact }: Props) {
  const statTotal = merc.stats.strength + merc.stats.agility + merc.stats.intellect + merc.stats.presence;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-3 transition-all cursor-pointer ${
        selected
          ? 'border-amber-500 bg-amber-950/40'
          : 'border-stone-700 bg-stone-800 hover:border-stone-500'
      } ${merc.isInjured ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{merc.portrait}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-100 truncate">{merc.name}</span>
            {merc.isInjured && (
              <span className="text-xs text-red-400 bg-red-900/40 px-1.5 py-0.5 rounded">Injured</span>
            )}
            {merc.isFatigued && !merc.isInjured && (
              <span className="text-xs text-yellow-400 bg-yellow-900/40 px-1.5 py-0.5 rounded">Fatigued</span>
            )}
          </div>
          <p className="text-xs text-stone-400">{merc.title}</p>
        </div>
        {!compact && (
          <div className="text-xs text-stone-400 text-right">
            <div>Score: {statTotal}</div>
            <div>{merc.missionsCompleted} missions</div>
          </div>
        )}
      </div>
      {!compact && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {merc.traits.map((t) => (
            <span
              key={t.id}
              className="text-xs bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full"
              title={t.description}
            >
              {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
