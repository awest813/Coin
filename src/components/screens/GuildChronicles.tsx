import { useGameStore } from '~/store/gameStore';

export function GuildChronicles() {
  const { guild } = useGameStore();
  const { chronicles } = guild;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-stone-500/10 border border-stone-500/20 rounded-full">
            <span className="w-2 h-2 bg-stone-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(120,113,108,0.6)]" />
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">The Eternal Log</span>
          </div>
          <h1 className="text-6xl font-black font-heading text-white tracking-tighter text-glow">
            Guild Chronicles
          </h1>
          <p className="text-stone-500 max-w-xl italic font-serif text-lg leading-relaxed">
            "Gold is spent, steel rusts, and men die. But the deeds written here shall outlast the empires that witnessed them."
          </p>
        </div>
        
        <div className="text-right">
           <div className="text-[10px] text-stone-600 font-black uppercase tracking-[0.2em] mb-1">Total Entries</div>
           <div className="text-3xl font-black text-white font-mono">{chronicles.length}</div>
        </div>
      </header>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-white/5 to-transparent hidden md:block" />

        <div className="space-y-12 relative z-10">
          {chronicles.length > 0 ? (
            chronicles.map((entry, idx) => (
              <div 
                key={entry.id} 
                className="flex flex-col md:flex-row gap-10 group animate-in fade-in slide-in-from-left-8 duration-700"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Entry Icon / Date */}
                <div className="flex items-center md:flex-col md:w-20 shrink-0 gap-4">
                   <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl transition-all duration-500 group-hover:scale-110 ${
                     entry.type === 'mission_success' ? 'bg-primary/10 border border-primary/20' :
                     entry.type === 'hero_unlock' ? 'bg-amber-500/10 border border-amber-500/20' :
                     'bg-white/5 border border-white/5'
                   }`}>
                     {entry.icon || '📖'}
                   </div>
                   <div className="text-[10px] font-mono text-stone-600 uppercase tracking-widest md:text-center">
                     {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </div>
                </div>

                {/* Entry Content */}
                <div className="flex-1 glass-dark rounded-[2.5rem] border border-white/5 p-8 transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.03]">
                   <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${
                            entry.type === 'mission_success' ? 'text-primary' :
                            entry.type === 'hero_unlock' ? 'text-amber-500' :
                            'text-stone-500'
                         }`}>
                           {entry.type.replace('_', ' ')}
                         </span>
                         <div className="flex-1 h-px bg-white/5" />
                      </div>
                      <h3 className="text-2xl font-black font-heading text-white tracking-tight">{entry.title}</h3>
                   </div>
                   <p className="text-stone-400 text-lg leading-relaxed font-serif italic">
                     "{entry.description}"
                   </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center glass-dark rounded-[3rem] border border-dashed border-white/10">
              <p className="text-stone-600 italic font-serif text-xl">The pages are empty, awaiting the first great deed of the banner.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
