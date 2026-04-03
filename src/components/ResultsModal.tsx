import { useGameStore } from '~/store/gameStore';
import { ITEMS_MAP } from '~/data/items';

const OUTCOME_STYLE = {
  success: { label: 'Success!', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700' },
  partial: { label: 'Partial Success', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700' },
  failure: { label: 'Failure', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700' },
};

export function ResultsModal() {
  const { lastResult, showResultModal, dismissResult, mercenaries } = useGameStore();

  if (!showResultModal || !lastResult) return null;

  const style = OUTCOME_STYLE[lastResult.outcome];
  const involvedMercs = mercenaries.filter((m) => lastResult.mercIds.includes(m.id));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl border ${style.border} ${style.bg} backdrop-blur max-w-lg w-full p-6`}>
        <div className="text-center mb-4">
          <h2 className={`text-2xl font-bold ${style.color}`}>{style.label}</h2>
          <p className="text-stone-400 text-sm mt-1">
            Party score {lastResult.partyScore} vs difficulty {lastResult.difficulty}
          </p>
        </div>

        <p className="text-stone-200 text-sm italic mb-4 text-center leading-relaxed">
          &ldquo;{lastResult.flavorText}&rdquo;
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-stone-800 rounded-lg p-3 text-center">
            <div className="text-amber-400 font-bold text-lg">+{lastResult.goldEarned}g</div>
            <div className="text-stone-400 text-xs">Gold Earned</div>
          </div>
          <div className="bg-stone-800 rounded-lg p-3 text-center">
            <div className="text-amber-400 font-bold text-lg">+{lastResult.renownEarned}</div>
            <div className="text-stone-400 text-xs">Renown Gained</div>
          </div>
        </div>

        {lastResult.itemsEarned.length > 0 && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">Loot Found</h4>
            <div className="flex flex-wrap gap-2">
              {lastResult.itemsEarned.map((id, i) => {
                const item = ITEMS_MAP[id];
                return item ? (
                  <span key={i} className="text-xs bg-stone-700 text-stone-200 px-2 py-1 rounded">
                    {item.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {(lastResult.injuredMercIds.length > 0 || lastResult.fatiguedMercIds.length > 0) && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">Casualties</h4>
            <div className="flex flex-wrap gap-2">
              {lastResult.injuredMercIds.map((id) => {
                const m = involvedMercs.find((x) => x.id === id);
                return m ? (
                  <span key={id} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                    🩹 {m.name} injured
                  </span>
                ) : null;
              })}
              {lastResult.fatiguedMercIds.map((id) => {
                const m = involvedMercs.find((x) => x.id === id);
                return m ? (
                  <span key={id} className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                    😓 {m.name} fatigued
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <button
          onClick={dismissResult}
          className="w-full py-2 rounded bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          Back to Guild Hall
        </button>
      </div>
    </div>
  );
}
