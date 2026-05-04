import { useGameStore } from '~/store/gameStore';
import type { ChronicleEntry } from '~/types/chronicles';

export function Chronicles() {
  const { guild } = useGameStore();
  const chronicles: ChronicleEntry[] = guild.chronicles;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black font-heading text-white tracking-tighter flex items-center justify-center gap-4">
          <span className="text-primary drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">📖</span>
          Guild Chronicles
        </h1>
        <p className="text-stone-400 italic font-serif text-lg max-w-2xl mx-auto">
          "A hundred years from now, they will read of our deeds and wonder if such giants ever truly walked the earth."
        </p>
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto" />
      </header>

      {chronicles.length === 0 ? (
        <div className="py-20 text-center space-y-4 opacity-40">
          <div className="text-6xl">✒️</div>
          <p className="font-serif italic text-xl">The pages are still blank. Go forth and make history.</p>
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-800 before:to-transparent">
          {chronicles.map((entry, idx) => (
            <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-stone-800 bg-stone-900 text-stone-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors duration-500 group-hover:border-primary/50 group-hover:text-primary">
                {entry.icon}
              </div>
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[45%] glass-dark p-6 rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-500">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-white text-lg font-heading">{entry.title}</div>
                  <time className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleDateString()}</time>
                </div>
                <div className="text-stone-400 text-sm italic font-serif leading-relaxed">
                  {entry.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
