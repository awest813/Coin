import { EVENT_TEMPLATES } from '~/data/events';
import type { PendingEvent, GameEventTemplate } from '~/types/event';
import type { Mercenary } from '~/types/mercenary';

const MAX_UINT32 = 0xffffffff;

function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / MAX_UINT32;
}

function resolvePlaceholders(
  text: string,
  mercs: Mercenary[],
  guildName: string
): string {
  let result = text;
  result = result.replace(/\{guild\}/g, guildName);
  if (mercs.length > 0) {
    result = result.replace(/\{merc1\}/g, mercs[0].name);
  }
  if (mercs.length > 1) {
    result = result.replace(/\{merc2\}/g, mercs[1].name);
  }
  return result;
}

function checkConditions(
  template: GameEventTemplate,
  mercs: Mercenary[],
  guildRenown: number
): boolean {
  const cond = template.conditions;
  if (!cond) return true;
  if (cond.minRenown !== undefined && guildRenown < cond.minRenown) return false;
  if (cond.maxRenown !== undefined && guildRenown > cond.maxRenown) return false;
  if (cond.requiresInjured && !mercs.some((m) => m.isInjured)) return false;
  if (cond.requiresBonded && !mercs.some((m) => Object.values(m.bondScores ?? {}).some((s) => s >= 8))) return false;
  return true;
}

export function generateGuildEvents(
  mercs: Mercenary[],
  guildRenown: number,
  trigger: string,
  seed: string,
  guildName = 'The Guild',
  count = 1
): PendingEvent[] {
  const eligible = EVENT_TEMPLATES.filter(
    (t) => t.trigger === trigger && checkConditions(t, mercs, guildRenown)
  );

  if (eligible.length === 0) return [];

  // Weighted random selection
  const totalWeight = eligible.reduce((s, t) => s + t.weight, 0);
  const results: PendingEvent[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    const roll = seededRandom(seed + 'pick' + i) * totalWeight;
    let cumulative = 0;
    let picked: GameEventTemplate | null = null;
    for (const t of eligible) {
      if (usedIds.has(t.id)) continue;
      cumulative += t.weight;
      if (roll < cumulative) {
        picked = t;
        break;
      }
    }
    if (!picked) picked = eligible[eligible.length - 1];
    usedIds.add(picked.id);

    // Pick 1-2 mercs for the event
    const shuffled = [...mercs].sort(
      (a, b) => seededRandom(seed + a.id + i) - seededRandom(seed + b.id + i)
    );
    const involvedMercs = shuffled.slice(0, Math.min(2, shuffled.length));
    const involvedMercIds = involvedMercs.map((m) => m.id);

    const resolvedText = resolvePlaceholders(picked.text, involvedMercs, guildName);
    const resolvedTitle = resolvePlaceholders(picked.title, involvedMercs, guildName);

    // Resolve choice labels too
    const resolvedChoices = picked.choices?.map((c) => ({
      ...c,
      label: resolvePlaceholders(c.label, involvedMercs, guildName),
      outcomeText: resolvePlaceholders(c.outcomeText, involvedMercs, guildName),
    }));

    const resolvedAutoOutcome = picked.autoOutcome
      ? {
          ...picked.autoOutcome,
          label: resolvePlaceholders(picked.autoOutcome.label, involvedMercs, guildName),
          outcomeText: resolvePlaceholders(
            picked.autoOutcome.outcomeText,
            involvedMercs,
            guildName
          ),
        }
      : undefined;

    results.push({
      id: `event_${seed}_${i}_${picked.id}`,
      templateId: picked.id,
      title: resolvedTitle,
      text: resolvedText,
      choices: resolvedChoices,
      autoOutcome: resolvedAutoOutcome,
      involvedMercIds,
    });
  }

  return results;
}
