import type { Mercenary } from './mercenary';
import type { Item } from './item';
import type { ActiveMission, MissionResult } from './mission';
import type { Guild } from './guild';
import type { GeneratedRecruit } from './recruit';
import type { ActiveExpedition, ExpeditionResult } from './expedition';
import type { PendingEvent } from './event';

export const SAVE_VERSION = 3;

export interface SaveData {
  version: number;
  savedAt: string; // ISO timestamp
  guild: Guild;
  mercenaries: Mercenary[];
  items: Record<string, Item>; // item ID -> Item (master registry)
  activeMission: ActiveMission | null;
  lastResult: MissionResult | null;
  availableRecruits: GeneratedRecruit[];
  lastRecruitRefresh: string;
  pendingEvents: PendingEvent[];
  activeExpedition: ActiveExpedition | null;
  lastExpeditionResult: ExpeditionResult | null;
}
