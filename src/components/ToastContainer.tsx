import { useEffect } from 'react';
import { useGameStore } from '~/store/gameStore';

export function ToastContainer() {
  const { toasts, dismissToast } = useGameStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      toasts.forEach((t) => {
        if (now - t.createdAt > 5000) {
          dismissToast(t.id);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-6 py-4 rounded-2xl glass-dark border flex items-center gap-4 min-w-[280px] animate-in slide-in-from-right-8 fade-in duration-500 ${
            t.type === 'success' ? 'border-emerald-500/30' : 
            t.type === 'error' ? 'border-rose-500/30' : 
            t.type === 'warning' ? 'border-amber-500/30' : 'border-white/10'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            t.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
            t.type === 'error' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
            t.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white/40'
          }`} />
          <span className="text-xs font-black uppercase tracking-widest text-white">{t.message}</span>
          <button 
            onClick={() => dismissToast(t.id)}
            className="ml-auto text-stone-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
