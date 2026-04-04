export type MissionTag = 'combat' | 'stealth' | 'social' | 'exploration' | 'escort';
export type MissionOutcome = 'success' | 'partial' | 'failure';

export interface MissionReward {
  gold: number;
  renown: number;
  /** item IDs that may drop */
  possibleItems: string[];
}

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  tags: MissionTag[];
  difficulty: number;   // 1-20
  durationLabel: string; // e.g. "2 days"
  reward: MissionReward;
  /** flavor text keyed by outcome */
  flavorText: Record<MissionOutcome, string>;
}

export interface ActiveMission {
  templateId: string;
  assignedMercIds: string[];
  /** ISO timestamp when mission was sent */
  startedAt: string;
}

export interface MissionResult {
  templateId: string;
  mercIds: string[];
  outcome: MissionOutcome;
  goldEarned: number;
  renownEarned: number;
  itemsEarned: string[]; // item IDs
  injuredMercIds: string[];
  fatiguedMercIds: string[];
  flavorText: string;
  partyScore: number;
  difficulty: number;
}
