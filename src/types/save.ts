import type { Mercenary } from './mercenary';
import type { Item } from './item';
import type { ActiveMission, MissionResult } from './mission';
import type { Guild } from './guild';

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  savedAt: string; // ISO timestamp
  guild: Guild;
  mercenaries: Mercenary[];
  items: Record<string, Item>; // item ID -> Item (master registry)
  activeMission: ActiveMission | null;
  lastResult: MissionResult | null;
}
