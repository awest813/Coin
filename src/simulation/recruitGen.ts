import { RECRUIT_ARCHETYPES } from '~/data/recruits';
import type { GeneratedRecruit } from '~/types/recruit';
import type { TraitTag } from '~/types/mercenary';

const MAX_UINT32 = 0xffffffff;

function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / MAX_UINT32;
}

function seededInt(seed: string, min: number, max: number): number {
  return min + Math.floor(seededRandom(seed) * (max - min + 1));
}

function seededPick<T>(seed: string, arr: T[]): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

const FIRST_NAMES = [
  'Aras', 'Bren', 'Cori', 'Daven', 'Elda', 'Finn', 'Gara', 'Holt', 'Iri', 'Joss',
  'Kael', 'Lena', 'Mave', 'Nico', 'Orla', 'Pell', 'Quen', 'Risa', 'Sela', 'Tarn',
  'Ura', 'Vex', 'Wren', 'Xara', 'Yeln', 'Zora',
];

const LAST_NAMES = [
  'Ash', 'Breck', 'Cole', 'Dusk', 'Embers', 'Flint', 'Grey', 'Holt', 'Iron', 'Jave',
  'Keld', 'Lorne', 'Marsh', 'Nite', 'Oak', 'Pike', 'Quill', 'Reed', 'Stone', 'Thorne',
  'Umber', 'Vale', 'Wick', 'Xen', 'Yore', 'Zale',
];

export function generateRecruit(seed: string): GeneratedRecruit {
  const archetype = seededPick(seed + 'arch', RECRUIT_ARCHETYPES);
  const firstName = seededPick(seed + 'fn', FIRST_NAMES);
  const lastName = seededPick(seed + 'ln', LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const title = seededPick(seed + 'title', archetype.titlePool);
  const portrait = seededPick(seed + 'portrait', archetype.portraitPool);
  const background = seededPick(seed + 'bg', archetype.backgroundLines);

  const { strength, agility, intellect, presence } = archetype.statRanges;
  const stats = {
    strength: seededInt(seed + 'str', strength[0], strength[1]),
    agility: seededInt(seed + 'agi', agility[0], agility[1]),
    intellect: seededInt(seed + 'int', intellect[0], intellect[1]),
    presence: seededInt(seed + 'pre', presence[0], presence[1]),
  };

  const isVeteran = seededRandom(seed + 'vet') < 0.10; // 10% chance
  if (isVeteran) {
    stats.strength = Math.min(10, stats.strength + 1);
    stats.agility = Math.min(10, stats.agility + 1);
    stats.intellect = Math.min(10, stats.intellect + 1);
    stats.presence = Math.min(10, stats.presence + 1);
  }

  // Pick 1-2 traits from the archetype's pool
  const traitCount = seededRandom(seed + 'traitc') < 0.5 ? 1 : 2;
  const shuffledTraits = [...archetype.traitPool].sort(
    (a, b) => seededRandom(seed + a.tag) - seededRandom(seed + b.tag)
  );
  const pickedTraits = shuffledTraits.slice(0, traitCount).map((t, i) => ({
    id: `trait_recruit_${seed}_${i}`,
    name: t.name,
    tag: t.tag as TraitTag,
    description: t.description,
    scoreBonus: t.scoreBonus,
  }));

  if (isVeteran) {
    pickedTraits.push({
      id: `trait_recruit_${seed}_vet`,
      name: 'Veteran of the Pits',
      tag: 'brave' as TraitTag,
      description: 'This fighter has survived dozens of arena matches. +3 score in combat.',
      scoreBonus: 3
    });
  }

  // Hire cost: base + stat total modifier
  const statTotal = stats.strength + stats.agility + stats.intellect + stats.presence;
  const hireCost = archetype.hireCostBase + Math.floor((statTotal - 20) * 2.5);

  // Generate starting skills based on classRole
  const skills: Record<string, number> = {};
  if (archetype.classRole === 'Sellsword' || archetype.classRole === 'Tribal Warrior' || archetype.classRole === 'Former Guard') {
    skills.tactics = seededInt(seed + 'sk1', 5, 15);
  } else if (archetype.classRole === 'Scout' || archetype.classRole === 'Wilderness Ranger') {
    skills.survival = seededInt(seed + 'sk2', 10, 20);
    skills.subterfuge = seededInt(seed + 'sk3', 5, 10);
  } else if (archetype.classRole === 'Street Thief' || archetype.classRole === 'Pirate Deserter') {
    skills.subterfuge = seededInt(seed + 'sk4', 10, 25);
  } else if (archetype.classRole === 'Hedge Witch' || archetype.classRole === 'Hedge Mage' || archetype.classRole === 'Field Surgeon') {
    skills.survival = seededInt(seed + 'sk5', 5, 15);
    skills.negotiation = seededInt(seed + 'sk6', 5, 10);
  } else if (archetype.classRole === 'Disgraced Noble' || archetype.classRole === 'Wandering Monk') {
    skills.negotiation = seededInt(seed + 'sk7', 10, 20);
    skills.tactics = seededInt(seed + 'sk8', 5, 10);
  }

  return {
    id: `recruit_${seed}`,
    name,
    title,
    portrait,
    classRole: archetype.classRole,
    background,
    stats,
    traits: pickedTraits,
    skills,
    hireCost: isVeteran ? Math.floor(hireCost * 1.5) : Math.max(archetype.hireCostBase - 20, hireCost),
    level: isVeteran ? 3 : 1,
    isVeteran,
    archetypeId: archetype.id,
  };
}

export function generateRecruitBatch(count: number, seed: string): GeneratedRecruit[] {
  const results: GeneratedRecruit[] = [];
  for (let i = 0; i < count; i++) {
    results.push(generateRecruit(`${seed}_${i}`));
  }
  return results;
}
