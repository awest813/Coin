import { useGameStore } from '~/store/gameStore';
import type { Mercenary } from '~/types/mercenary';

interface Props {
  merc: Mercenary;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
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

  const isLegend = merc.isLegendary;

  return (
    <div
      onClick={onClick}
      className={`premium-card p-5 flex flex-col gap-4 transition-all cursor-pointer relative overflow-hidden group haptic-click ${
        isLegend 
          ? 'border-amber-500/40 bg-amber-500/[0.03] shadow-[0_15px_45px_rgba(245,158,11,0.15)] shimmer-effect' 
          : 'hover:bg-white/5 border-white/10'
      } ${
        selected ? 'ring-2 ring-primary bg-primary/10 shadow-[0_0_40px_rgba(251,191,36,0.15)] border-primary/30' : ''
      } ${merc.isInjured ? 'grayscale-[0.5] opacity-80' : ''}`}
    >
      {isLegend && (
        <div className="absolute top-0 right-0 px-4 py-1 bg-amber-500 text-stone-950 text-[8px] font-black uppercase tracking-[0.3em] rounded-bl-2xl shadow-xl z-20">
          Legend
        </div>
      )}

      <div className="flex items-start gap-5">
        {/* Avatar / Portrait */}
        <div className={`relative w-16 h-16 shrink-0 rounded-[1.25rem] glass-dark flex items-center justify-center text-4xl border transition-all duration-700 ${
          isLegend ? 'border-amber-500/40 text-glow' : 'border-white/10'
        } ${selected ? 'scale-110 rotate-2 border-primary' : 'group-hover:scale-105 group-hover:rotate-1'}`}>
          <span className="icon-premium">{merc.portrait}</span>
          {merc.isInjured && (
             <div className="absolute -bottom-1.5 -right-1.5 bg-danger text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(239,68,68,0.5)] border border-white/20 animate-pulse">
               CRITICAL
             </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-1">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <h4 className={`font-black font-heading tracking-tight truncate transition-all duration-500 ${
                isLegend ? 'text-amber-400' : 'text-stone-200'
              } ${selected ? 'text-lg text-glow' : 'text-base group-hover:text-primary'}`}>
                {merc.name}
              </h4>
              <p className="text-stone-500 text-[9px] uppercase tracking-[0.25em] font-black">{merc.title}</p>
            </div>
            <div className="text-right">
               <div className={`text-xs font-black ${MORALE_COLOR(merc.morale)} drop-shadow-sm`}>♥ {merc.morale}</div>
               <div className="text-stone-500 text-[9px] font-mono font-black mt-1 bg-white/5 px-1.5 rounded-md border border-white/5">{statTotal} OVR</div>
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-700">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: 'Strength', val: merc.stats.strength, color: 'bg-rose-500' },
              { label: 'Agility', val: merc.stats.agility, color: 'bg-emerald-500' },
              { label: 'Intellect', val: merc.stats.intellect, color: 'bg-sky-500' },
              { label: 'Presence', val: merc.stats.presence, color: 'bg-primary' },
            ].map(s => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-stone-500 uppercase font-black tracking-widest">
                  <span>{s.label}</span>
                  <span className="text-stone-300">{s.val}</span>
                </div>
                <div className="h-1 bg-black/60 rounded-full overflow-hidden p-[1px]">
                  <div 
                    className={`h-full rounded-full ${s.color} shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000 ease-out`} 
                    style={{ width: `${s.val * 10}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Traits & Gear */}
          {(merc.traits.length > 0 || equippedItems.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              {merc.traits.map(t => (
                <span key={t.id} className={`stat-badge text-[8px] font-black ${
                  t.isLegendary ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-accent/10 text-accent border-accent/20'
                }`}>
                  {t.isLegendary ? '⭐' : '🛡️'} {t.name.toUpperCase()}
                </span>
              ))}
              {equippedItems.map(item => (
                <span key={item!.id} className="stat-badge text-[8px] bg-white/5 text-stone-300 border-white/10 font-black">
                  {item!.icon} {item!.name.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {compact && equippedItems.length > 0 && (
         <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest truncate pt-3 border-t border-white/5">
            LOADOUT: <span className="text-stone-300">{equippedItems.map(i => i!.name).join(', ')}</span>
         </div>
      )}
    </div>
  );
}
