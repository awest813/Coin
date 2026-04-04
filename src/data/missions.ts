import type { MissionTemplate } from '~/types/mission';

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: 'mission_caravan',
    name: 'Caravan Escort',
    description:
      'A merchant needs armed escort through the Thornwood pass. Bandits have been bold lately.',
    tags: ['combat', 'escort'],
    difficulty: 7,
    durationLabel: '2 days',
    reward: {
      gold: 80,
      renown: 5,
      possibleItems: ['iron_sword', 'leather_armor', 'ration_pack', 'lucky_charm'],
    },
    flavorText: {
      success:
        'The merchant arrived safely, purse intact. He tipped the party extra and promised a good word around the docks.',
      partial:
        'The caravan made it through, but Thornwood had surprises. Goods were lost, tempers were frayed.',
      failure:
        'The bandits were better organized than expected. The merchant escaped, barely. No payment.',
    },
  },
  {
    id: 'mission_ruin',
    name: 'Ruin Survey',
    description:
      'Locate a collapsed watchtower east of Greyfen. Map the site, recover any surviving records.',
    tags: ['exploration'],
    difficulty: 5,
    durationLabel: '3 days',
    reward: {
      gold: 50,
      renown: 8,
      possibleItems: ['grimoire_fragment', 'banner_shard', 'runed_amulet', 'ration_pack'],
    },
    flavorText: {
      success:
        'The tower held its secrets loosely. Records recovered, site mapped. The client was pleased.',
      partial:
        'Some records were damaged by water. The map is rough but usable. Half pay rendered.',
      failure:
        'The route was impassable after heavy rain. The party returned empty-handed and muddy.',
    },
  },
  {
    id: 'mission_informant',
    name: 'Extract the Informant',
    description:
      "A city contact needs quiet extraction from a noble's estate before dawn. Discretion is essential.",
    tags: ['stealth', 'social'],
    difficulty: 11,
    durationLabel: '1 day',
    reward: {
      gold: 120,
      renown: 12,
      possibleItems: ['silver_dagger', 'scouts_cloak', 'lucky_charm', 'runed_amulet'],
    },
    flavorText: {
      success:
        'The informant was out before the watch changed. Clean, quiet, professional. Word will spread.',
      partial:
        'The contact was extracted but not cleanly. Raised voices, a broken window. The noble will ask questions.',
      failure:
        'The whole affair fell apart at the gate. The informant is lying low. The client is furious.',
    },
  },
];
