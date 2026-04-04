import type { Mercenary } from '~/types/mercenary';

export interface BondChange {
  mercId1: string;
  mercId2: string;
  delta: number;
}

const MAX_UINT32 = 0xffffffff;

function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / MAX_UINT32;
}

export function computeMissionBondChanges(
  mercs: Mercenary[],
  outcome: string,
  seed: string
): BondChange[] {
  const changes: BondChange[] = [];
  const ids = mercs.map((m) => m.id);

  // Base delta: success +1, partial +0.5, failure -0.5
  const baseDelta =
    outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : -0.5;

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const pairSeed = seed + ids[i] + ids[j];
      // Small random variance ±0.25
      const variance = (seededRandom(pairSeed + 'var') - 0.5) * 0.5;
      const delta = baseDelta + variance;
      changes.push({ mercId1: ids[i], mercId2: ids[j], delta });
    }
  }

  return changes;
}

export function bondScoreToSentiment(
  score: number
): 'neutral' | 'friendly' | 'close' | 'rival' | 'bonded' {
  if (score >= 8) return 'bonded';
  if (score >= 4) return 'close';
  if (score >= 1) return 'friendly';
  if (score <= -3) return 'rival';
  return 'neutral';
}

/** Apply an array of bond changes to a mutable mercs array (returns updated copies) */
export function applyBondChanges(
  mercs: Mercenary[],
  changes: BondChange[]
): Mercenary[] {
  const updated = mercs.map((m) => ({
    ...m,
    bondScores: { ...(m.bondScores ?? {}) },
  }));

  for (const change of changes) {
    const m1 = updated.find((m) => m.id === change.mercId1);
    const m2 = updated.find((m) => m.id === change.mercId2);
    if (m1) {
      const prev = m1.bondScores![change.mercId2] ?? 0;
      m1.bondScores![change.mercId2] = Math.max(-10, Math.min(10, prev + change.delta));
    }
    if (m2) {
      const prev = m2.bondScores![change.mercId1] ?? 0;
      m2.bondScores![change.mercId1] = Math.max(-10, Math.min(10, prev + change.delta));
    }
  }

  return updated;
}
