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

export interface Guild {
  name: string;
  resources: GuildResources;
  rooms: RoomUpgrade[];
  inventoryItemIds: string[]; // item IDs in stash (may have duplicates)
  materials: Record<string, number>; // materialId -> quantity
  guildRank: number; // 1-5
  completedContracts: number; // total missions completed
  unlockedRegions: string[];
}
