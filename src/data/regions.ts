import type { InfluenceMilestone, RegionalInfluence, InfluencePerkId } from '~/types/guild';

export interface RegionData {
  id: string;
  name: string;
  icon: string;
  description: string;
  flavorText: string;
  biome: 'forest' | 'marsh' | 'mountain' | 'city' | 'tundra';
  milestones: InfluenceMilestone[];
  /** mission tags that generate influence in this region */
  relevantTags: string[];
}

export const REGION_DATA: RegionData[] = [
  {
    id: 'thornwood',
    name: 'Thornwood',
    icon: '🌲',
    description: 'A dense trading forest corridor. Merchants rely on the guild for protection.',
    flavorText: '"Thornwood has highways but no law. We are the law."',
    biome: 'forest',
    relevantTags: ['escort', 'combat', 'bounty'],
    milestones: [
      {
        threshold: 20,
        perkId: 'thornwood_ties',
        label: 'Merchant Ties',
        description: '+10% gold from all escort and bounty missions.',
      },
      {
        threshold: 50,
        perkId: 'thornwood_provisioner',
        label: 'Forest Provisioner',
        description: 'Mission supply usage reduced by 20% due to local supply chains.',
      },
    ],
  },
  {
    id: 'ashfen_marsh',
    name: 'Ashfen Marsh',
    icon: '🌿',
    description: 'A treacherous wetland hiding forgotten ruins and rare herbs.',
    flavorText: '"The marsh swallows secrets. We are here to drag them out."',
    biome: 'marsh',
    relevantTags: ['exploration', 'ruin', 'hunt'],
    milestones: [
      {
        threshold: 20,
        perkId: 'ashfen_scouts',
        label: 'Marsh Scouts',
        description: '+1 guaranteed loot drop from exploration and ruin missions.',
      },
      {
        threshold: 50,
        perkId: 'ashfen_herbalist',
        label: 'Fen Herbalist',
        description: 'Passive morale recovery increased by 50% through medicinal tonics.',
      },
    ],
  },
  {
    id: 'grey_mountains',
    name: 'Grey Mountains',
    icon: '⛰️',
    description: 'Treacherous peaks home to bandits, beasts, and ancient keeps.',
    flavorText: '"The mountains break men. We break the mountains."',
    biome: 'mountain',
    relevantTags: ['combat', 'hunt', 'bounty'],
    milestones: [
      {
        threshold: 25,
        perkId: 'mountain_hardened',
        label: 'Mountain Hardened',
        description: '-15% injury chance on all combat and hunt missions.',
      },
      {
        threshold: 50,
        perkId: 'mountain_quarry',
        label: 'Mountain Quarry',
        description: '+1 material drop from all missions worldwide.',
      },
    ],
  },
  {
    id: 'city_below',
    name: 'City Below',
    icon: '🏙️',
    description: 'The underbelly of the capital. Intrigue, social contracts, and political favors.',
    flavorText: '"Gold opens doors. Presence keeps them open."',
    biome: 'city',
    relevantTags: ['social', 'stealth'],
    milestones: [
      {
        threshold: 30,
        perkId: 'city_contacts',
        label: 'City Contacts',
        description: 'Hiring Hall auto-refreshes every 5 minutes instead of 15.',
      },
      {
        threshold: 60,
        perkId: 'city_informants',
        label: 'Shadow Informants',
        description: 'Global gold gain increased by 10% from insider contract tips.',
      },
    ],
  },
  {
    id: 'pale_border',
    name: 'Pale Border',
    icon: '❄️',
    description: 'The frozen frontier. A proving ground where only legends survive.',
    flavorText: '"The border does not care about your rank. Only your record."',
    biome: 'tundra',
    relevantTags: ['combat', 'exploration', 'escort'],
    milestones: [
      {
        threshold: 40,
        perkId: 'pale_border_veterans',
        label: 'Pale Border Veterans',
        description: '+5% base success margin on all missions worldwide.',
      },
      {
        threshold: 80,
        perkId: 'pale_border_heroes',
        label: 'Northern Legends',
        description: 'New recruits are hardened by border stories, starting with +1 to all stats.',
      },
    ],
  },
];

/** Map region name -> region data for O(1) lookup */
export const REGION_MAP: Record<string, RegionData> = Object.fromEntries(
  REGION_DATA.map(r => [r.name, r])
);

/** Influence gained per mission outcome, scaled by region relevance */
export const INFLUENCE_PER_OUTCOME: Record<string, number> = {
  success: 5,
  partial: 2,
  failure: 0,
};

/** Build the default influence record for all regions */
export function buildDefaultInfluence(): Record<string, RegionalInfluence> {
  const result: Record<string, RegionalInfluence> = {};
  for (const r of REGION_DATA) {
    result[r.name] = {
      region: r.name,
      influence: 0,
      maxInfluence: 100,
      unlockedPerks: [],
    };
  }
  return result;
}

/** Given current influence and milestones, compute which perks should be unlocked */
export function computeUnlockedPerks(
  influence: number,
  milestones: InfluenceMilestone[]
): InfluencePerkId[] {
  return milestones
    .filter(m => influence >= m.threshold)
    .map(m => m.perkId);
}

/** Get all active perks across all regions */
export function getAllActivePerks(
  regionalInfluence: Record<string, RegionalInfluence>
): Set<InfluencePerkId> {
  const perks = new Set<InfluencePerkId>();
  for (const ri of Object.values(regionalInfluence)) {
    for (const p of ri.unlockedPerks) perks.add(p);
  }
  return perks;
}
