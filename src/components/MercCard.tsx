import { useGameStore } from '~/store/gameStore';
import type { Mercenary } from '~/types/mercenary';

interface Props {
  merc: Mercenary;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

function StatMiniBar({ value, color = 'bg-amber-500' }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-stone-700 rounded-full h-1">
      <div className={`${color} h-1 rounded-full stat-bar-fill`} style={{ width: `${value * 10}%` }} />
    </div>
  );
}

const MORALE_COLOR = (m: number) =>
  m >= 7 ? 'text-green-400' : m >= 4 ? 'text-yellow-400' : 'text-red-400';

export function MercCard({ merc, selected, onClick, compact }: Props) {
  const items = useGameStore((s) => s.items);
  const statTotal = merc.stats.strength + merc.stats.agility + merc.stats.intellect + merc.stats.presence;
  const equippedItems = Object.values(merc.equipment)
    .filter(Boolean)
    .map((id) => items[id!])
    .filter(Boolean);

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-3 transition-all duration-150 cursor-pointer ${
        selected
          ? 'border-amber-500 bg-gradient-to-br from-amber-950/40 to-stone-900 shadow-md shadow-amber-900/30'
          : 'border-stone-700 bg-gradient-to-br from-stone-900 to-stone-800 hover:border-stone-500 hover:shadow-sm'
      } ${merc.isInjured ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        {/* Portrait */}
        <div className={`relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
          selected ? 'border-amber-500/70' : 'border-stone-600'
        } bg-stone-900`}>
          {merc.portrait}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold font-heading text-sm text-stone-100 truncate">
              {merc.name}
            </span>
            {merc.isInjured && (
              <span className="badge-status bg-red-900/60 text-red-300 border border-red-800/50">🩹 Injured</span>
            )}
            {merc.isFatigued && !merc.isInjured && (
              <span className="badge-status bg-yellow-900/60 text-yellow-300 border border-yellow-800/50">😓 Fatigued</span>
            )}
          </div>
          <p className="text-xs text-stone-400">{merc.title}</p>

          {!compact && (
            <div className="mt-1.5 grid grid-cols-4 gap-1">
              {[
                { key: 'STR', val: merc.stats.strength, color: 'bg-red-500' },
                { key: 'AGI', val: merc.stats.agility, color: 'bg-green-500' },
                { key: 'INT', val: merc.stats.intellect, color: 'bg-blue-500' },
                { key: 'PRS', val: merc.stats.presence, color: 'bg-purple-500' },
              ].map(({ key, val, color }) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>{key}</span><span>{val}</span>
                  </div>
                  <StatMiniBar value={val} color={color} />
                </div>
              ))}
            </div>
          )}

          {compact && equippedItems.length > 0 && (
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {equippedItems.map((i) => i!.name).join(', ')}
            </p>
          )}
        </div>

        <div className="text-xs text-stone-400 text-right shrink-0 flex flex-col items-end gap-0.5">
          <span className="text-stone-300 font-semibold">{statTotal} pts</span>
          <span className={`${MORALE_COLOR(merc.morale)}`}>♥ {merc.morale}/10</span>
        </div>
      </div>

      {!compact && (
        <>
          {merc.traits.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {merc.traits.map((t) => (
                <span
                  key={t.id}
                  className="text-[10px] bg-stone-700/80 text-stone-300 px-2 py-0.5 rounded-full border border-stone-600/50"
                  title={t.description}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
          {equippedItems.length > 0 && (
            <div className="mt-1.5 flex gap-1 flex-wrap">
              {equippedItems.map((item) => (
                <span
                  key={item!.id}
                  className="text-[10px] bg-amber-900/30 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded-full"
                  title={item!.description}
                >
                  {item!.name}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
