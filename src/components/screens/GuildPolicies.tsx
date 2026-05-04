import { useGameStore } from '~/store/gameStore';
import { GUILD_POLICIES } from '~/data/policies';

export function GuildPolicies() {
  const { guild, setPolicy } = useGameStore();
  const activeIds = guild.activePolicyIds || [];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black font-heading text-white tracking-tighter text-glow">
          Guild Policies
        </h2>
        <p className="text-stone-500 font-flavor text-lg max-w-2xl mx-auto">
          Define the operational philosophy of your company. Every choice brings prosperity, but carries a weight.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <div className="stat-badge bg-primary/10 text-primary border-primary/20">
            Active Slots: {activeIds.length} / {guild.maxPolicySlots}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {GUILD_POLICIES.map((policy) => {
          const isActive = activeIds.includes(policy.id);
          return (
            <div
              key={policy.id}
              onClick={() => setPolicy(policy.id)}
              className={`premium-card p-8 flex flex-col gap-6 group cursor-pointer transition-all duration-700 relative overflow-hidden ${
                isActive 
                ? 'ring-2 ring-primary bg-primary/5 shadow-[0_0_40px_rgba(251,191,36,0.15)] border-primary/40 shimmer-effect' 
                : 'hover:bg-white/5 border-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 p-4">
                   <span className="bg-primary text-stone-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                     ACTIVE POLICY
                   </span>
                </div>
              )}

              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-3xl glass-dark flex items-center justify-center text-5xl transition-all duration-700 ${
                  isActive ? 'scale-110 rotate-3 border-primary/50 text-glow' : 'group-hover:scale-105 group-hover:rotate-2 border-white/5'
                }`}>
                  <span className="icon-premium">{policy.icon}</span>
                </div>
                <div>
                  <h3 className={`text-2xl font-black font-heading tracking-tight transition-colors duration-500 ${isActive ? 'text-white text-glow' : 'text-stone-300 group-hover:text-primary'}`}>
                    {policy.name}
                  </h3>
                  <p className="text-stone-500 text-xs italic font-serif mt-1">
                    "{policy.description}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="p-4 rounded-2xl bg-success/5 border border-success/20 flex items-start gap-4">
                   <div className="w-6 h-6 bg-success/20 rounded-lg flex items-center justify-center text-success text-xs font-black">+</div>
                   <div className="text-xs text-stone-300 font-bold leading-relaxed">
                     <span className="text-success uppercase tracking-widest text-[10px] block mb-1">STRATEGIC ADVANTAGE</span>
                     {policy.effects.positive}
                   </div>
                </div>
                <div className="p-4 rounded-2xl bg-danger/5 border border-danger/20 flex items-start gap-4">
                   <div className="w-6 h-6 bg-danger/20 rounded-lg flex items-center justify-center text-danger text-xs font-black">-</div>
                   <div className="text-xs text-stone-400 font-bold leading-relaxed">
                     <span className="text-danger uppercase tracking-widest text-[10px] block mb-1">OPERATIONAL RISK</span>
                     {policy.effects.negative}
                   </div>
                </div>
              </div>

              <div className="mt-4 pt-6 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[10px] text-stone-600 font-black uppercase tracking-widest">
                   {isActive ? 'Click to deactivate' : 'Click to authorize'}
                 </span>
                 <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${isActive ? 'bg-primary' : 'bg-stone-800'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-500 ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-10">
        <p className="text-stone-600 text-[10px] uppercase tracking-[0.3em] font-black max-w-lg mx-auto leading-loose">
          Increase Guild Rank to unlock additional policy slots. Maximize efficiency through synergy between your active artifacts and established operational laws.
        </p>
      </div>
    </div>
  );
}
