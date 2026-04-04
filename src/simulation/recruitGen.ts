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

  // Hire cost: base + stat total modifier
  const statTotal = stats.strength + stats.agility + stats.intellect + stats.presence;
  const hireCost = archetype.hireCostBase + Math.floor((statTotal - 20) * 2.5);

  return {
    id: `recruit_${seed}`,
    name,
    title,
    portrait,
    classRole: archetype.classRole,
    background,
    stats,
    traits: pickedTraits,
    hireCost: Math.max(archetype.hireCostBase - 20, hireCost),
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
