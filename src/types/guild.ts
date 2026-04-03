export interface GuildResources {
  gold: number;
  supplies: number;
  renown: number;
}

export interface RoomUpgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: GuildResources;
  // TODO Phase 1: unlock bonuses per level
}

export interface Guild {
  name: string;
  resources: GuildResources;
  rooms: RoomUpgrade[];
  inventoryItemIds: string[]; // item IDs in stash (may have duplicates)
}
