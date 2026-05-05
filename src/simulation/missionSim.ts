import type { Mercenary } from '~/types/mercenary';
import type { Item } from '~/types/item';
import type { MissionTemplate, MissionResult, MissionOutcome, ScoreBreakdownEntry, SynergyBonus } from '~/types/mission';
import type { RoomUpgrade } from '~/types/guild';
import { ITEMS_MAP } from '~/data/items';
import { ARTIFACTS_MAP } from '~/data/artifacts';

const MAX_UINT32 = 0xffffffff;

/** Deterministic-ish pseudo-random seeded by input strings */
function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / MAX_UINT32;
}

/** Return the equipped items for a merc from the global item registry */
function getEquippedItems(merc: Mercenary, durability?: Partial<Record<EquipmentSlot, number>>): { item: Item; dur: number }[] {
  const items: { item: Item; dur: number }[] = [];
  for (const [slot, itemId] of Object.entries(merc.equipment)) {
    if (itemId) {
      const item = ITEMS_MAP[itemId];
      const dur = durability?.[slot as EquipmentSlot] ?? 100;
      if (item) items.push({ item, dur });
    }
  }
  return items;
}

/** Total stat bonus from equipped items for a given stat */
function equipStatBonus(merc: Mercenary, stat: 'strength' | 'agility' | 'intellect' | 'presence', durability?: Partial<Record<EquipmentSlot, number>>): number {
  return getEquippedItems(merc, durability).reduce((sum, { item, dur }) => {
    if (dur <= 0) return sum; // Broken items give no bonus
    return sum + (item.statBonus?.[stat] ?? 0);
  }, 0);
}

/** Score a single merc against a mission, returning a full breakdown entry */
function scoreMercDetailed(
  merc: Mercenary,
  template: MissionTemplate,
  partyMercIds: string[],
  durability?: Partial<Record<EquipmentSlot, number>>
): ScoreBreakdownEntry {
  const { strength, agility, intellect, presence } = merc.stats;

  // Base = sum of raw stats + equipment bonuses
  const rawStats = strength + agility + intellect + presence;
  const equipBonus =
    equipStatBonus(merc, 'strength', durability) +
    equipStatBonus(merc, 'agility', durability) +
    equipStatBonus(merc, 'intellect', durability) +
    equipStatBonus(merc, 'presence', durability);
  const baseScore = rawStats + equipBonus;

  // Trait bonuses when tags match
  const tagMap: Record<string, string[]> = {
    combat: ['brave', 'tough', 'reckless', 'ruthless'],
    stealth: ['stealthy', 'cautious', 'hunter'],
    social: ['scholarly', 'loyal', 'greedy', 'charismatic'],
    exploration: ['scholarly', 'cautious', 'hunter'],
    escort: ['brave', 'loyal', 'tough'],
    hunt: ['hunter', 'cautious', 'stealthy'],
    bounty: ['brave', 'ruthless', 'tough'],
    ruin: ['scholarly', 'cautious', 'cursed'],
  };
  let traitBonus = 0;
  for (const trait of merc.traits) {
    for (const missionTag of template.tags) {
      if (tagMap[missionTag]?.includes(trait.tag)) {
        traitBonus += trait.scoreBonus;
      }
    }
  }

  // Relationship bonus: +1 per friend/bonded in the party; -1 per rival
  let relBonus = 0;
  for (const rel of merc.relationships) {
    if (!partyMercIds.includes(rel.mercId)) continue;
    if (rel.sentiment === 'bonded') relBonus += 2;
    else if (rel.sentiment === 'friend') relBonus += 1;
    else if (rel.sentiment === 'rival') relBonus -= 1;
  }

  // Status penalties
  let statusPenalty = 0;
  if (merc.isInjured) statusPenalty += 4;
  if (merc.isFatigued) statusPenalty += 2;
  // Low morale penalty (morale < 5 = -1, morale < 3 = -2)
  if (merc.morale < 3) statusPenalty += 2;
  else if (merc.morale < 5) statusPenalty += 1;

  const total = Math.max(0, baseScore + traitBonus + relBonus - statusPenalty);

  return {
    mercName: merc.name,
    baseScore: rawStats,
    traitBonus,
    equipBonus,
    relBonus,
    statusPenalty,
    total,
  };
}

