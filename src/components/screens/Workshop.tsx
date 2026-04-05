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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-400 font-heading">🔨 Workshop</h1>
        <div className="flex gap-4 text-sm text-stone-400">
          <span>Forge Level: <span className="text-amber-400 font-bold">{forgeLevel}</span></span>
          <span>Materials: <span className="text-amber-400 font-bold">{totalMaterialCount}</span></span>
        </div>
      </div>

      {/* Materials Inventory */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-300 mb-3">📦 Materials</h2>
        {Object.keys(materials).length === 0 ? (
          <p className="text-stone-500 text-sm italic">No materials yet. Complete missions to gather them.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(materials)
              .filter(([, qty]) => qty > 0)
              .map(([matId, qty]) => {
                const mat = MATERIALS_MAP[matId];
                if (!mat) return null;
                return (
                  <div
                    key={matId}
                    className="bg-stone-800 border border-stone-700 rounded p-2 flex items-center gap-2"
                  >
                    <span className="text-xl">{mat.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-stone-200 truncate">{mat.name}</div>
                      <div className="text-xs text-stone-400">x{qty}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Recipes */}
      {categories.map((cat) => {
        const catRecipes = RECIPES.filter((r) => r.category === cat);
        return (
          <section key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-stone-300 mb-3">{CATEGORY_LABELS[cat]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catRecipes.map((recipe) => {
                const outputItem = ITEMS_MAP[recipe.outputItemId];
                const craftable = canCraft(recipe.id);
                const forgeLocked = recipe.requiresForgeLevel !== undefined && forgeLevel < recipe.requiresForgeLevel;

                return (
                  <div
                    key={recipe.id}
                    className={`rounded p-4 transition-colors ${craftable ? 'bg-gradient-to-br from-amber-950/30 to-stone-900 border border-amber-700 shadow-sm shadow-amber-900/20' : 'bg-gradient-to-br from-stone-900 to-stone-800 border border-stone-700 opacity-80'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-medium text-stone-200">{recipe.name}</div>
                        <div className="text-xs text-stone-400 mt-0.5">{recipe.description}</div>
                        {outputItem && (
                          <div className="text-xs text-stone-500 mt-1 italic">→ {outputItem.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => craftItem(recipe.id)}
                        disabled={!craftable}
                        className={`shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          craftable
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        Craft
                      </button>
                    </div>

                    {forgeLocked && (
                      <div className="text-xs text-orange-400 mb-2">
                        🔒 Requires Forge Level {recipe.requiresForgeLevel}
                      </div>
                    )}

                    {/* Cost */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded ${resources.gold >= recipe.goldCost ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                        💰 {recipe.goldCost}g
                      </span>
                      {recipe.ingredients.map((ing) => {
                        const mat = MATERIALS_MAP[ing.materialId];
                        const have = materials[ing.materialId] ?? 0;
                        const enough = have >= ing.quantity;
                        return (
                          <span
                            key={ing.materialId}
                            className={`px-2 py-0.5 rounded ${enough ? 'bg-stone-700 text-stone-300' : 'bg-red-900 text-red-300'}`}
                          >
                            {mat?.icon ?? '📦'} {mat?.name ?? ing.materialId} x{ing.quantity}
                            <span className="ml-1 opacity-70">({have}/{ing.quantity})</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
