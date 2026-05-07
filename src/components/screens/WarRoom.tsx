import React from 'react';
import { useGameStore } from '~/store/gameStore';
import { CAMPAIGN_MISSIONS, STRATEGIC_ASSETS } from '~/data/campaign';

export const WarRoom: React.FC = () => {
  const { guild, campaignStage, campaignActive, startCampaign, setScreen, activeMissions, unlockedStrategicAssetIds, purchaseStrategicAsset } = useGameStore();

  const isRankTen = guild.guildRank >= 10;
  const currentMission = CAMPAIGN_MISSIONS[campaignStage];
  const isMissionActive = activeMissions.some(am => am.templateId === currentMission?.id);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black font-heading text-white tracking-tighter text-glow flex items-center justify-center gap-6">
          <span className="text-rose-600 drop-shadow-[0_0_20px_rgba(225,29,72,0.6)]">⚔️</span>
          The Grand Campaign
        </h1>
        <p className="text-stone-400 font-serif italic text-lg max-w-2xl mx-auto">
          "The Sovereign Keep awaits. All our gold, all our blood, all our history converges on this final assault."
        </p>
      </div>

      {!campaignActive ? (
        <div className="glass rounded-[3rem] p-16 border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] text-center space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 space-y-6">
             <div className="w-24 h-24 bg-stone-900 rounded-3xl border border-white/10 flex items-center justify-center text-5xl mx-auto shadow-inner group-hover:scale-110 transition-transform duration-700">
               🚩
             </div>
             <h2 className="text-3xl font-bold text-white tracking-tight font-heading">Prepare for the Sovereign Assault</h2>
             <p className="text-stone-400 max-w-lg mx-auto leading-relaxed">
               To begin the Grand Campaign, your guild must be recognized as a Tier 10 power. Reclaiming the Keep is an undertaking that will test every resource at your disposal.
             </p>

             <div className="flex flex-col items-center gap-4 pt-6">
                <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 transition-all ${isRankTen ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/50 bg-rose-500/5 text-rose-400'}`}>
                   <span className="text-xl">{isRankTen ? '✅' : '❌'}</span>
                   <span className="text-sm font-black uppercase tracking-widest">Guild Rank 10 Required</span>
                </div>

                <button
                  disabled={!isRankTen}
                  onClick={startCampaign}
                  className={`px-12 py-5 rounded-[2rem] text-xl font-black uppercase tracking-[0.3em] transition-all haptic-click ${
                    isRankTen 
                      ? 'bg-rose-600 text-white hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(225,29,72,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(225,29,72,0.6)]' 
                      : 'bg-stone-800 text-stone-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  Initiate Campaign
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Timeline */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-3xl p-8 border border-white/5">
              <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] mb-8">Campaign Objectives</h3>
              <div className="space-y-12 relative">
                <div className="absolute left-[1.375rem] top-2 bottom-2 w-px bg-stone-800" />
                
                {CAMPAIGN_MISSIONS.map((m, idx) => {
                  const isCurrent = idx === campaignStage;
                  const isPast = idx < campaignStage;
                  return (
                    <div key={m.id} className="relative pl-12">
                      <div className={`absolute left-0 top-1 w-11 h-11 rounded-xl border flex items-center justify-center text-xl transition-all duration-700 ${
                        isPast ? 'bg-emerald-500 border-emerald-400 text-stone-950 scale-90' : 
                        isCurrent ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] animate-pulse' :
                        'bg-stone-900 border-white/5 text-stone-600'
                      }`}>
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <div>
                        <h4 className={`font-bold font-heading ${isCurrent ? 'text-white' : 'text-stone-500'}`}>{m.name}</h4>
                        {isCurrent && <p className="text-[11px] text-stone-400 italic mt-1">{m.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="premium-card p-8 bg-rose-600/5 border-rose-600/20">
               <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] mb-4">Total Dominance</h3>
               <div className="text-4xl font-black text-white font-heading">{(campaignStage / CAMPAIGN_MISSIONS.length * 100).toFixed(0)}%</div>
               <div className="h-1.5 bg-black/40 rounded-full mt-4 overflow-hidden">
                 <div 
                   className="h-full bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)] transition-all duration-1000"
                   style={{ '--width': `${(campaignStage / CAMPAIGN_MISSIONS.length * 100)}%` } as any}
                 />
               </div>
            </div>
          </div>

          {/* Strategic Assets Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-3xl p-8 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em]">Strategic Assets</h3>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{unlockedStrategicAssetIds.length} / {STRATEGIC_ASSETS.length} Unlocked</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STRATEGIC_ASSETS.map(asset => {
                  const isUnlocked = unlockedStrategicAssetIds.includes(asset.id);
                  const canAfford = guild.resources.gold >= asset.cost.gold && guild.resources.renown >= asset.cost.renown;

                  return (
                    <div key={asset.id} className={`p-5 rounded-2xl border transition-all ${isUnlocked ? 'bg-rose-600/5 border-rose-600/20 shadow-lg' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isUnlocked ? 'bg-rose-600/20' : 'bg-stone-800'}`}>
                          {asset.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold font-heading ${isUnlocked ? 'text-white' : 'text-stone-400'}`}>{asset.name}</h4>
                          <p className="text-[10px] text-stone-500 italic leading-tight">{asset.description}</p>
                        </div>
                      </div>

                      {!isUnlocked && (
                        <button
                          disabled={!canAfford}
                          onClick={() => purchaseStrategicAsset(asset.id)}
                          className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all haptic-click ${
                            canAfford 
                              ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' 
                              : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? `Acquire: 💰${asset.cost.gold} ⭐${asset.cost.renown}` : 'Insufficient Resources'}
                        </button>
                      )}
                      {isUnlocked && (
                         <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-center border border-emerald-500/20 py-1.5 rounded-xl bg-emerald-500/5">
                           ✓ ACTIVE
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Objective Details */}
          <div className="lg:col-span-2 space-y-8">
            {campaignStage < CAMPAIGN_MISSIONS.length ? (
              <div className="glass rounded-[2.5rem] p-12 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.03] font-black italic pointer-events-none">STAGE {campaignStage + 1}</div>
                
                <div className="relative z-10 space-y-8">
                  <div>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-2 block">Current Deployment</span>
                    <h2 className="text-4xl font-black text-white font-heading tracking-tight">{currentMission.name}</h2>
                  </div>

                  <p className="text-stone-400 text-lg leading-relaxed font-serif italic">
                    {currentMission.description}
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass-dark p-6 rounded-2xl border border-white/5">
                      <div className="text-[10px] text-stone-500 uppercase font-black tracking-widest mb-2">Primary Difficulty</div>
                      <div className="text-2xl font-bold text-white">{currentMission.difficulty} <span className="text-rose-500 text-sm">LEGENDARY</span></div>
                    </div>
                    <div className="glass-dark p-6 rounded-2xl border border-white/5">
                      <div className="text-[10px] text-stone-500 uppercase font-black tracking-widest mb-2">Estimated Duration</div>
                      <div className="text-2xl font-bold text-white">{currentMission.durationLabel}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-8">
                    <div className="space-y-4">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Strategic Spoils</span>
                       <div className="flex gap-4">
                          <div className="stat-badge bg-primary/20 text-primary">💰 {currentMission.reward.gold}</div>
                          <div className="stat-badge bg-emerald-500/20 text-emerald-400">⭐ {currentMission.reward.renown}</div>
                       </div>
                    </div>

                    <button
                      disabled={isMissionActive}
                      onClick={() => setScreen('missions')}
                      className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all haptic-click ${
                        isMissionActive
                          ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                          : 'bg-rose-600 text-white hover:scale-105 active:scale-95 shadow-xl shadow-rose-900/20'
                      }`}
                    >
                      {isMissionActive ? 'DEPLOYED' : 'Go to Mission Board'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-[3rem] p-16 border border-emerald-500/20 bg-emerald-500/[0.02] text-center space-y-8 animate-in zoom-in duration-1000">
                 <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-6xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                   🏰
                 </div>
                 <h2 className="text-5xl font-black text-white font-heading">The Keep is Reclaimed</h2>
                 <p className="text-stone-400 max-w-xl mx-auto text-lg italic font-serif">
                   "The miasma has cleared. The people look to the Keep once more, and they see the Banner of Coin. Your legacy is etched into the very stones of this world."
                 </p>
                 <div className="pt-8">
                   <button
                     onClick={() => setScreen('dashboard')}
                     className="px-12 py-5 bg-white text-stone-950 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                   >
                     Return to Guild Hall
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
};
