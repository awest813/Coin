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
  merc_legend_saria: {
    id: 'merc_legend_saria',
    name: 'Saria',
    title: 'Void-Walker',
    portrait: '👁️',
    stats: {
      strength: 5,
      agility: 7,
      intellect: 10,
      presence: 6,
    },
    traits: [
      {
        id: 'trait_void_touched',
        name: 'Void-Touched',
        tag: 'cursed',
        description: 'Can perceive the gaps between worlds. Intellect-based checks gain +3.',
        scoreBonus: 3,
        isLegendary: true,
      },
    ],
    relationships: [],
    equipment: {},
    isInjured: false,
    isFatigued: false,
    morale: 7,
    loyalty: 8,
    missionsCompleted: 0,
    background: 'She has walked the spaces between worlds and returned. The void left its mark on her eyes — and its secrets in her mind.',
    isLegendary: true,
    uniqueTrait: 'Rift Sight: On exploration or ruin missions, she finds hidden routes others miss. +5 to party score.',
  },
};
