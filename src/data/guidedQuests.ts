export interface GuidedQuest {
  id: string;
  name: string;
  description: string;
  steps: GuidedQuestStep[];
  isActive: boolean;
  isCompleted: boolean;
  currentStepIndex: number;
  reward?: {
    gold?: number;
    renown?: number;
    itemId?: string;
  };
  icon: string;
}

export interface GuidedQuestStep {
  id: string;
  title: string;
  instruction: string;
  targetScreen?: string | null;
  targetAction?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export const NEW_PLAYER_QUEST: Omit<GuidedQuest, 'isActive' | 'isCompleted' | 'currentStepIndex'> = {
  id: 'quest_new_guildmaster',
  name: 'New Guildmaster',
  description: 'Learn the ropes of guild management and complete your first contracts.',
  icon: '📜',
  steps: [
    {
      id: 'step_view_roster',
      title: 'Meet Your Crew',
      instruction: 'Visit the Roster to see your starting mercenaries and learn about their abilities.',
      targetScreen: 'roster',
      isCompleted: false,
    },
    {
      id: 'step_send_first_contract',
      title: 'First Contract',
      instruction: 'Go to Missions and deploy mercs on a contract. Choose an Easy mission to start.',
      targetScreen: 'missions',
      targetAction: 'deploy_mission',
      isCompleted: false,
    },
    {
      id: 'step_collect_rewards',
      title: 'Reap the Rewards',
      instruction: 'Return to the Guild Hall after your mission completes to collect rewards and review outcomes.',
      targetScreen: 'dashboard',
      isCompleted: false,
    },
    {
      id: 'step_equip_mercs',
      title: 'Gear Up',
      instruction: 'Visit the Workshop to craft equipment for your mercs, improving their mission performance.',
      targetScreen: 'workshop',
      isCompleted: false,
    },
    {
      id: 'step_upgrade_room',
      title: 'Improve Facilities',
      instruction: 'Upgrade a room in the Guild Hall to boost your operations.',
      targetScreen: 'dashboard',
      targetAction: 'upgrade_room',
      isCompleted: false,
    },
    {
      id: 'step_hire_merc',
      title: 'Expand Your Roster',
      instruction: 'Visit the Hiring Hall to recruit a new mercenary.',
      targetScreen: 'hiring',
      isCompleted: false,
    },
    {
      id: 'step_complete_five',
      title: 'Establish Reputation',
      instruction: 'Complete 5 contracts total to reach Known Band rank and unlock Grey Mountains.',
      targetScreen: null,
      isCompleted: false,
    },
  ],
};

export const INTERMEDIATE_QUESTS: Omit<GuidedQuest, 'isActive' | 'isCompleted' | 'currentStepIndex'>[] = [
  {
    id: 'quest_explorer',
    name: 'Dungeoneer',
    description: 'Venture into ruins and ancient sites to recover lost artifacts and knowledge.',
    icon: '🏚️',
    reward: { gold: 150, itemId: 'grimoire_fragment' },
    steps: [
      {
        id: 'step_complete_ruin',
        title: 'Delve the Depths',
        instruction: 'Complete an exploration or ruin mission in Ashfen Marsh.',
        targetScreen: 'missions',
        isCompleted: false,
      },
      {
        id: 'step_equip_explorer',
        title: 'Proper Preparation',
        instruction: 'Equip your expedition team with items suited for exploration.',
        targetScreen: 'workshop',
        isCompleted: false,
      },
      {
        id: 'step_complete_three_ruins',
        title: 'Seasoned Delver',
        instruction: 'Complete 3 exploration or ruin missions total.',
        targetScreen: null,
        isCompleted: false,
      },
    ],
  },
  {
    id: 'quest_diplomat',
    name: 'Silver Tongue',
    description: 'Master the art of social contracts and build regional influence.',
    icon: '💬',
    reward: { renown: 25 },
    steps: [
      {
        id: 'step_complete_social',
        title: 'Social Contract',
        instruction: 'Complete a mission with social or stealth tags.',
        targetScreen: 'missions',
        isCompleted: false,
      },
      {
        id: 'step_build_influence',
        title: 'Regional Presence',
        instruction: 'Gain 15 influence in a region through successful contracts.',
        targetScreen: 'worldmap',
        isCompleted: false,
      },
      {
        id: 'step_unlock_perk',
        title: 'Perk Unlocked',
        instruction: 'Unlock your first regional influence perk.',
        targetScreen: 'worldmap',
        isCompleted: false,
      },
    ],
  },
];

export function createGuidedQuest(template: Omit<GuidedQuest, 'isActive' | 'isCompleted' | 'currentStepIndex'>): GuidedQuest {
  return {
    ...template,
    steps: template.steps.map(step => ({ ...step, isCompleted: step.isCompleted ?? false })),
    isActive: false,
    isCompleted: false,
    currentStepIndex: 0,
  };
}