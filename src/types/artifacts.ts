import type { GuildResources } from './guild';

export type ArtifactModifierType = 
  | 'mission_duration' 
  | 'success_chance' 
  | 'supply_cap' 
  | 'gold_gain' 
  | 'injury_recovery' 
  | 'morale_gain'
  | 'fatigue_chance'
  | 'recruit_quality';

export interface ArtifactModifier {
  type: ArtifactModifierType;
  value: number; // e.g., -0.1 for 10% reduction, +0.05 for 5% boost
}

export interface Artifact {
  id: string;
  name: string;
  icon: string;
  description: string;
  lore: string;
  modifiers: ArtifactModifier[];
  cost: {
    gold: number;
    renown: number;
    materials: Record<string, number>; // rare materials from expeditions
  };
}
