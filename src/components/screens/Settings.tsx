import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';

export function Settings() {
  const { exportSave, importSave, resetGame, addToast } = useGameStore();
  const [importText, setImportText] = useState('');

  const handleExport = () => {
    const data = exportSave();
    navigator.clipboard.writeText(data);
    addToast('Save data copied to clipboard!', 'success');
  };

  const handleImport = () => {
    if (!importText) return;
    const success = importSave(importText);
    if (success) {
      addToast('Save data imported successfully!', 'success');
      setImportText('');
    } else {
      addToast('Invalid save data!', 'error');
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
          <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">⚙️</span>
          Guild Archives
        </h1>
        <p className="text-stone-400 mt-2 italic font-serif leading-relaxed">
          "The chronicles of the banner must be preserved, no matter how much blood is spilled to write them."
        </p>
      </header>

      <section className="space-y-6">
        <div className="glass-dark p-8 rounded-[2rem] border border-white/5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">Data Management</h2>
            <p className="text-xs text-stone-400">Back up your progress or transfer your guild to another device.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleExport}
              className="w-full py-4 rounded-2xl bg-primary text-stone-950 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 hover:scale-[1.02] transition-all haptic-click"
            >
              📤 Export Save to Clipboard
            </button>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black text-stone-600 uppercase tracking-widest px-1">Import Save Data</label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste save string here..."
                className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-primary placeholder:text-stone-700 focus:outline-none focus:border-primary/30 transition-all"
              />
              <button
                onClick={handleImport}
                disabled={!importText}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 transition-all haptic-click"
              >
                📥 Overwrite with Imported Save
              </button>
            </div>
          </div>
        </div>

        <div className="glass-dark p-8 rounded-[2rem] border border-rose-500/10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.2em]">Danger Zone</h2>
            <p className="text-xs text-stone-500">Permanently delete all guild history and start from scratch.</p>
          </div>
          
          <button
            onClick={resetGame}
            className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all haptic-click"
          >
            💀 Erase Guild History (Reset)
          </button>
        </div>
      </section>

      <footer className="text-center pt-10">
        <div className="text-[10px] font-black text-stone-700 uppercase tracking-widest">Coin: The Tarnished Banner</div>
        <div className="text-[9px] text-stone-800 mt-1 uppercase tracking-tighter">v0.2.1-industrial-glass</div>
      </footer>
    </div>
  );
}
