import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { ITEMS_MAP } from '~/data/items';

const OUTCOME_STYLE = {
  success: { label: '✅ Success!', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700' },
  partial: { label: '⚠️ Partial Success', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700' },
  failure: { label: '❌ Failure', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700' },
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-stone-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  legendary: 'text-purple-400',
};

export function ResultsModal() {
  const { lastResult, showResultModal, dismissResult, mercenaries } = useGameStore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!showResultModal || !lastResult) return null;

  const style = OUTCOME_STYLE[lastResult.outcome];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`rounded-xl border ${style.border} ${style.bg} backdrop-blur max-w-lg w-full p-6 my-4`}>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className={`text-2xl font-bold ${style.color}`}>{style.label}</h2>
          <p className="text-stone-400 text-sm mt-1">
            Party score <span className="text-stone-200 font-medium">{lastResult.partyScore}</span> vs difficulty <span className="text-stone-200 font-medium">{lastResult.difficulty}</span>
          </p>
        </div>

        {/* Narrative events */}
        {lastResult.narrativeEvents.length > 0 && (
          <div className="mb-4 space-y-2">
            {lastResult.narrativeEvents.map((text, i) => (
              <p
                key={i}
                className={`text-sm italic leading-relaxed ${i === 0 ? 'text-stone-200' : 'text-stone-400'}`}
              >
                &ldquo;{text}&rdquo;
              </p>
            ))}
          </div>
        )}

        {/* Gold & Renown */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-stone-800/80 rounded-lg p-3 text-center">
            <div className="text-amber-400 font-bold text-lg">+{lastResult.goldEarned}g</div>
            <div className="text-stone-400 text-xs">Gold Earned</div>
          </div>
          <div className="bg-stone-800/80 rounded-lg p-3 text-center">
            <div className="text-yellow-400 font-bold text-lg">+{lastResult.renownEarned}</div>
            <div className="text-stone-400 text-xs">Renown Gained</div>
          </div>
        </div>

        {/* Loot */}
        {lastResult.itemsEarned.length > 0 && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">⚗️ Loot Found</h4>
            <div className="flex flex-wrap gap-2">
              {lastResult.itemsEarned.map((id, i) => {
                const item = ITEMS_MAP[id];
                return item ? (
                  <span
                    key={i}
                    className={`text-xs bg-stone-800 px-2 py-1 rounded border border-stone-700 ${RARITY_COLORS[item.rarity]}`}
                    title={item.description}
                  >
                    {item.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Casualties */}
        {(lastResult.injuredMercIds.length > 0 || lastResult.fatiguedMercIds.length > 0) && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">🩹 Casualties</h4>
            <div className="flex flex-wrap gap-2">
              {lastResult.injuredMercIds.map((id) => {
                const m = mercenaries.find((x) => x.id === id);
                return m ? (
                  <span key={id} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                    🩹 {m.name} injured
                  </span>
                ) : null;
              })}
              {lastResult.fatiguedMercIds.map((id) => {
                const m = mercenaries.find((x) => x.id === id);
                return m ? (
                  <span key={id} className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                    😓 {m.name} fatigued
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Score Breakdown toggle */}
        {lastResult.scoreBreakdown.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowBreakdown((v) => !v)}
              className="text-xs text-stone-400 hover:text-amber-400 underline transition-colors"
            >
              {showBreakdown ? '▲ Hide' : '▼ Show'} score breakdown
            </button>
            {showBreakdown && (
              <div className="mt-2 bg-stone-900/60 rounded-lg p-3 space-y-2">
                {lastResult.scoreBreakdown.map((entry, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between text-stone-300 font-medium mb-0.5">
                      <span>{entry.mercName}</span>
                      <span className="text-amber-400">{entry.total} pts</span>
                    </div>
                    <div className="text-stone-500 flex flex-wrap gap-x-3 gap-y-0.5 pl-2">
                      <span>base {entry.baseScore}</span>
                      {entry.traitBonus !== 0 && (
                        <span className="text-green-500">traits {entry.traitBonus > 0 ? '+' : ''}{entry.traitBonus}</span>
                      )}
                      {entry.equipBonus !== 0 && (
                        <span className="text-blue-400">gear {entry.equipBonus > 0 ? '+' : ''}{entry.equipBonus}</span>
                      )}
                      {entry.relBonus !== 0 && (
                        <span className={entry.relBonus > 0 ? 'text-purple-400' : 'text-red-400'}>
                          bonds {entry.relBonus > 0 ? '+' : ''}{entry.relBonus}
                        </span>
                      )}
                      {entry.statusPenalty !== 0 && (
                        <span className="text-red-500">status −{entry.statusPenalty}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="border-t border-stone-700 pt-2 flex justify-between text-xs text-stone-400">
                  <span>Total party score</span>
                  <span className="text-amber-400 font-bold">{lastResult.partyScore}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => { dismissResult(); setShowBreakdown(false); }}
          className="w-full py-2 rounded bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          Back to Guild Hall
        </button>
      </div>
    </div>
  );
}
