export type TraitTag =
  | 'brave'
  | 'cautious'
  | 'greedy'
  | 'loyal'
  | 'reckless'
  | 'scholarly'
  | 'stealthy'
  | 'tough'
  | 'ruthless'
  | 'charismatic'
  | 'cursed'
  | 'hunter';

export interface Trait {
  id: string;
  name: string;
  tag: TraitTag;
  description: string;
  /** flat bonus added to party score for matching mission tags */
  scoreBonus: number;
}

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type RelationshipSentiment = 'friend' | 'rival' | 'neutral' | 'bonded';

export interface Relationship {
  mercId: string;
  sentiment: RelationshipSentiment;
}

export interface MercStats {
  strength: number;   // 1-10
  agility: number;    // 1-10
  intellect: number;  // 1-10
  presence: number;   // 1-10
}

export interface Mercenary {
  id: string;
  name: string;
  title: string;
  portrait: string;   // emoji or placeholder string
  stats: MercStats;
  traits: Trait[];
  relationships: Relationship[];
  equipment: Partial<Record<EquipmentSlot, string>>; // item IDs
  isInjured: boolean;
  isFatigued: boolean;
  /** 0-10 morale; low morale imposes mission penalties */
  morale: number;
  /** 0-10 loyalty; higher loyalty means less chance of leaving / better bonded bonds */
  loyalty: number;
  /** missions completed */
  missionsCompleted: number;
}
