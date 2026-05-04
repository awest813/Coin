import { useGameStore } from '~/store/gameStore';
import { RECIPES } from '~/data/recipes';
import { MATERIALS_MAP } from '~/data/materials';
import { ITEMS_MAP } from '~/data/items';
import type { RecipeCategory } from '~/types/crafting';

const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  weapon: '⚔️ Weapons',
  armor: '🛡️ Armor',
  consumable: '🧪 Consumables',
};

export function Workshop() {
  const { guild, craftItem } = useGameStore();
  const { materials, resources } = guild;

  const forgeRoom = guild.rooms.find((r) => r.id === 'room_forge');
  const forgeLevel = forgeRoom?.levels[forgeRoom.level - 1]?.effects?.forgeLevel ?? 1;

  const totalMaterialCount = Object.values(materials).reduce((s, q) => s + q, 0);

  function canCraft(recipeId: string): boolean {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return false;
    if (resources.gold < recipe.goldCost) return false;
    if (recipe.requiresForgeLevel && forgeLevel < recipe.requiresForgeLevel) return false;
    for (const ing of recipe.ingredients) {
      if ((materials[ing.materialId] ?? 0) < ing.quantity) return false;
    }
    return true;
  }

  const categories: RecipeCategory[] = ['weapon', 'armor', 'consumable'];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight flex items-center gap-3">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">🔨</span>
            Master Forge
          </h1>
          <p className="text-stone-400 mt-2 max-w-md italic font-serif leading-relaxed">
            "Steel and stone obey those who have the gold to command them."
          </p>
        </div>
        <div className="flex gap-4">
          <div className="stat-badge glass">
            <span className="text-stone-500 mr-1 uppercase text-[10px] tracking-widest font-bold">Forge Rank</span>
            <span className="text-primary font-bold">{forgeLevel}</span>
          </div>
          <div className="stat-badge glass">
            <span className="text-stone-500 mr-1 uppercase text-[10px] tracking-widest font-bold">Total Mats</span>
            <span className="text-primary font-bold">{totalMaterialCount}</span>
          </div>
        </div>
      </header>

      {/* Materials Inventory */}
      <section className="space-y-6">
        <h2 className="text-xs font-black text-stone-600 uppercase tracking-[0.3em] px-1">Component Inventory</h2>
        {Object.keys(materials).length === 0 ? (
          <div className="py-12 text-center glass-dark rounded-3xl border border-dashed border-white/10">
            <p className="text-stone-500 text-sm italic font-serif">Your supply crates are empty. Send expeditions to gather materials.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {Object.entries(materials)
              .filter(([, qty]) => qty > 0)
              .map(([matId, qty]) => {
                const mat = MATERIALS_MAP[matId];
                if (!mat) return null;
                return (
                  <div
                    key={matId}
                    className="glass-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:border-white/10 transition-colors group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-500">{mat.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-stone-300 uppercase tracking-tighter truncate">{mat.name}</div>
                      <div className="text-sm font-bold text-primary">x{qty}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Recipes */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const catRecipes = RECIPES.filter((r) => r.category === cat);
          return (
            <section key={cat} className="space-y-6">
              <h2 className="text-xs font-black text-stone-600 uppercase tracking-[0.3em] px-1">{CATEGORY_LABELS[cat]}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catRecipes.map((recipe) => {
                  const outputItem = ITEMS_MAP[recipe.outputItemId];
                  const craftable = canCraft(recipe.id);
                  const forgeLocked = recipe.requiresForgeLevel !== undefined && forgeLevel < recipe.requiresForgeLevel;

                  return (
                    <div
                      key={recipe.id}
                      className={`premium-card relative overflow-hidden flex flex-col h-full ${!craftable ? 'opacity-60 grayscale-[0.3]' : ''}`}
                    >
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{recipe.name}</h4>
                            <p className="text-stone-400 text-[11px] italic font-serif leading-tight">"{recipe.description}"</p>
                          </div>
                          <div className="text-2xl filter drop-shadow-md">{outputItem?.icon}</div>
                        </div>

                        {outputItem && (
                          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-400/5 border border-emerald-400/10 px-2 py-1 rounded-lg">
                            Result: {outputItem.name}
                          </div>
                        )}

                        {forgeLocked && (
                          <div className="text-[9px] text-orange-400 font-black uppercase tracking-widest bg-orange-400/10 border border-orange-400/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
                            🔒 Rank {recipe.requiresForgeLevel} Forge Required
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className={`stat-badge text-[9px] ${resources.gold >= recipe.goldCost ? 'text-primary' : 'text-rose-400 animate-shake'}`}>
                            💰 {recipe.goldCost}g
                          </span>
                          {recipe.ingredients.map((ing) => {
                            const mat = MATERIALS_MAP[ing.materialId];
                            const have = materials[ing.materialId] ?? 0;
                            const enough = have >= ing.quantity;
                            return (
                              <span
                                key={ing.materialId}
                                className={`stat-badge text-[9px] ${enough ? 'text-stone-400' : 'text-rose-400 animate-shake'}`}
                              >
                                {mat?.icon ?? '📦'} {ing.quantity} {mat?.name ?? ing.materialId}
                                <span className="ml-1 opacity-50">({have})</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => craftItem(recipe.id)}
                        disabled={!craftable}
                        className={`mt-6 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all haptic-click ${
                          craftable
                            ? 'bg-primary text-stone-950 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.95]'
                            : 'bg-white/5 text-stone-600 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        Forge Item
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
