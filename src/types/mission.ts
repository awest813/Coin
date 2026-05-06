export type MissionTag =
  | 'combat'
  | 'stealth'
  | 'social'
  | 'exploration'
  | 'escort'
  | 'hunt'
  | 'bounty'
  | 'ruin'
  | 'campaign';

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
  weaponBonus?: number;
  statusPenalty: number;
  total: number;
}

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  tags: MissionTag[];
  /** Which region this contract is set in — used for influence gain */
  region?: string;
  difficulty: number;   // 1-20
  durationLabel: string; // e.g. "2 days"
  durationSeconds: number; // e.g. 180 for 3 minutes
  reward: MissionReward;
  /** flavor text keyed by outcome */
  flavorText: Record<MissionOutcome, string>;
  /** optional extra flavor variants (randomly chosen in addition to base) */
  eventSnippets?: string[];
  /** Is this part of the Phase 7: Grand Campaign? */
  isCampaign?: boolean;
  /** Suggested class roles for this mission (UI hint) */
  recommendedClasses?: string[];
}

export interface ActiveMission {
  /** Unique run ID so the same template can be active more than once */
  missionRunId: string;
  templateId: string;
  assignedMercIds: string[];
  /** ISO timestamp when mission was sent */
  startedAt: string;
  /** ISO timestamp when mission will be complete */
  endTime: string;
  /** item IDs of consumables used on this mission */
  consumablesAssigned?: string[];
}

export interface SynergyBonus {
  name: string;
  scoreBonus: number;
  description: string;
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
  /** Skill XP gained per merc: mercId -> { skillId: xp } */
  skillXP?: Record<string, Record<string, number>>;
  flavorText: string;
  partyScore: number;
  difficulty: number;
  scoreBreakdown: ScoreBreakdownEntry[];
  synergies?: SynergyBonus[];
  narrativeEvents: string[];
  durabilityLoss?: { mercId: string; loss: Partial<Record<import('./mercenary').EquipmentSlot, number>> }[];
  /** Optional material drops keyed by material ID, added by mission resolution UI */
  materialsEarned?: Record<string, number>;
}
