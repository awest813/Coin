import { useGameStore } from '~/store/gameStore';
import { bondScoreToSentiment } from '~/simulation/bondSim';
import type { GeneratedRecruit } from '~/types/recruit';

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-stone-400 w-12">{label}</span>
      <div className="flex-1 bg-stone-700 rounded-full h-1.5">
        <div
          className="bg-amber-500 h-1.5 rounded-full"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="text-stone-300 w-4 text-right">{value}</span>
    </div>
  );
}

function RecruitCard({
  recruit,
  onHire,
  canAfford,
  rosterFull,
}: {
  recruit: GeneratedRecruit;
  onHire: () => void;
  canAfford: boolean;
  rosterFull: boolean;
}) {
  const disabled = !canAfford || rosterFull;
  return (
    <div className="bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 rounded-lg p-4 flex flex-col gap-3 hover:border-stone-600 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-4xl">{recruit.portrait}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-stone-200" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>{recruit.name}</div>
          <div className="text-amber-400 text-sm">{recruit.title}</div>
          <div className="text-stone-400 text-xs">{recruit.classRole}</div>
        </div>
      </div>

      <p className="text-stone-400 text-xs italic">&ldquo;{recruit.background}&rdquo;</p>

      <div className="space-y-1">
        <StatBar label="STR" value={recruit.stats.strength} />
        <StatBar label="AGI" value={recruit.stats.agility} />
        <StatBar label="INT" value={recruit.stats.intellect} />
        <StatBar label="PRS" value={recruit.stats.presence} />
      </div>

      {recruit.traits.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recruit.traits.map((t) => (
            <span
              key={t.id}
              className="px-2 py-0.5 bg-stone-700 text-stone-300 rounded text-xs"
              title={t.description}
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onHire}
        disabled={disabled}
        className={`w-full py-2 rounded font-medium text-sm transition-colors ${
          disabled
            ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-500 text-white'
        }`}
      >
        {rosterFull
          ? 'Roster Full'
          : !canAfford
          ? `💰 ${recruit.hireCost}g — Can't Afford`
          : `Hire for ${recruit.hireCost}g`}
      </button>
    </div>
  );
}

export function HiringHall() {
  const {
    guild,
    mercenaries,
    availableRecruits,
    hireRecruit,
    generateRecruits,
  } = useGameStore();

  const barracksRoom = guild.rooms.find((r) => r.id === 'room_barracks');
  const rosterCap = barracksRoom?.levels[barracksRoom.level - 1]?.effects?.rosterCap ?? 6;
  const rosterFull = mercenaries.length >= rosterCap;
  const rerollCost = 25;
  const canReroll = guild.resources.gold >= rerollCost;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-400" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>🧑‍🤝‍🧑 Hiring Hall</h1>
        <div className="flex items-center gap-4 text-sm text-stone-400">
          <span>
            Roster:{' '}
            <span className={`font-bold ${rosterFull ? 'text-red-400' : 'text-stone-200'}`}>
              {mercenaries.length}/{rosterCap}
            </span>
          </span>
          <button
            onClick={generateRecruits}
            disabled={!canReroll}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              canReroll
                ? 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }`}
          >
            🔄 Reroll ({rerollCost}g)
          </button>
        </div>
      </div>

      {rosterFull && (
        <div className="mb-4 p-3 bg-red-950 border border-red-800 rounded text-red-300 text-sm">
          Your barracks are at capacity. Upgrade the Barracks or dismiss a mercenary before hiring.
        </div>
      )}

      {availableRecruits.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <div className="text-4xl mb-4">🏚️</div>
          <p>No recruits available. Use the Reroll button to find new candidates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableRecruits.map((r) => (
            <RecruitCard
              key={r.id}
              recruit={r}
              onHire={() => hireRecruit(r.id)}
              canAfford={guild.resources.gold >= r.hireCost}
              rosterFull={rosterFull}
            />
          ))}
        </div>
      )}

      {/* Current Roster */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-300 mb-3">Current Roster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {mercenaries.map((m) => {
            const bondEntries = Object.entries(m.bondScores ?? {}).filter(([, s]) => s !== 0);
            return (
              <div key={m.id} className="bg-stone-800 border border-stone-700 rounded p-3 flex items-center gap-3">
                <span className="text-3xl">{m.portrait}</span>
                <div>
                  <div className="font-medium text-stone-200">{m.name}</div>
                  <div className="text-xs text-amber-400">{m.title}</div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {m.isInjured ? '🩹 Injured' : m.isFatigued ? '😴 Fatigued' : '✅ Ready'}
                  </div>
                  {bondEntries.length > 0 && (
                    <div className="text-xs text-stone-500 mt-0.5">
                      {bondEntries.slice(0, 2).map(([id, s]) => {
                        const other = mercenaries.find((x) => x.id === id);
                        if (!other) return null;
                        return (
                          <span key={id} className="mr-2">
                            {other.name}: {bondScoreToSentiment(s)}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
