export type EventTrigger = 'after_mission' | 'after_expedition' | 'guild_idle' | 'on_injury' | 'periodic';
export type EventCategory = 'social' | 'guild' | 'mission' | 'tavern' | 'campfire';

export interface EventChoice {
  label: string;
  outcomeText: string;
  effects: {
    gold?: number;
    renown?: number;
    supplies?: number;
    moraleDelta?: number; // applied to all in-party mercs
    loyaltyDelta?: number;
    bondDelta?: number; // between involved mercs
    materialId?: string;
    materialQty?: number;
  };
}

export interface GameEventTemplate {
  id: string;
  category: EventCategory;
  trigger: EventTrigger;
  title: string;
  text: string; // supports {merc1}, {merc2}, {guild} placeholders
  weight: number; // relative probability
  choices?: EventChoice[]; // if present, player picks; otherwise auto-resolves
  autoOutcome?: EventChoice; // for events with no player choice
  conditions?: {
    minRenown?: number;
    maxRenown?: number;
    requiresInjured?: boolean;
    requiresBonded?: boolean;
  };
}

export interface PendingEvent {
  id: string; // unique runtime ID
  templateId: string;
  title: string;
  text: string; // with placeholders resolved
  choices?: EventChoice[];
  autoOutcome?: EventChoice;
  involvedMercIds: string[];
}
