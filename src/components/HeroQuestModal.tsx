import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-stone-950/95 backdrop-blur-2xl"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-4xl w-full relative group"
        >
          {/* Cinematic Backdrop Flair */}
          <div className="absolute -inset-20 bg-primary/10 blur-[120px] rounded-full opacity-50 animate-pulse-glow pointer-events-none" />
          
          <div className="relative weathered-panel rounded-[3rem] border-2 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
            <header className="p-10 border-b border-white/10 bg-white/5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
              <div className="relative z-10 space-y-1">
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 block"
                >
                  Legendary Chronicle
                </motion.span>
                <h2 className="text-4xl font-black font-heading text-white tracking-tighter metallic-gold">{activeHeroQuest.name}</h2>
              </div>
              <motion.div 
                whileHover={{ rotate: 360, transition: { duration: 1 } }}
                className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl shadow-lg relative z-10"
              >
                🌟
              </motion.div>
            </header>

            <div className="p-12 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar bg-black/20">
              <AnimatePresence mode="wait">
                {selectedChoiceIdx === null ? (
                  <motion.div 
                    key="quest-stage"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <h3 className="text-sm font-black text-stone-500 font-heading uppercase tracking-[0.3em] whitespace-nowrap">{currentStage.title}</h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
                      </div>
                      
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                        className="text-3xl text-white leading-relaxed font-serif italic text-center px-10"
                      >
                        "{currentStage.narrative}"
                      </motion.p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 pt-10">
                      {currentStage.choices.map((choice, idx) => {
                        const hasReq = !!choice.requirement;
                        const meetsReq = hasReq 
                          ? mercenaries.some(m => {
                              if (choice.requirement!.type === 'skill') {
                                return (m.skills?.[choice.requirement!.stat as keyof NonNullable<typeof m.skills>] ?? 0) >= choice.requirement!.value;
                              }
                              return (m.stats[choice.requirement!.stat as keyof typeof m.stats] ?? 0) >= choice.requirement!.value;
                            })
                          : true;

                        return (
                          <motion.button
                            whileHover={meetsReq ? { x: 10, backgroundColor: 'rgba(251,191,36,0.05)' } : {}}
                            whileTap={meetsReq ? { scale: 0.98 } : {}}
                            key={idx}
                            onClick={() => meetsReq && handleChoice(idx)}
                            disabled={!meetsReq}
                            className={`w-full text-left p-8 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between group relative overflow-hidden ${
                              !meetsReq
                              ? 'opacity-30 grayscale cursor-not-allowed border-white/5 bg-white/5'
                              : 'bg-white/5 border-white/10 hover:border-primary/50'
                            }`}
                          >
                            {meetsReq && <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-100%] group-hover:translate-x-[100%] duration-1000" />}
                            
                            <div className="flex-1 relative z-10">
                              <div className={`text-xl font-bold transition-colors ${meetsReq ? 'text-white group-hover:text-primary' : 'text-stone-600'}`}>
                                {choice.label}
                              </div>
                              {choice.requirement && (
                                <div className={`text-[10px] uppercase tracking-[0.2em] font-black mt-3 flex items-center gap-3 ${meetsReq ? 'text-primary/80 animate-pulse' : 'text-rose-500/60'}`}>
                                  <span className={`w-2 h-2 rounded-full ${meetsReq ? 'bg-primary shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-rose-500'}`} />
                                  Requirement: {choice.requirement.stat} {choice.requirement.value}+
                                  {!meetsReq && <span className="ml-2 italic text-rose-500/80">(Strength of Guild Insufficient)</span>}
                                </div>
                              )}
                            </div>
                            {meetsReq && (
                              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-stone-950 group-hover:border-primary transition-all duration-500 shadow-xl relative z-10">
                                <span className="text-xl">⚔️</span>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="quest-outcome"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-12 text-center py-10"
                  >
                     <div className="space-y-8">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.5 }}
                          className="w-20 h-20 bg-primary/20 border-2 border-primary/50 rounded-full flex items-center justify-center text-4xl mx-auto shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                        >
                          📜
                        </motion.div>
                        <p className="text-4xl text-white leading-snug font-serif italic metallic-gold px-12">
                          "{currentStage.choices[selectedChoiceIdx].outcome.text}"
                        </p>
                     </div>
                     
                     <div className="pt-10 flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05, shadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleContinue}
                          className="premium-button min-w-[320px] py-6 text-xl font-black uppercase tracking-[0.4em] shadow-2xl"
                        >
                          {currentStage.choices[selectedChoiceIdx].outcome.nextStageId ? 'Forge Ahead →' : 'Legend Forged ⚔️'}
                        </motion.button>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="p-10 border-t border-white/10 bg-black/40 flex flex-col items-center gap-4">
               <div className="flex gap-4">
                  {[...Array(activeHeroQuest.stages.length)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 w-12 rounded-full transition-all duration-700 ${
                        activeHeroQuest.stages.findIndex(s => s.id === activeHeroQuestStageId) >= i 
                        ? 'bg-primary shadow-[0_0_10px_rgba(251,191,36,0.4)]' 
                        : 'bg-white/5'
                      }`} 
                    />
                  ))}
               </div>
               <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.6em] animate-pulse">The Chronicle Endures</p>
            </footer>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
