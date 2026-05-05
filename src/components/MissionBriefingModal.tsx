import { useGameStore } from '~/store/gameStore';
import { ITEMS_MAP } from '~/data/items';
import type { MissionTemplate } from '~/types/mission';

function getDifficulty(d: number) {
  if (d <= 6) return { bg: 'bg-green-900/20', text: 'text-green-400', label: 'Easy' };
  if (d <= 10) return { bg: 'bg-yellow-900/20', text: 'text-yellow-400', label: 'Moderate' };
  if (d <= 14) return { bg: 'bg-orange-900/20', text: 'text-orange-400', label: 'Hard' };
  return { bg: 'bg-red-900/20', text: 'text-red-400', label: 'Deadly' };
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-stone-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  legendary: 'text-purple-400',
};

const TAG_MATERIAL_HINTS: Record<string, string> = {
  combat: 'Iron scraps, tanned hide',
  exploration: 'Herbs bundle, ancient ink',
  ruin: 'Bone fragments, ancient ink',
  hunt: 'Wolf pelt, bone fragments',
  escort: 'Tanned hide, iron scraps',
  stealth: 'Silver dust, swamp reed',
  social: 'Ancient ink, herbs bundle',
  bounty: 'Iron scraps, refined steel',
};

interface BriefingModalProps {
  mission: MissionTemplate;
  onAccept: () => void;
  onDecline: () => void;
}

export function MissionBriefingModal({ mission, onAccept, onDecline }: BriefingModalProps) {
  const { guild } = useGameStore();
  const diff = getDifficulty(mission.difficulty);
  const regionUnlocked = !mission.region || guild.unlockedRegions.includes(mission.region);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass-dark rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
        <header className={`p-10 border-b border-white/5 ${diff.bg} relative overflow-hidden`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-current opacity-5 blur-[60px] -translate-y-1/2" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                <span className={`w-2 h-2 rounded-full ${diff.text.replace('text-', 'bg-')} animate-pulse`} />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${diff.text}`}>{diff.label} Difficulty</span>
              </div>
              {mission.region && (
                <span className="stat-badge text-[9px] bg-white/5 border-white/5 text-stone-400">
                  {mission.region}
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black font-heading text-white tracking-tighter text-glow">{mission.name}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {/* Flavor Description */}
          <section className="space-y-2">
            <p className="text-xl text-stone-300 leading-relaxed font-serif italic">
              "{mission.description}"
            </p>
          </section>

          {/* Tags & Duration */}
          <section className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {mission.tags.map(tag => (
                <span key={tag} className="stat-badge text-[9px] bg-white/5 border-white/5 text-stone-300 uppercase tracking-wider font-bold">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-stone-500 text-[11px] font-bold">
              <span>⏱</span>
              <span>{mission.durationLabel}</span>
            </div>
          </section>

          {/* Difficulty Breakdown */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Difficulty Assessment</h4>
            <div className="glass p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-stone-200">Contract Threshold</span>
                <span className={`text-lg font-black ${diff.text}`}>{mission.difficulty}</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${diff.text.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(100, (mission.difficulty / 20) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-500 italic">
                Party score must exceed {mission.difficulty} for success. Your roster's average stats and synergies will determine the outcome.
              </p>
            </div>
          </section>

          {/* Rewards */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Contract Payment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                <div className="text-primary font-black text-2xl">{mission.reward.gold}g</div>
                <div className="text-[9px] text-stone-500 uppercase tracking-wider font-bold mt-1">Gold Bounty</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-white/5 text-center">
                <div className="text-yellow-400 font-black text-2xl">+{mission.reward.renown}</div>
                <div className="text-[9px] text-stone-500 uppercase tracking-wider font-bold mt-1">Renown</div>
              </div>
            </div>
          </section>

          {/* Possible Loot */}
          {mission.reward.possibleItems.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Possible Loot</h4>
              <div className="flex flex-wrap gap-2">
                {mission.reward.possibleItems.map(itemId => {
                  const item = ITEMS_MAP[itemId];
                  return (
                    <span
                      key={itemId}
                      className={`stat-badge text-[9px] bg-white/5 border-white/10 ${RARITY_COLORS[item?.rarity ?? 'common']} font-bold`}
                    >
                      {item?.name ?? itemId}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Material Drops */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Expected Materials</h4>
            <div className="flex flex-wrap gap-2">
              {mission.tags.map(tag => TAG_MATERIAL_HINTS[tag]?.split(', ').map(m => (
                <span key={m} className="stat-badge text-[9px] bg-emerald-500/5 border-emerald-500/20 text-emerald-400 font-bold">
                  {m}
                </span>
              ))).flat().filter((v, i, a) => a.indexOf(v) === i)}
            </div>
          </section>

          {/* Consequences */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Failure Consequences</h4>
            <div className="glass p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-2">
              <p className="text-[11px] text-rose-400 italic leading-relaxed">
                {mission.flavorText.failure}
              </p>
              <div className="flex gap-2 text-[10px] font-bold text-stone-400">
                <span>• No payment</span>
                <span>• Injured mercs possible</span>
                <span>• Renown loss</span>
              </div>
            </div>
          </section>

          {!regionUnlocked && (
            <section className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <p className="text-[11px] text-amber-400 font-bold">⚠ This contract is in {mission.region}, a region not yet unlocked by your guild.</p>
            </section>
          )}
        </div>

        <footer className="p-8 border-t border-white/5 bg-white/5 flex gap-4">
          <button
            onClick={onDecline}
            className="px-8 py-4 rounded-2xl text-stone-500 hover:text-white transition-colors font-bold text-sm bg-white/5 border border-white/5 hover:border-white/10"
          >
            Decline Contract
          </button>
          <button
            onClick={onAccept}
            className="premium-button flex-1 py-4 text-sm font-black uppercase tracking-[0.2em]"
          >
            Accept Contract → Assign Party
          </button>
        </footer>
      </div>
    </div>
  );
}