/** Pick a narrative event snippet from a mission template + seed */
function pickEventSnippets(
  template: MissionTemplate,
  outcome: MissionOutcome,
  seed: string,
  mercs: Mercenary[]
): string[] {
  const snippets: string[] = [];

  // Add outcome flavor
  snippets.push(template.flavorText[outcome]);

  // Add 0-2 additional event snippets if available
  const pool = template.eventSnippets ?? [];
  if (pool.length > 0) {
    const idx = Math.floor(seededRandom(seed + 'event0') * pool.length);
    snippets.push(pool[idx]);
    if (pool.length > 1 && seededRandom(seed + 'event1') < 0.5) {
      const idx2 = (idx + 1 + Math.floor(seededRandom(seed + 'event2') * (pool.length - 1))) % pool.length;
      snippets.push(pool[idx2]);
    }
  }

  // Relationship-based narrative lines
  for (const merc of mercs) {
    for (const rel of merc.relationships) {
      const other = mercs.find((m) => m.id === rel.mercId);
      if (!other) continue;
      if (rel.sentiment === 'bonded' && seededRandom(seed + merc.id + 'bond') < 0.6) {
        snippets.push(`${merc.name} and ${other.name} worked as one — something unspoken, but unmistakable.`);
      } else if (rel.sentiment === 'rival' && seededRandom(seed + merc.id + 'riv') < 0.4) {
        snippets.push(`${merc.name} and ${other.name} argued tactics on the road back. Old habits.`);
      }
    }
  }

  return snippets;
}

export interface SimulationOptions {
  /** Current forge room level (1–3); affects loot quantity/quality */
  forgeLevel?: number;
  /** Consumable item IDs assigned to this mission */
  consumableItemIds?: string[];
  /** IDs of artifacts currently unlocked by the guild */
  unlockedArtifactIds?: string[];
  /** IDs of active perks unlocked via influence */
  activePerkIds?: string[];
  /** IDs of active guild policies */
  activePolicyIds?: string[];
  /** Guild morale (0–100). High morale boosts party score; low morale increases injury risk. */
  guildMorale?: number;
  /** IDs of strategic assets unlocked in the War Room */
  unlockedStrategicAssetIds?: string[];
}

function computeSynergies(mercs: Mercenary[]): SynergyBonus[] {
  const synergies: SynergyBonus[] = [];
  if (mercs.length < 2) return synergies;

  // 1. Double Trouble: 2+ mercs with same combat-relevant trait
  const traits = mercs.flatMap(m => m.traits.map(t => t.tag));
  const combatTraits = ['brave', 'tough', 'reckless', 'ruthless', 'hunter'];
  for (const tag of combatTraits) {
    if (traits.filter(t => t === tag).length >= 2) {
      synergies.push({
        name: `Double ${tag.charAt(0).toUpperCase() + tag.slice(1)}`,
        scoreBonus: 2,
        description: `Multiple specialists with the ${tag} trait coordinate their tactics.`
      });
      break; // Only one "Double" bonus
    }
  }

  // 2. Veteran Pair: 2+ mercs with 10+ missions completed
  if (mercs.filter(m => m.missionsCompleted >= 10).length >= 2) {
    synergies.push({
      name: 'Veteran Coordination',
      scoreBonus: 3,
      description: 'Battle-hardened mercenaries move with instinctive precision.'
    });
  }

  // 3. Perfect Balance: At least one Strength and one Intellect focused merc (stat > 7)
  const hasStrong = mercs.some(m => m.stats.strength > 7);
  const hasSmart = mercs.some(m => m.stats.intellect > 7);
  if (hasStrong && hasSmart) {
    synergies.push({
      name: 'Brains & Brawn',
      scoreBonus: 2.5,
      description: 'Tactical planning meets raw physical force.'
    });
  }

  return synergies;
}

