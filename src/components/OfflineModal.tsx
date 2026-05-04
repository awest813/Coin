import { useGameStore } from '~/store/gameStore';

export function OfflineModal() {
  const { lastOfflineResult, showOfflineModal, isInMainMenu, dismissOfflineResult } = useGameStore();

  if (!showOfflineModal || !lastOfflineResult || isInMainMenu) return null;

  const { goldGained, suppliesGained, missionsCompleted, secondsPassed } = lastOfflineResult;

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="glass-dark rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Decorative background flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2" />
        
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-primary/10 border border-primary/20">
            ⏳
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 font-heading tracking-tight">The Guild Endures</h2>
          <p className="text-stone-400 text-sm mb-8 italic font-serif">
            While you were away for <span className="text-stone-200 font-bold">{formatTime(secondsPassed)}</span>, your guild continued its operations.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-10 text-left">
            <div className="glass p-5 rounded-[1.5rem] flex items-center gap-5 group hover:bg-white/10 transition-all loot-pop" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">💰</div>
              <div>
                <div className="text-primary font-black text-xl">+{goldGained} Gold</div>
                <div className="text-stone-500 text-[10px] uppercase tracking-widest font-black">Passive Revenue</div>
              </div>
            </div>

            <div className="glass p-5 rounded-[1.5rem] flex items-center gap-5 group hover:bg-white/10 transition-all loot-pop" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">🧴</div>
              <div>
                <div className="text-emerald-400 font-black text-xl">+{suppliesGained} Supplies</div>
                <div className="text-stone-500 text-[10px] uppercase tracking-widest font-black">Logistics & Scavenging</div>
              </div>
            </div>

            {missionsCompleted > 0 && (
              <div className="glass p-5 rounded-[1.5rem] flex items-center gap-5 group hover:bg-white/10 transition-all border-l-4 border-l-primary animate-in slide-in-from-bottom-2 duration-700 loot-pop" style={{ animationDelay: '0.5s' }}>
                <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">📜</div>
                <div>
                  <div className="text-white font-black text-xl">{missionsCompleted} Missions Ready</div>
                  <div className="text-primary text-[10px] uppercase tracking-widest font-black">Contracts awaiting turn-in</div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={dismissOfflineResult}
            className="premium-button w-full py-4 text-sm font-black uppercase tracking-[0.2em] haptic-click"
          >
            Enter the Guildhall
          </button>
        </div>
      </div>
    </div>
  );
}
