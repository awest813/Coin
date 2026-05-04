import type { Artifact } from '~/types/artifacts';

export const ARTIFACTS: Artifact[] = [
  {
    id: 'art_chronos_hourglass',
    name: 'Chronos Hourglass',
    icon: '⏳',
    description: 'Reduces all mission durations by 15%.',
    lore: 'Found in the shifting sands of the Timeless Waste. It hums with an unsettling vibration.',
    modifiers: [{ type: 'mission_duration', value: -0.15 }],
    cost: {
      gold: 1500,
      renown: 100,
      materials: { obsidian_shard: 10, star_silk: 5 },
    },
  },
  {
    id: 'art_banner_of_unity',
    name: 'Banner of Unity',
    icon: '🚩',
    description: 'Increases mission success chance by 10%.',
    lore: 'The original standard of the Guild Founders. It inspires even the most cynical sellsword.',
    modifiers: [{ type: 'success_chance', value: 0.10 }],
    cost: {
      gold: 800,
      renown: 150,
      materials: { ancient_wood: 25, star_silk: 3 },
    },
  },
  {
    id: 'art_bottomless_satchel',
    name: 'Bottomless Satchel',
    icon: '👜',
    description: 'Increases maximum supply cap by 300.',
    lore: 'An experiment in spatial folding that actually worked. Mostly.',
    modifiers: [{ type: 'supply_cap', value: 300 }],
    cost: {
      gold: 1200,
      renown: 80,
      materials: { tanned_hide: 100, void_thread: 10 },
    },
  },
  {
    id: 'art_midas_lens',
    name: 'Midas Lens',
    icon: '👁️',
    description: 'Increases gold gain from all sources by 20%.',
    lore: 'Those who look through it see only the value of things. Very profitable.',
    modifiers: [{ type: 'gold_gain', value: 0.20 }],
    cost: {
      gold: 3000,
      renown: 120,
      materials: { silver_dust: 100, dragonscale_fragment: 2 },
    },
  },
  {
    id: 'art_wraith_cloak',
    name: "Wraith's Cloak",
    icon: '🧥',
    description: 'Reduces injury chance by 25% and fatigue by 50%.',
    lore: 'A garment stolen from the Pales. It makes the wearer as light as a whisper.',
    modifiers: [
      { type: 'fatigue_chance', value: -0.5 },
      { type: 'success_chance', value: 0.05 },
    ],
    cost: {
      gold: 2500,
      renown: 200,
      materials: { void_thread: 15, star_silk: 5 },
    },
  },
  {
    id: 'art_monarch_seal',
    name: "Monarch's Seal",
    icon: '💍',
    description: 'Recruits have higher base stats (+1 to all).',
    lore: 'A signet ring from a forgotten dynasty. Authority flows from its cold metal.',
    modifiers: [{ type: 'recruit_quality', value: 1 }],
    cost: {
      gold: 5000,
      renown: 300,
      materials: { silver_dust: 200, moonstone_shard: 5 },
    },
  },
];

export const ARTIFACTS_MAP: Record<string, Artifact> = ARTIFACTS.reduce(
  (acc, art) => ({ ...acc, [art.id]: art }),
  {}
);
