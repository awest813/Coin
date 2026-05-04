import type { Mercenary } from '~/types/mercenary';

export const LEGENDARY_MERCENARIES: Record<string, Mercenary> = {
  merc_legend_valerius: {
    id: 'merc_legend_valerius',
    name: 'Valerius the Silver',
    title: 'Legendary Duelist',
    portrait: '🤺',
    stats: {
      strength: 7,
      agility: 10,
      intellect: 6,
      presence: 8,
    },
    traits: [
      {
        id: 'trait_legendary_precision',
        name: 'Legendary Precision',
        tag: 'stealthy',
        description: 'Increases mission success margin by 20% when on high-difficulty contracts.',
        scoreBonus: 5,
      },
    ],
    relationships: [],
    equipment: {
      weapon: 'item_silver_rapier',
    },
    isInjured: false,
    isFatigued: false,
    morale: 10,
    loyalty: 10,
    missionsCompleted: 100,
    background: 'A master of the blade from the distant Silver Isles. He seeks only the most challenging contracts.',
    isLegendary: true,
    uniqueTrait: 'Silver Waltz: All party members gain +2 Agility on this mission.',
  },
};
