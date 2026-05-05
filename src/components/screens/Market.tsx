import { useState } from 'react';
import { useGameStore } from '~/store/gameStore';
import { MATERIALS } from '~/data/materials';
import { REGION_DATA } from '~/data/regions';

const REGIONAL_MODS: Record<string, Record<string, number>> = {
  'Ashfen Marsh': { swamp_reed: 0.5, herbs_bundle: 0.8, ancient_ink: 1.2 },
  'Grey Mountains': { iron_scraps: 0.5, refined_steel: 0.7, moonstone_shard: 0.8 },
  'Thornwood': { herbs_bundle: 0.5, ancient_wood: 0.6, wolf_pelt: 0.7 },
  'City Below': { rough_cloth: 0.6, tallow_candles: 0.5, silver_dust: 0.8 },
  'Pale Border': { dragonscale_fragment: 0.9, star_silk: 0.9, bone_fragment: 0.6 },
  'Whispering Peaks': { moonstone_shard: 0.4, star_silk: 0.5, tallow_candles: 1.5, sky_king_seal: 0.8 },
};

export function Market() {
  const { guild, buyMaterial, sellMaterial } = useGameStore();
  const [activeRegion, setActiveRegion] = useState(guild.unlockedRegions[0] || 'Thornwood');

  const availableMaterials = MATERIALS.filter(m => m.rarity === 'common' || m.rarity === 'uncommon');

  function getPrice(materialId: string, baseValue: number, isBuying: boolean) {
    const regMod = REGIONAL_MODS[activeRegion]?.[materialId] ?? 1.0;
    const price = baseValue * regMod;
    
    const { unlockedStrategicAssetIds } = useGameStore.getState();
    const hasDiscount = isBuying && unlockedStrategicAssetIds.includes('asset_mercantile_charter');
    const finalPrice = hasDiscount ? price * 0.9 : price;

    return {
      price: isBuying ? Math.ceil(finalPrice * 1.5) : Math.floor(price * 0.5),
      mod: regMod
    };
  }

  function findBestRegion(materialId: string, isBuying: boolean) {
    let bestRegion = '';
    let bestMod = isBuying ? 999 : 0;

    Object.entries(REGIONAL_MODS).forEach(([region, mods]) => {
      const mod = mods[materialId] ?? 1.0;
      if (isBuying) {
        if (mod < bestMod) {
          bestMod = mod;
          bestRegion = region;
        }
      } else {
        if (mod > bestMod) {
          bestMod = mod;
          bestRegion = region;
        }
      }
    });

    return { region: bestRegion, mod: bestMod };
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">⚖️</span>
            Merchant's Exchange
          </h1>
          <p className="text-stone-400 mt-2 max-w-md italic font-serif leading-relaxed">
            "Buy low in the mud of the Ashfen, sell high in the spires of the City. That's the only law that matters."
          </p>
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 gap-1 shadow-inner overflow-x-auto no-scrollbar">
          {guild.unlockedRegions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all haptic-click whitespace-nowrap ${
                activeRegion === region ? 'bg-primary text-stone-950 shadow-lg shadow-primary/20' : 'text-stone-500 hover:text-white'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Buy Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Purchase Materials</h2>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Region Modifier: {activeRegion}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {availableMaterials.map((mat) => {
              const { price: buyPrice, mod } = getPrice(mat.id, mat.value, true);
              const best = findBestRegion(mat.id, true);
              const isBest = mod <= best.mod;
              const canAfford = guild.resources.gold >= buyPrice;
              
              return (
                <div key={`buy-${mat.id}`} className={`glass-dark border rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-all group ${isBest ? 'border-primary/30 bg-primary/[0.02]' : 'border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-500">{mat.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {mat.name}
                        {isBest && <span className="text-[7px] bg-primary text-stone-950 px-1.5 py-0.5 rounded-full font-black uppercase">Best Price</span>}
                      </div>
                      <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest">
                        {mat.rarity} • {(mod * 100).toFixed(0)}% Regional Rate
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-bold ${canAfford ? 'text-primary' : 'text-rose-500'}`}>{buyPrice}g</div>
                      <div className="text-[8px] text-stone-600 font-black uppercase tracking-tighter">Cost per unit</div>
                    </div>
                    <button
                      onClick={() => buyMaterial(mat.id, 1, buyPrice)}
                      disabled={!canAfford}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase text-stone-400 hover:text-white hover:bg-primary hover:text-stone-950 hover:border-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all haptic-click"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sell Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">Unload Inventory</h2>
            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Current Stock</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(guild.materials)
              .filter(([, qty]) => qty > 0)
              .map(([matId, qty]) => {
                const mat = MATERIALS.find(m => m.id === matId);
                if (!mat) return null;
                const { price: sellPrice, mod } = getPrice(mat.id, mat.value, false);
                const best = findBestRegion(mat.id, false);
                const isBest = mod >= best.mod;

                return (
                  <div key={`sell-${mat.id}`} className={`glass-dark border rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-all group ${isBest ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-500">{mat.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {mat.name}
                          {isBest && <span className="text-[7px] bg-emerald-500 text-stone-950 px-1.5 py-0.5 rounded-full font-black uppercase">High Demand</span>}
                        </div>
                        <div className="text-[9px] text-primary font-black uppercase tracking-widest">
                          x{qty} In Stock • {(mod * 100).toFixed(0)}% Value
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{sellPrice}g</div>
                        <div className="text-[8px] text-stone-600 font-black uppercase tracking-tighter">Sale Price</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => sellMaterial(mat.id, 1, sellPrice)}
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase text-stone-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all haptic-click"
                        >
                          x1
                        </button>
                        {qty >= 5 && (
                          <button
                            onClick={() => sellMaterial(mat.id, 5, sellPrice)}
                            className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase text-stone-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all haptic-click"
                          >
                            x5
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            {Object.values(guild.materials).every(q => q === 0) && (
              <div className="py-20 text-center glass-dark rounded-[2rem] border border-dashed border-white/5">
                <p className="text-stone-600 text-xs italic font-serif">No materials to sell. Send your mercs out to scavenge.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
