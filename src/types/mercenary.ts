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
  isLegendary?: boolean;
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
  equipmentDurability?: Partial<Record<EquipmentSlot, number>>; // 0-100
  isInjured: boolean;
  isFatigued: boolean;
  /** 0-10 morale; low morale imposes mission penalties */
  morale: number;
  /** 0-10 loyalty; higher loyalty means less chance of leaving / better bonded bonds */
  loyalty: number;
  /** missions completed */
  missionsCompleted: number;
  /** Character level (1-10) */
  level: number;
  /** Professional identity: Vanguard, Scout, Scholar, etc. */
  classRole?: string;
  /** Specialized proficiencies (0-100) */
  skills?: {
    tactics?: number;      // Combat/Escort bonus
    survival?: number;     // Exploration/Hunt bonus
    subterfuge?: number;   // Stealth/Bounty bonus
    negotiation?: number;  // Social bonus
    arcana?: number;       // Magic/Ruin bonus
  };
  /** Optional flavor text line shown on detail panel */
  background?: string;
  /** Bond scores with other mercs: mercId -> -10 to +10 */
  bondScores?: Record<string, number>;
  isTraining?: boolean;
  trainingStat?: keyof MercStats;
  trainingProgress?: number; // 0 to 100
  isLegendary?: boolean;
  uniqueTrait?: string;
}
