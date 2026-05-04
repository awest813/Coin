import { useGameStore } from '~/store/gameStore';
import { bondScoreToSentiment } from '~/simulation/bondSim';
import type { GeneratedRecruit } from '~/types/recruit';

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-stone-500 w-8 font-black uppercase tracking-tighter">{label}</span>
      <div className="flex-1 bg-black/40 rounded-full h-1 shadow-inner overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_5px_rgba(251,191,36,0.5)]"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="text-white w-4 text-right font-bold">{value}</span>
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
    <div className={`premium-card flex flex-col h-full group ${disabled ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      <div className="flex-1 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 shadow-inner">
            {recruit.portrait}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white font-heading tracking-tight truncate group-hover:text-primary transition-colors">{recruit.name}</h3>
            <div className="text-primary text-[10px] font-black uppercase tracking-widest">{recruit.title}</div>
            <div className="text-stone-500 text-[9px] font-bold uppercase tracking-widest mt-1">{recruit.classRole}</div>
          </div>
        </div>

        <p className="text-stone-400 text-xs italic font-serif leading-relaxed line-clamp-2">&ldquo;{recruit.background}&rdquo;</p>

        <div className="space-y-2 py-2 border-y border-white/5">
          <StatBar label="STR" value={recruit.stats.strength} />
          <StatBar label="AGI" value={recruit.stats.agility} />
          <StatBar label="INT" value={recruit.stats.intellect} />
          <StatBar label="PRS" value={recruit.stats.presence} />
        </div>

        {recruit.traits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recruit.traits.map((t) => (
              <span
                key={t.id}
                className="stat-badge text-[9px] bg-white/5 text-stone-400 border-white/5"
                title={t.description}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onHire}
        disabled={disabled}
        className={`w-full mt-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all haptic-click ${
          disabled
            ? 'bg-white/5 text-stone-600 border border-white/5 cursor-not-allowed'
            : 'bg-primary text-stone-950 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.95]'
        }`}
      >
        {rosterFull
          ? 'Roster Capacity Reached'
          : !canAfford
          ? `💰 ${recruit.hireCost}g — INSURMOUNTABLE`
          : `Deploy for ${recruit.hireCost}g`}
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
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">🧑‍🤝‍🧑</span>
            Hiring Hall
          </h1>
          <p className="text-stone-400 mt-2 max-w-md italic font-serif leading-relaxed">
            "Loyalty is a luxury. Competence is a requirement. Check their steel, then their coin."
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="stat-badge glass">
            <span className="text-stone-500 mr-2 uppercase text-[10px] tracking-widest font-bold">Roster Capacity</span>
            <span className={`font-black ${rosterFull ? 'text-rose-400' : 'text-primary'}`}>
              {mercenaries.length} / {rosterCap}
            </span>
          </div>

          <div className="flex items-center bg-black/40 px-4 py-2 rounded-xl border border-white/5 gap-4">
            <div className="flex flex-col">
               <span className="text-[8px] text-stone-600 font-black uppercase tracking-widest">Auto-Refresh In</span>
               <span className="text-[11px] font-mono font-bold text-stone-300">
                 {(() => {
                    const last = new Date(useGameStore.getState().lastRecruitRefresh).getTime();
                    const diff = Math.max(0, 900 - (useGameStore.getState().currentTime - last) / 1000);
                    const m = Math.floor(diff / 60);
                    const s = Math.floor(diff % 60);
                    return `${m}:${s.toString().padStart(2, '0')}`;
                 })()}
               </span>
            </div>
            
            <div className="w-[1px] h-6 bg-white/5" />

            <button
              onClick={generateRecruits}
              disabled={!canReroll}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all haptic-click ${
                canReroll
                  ? 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-lg'
                  : 'bg-stone-900/50 text-stone-700 cursor-not-allowed border border-white/5'
              }`}
            >
              🔄 Reroll Now ({rerollCost}g)
            </button>
          </div>
        </div>
      </header>

      {rosterFull && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-3 animate-shake">
          <span className="text-lg">⚠️</span>
          Personnel limit reached. Upgrade barracks or dismiss members to authorize new contracts.
        </div>
      )}

      {availableRecruits.length === 0 ? (
        <div className="py-24 text-center glass-dark rounded-[2.5rem] border border-dashed border-white/10">
          <div className="text-5xl mb-4 opacity-50">🏚️</div>
          <p className="text-stone-500 text-sm italic font-serif">The hall is empty. Check back later or reroll the board.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Current Roster Quick Reference */}
      <section className="pt-8 border-t border-white/5 space-y-6">
        <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] px-1">Active Personnel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mercenaries.map((m) => (
            <div key={m.id} className="glass-dark border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors group cursor-pointer" onClick={() => useGameStore.getState().setScreen('roster')}>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">{m.portrait}</div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate group-hover:text-primary transition-colors">{m.name}</div>
                <div className="text-[9px] text-primary font-black uppercase tracking-widest">{m.title}</div>
                <div className="text-[9px] text-stone-600 font-bold uppercase mt-1">
                  {m.isInjured ? '🩹 Recovery' : m.isFatigued ? '😴 Exhausted' : '✅ Operational'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
