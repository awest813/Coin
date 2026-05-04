import type { Mercenary } from './mercenary';

export interface HeroQuestStage {
  id: string;
  title: string;
  narrative: string;
  choices: HeroQuestChoice[];
}

export interface HeroQuestChoice {
  label: string;
  requirement?: {
    stat: keyof Mercenary['stats'];
    value: number;
  };
  outcome: {
    text: string;
    nextStageId?: string; // null means quest ends
    success: boolean;
  };
}

export interface HeroQuest {
  id: string;
  name: string;
  description: string;
  triggerCondition: {
    minRenown?: number;
    minContracts?: number;
  };
  stages: HeroQuestStage[];
  rewardMercenaryId: string; // The ID of the Legendary Merc to unlock
}
