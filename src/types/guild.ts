import type { ChronicleEntry } from './chronicles';

export const WEATHER_IDS = ['clear', 'rain', 'snow', 'night', 'storm'] as const;
export type WeatherId = (typeof WEATHER_IDS)[number];

export interface GuildResources {
  gold: number;
  supplies: number;
  renown: number;
}

export interface RoomUpgradeLevel {
  description: string;
  /** Key → value pairs describing mechanical effects, e.g. { rosterCap: 8 } */
  effects: Record<string, number>;
  upgradeCost: GuildResources;
}

export interface RoomUpgrade {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
  maxLevel: number;
  /** Indexed by level 1..maxLevel */
  levels: RoomUpgradeLevel[];
}

export interface AutomationSettings {
  autoDeploy: boolean;
  autoRefill: boolean;
}

export type InfluencePerkId =
  | 'thornwood_ties'        // +10% gold from escort missions
  | 'thornwood_provisioner' // -20% supply cost for missions
  | 'ashfen_scouts'         // +1 loot from exploration missions
  | 'ashfen_herbalist'      // +50% passive morale recovery
  | 'mountain_hardened'     // -15% injury chance in Grey Mountains
  | 'mountain_quarry'       // +1 materials from all missions
  | 'city_contacts'         // auto-refresh recruits every 5 mins instead of 15
  | 'city_informants'       // +10% gold gain globally
  | 'pale_border_veterans'  // +5% success chance on all missions
  | 'pale_border_heroes';    // Recruits start with +1 to all stats

export interface InfluenceMilestone {
  threshold: number;
  perkId: InfluencePerkId;
  label: string;
  description: string;
}

export interface RegionalInfluence {
  region: string;
  influence: number;       // current influence points
  maxInfluence: number;    // cap before next tier
  unlockedPerks: InfluencePerkId[];
}

export type GuildPolicyId = 
  | 'aggressive_recruiting' // Higher hire costs, but better stats for recruits
  | 'safety_first'          // Lower mission speed, but much lower injury chance
  | 'profit_maximization'  // Higher gold gain, but morale decays faster
  | 'rigorous_training'    // Higher training cost, but double progress speed
  | 'frugal_operations';    // Lower maintenance, but lower renown gain

export interface GuildPolicy {
  id: GuildPolicyId;
  name: string;
  description: string;
  icon: string;
  effects: {
    positive: string;
    negative: string;
  };
}

export interface Guild {
  name: string;
  resources: GuildResources;
  rooms: RoomUpgrade[];
  inventoryItemIds: string[]; // item IDs in stash (may have duplicates)
  materials: Record<string, number>; // materialId -> quantity
  guildRank: number; // 1-5
  completedContracts: number; // total missions completed
  unlockedRegions: string[];
  automationSettings: AutomationSettings;
  regionalInfluence: Record<string, RegionalInfluence>; // region name -> data
  unlockedArtifactIds: string[];
  unlockedPropIds: string[];
  currentWeather: WeatherId;
  chronicles: ChronicleEntry[];
  activePolicyIds: GuildPolicyId[];
  maxPolicySlots: number;
  /** Guild Morale: 0–100. High morale boosts party score; low morale increases injury risk. */
  guildMorale: number;
  /** Consumable stockpile for auto-deployment. Item ID → quantity. */
  consumableStockpile: Record<string, number>;
  /** Map of inventory index → durability (0-100) */
  inventoryDurability: Record<number, number>;
  /** Level of guild investments, boosts passive income. */
  businessLevel: number;
}
