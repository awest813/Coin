import type { MissionTemplate } from '~/types/mission';

interface Props {
  mission: MissionTemplate;
  onAssign: () => void;
  disabled?: boolean;
}

const DIFFICULTY_LABEL = (d: number) => {
  if (d <= 4) return { label: 'Trivial', color: 'text-green-400' };
  if (d <= 7) return { label: 'Easy', color: 'text-lime-400' };
  if (d <= 10) return { label: 'Moderate', color: 'text-yellow-400' };
  if (d <= 14) return { label: 'Hard', color: 'text-orange-400' };
  return { label: 'Brutal', color: 'text-red-400' };
};

const TAG_ICONS: Record<string, string> = {
  combat: '⚔️',
  stealth: '🗡️',
  social: '💬',
  exploration: '🗺️',
  escort: '🛡️',
};

export function MissionCard({ mission, onAssign, disabled }: Props) {
  const diff = DIFFICULTY_LABEL(mission.difficulty);

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-stone-100">{mission.name}</h3>
            <span className={`text-xs font-medium ${diff.color}`}>{diff.label}</span>
          </div>
          <p className="text-sm text-stone-400 mb-2">{mission.description}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {mission.tags.map((tag) => (
              <span key={tag} className="bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full">
                {TAG_ICONS[tag]} {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right text-sm text-stone-400 shrink-0">
          <div>⏱ {mission.durationLabel}</div>
          <div>💰 {mission.reward.gold}g</div>
          <div>⭐ +{mission.reward.renown}</div>
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={onAssign}
          disabled={disabled}
          className="w-full py-1.5 rounded bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {disabled ? 'Party on mission' : 'Send Party'}
        </button>
      </div>
    </div>
  );
}
