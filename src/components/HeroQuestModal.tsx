import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';

export function HeroQuestModal() {
  const { activeHeroQuest, activeHeroQuestStageId, progressHeroQuest, mercenaries } = useGameStore();
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);

  if (!activeHeroQuest || !activeHeroQuestStageId) return null;

  const currentStage = activeHeroQuest.stages.find(s => s.id === activeHeroQuestStageId);
  if (!currentStage) return null;

  const handleChoice = (idx: number) => {
    setSelectedChoiceIdx(idx);
  };

  const handleContinue = () => {
    if (selectedChoiceIdx === null) return;
    progressHeroQuest(selectedChoiceIdx);
    setSelectedChoiceIdx(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="max-w-4xl w-full relative group">
        {/* Cinematic Backdrop Flair */}
        <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full opacity-50 animate-pulse pointer-events-none" />
        
        <div className="relative glass-dark rounded-[3rem] border-2 border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <header className="p-10 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Legendary Chronicle</span>
              <h2 className="text-3xl font-black font-heading text-white tracking-tighter text-glow">{activeHeroQuest.name}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">🌟</div>
          </header>

          <div className="p-12 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {selectedChoiceIdx === null ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-white/90 font-heading uppercase tracking-widest">{currentStage.title}</h3>
                  <p className="text-2xl text-stone-300 leading-relaxed font-serif italic drop-shadow-sm">
                    "{currentStage.narrative}"
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-10">
                  {currentStage.choices.map((choice, idx) => {
                    const hasReq = !!choice.requirement;
                    const meetsReq = hasReq 
                      ? mercenaries.some(m => m.stats[choice.requirement!.stat] >= choice.requirement!.value)
                      : true;

                    return (
                      <button
                        key={idx}
                        onClick={() => meetsReq && handleChoice(idx)}
                        disabled={!meetsReq}
                        className={`w-full group text-left p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between ${
                          !meetsReq
                          ? 'opacity-30 grayscale cursor-not-allowed border-white/5 bg-white/5'
                          : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.01]'
                        }`}
                      >
                        <div className="flex-1">
                          <div className={`text-lg font-bold transition-colors ${meetsReq ? 'text-white group-hover:text-primary' : 'text-stone-600'}`}>
                            {choice.label}
                          </div>
                          {choice.requirement && (
                            <div className={`text-[10px] uppercase tracking-[0.2em] font-black mt-2 flex items-center gap-2 ${meetsReq ? 'text-primary/60' : 'text-rose-500/60'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              Requires {choice.requirement.stat} {choice.requirement.value}+
                              {!meetsReq && <span className="ml-2 italic text-rose-500">(Roster requirement not met)</span>}
                            </div>
                          )}
                        </div>
                        {meetsReq && (
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-stone-950 transition-all shadow-sm">
                            →
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Outcome</span>
                    <p className="text-3xl text-white leading-relaxed font-serif italic text-glow">
                      "{currentStage.choices[selectedChoiceIdx].outcome.text}"
                    </p>
                 </div>
                 
                 <div className="pt-10">
                    <button
                      onClick={handleContinue}
                      className="premium-button w-full py-5 text-lg font-black uppercase tracking-[0.3em]"
                    >
                      {currentStage.choices[selectedChoiceIdx].outcome.nextStageId ? 'Continue Journey →' : 'Accept Destiny ⚔️'}
                    </button>
                 </div>
              </div>
            )}
          </div>

          <footer className="p-8 border-t border-white/5 bg-black/20 flex justify-center">
             <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.5em] animate-pulse">Consulting the Oracle</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
