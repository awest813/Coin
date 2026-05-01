import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { ITEMS_MAP } from '~/data/items';
import { MATERIALS_MAP } from '~/data/materials';
import { bondScoreToSentiment } from '~/simulation/bondSim';
import { MISSION_TEMPLATES } from '~/data/missions';

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

// Extended result type with Phase 2 fields
interface ExtendedMissionResult {
  templateId: string;
  outcome: 'success' | 'partial' | 'failure';
  partyScore: number;
  difficulty: number;
  narrativeEvents: string[];
  goldEarned: number;
  renownEarned: number;
  suppliesEarned?: number;
  itemsEarned: string[];
  injuredMercIds: string[];
  fatiguedMercIds: string[];
  scoreBreakdown: Array<{
    mercName: string;
    baseScore: number;
    traitBonus: number;
    equipBonus: number;
    relBonus: number;
    statusPenalty: number;
    total: number;
  }>;
  bondChanges?: Array<{ mercId1: string; mercId2: string; delta: number }>;
  materialsEarned?: Record<string, number>;
}

export function ResultsModal() {
  const { lastResult, showResultModal, dismissResult, mercenaries, setScreen } = useGameStore();
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!showResultModal || !lastResult) return null;

  const result = lastResult as unknown as ExtendedMissionResult;
  const style = OUTCOME_STYLE[result.outcome];

  const bondChanges = result.bondChanges ?? [];
  const materialsEarned = result.materialsEarned ?? {};
  const hasMaterials = Object.values(materialsEarned).some((q) => q > 0);

  // Find mission name from template ID
  const missionName = MISSION_TEMPLATES.find((t) => t.id === result.templateId)?.name;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`rounded-xl border ${style.border} ${style.bg} backdrop-blur max-w-lg w-full p-6 my-4 shadow-2xl`}>
        {/* Header */}
        <div className="text-center mb-4">
          {missionName && (
            <p className="text-stone-400 text-xs mb-1 uppercase tracking-wider">{missionName}</p>
          )}
          <h2 className={`text-2xl font-bold font-heading ${style.color}`}>{style.label}</h2>
          <p className="text-stone-400 text-sm mt-1">
            Party score <span className="text-stone-200 font-medium">{result.partyScore}</span> vs difficulty <span className="text-stone-200 font-medium">{result.difficulty}</span>
          </p>
        </div>

        {/* Narrative events */}
        {result.narrativeEvents.length > 0 && (
          <div className="mb-4 space-y-2">
            {result.narrativeEvents.map((text, i) => (
              <p
                key={i}
                className={`text-sm italic leading-relaxed ${i === 0 ? 'text-stone-200' : 'text-stone-400'}`}
              >
                &ldquo;{text}&rdquo;
              </p>
            ))}
          </div>
        )}

        {/* Gold, Renown & Supplies */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-stone-800/80 rounded-lg p-3 text-center">
            <div className="text-amber-400 font-bold text-lg">+{result.goldEarned}g</div>
            <div className="text-stone-400 text-xs">Gold Earned</div>
          </div>
          <div className="bg-stone-800/80 rounded-lg p-3 text-center">
            <div className="text-yellow-400 font-bold text-lg">+{result.renownEarned}</div>
            <div className="text-stone-400 text-xs">Renown Gained</div>
          </div>
          {(result.suppliesEarned ?? 0) > 0 && (
            <div className="bg-stone-800/80 rounded-lg p-3 text-center">
              <div className="text-green-400 font-bold text-lg">+{result.suppliesEarned}</div>
              <div className="text-stone-400 text-xs">Supplies</div>
            </div>
          )}
        </div>

        {/* Materials */}
        {hasMaterials && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">📦 Materials Found</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(materialsEarned)
                .filter(([, qty]) => qty > 0)
                .map(([matId, qty]) => {
                  const mat = MATERIALS_MAP[matId];
                  return mat ? (
                    <span key={matId} className="text-xs bg-stone-800 px-2 py-1 rounded border border-stone-700 text-stone-300">
                      {mat.icon} {mat.name} x{qty}
                    </span>
                  ) : null;
                })}
            </div>
          </div>
        )}

        {/* Loot */}
        {result.itemsEarned.length > 0 && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">⚗️ Loot Found</h4>
            <div className="flex flex-wrap gap-2">
              {result.itemsEarned.map((id, i) => {
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

        {/* Bond changes */}
        {bondChanges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">💞 Bond Changes</h4>
            <div className="space-y-1">
              {bondChanges.map((bc, i) => {
                const m1 = mercenaries.find((m) => m.id === bc.mercId1);
                const m2 = mercenaries.find((m) => m.id === bc.mercId2);
                if (!m1 || !m2) return null;
                const newScore1 = (m1.bondScores?.[bc.mercId2] ?? 0);
                const sentiment = bondScoreToSentiment(newScore1);
                return (
                  <div key={i} className="text-xs text-stone-400">
                    {m1.name} & {m2.name}:{' '}
                    <span className={bc.delta > 0 ? 'text-green-400' : 'text-red-400'}>
                      {bc.delta > 0 ? '+' : ''}{bc.delta.toFixed(1)}
                    </span>
                    {' '}→ <span className="text-stone-300">{sentiment}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Casualties */}
        {(result.injuredMercIds.length > 0 || result.fatiguedMercIds.length > 0) && (
          <div className="mb-4">
            <h4 className="text-stone-300 text-sm font-medium mb-2">🩹 Casualties</h4>
            <div className="flex flex-wrap gap-2">
              {result.injuredMercIds.map((id) => {
                const m = mercenaries.find((x) => x.id === id);
                return m ? (
                  <span key={id} className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                    🩹 {m.name} injured
                  </span>
                ) : null;
              })}
              {result.fatiguedMercIds.map((id) => {
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
        {result.scoreBreakdown.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowBreakdown((v) => !v)}
              className="text-xs text-stone-400 hover:text-amber-400 underline transition-colors"
            >
              {showBreakdown ? '▲ Hide' : '▼ Show'} score breakdown
            </button>
            {showBreakdown && (
              <div className="mt-2 bg-stone-900/60 rounded-lg p-3 space-y-2">
                {result.scoreBreakdown.map((entry, i) => (
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
                  <span className="text-amber-400 font-bold">{result.partyScore}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { dismissResult(); setShowBreakdown(false); }}
            className="flex-1 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Back to Guild Hall
          </button>
          <button
            onClick={() => { dismissResult(); setShowBreakdown(false); setScreen('roster'); }}
            className="px-4 py-2 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm transition-colors"
          >
            View Roster
          </button>
        </div>
      </div>
    </div>
  );
}
