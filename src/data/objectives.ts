export type ObjectiveCategory = 'combat' | 'exploration' | 'social' | 'guild' | 'collection';

export type ObjectiveDifficulty = 'starter' | 'easy' | 'medium' | 'hard' | 'legendary';

export interface Objective {
  id: string;
  name: string;
  description: string;
  category: ObjectiveCategory;
  difficulty: ObjectiveDifficulty;
  target: number;
  current: number;
  reward?: {
    gold?: number;
    renown?: number;
    supplies?: number;
    itemId?: string;
    materialId?: string;
    materialQty?: number;
  };
  isCompleted: boolean;
  isHidden?: boolean;
  onComplete?: string;
  icon: string;
}

export const OBJECTIVE_TEMPLATES: Omit<Objective, 'current' | 'isCompleted'>[] = [
  // ── Starter Objectives ──────────────────────────────────────────────────────
  {
    id: 'obj_first_contract',
    name: 'First Contract',
    description: 'Complete your first mission to establish your guild\'s reputation.',
    category: 'combat',
    difficulty: 'starter',
    target: 1,
    reward: { gold: 50, renown: 5 },
    icon: '⚔️',
  },
  {
    id: 'obj_roster_growth',
    name: 'Building the Crew',
    description: 'Hire your first new mercenary to expand your operations.',
    category: 'guild',
    difficulty: 'starter',
    target: 1,
    reward: { renown: 3 },
    icon: '🧑‍🤝‍🧑',
  },
  {
    id: 'obj_workshop_upgrade',
    name: 'Foundations of Power',
    description: 'Upgrade any room in the Guild Hall to improve your facilities.',
    category: 'guild',
    difficulty: 'starter',
    target: 1,
    reward: { gold: 30, renown: 2 },
    icon: '🔨',
  },
  // ── Easy Objectives ───────────────────────────────────────────────────────
  {
    id: 'obj_five_contracts',
    name: 'Proven Track Record',
    description: 'Complete 5 contracts and unlock the Grey Mountains region.',
    category: 'combat',
    difficulty: 'easy',
    target: 5,
    reward: { gold: 100, renown: 15 },
    icon: '📋',
    onComplete: 'unlock_region_grey_mountains',
  },
  {
    id: 'obj_complete_ruins',
    name: 'Delve the Depths',
    description: 'Complete an exploration or ruin mission to recover ancient treasures.',
    category: 'exploration',
    difficulty: 'easy',
    target: 1,
    reward: { itemId: 'grimoire_fragment' },
    icon: '🏚️',
  },
  {
    id: 'obj_different_roles',
    name: 'Versatility',
    description: 'Send mercs with different specializations on missions.',
    category: 'social',
    difficulty: 'easy',
    target: 3,
    reward: { gold: 75, renown: 8 },
    icon: '🎭',
  },
  // ── Medium Objectives ───────────────────────────────────────────────────────
  {
    id: 'obj_legendary_item',
    name: 'Armed for Glory',
    description: 'Equip a mercenary with a rare or legendary weapon.',
    category: 'collection',
    difficulty: 'medium',
    target: 1,
    reward: { renown: 20 },
    icon: '🗡️',
  },
  {
    id: 'obj_fifteen_contracts',
    name: 'Rising Renown',
    description: 'Complete 15 contracts to achieve Established Guild rank.',
    category: 'combat',
    difficulty: 'medium',
    target: 15,
    reward: { gold: 250, renown: 30 },
    icon: '⭐',
  },
  {
    id: 'obj_influence_30',
    name: 'Regional Power',
    description: 'Gain 30 influence in any region to unlock regional perks.',
    category: 'exploration',
    difficulty: 'medium',
    target: 30,
    reward: { itemId: 'lucky_charm' },
    icon: '🌐',
  },
  // ── Hard Objectives ────────────────────────────────────────────────────────
  {
    id: 'obj_perfect_mission',
    name: 'Flawless Execution',
    description: 'Complete a mission with a perfect success outcome (margin 10+).',
    category: 'combat',
    difficulty: 'hard',
    target: 1,
    reward: { gold: 200, renown: 25 },
    icon: '💎',
  },
  {
    id: 'obj_all_regions',
    name: 'Kingdom-Wide Reach',
    description: 'Unlock all five regions for your guild operations.',
    category: 'exploration',
    difficulty: 'hard',
    target: 5,
    reward: { itemId: 'soldier_sword' },
    icon: '🗺️',
  },
  {
    id: 'obj_legendary_ally',
    name: 'Legendary Companion',
    description: 'Recruit or unlock a legendary mercenary.',
    category: 'social',
    difficulty: 'legendary',
    target: 1,
    reward: { renown: 50, gold: 300 },
    icon: '🏆',
  },
];

export function createInitialObjectives(): Objective[] {
  return OBJECTIVE_TEMPLATES.map(template => ({
    ...template,
    current: 0,
    isCompleted: false,
  }));
}