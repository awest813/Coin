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
    <div className="rounded-lg border border-stone-700 bg-gradient-to-br from-stone-900 to-stone-800 p-4 hover:border-stone-600 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold font-heading text-[0.9rem] text-stone-100">
              {mission.name}
            </h3>
          </div>
          <p className="text-sm text-stone-400 mb-2 leading-snug">{mission.description}</p>

          {/* Difficulty bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold ${diff.color} w-16 shrink-0`}>{diff.label}</span>
            <div className="flex-1 bg-stone-700 rounded-full h-1.5">
              <div className={`${diff.bar} h-1.5 rounded-full stat-bar-fill`} style={{ width: `${diff.pct}%` }} />
            </div>
            <span className="text-xs text-stone-500 w-6 text-right">d{mission.difficulty}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 text-xs">
            {mission.tags.map((tag) => (
              <span key={tag} className="bg-stone-700/80 text-stone-300 px-2 py-0.5 rounded-full border border-stone-600/40">
                {TAG_ICONS[tag] ?? '📌'} {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Rewards panel */}
        <div className="shrink-0 flex flex-col gap-1 items-end">
          <span className="text-xs text-stone-500">⏱ {mission.durationLabel}</span>
          <span className="text-sm font-semibold text-amber-300">💰 {mission.reward.gold}g</span>
          <span className="text-xs text-yellow-400">⭐ +{mission.reward.renown}</span>
        </div>
      </div>

      <div className="mt-3 border-t border-stone-700/60 pt-3">
        <button
          onClick={onAssign}
          disabled={disabled}
          className="w-full py-1.5 rounded font-semibold text-sm transition-all duration-150 bg-amber-800 hover:bg-amber-700 active:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm"
        >
          {disabled ? '⚔️ Party Deployed' : '⚔️ Send Party'}
        </button>
      </div>
    </div>
  );
}
