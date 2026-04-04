import type { MissionOutcome } from './mission';

export type ExpeditionStageType = 'travel' | 'hazard' | 'objective' | 'escape';

export interface ExpeditionStageResult {
  stageIndex: number;
  stageType: ExpeditionStageType;
  outcome: MissionOutcome;
  narrative: string;
  goldBonus: number;
  materialsFound: Array<{ materialId: string; quantity: number }>;
  itemsFound: string[]; // item IDs
  injuredMercIds: string[];
  fatiguedMercIds: string[];
}

export interface ExpeditionStage {
  type: ExpeditionStageType;
  label: string;
  description: string;
  difficultyMod: number; // added to base expedition difficulty
  eventPool: string[]; // narrative snippets
}

export interface ExpeditionTemplate {
  id: string;
  name: string;
  description: string;
  region: string;
  baseDifficulty: number;
  durationLabel: string;
  stages: ExpeditionStage[];
  reward: {
    gold: number;
    renown: number;
    possibleItems: string[];
    possibleMaterials: string[];
  };
  requiredRenown?: number; // to unlock
  requiredContracts?: number; // completed contracts to unlock
}

export interface ActiveExpedition {
  templateId: string;
  assignedMercIds: string[];
  startedAt: string;
  currentStageIndex: number; // 0-based
  stageResults: ExpeditionStageResult[];
  consumablesAssigned: string[]; // item IDs
}

export interface ExpeditionResult {
  templateId: string;
  mercIds: string[];
  totalOutcome: MissionOutcome;
  goldEarned: number;
  renownEarned: number;
  itemsEarned: string[];
  materialsEarned: Array<{ materialId: string; quantity: number }>;
  injuredMercIds: string[];
  fatiguedMercIds: string[];
  stageResults: ExpeditionStageResult[];
  bondChanges: Array<{ mercId1: string; mercId2: string; delta: number }>;
}
