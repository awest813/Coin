import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { getTipsForScreen, getRandomTip, type TutorialTip } from '~/data/tutorialTips';

export function TutorialSystem() {
  const { activeScreen, guild, mercenaries } = useGameStore();
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const barracks = guild.rooms.find(r => r.id === 'room_barracks');
  const rosterCap = barracks ? barracks.levels[barracks.level - 1]?.effects?.rosterCap : 10;
  const gameState = {
    guildMorale: guild.guildMorale,
    completedContracts: guild.completedContracts,
    unlockedRegions: guild.unlockedRegions,
    rosterSize: mercenaries.length,
    rosterCap: rosterCap ?? 10,
    mercenaries,
    regionalInfluence: guild.regionalInfluence,
  };

  const screenTips = getTipsForScreen(activeScreen, gameState);
  const randomTip = getRandomTip(gameState);

  const currentTip = screenTips[0] ?? randomTip;

  if (dismissed || minimized) return null;
  if (!currentTip) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="glass rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border-b border-primary/10">
          <span className="text-primary text-sm">💡</span>
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex-1">
            {currentTip.title}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setMinimized(true)}
              className="w-5 h-5 rounded flex items-center justify-center text-stone-500 hover:text-stone-300 transition-colors text-[10px]"
              aria-label="Minimize"
            >
              −
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="w-5 h-5 rounded flex items-center justify-center text-stone-500 hover:text-rose-400 transition-colors text-[10px]"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-stone-300 text-xs leading-relaxed">
            {currentTip.content}
          </p>
        </div>

        {/* Footer */}
        {screenTips.length > 1 && (
          <div className="flex gap-1 px-4 pb-3 justify-center">
            {screenTips.slice(0, 3).map((tip, i) => (
              <div
                key={tip.id}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === 0 ? 'bg-primary' : 'bg-stone-600'
                }`}
              />
            ))}
            {screenTips.length > 3 && (
              <span className="text-stone-600 text-[8px] ml-1">+{screenTips.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TipDisplayProps {
  tip: TutorialTip;
}

export function TipCard({ tip }: TipDisplayProps) {
  return (
    <div className="glass rounded-xl p-4 border border-primary/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-primary text-sm">💡</span>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          {tip.title}
        </span>
      </div>
      <p className="text-stone-400 text-xs leading-relaxed">
        {tip.content}
      </p>
    </div>
  );
}

interface ObjectiveTrackerProps {
  objectives: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    icon: string;
    target: number;
    current: number;
    isCompleted: boolean;
    reward?: { gold?: number; renown?: number; itemId?: string };
  }>;
  onObjectiveClick?: (objectiveId: string) => void;
}

export function ObjectiveTracker({ objectives, onObjectiveClick }: ObjectiveTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const activeObjectives = objectives.filter(o => !o.isCompleted);
  const completedCount = objectives.filter(o => o.isCompleted).length;

  const difficultyColors: Record<string, string> = {
    starter: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    easy: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    hard: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    legendary: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🎯</span>
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Objectives
          </span>
          <span className="text-[10px] text-stone-500 font-mono">
            {completedCount}/{objectives.length}
          </span>
        </div>
        <span className={`text-stone-500 text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3">
          {activeObjectives.slice(0, 5).map(objective => {
            const progress = Math.min(100, (objective.current / objective.target) * 100);
            const isComplete = objective.current >= objective.target;

            return (
              <div
                key={objective.id}
                onClick={() => onObjectiveClick?.(objective.id)}
                className={`glass-dark rounded-xl p-4 border transition-all cursor-pointer hover:border-white/10 ${
                  isComplete ? 'border-primary/30 bg-primary/5' : 'border-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{objective.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white truncate">
                        {objective.name}
                      </span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${difficultyColors[objective.difficulty]}`}>
                        {objective.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-relaxed line-clamp-2 mb-2">
                      {objective.description}
                    </p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-stone-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-stone-500 shrink-0">
                        {objective.current}/{objective.target}
                      </span>
                    </div>

                    {/* Reward preview */}
                    {objective.reward && (
                      <div className="flex gap-2 mt-2">
                        {objective.reward.gold && (
                          <span className="text-[9px] text-amber-400">💰 {objective.reward.gold}g</span>
                        )}
                        {objective.reward.renown && (
                          <span className="text-[9px] text-yellow-400">⭐ +{objective.reward.renown}</span>
                        )}
                        {objective.reward.itemId && (
                          <span className="text-[9px] text-primary">🎁 Item</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {activeObjectives.length === 0 && (
            <div className="text-center py-6 text-stone-500 text-xs">
              All objectives completed! 🎉
            </div>
          )}

          {activeObjectives.length > 5 && (
            <button className="w-full py-2 text-[10px] text-primary hover:text-white transition-colors">
              View all {activeObjectives.length} objectives →
            </button>
          )}
        </div>
      )}
    </div>
  );
}