export type MaterialRarity = 'common' | 'uncommon' | 'rare';

export interface Material {
  id: string;
  name: string;
  description: string;
  rarity: MaterialRarity;
  icon: string; // emoji
  value: number;
}

export type RecipeCategory = 'weapon' | 'armor' | 'consumable';

export interface RecipeIngredient {
  materialId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  outputItemId: string; // item ID it produces
  goldCost: number;
  ingredients: RecipeIngredient[];
  description: string;
  requiresForgeLevel?: number; // 1-3, default 1
}
