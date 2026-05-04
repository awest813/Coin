import type { MissionTemplate } from '~/types/mission';

interface Props {
  mission: MissionTemplate;
  onAssign: () => void;
  disabled?: boolean;
}

const MAX_DIFFICULTY_SCALE = 20;

const DIFFICULTY_CONFIG = (d: number) => {
  if (d <= 4) return { label: 'Trivial', color: 'text-green-400', bar: 'bg-green-500', pct: (d / MAX_DIFFICULTY_SCALE) * 100 };
  if (d <= 7) return { label: 'Easy', color: 'text-lime-400', bar: 'bg-lime-500', pct: (d / MAX_DIFFICULTY_SCALE) * 100 };
  if (d <= 10) return { label: 'Moderate', color: 'text-yellow-400', bar: 'bg-yellow-500', pct: (d / MAX_DIFFICULTY_SCALE) * 100 };
  if (d <= 14) return { label: 'Hard', color: 'text-orange-400', bar: 'bg-orange-500', pct: (d / MAX_DIFFICULTY_SCALE) * 100 };
  return { label: 'Brutal', color: 'text-red-400', bar: 'bg-red-500', pct: (d / MAX_DIFFICULTY_SCALE) * 100 };
};

const TAG_ICONS: Record<string, string> = {
  combat: '⚔️',
  stealth: '🗡️',
  social: '💬',
  exploration: '🗺️',
  escort: '🛡️',
  hunt: '🏹',
  bounty: '💰',
  ruin: '🏚️',
};

export function MissionCard({ mission, onAssign, disabled }: Props) {
  const diff = DIFFICULTY_CONFIG(mission.difficulty);

  return (
    <div className={`premium-card p-6 group transition-all duration-700 ${disabled ? 'opacity-50 grayscale-[0.2]' : ''} ${mission.reward.gold > 200 ? 'shimmer-effect' : ''}`}>
      <div className="flex flex-col md:flex-row items-stretch gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="text-2xl font-black font-heading text-white tracking-tighter group-hover:text-primary transition-all duration-500 text-glow">
              {mission.name}
            </h3>
            <div className="flex gap-2">
              {mission.tags.map((tag) => (
                <span key={tag} className="stat-badge text-[9px] bg-primary/5 border-primary/20 text-primary font-black">
                  {TAG_ICONS[tag] ?? '📌'} {tag.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <p className="text-stone-400 text-[13px] italic font-serif leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            "{mission.description}"
          </p>

          <div className="pt-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <span className={`${diff.color} drop-shadow-sm`}>{diff.label} Difficulty</span>
              <span className="text-stone-500">Tier {Math.ceil(mission.difficulty / 4)} Contract</span>
            </div>
            <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${diff.bar} shadow-[0_0_12px_rgba(251,191,36,0.5)]`} 
                style={{ width: `${diff.pct}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Rewards & Action */}
        <div className="w-full md:w-48 flex md:flex-col justify-between items-stretch gap-4 p-4 glass-dark rounded-2xl border border-white/5">
          <div className="space-y-2">
             <div className="flex justify-between items-center">
               <span className="text-[9px] text-stone-500 font-black uppercase tracking-widest">Payment</span>
               <div className="text-primary font-black text-xl text-glow">💰 {mission.reward.gold}g</div>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-[9px] text-stone-500 font-black uppercase tracking-widest">Prestige</span>
               <div className="text-yellow-500 text-xs font-black">⭐ +{mission.reward.renown}</div>
             </div>
             <div className="h-px bg-white/5 my-2" />
             <div className="flex justify-between items-center text-stone-400 text-[10px] font-mono font-bold">
               <span>DURATION</span>
               <span className="flex items-center gap-1.5 text-white">
                 <span className="text-sm">⏱</span> {mission.durationLabel}
               </span>
             </div>
          </div>
          
          <button
            onClick={onAssign}
            disabled={disabled}
            className={`premium-button w-full !text-[9px] !py-2 ${disabled ? 'opacity-30 grayscale cursor-not-allowed pointer-events-none' : ''}`}
          >
            {disabled ? 'PERSONNEL DEPLOYED' : 'INITIALIZE CONTRACT'}
          </button>
        </div>
      </div>
    </div>
  );
}
