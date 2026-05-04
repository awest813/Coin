import { useGameStore } from '~/store/gameStore';
import { useState } from 'react';

export function MainMenu() {
  const { setInMainMenu, resetSave } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  function handleReset() {
    if (confirm('Are you absolutely sure? All guild progress, mercenaries, and artifacts will be lost forever.')) {
      resetSave();
      alert('The ledger has been burned. A new legend begins.');
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-1000">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md w-full px-6 flex flex-col items-center text-center space-y-12">
        {/* Title Header */}
        <header className="space-y-4">
          <div className="stat-badge glass inline-block mx-auto mb-2 tracking-[0.4em] text-primary/60">EST. 1204</div>
          <h1 className="text-7xl font-black font-heading text-white tracking-tighter drop-shadow-2xl">
            COIN <span className="text-primary">&</span> IRON
          </h1>
          <p className="text-stone-400 italic font-serif text-lg">
            "A Guild Master's legacy is written in blood and gold."
          </p>
        </header>

        {/* Menu Actions */}
        <nav className="w-full space-y-4">
          <button
            onClick={() => setInMainMenu(false)}
            className="w-full py-5 rounded-2xl bg-primary text-stone-950 font-black text-sm uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all haptic-click group"
          >
            Commence Operations <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full py-5 rounded-2xl bg-white/5 text-stone-300 font-black text-xs uppercase tracking-[0.3em] border border-white/5 hover:bg-white/10 transition-all haptic-click"
          >
            {showSettings ? 'Close Strategic Options' : 'Strategic Options [⚙️]'}
          </button>

          {showSettings && (
            <div className="p-8 glass-dark rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-2">
                <h3 className="text-rose-400 font-black uppercase text-[10px] tracking-widest">Danger Zone: The Purge</h3>
                <p className="text-stone-500 text-[10px] italic leading-relaxed">
                  Resetting your save will permanently delete the current guild's records from this terminal.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all haptic-click"
              >
                Burn the Ledger (Wipe Save)
              </button>
            </div>
          )}
        </nav>

        {/* Footer Info */}
        <footer className="pt-12 text-stone-600">
           <div className="text-[10px] font-black uppercase tracking-widest mb-1">Advanced Agentic Coding Simulation</div>
           <div className="text-[9px] opacity-50 font-mono italic">v0.4.2-ALPHA // DEEPMIND ANTIGRAVITY ENGINE</div>
        </footer>
      </div>
    </div>
  );
}
