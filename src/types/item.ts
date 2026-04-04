export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type ItemCategory = 'weapon' | 'armor' | 'accessory' | 'consumable' | 'trophy';
export type ItemTag =
  | 'holy'
  | 'cursed'
  | 'scout'
  | 'fine_steel'
  | 'arcane'
  | 'durable'
  | 'light'
  | 'heavy'
  | 'ancient'
  | 'blessed'
  | 'silver'
  | 'poisoned';

export interface Item {
  id: string;
  name: string;
  description: string;
  /** Short in-world flavor text shown below description */
  flavorText?: string;
  rarity: ItemRarity;
  category: ItemCategory;
  /** Optional thematic tags that influence simulation or flavor */
  tags?: ItemTag[];
  /** stat bonuses when equipped */
  statBonus?: Partial<Record<'strength' | 'agility' | 'intellect' | 'presence', number>>;
  /** gold value */
  value: number;
}
