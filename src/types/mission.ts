export type MissionTag =
  | 'combat'
  | 'stealth'
  | 'social'
  | 'exploration'
  | 'escort'
  | 'hunt'
  | 'bounty'
  | 'ruin';

export type MissionOutcome = 'success' | 'partial' | 'failure';

export interface MissionReward {
  gold: number;
  renown: number;
  /** item IDs that may drop */
  possibleItems: string[];
}

export interface ScoreBreakdownEntry {
  mercName: string;
  baseScore: number;
  traitBonus: number;
  equipBonus: number;
  relBonus: number;
  statusPenalty: number;
  total: number;
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
  /** optional extra flavor variants (randomly chosen in addition to base) */
  eventSnippets?: string[];
}

export interface ActiveMission {
  /** Unique run ID so the same template can be active more than once */
  missionRunId: string;
  templateId: string;
  assignedMercIds: string[];
  /** ISO timestamp when mission was sent */
  startedAt: string;
  /** item IDs of consumables used on this mission */
  consumablesAssigned?: string[];
}

export interface MissionResult {
  /** Matches the ActiveMission that produced this result */
  missionRunId: string;
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
  scoreBreakdown: ScoreBreakdownEntry[];
  narrativeEvents: string[];
}
