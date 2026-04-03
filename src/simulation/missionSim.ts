import type { Mercenary } from '~/types/mercenary';
import type { MissionTemplate, MissionResult, MissionOutcome } from '~/types/mission';

/** Deterministic-ish pseudo-random seeded by input strings */
function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 0xffffffff);
}

/** Score a single merc against a mission */
function scoreMerc(merc: Mercenary, template: MissionTemplate): number {
  const { strength, agility, intellect, presence } = merc.stats;
  let base = strength + agility + intellect + presence;

  // trait bonuses if any tag matches mission tags
  for (const trait of merc.traits) {
    for (const missionTag of template.tags) {
      const tagMap: Record<string, string[]> = {
        combat: ['brave', 'tough', 'reckless'],
        stealth: ['stealthy', 'cautious'],
        social: ['scholarly', 'loyal', 'greedy'],
        exploration: ['scholarly', 'cautious'],
        escort: ['brave', 'loyal', 'tough'],
      };
      if (tagMap[missionTag]?.includes(trait.tag)) {
        base += trait.scoreBonus;
      }
    }
  }

  // penalty for status
  if (merc.isInjured) base -= 4;
  if (merc.isFatigued) base -= 2;

  return Math.max(0, base);
}

export function simulateMission(
  mercs: Mercenary[],
  template: MissionTemplate,
  seed: string
): MissionResult {
  const partyScore = mercs.reduce((sum, m) => sum + scoreMerc(m, template), 0);
  const roll = seededRandom(seed + template.id);

  // margin: positive = over-performed, negative = under-performed
  const margin = partyScore - template.difficulty + (roll * 6 - 3);

  let outcome: MissionOutcome;
  if (margin >= 4) {
    outcome = 'success';
  } else if (margin >= 0) {
    outcome = 'partial';
  } else {
    outcome = 'failure';
  }

  // Gold and renown based on outcome
  const goldMult = outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : 0;
  const renownMult = outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : 0.1;
  const goldEarned = Math.floor(template.reward.gold * goldMult);
  const renownEarned = Math.max(1, Math.floor(template.reward.renown * renownMult));

  // Loot: success = up to 2 items, partial = up to 1, failure = 0
  const lootCount = outcome === 'success' ? 2 : outcome === 'partial' ? 1 : 0;
  const possibleItems = template.reward.possibleItems;
  const itemsEarned: string[] = [];
  for (let i = 0; i < lootCount; i++) {
    const idx = Math.floor(seededRandom(seed + i + outcome) * possibleItems.length);
    itemsEarned.push(possibleItems[idx]);
  }

  // Injury / fatigue
  const injuredMercIds: string[] = [];
  const fatiguedMercIds: string[] = [];
  for (const merc of mercs) {
    const r = seededRandom(seed + merc.id);
    if (outcome === 'failure' && r < 0.4) {
      injuredMercIds.push(merc.id);
    } else if (outcome === 'partial' && r < 0.25) {
      fatiguedMercIds.push(merc.id);
    } else if (outcome === 'success' && r < 0.1) {
      fatiguedMercIds.push(merc.id);
    }
  }

  return {
    templateId: template.id,
    mercIds: mercs.map((m) => m.id),
    outcome,
    goldEarned,
    renownEarned,
    itemsEarned,
    injuredMercIds,
    fatiguedMercIds,
    flavorText: template.flavorText[outcome],
    partyScore,
    difficulty: template.difficulty,
  };
}
