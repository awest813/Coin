import type { TraitTag } from './mercenary';

export interface RecruitArchetype {
  id: string;
  titlePool: string[];
  portraitPool: string[]; // emojis
  classRole: string;
  statRanges: {
    strength: [number, number];
    agility: [number, number];
    intellect: [number, number];
    presence: [number, number];
  };
  traitPool: Array<{ tag: TraitTag; name: string; description: string; scoreBonus: number }>;
  backgroundLines: string[];
  hireCostBase: number; // gold
}

export interface GeneratedRecruit {
  id: string;
  name: string;
  title: string;
  portrait: string;
  classRole: string;
  background: string;
  stats: { strength: number; agility: number; intellect: number; presence: number };
  traits: Array<{ id: string; name: string; tag: TraitTag; description: string; scoreBonus: number }>;
  hireCost: number;
  level?: number;
  isVeteran?: boolean;
  archetypeId: string;
}
