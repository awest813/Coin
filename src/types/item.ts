export type ItemRarity = 'common' | 'uncommon' | 'rare';
export type ItemCategory = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'trophy';

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  category: ItemCategory;
  /** stat bonuses when equipped */
  statBonus?: Partial<Record<'strength' | 'agility' | 'intellect' | 'presence', number>>;
  /** gold value */
  value: number;
}