export function simulateMission(
  mercs: Mercenary[],
  template: MissionTemplate,
  seed: string,
  options: SimulationOptions = {}
): MissionResult {
  const partyMercIds = mercs.map((m) => m.id);
  const scoreBreakdown: ScoreBreakdownEntry[] = mercs.map((m) =>
    scoreMercDetailed(m, template, partyMercIds, m.equipmentDurability)
  );
  
  const synergies = computeSynergies(mercs);
  const synergyScore = synergies.reduce((sum, s) => sum + s.scoreBonus, 0);
  
  let partyScore = scoreBreakdown.reduce((sum, e) => sum + e.total, 0) + synergyScore;

  const activeArtifacts = (options.unlockedArtifactIds ?? []).map(id => ARTIFACTS_MAP[id]).filter(Boolean);
  const activePerks = new Set(options.activePerkIds ?? []);
  const activePolicies = new Set(options.activePolicyIds ?? []);

  // ── Modifiers ─────────────────────────────────────────────────────────────
  
  // Consumable effects
  const consumables = options.consumableItemIds ?? [];
  let injuryProtection = 0;
  let fatigueProtection = 0;
  let smokeUsed = false;
  for (const itemId of consumables) {
    switch (itemId) {
      case 'bandages': injuryProtection += 0.2; break;
      case 'field_rations': fatigueProtection += 0.2; break;
      case 'torch_bundle':
        if (template.tags.includes('ruin') || template.tags.includes('exploration')) partyScore += 1;
        break;
      case 'lucky_salve': partyScore += 0.5; break;
      case 'smoke_bomb': smokeUsed = true; break;
    }
  }

  // Artifact Modifier: success_chance (Score Boost)
  const successMod = activeArtifacts.reduce((acc, art) => {
    const mod = art.modifiers.find(m => m.type === 'success_chance' || (m.type as string) === 'mission_success');
    return acc + (mod?.value ?? 0);
  }, 0);
  partyScore += successMod;

  // Perk Modifier: pale_border_veterans (+1 score in Pale Border)
  if (activePerks.has('pale_border_veterans') && template.region === 'Pale Border') {
    partyScore += 1;
  }

  // Guild Morale Modifier
  const morale = options.guildMorale ?? 50;
  let moraleInjuryPenalty = 0;
  if (morale >= 80) {
    partyScore *= 1.05; // High morale: +5% party score
  } else if (morale < 30) {
    partyScore *= 0.95; // Low morale: -5% party score
    moraleInjuryPenalty = 0.10; // Low morale: +10% injury chance
  }

  // Artifact Modifier: injury_chance & fatigue_chance (Reduction)
  const injuryMod = activeArtifacts.reduce((acc, art) => {
    const mod = art.modifiers.find(m => m.type === 'injury_chance');
    return acc + (mod?.value ?? 0);
  }, 0);
  injuryProtection += Math.abs(injuryMod); 

  const fatigueMod = activeArtifacts.reduce((acc, art) => {
    const mod = art.modifiers.find(m => m.type === 'fatigue_chance');
    return acc + (mod?.value ?? 0);
  }, 0);
  fatigueProtection += Math.abs(fatigueMod);

  // Policy Modifier: safety_first
  if (activePolicies.has('safety_first')) {
    partyScore -= 2; // Slower, more cautious approach
    injuryProtection += 0.3;
    fatigueProtection += 0.2;
  }

  // ── Strategic Assets ──────────────────────────────────────────────────────
  const assets = new Set(options.unlockedStrategicAssetIds ?? []);
  if (assets.has('asset_siege_train') && template.tags.includes('combat')) {
    partyScore += 3;
    synergies.push({ name: 'Siege Train', scoreBonus: 3, description: 'Heavy ordnance clears the path.' });
  }
  if (assets.has('asset_intelligence_network') && (template.tags.includes('stealth') || template.tags.includes('social'))) {
    partyScore += 2;
    synergies.push({ name: 'Intel Network', scoreBonus: 2, description: 'Inside information on enemy movements.' });
  }
  if (assets.has('asset_veteran_trainers')) {
    // Note: XP bonus applied in store when processing result (not implemented yet)
  }

  // ── Resolution ────────────────────────────────────────────────────────────

  const roll = seededRandom(seed + template.id);

  // margin: positive = over-performed, negative = under-performed
  const margin = partyScore - template.difficulty + (roll * 6 - 3);

  let outcome: MissionOutcome;
  if (margin >= 4) {
    outcome = 'success';
  } else if (margin >= 0) {
    outcome = 'partial';
  } else {
    // smoke bomb converts first failure to partial
    outcome = smokeUsed ? 'partial' : 'failure';
  }

  // Gold and renown based on outcome (Perks/Artifacts applied at store level)
  const goldMult = outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : 0;
  const renownMult = outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : 0.1;
  const goldEarned = Math.floor(template.reward.gold * goldMult);
  const renownEarned = Math.max(1, Math.floor(template.reward.renown * renownMult));

  // Loot: forge level improves loot count ceiling
  const forgeLevel = options.forgeLevel ?? 1;
  const baseMax = outcome === 'success' ? 2 : outcome === 'partial' ? 1 : 0;
  const lootCount = Math.min(baseMax + Math.max(0, forgeLevel - 1), 3);
  const possibleItems = template.reward.possibleItems;
  const itemsEarned: string[] = [];
  for (let i = 0; i < lootCount; i++) {
    const idx = Math.floor(seededRandom(`${seed}-loot-${i}-${outcome}`) * possibleItems.length);
    itemsEarned.push(possibleItems[idx]);
  }

  // Injury / fatigue
  const injuredMercIds: string[] = [];
  const fatiguedMercIds: string[] = [];
  // Low morale increases injury risk (moraleInjuryPenalty is positive, subtracted from protection)
  const effectiveInjuryProtection = injuryProtection - moraleInjuryPenalty;
  for (const merc of mercs) {
    const r = seededRandom(seed + merc.id + 'status');
    if (outcome === 'failure' && r < Math.max(0.05, 0.4 - effectiveInjuryProtection)) {
      injuredMercIds.push(merc.id);
    } else if (outcome === 'partial' && r < Math.max(0.05, 0.25 - (fatigueProtection + effectiveInjuryProtection * 0.5))) {
      fatiguedMercIds.push(merc.id);
    } else if (outcome === 'success' && r < Math.max(0, 0.1 - (fatigueProtection + effectiveInjuryProtection * 0.5))) {
      fatiguedMercIds.push(merc.id);
    }
  }

  const narrativeEvents = pickEventSnippets(template, outcome, seed, mercs);

  return {
    missionRunId: seed,
    templateId: template.id,
    mercIds: partyMercIds,
    outcome,
    goldEarned,
    renownEarned,
    itemsEarned,
    injuredMercIds,
    fatiguedMercIds,
    flavorText: template.flavorText[outcome],
    partyScore,
    difficulty: template.difficulty,
    scoreBreakdown,
    synergies,
    narrativeEvents,
    durabilityLoss: mercs.map(m => {
      const loss: Partial<Record<EquipmentSlot, number>> = {};
      const baseLoss = outcome === 'failure' ? 10 : outcome === 'partial' ? 5 : 2;
      for (const slot of Object.keys(m.equipment)) {
        loss[slot as EquipmentSlot] = baseLoss + Math.floor(seededRandom(seed + m.id + slot) * 5);
      }
      return { mercId: m.id, loss };
    }),
  };
}

/** Helper: get the mechanical effect value for a given key from a room at its current level */
export function getRoomEffect(room: RoomUpgrade, key: string): number {
  const levelData = room.levels[room.level - 1];
  return levelData?.effects[key] ?? 0;
}
