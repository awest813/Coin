import type { Mercenary } from '~/types/mercenary';
import type {
  ExpeditionTemplate,
  ExpeditionStageResult,
  ExpeditionResult,
  ActiveExpedition,
} from '~/types/expedition';
import type { MissionOutcome } from '~/types/mission';
import { EXPEDITION_TEMPLATES } from '~/data/expeditions';

const MAX_UINT32 = 0xffffffff;

function seededRandom(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / MAX_UINT32;
}

function partyScore(mercs: Mercenary[]): number {
  return mercs.reduce((sum, m) => {
    const { strength, agility, intellect, presence } = m.stats;
    let score = strength + agility + intellect + presence;
    if (m.isInjured) score -= 4;
    if (m.isFatigued) score -= 2;
    if (m.morale < 3) score -= 2;
    else if (m.morale < 5) score -= 1;
    return sum + Math.max(0, score);
  }, 0);
}

export function simulateExpeditionStage(
  mercs: Mercenary[],
  template: ExpeditionTemplate,
  stageIndex: number,
  seed: string,
  consumableItemIds: string[]
): ExpeditionStageResult {
  const stage = template.stages[stageIndex];
  const difficulty = template.baseDifficulty + stage.difficultyMod;
  const score = partyScore(mercs);

  // Consumable bonuses
  let consumableBonus = 0;
  let injuryProtection = 0;
  let fatigueProtection = 0;
  let smokeUsed = false;

  for (const itemId of consumableItemIds) {
    switch (itemId) {
      case 'bandages':
        injuryProtection += 0.2;
        break;
      case 'field_rations':
        fatigueProtection += 0.2;
        break;
      case 'torch_bundle':
        if (stage.type === 'hazard' || stage.type === 'objective') consumableBonus += 1;
        break;
      case 'lucky_salve':
        consumableBonus += 0.5;
        break;
      case 'smoke_bomb':
        smokeUsed = true;
        break;
    }
  }

  const roll = seededRandom(seed + template.id + stageIndex);
  const margin = score + consumableBonus - difficulty + (roll * 6 - 3);

  let outcome: MissionOutcome;
  if (margin >= 4) {
    outcome = 'success';
  } else if (margin >= 0) {
    outcome = 'partial';
  } else {
    // smoke bomb converts first failure to partial
    outcome = smokeUsed ? 'partial' : 'failure';
  }

  // Gold bonus for stage
  const goldBonus =
    outcome === 'success'
      ? Math.floor(template.reward.gold * 0.2)
      : outcome === 'partial'
      ? Math.floor(template.reward.gold * 0.1)
      : 0;

  // Materials found
  const materialsFound: Array<{ materialId: string; quantity: number }> = [];
  if (outcome !== 'failure' && template.reward.possibleMaterials.length > 0) {
    const matSeed = seed + 'mat' + stageIndex;
    if (seededRandom(matSeed) < 0.6) {
      const matId =
        template.reward.possibleMaterials[
          Math.floor(seededRandom(matSeed + 'pick') * template.reward.possibleMaterials.length)
        ];
      materialsFound.push({ materialId: matId, quantity: 1 });
    }
  }

  // Items found (only on success stages)
  const itemsFound: string[] = [];
  if (outcome === 'success' && seededRandom(seed + 'item' + stageIndex) < 0.25) {
    const itemPool = template.reward.possibleItems;
    itemsFound.push(
      itemPool[Math.floor(seededRandom(seed + 'itempick' + stageIndex) * itemPool.length)]
    );
  }

  // Injuries and fatigue
  const injuredMercIds: string[] = [];
  const fatiguedMercIds: string[] = [];
  for (const merc of mercs) {
    const r = seededRandom(seed + merc.id + 'stagstatus' + stageIndex);
    if (outcome === 'failure' && r < Math.max(0.05, 0.35 - injuryProtection)) {
      injuredMercIds.push(merc.id);
    } else if (outcome === 'partial' && r < Math.max(0.05, 0.2 - fatigueProtection)) {
      fatiguedMercIds.push(merc.id);
    } else if (outcome === 'success' && r < Math.max(0, 0.08 - fatigueProtection)) {
      fatiguedMercIds.push(merc.id);
    }
  }

  // Pick a narrative snippet
  const eventPool = stage.eventPool;
  const narrative = eventPool[Math.floor(seededRandom(seed + 'narr' + stageIndex) * eventPool.length)];

  return {
    stageIndex,
    stageType: stage.type,
    outcome,
    narrative,
    goldBonus,
    materialsFound,
    itemsFound,
    injuredMercIds,
    fatiguedMercIds,
  };
}

export function finalizeExpedition(
  mercs: Mercenary[],
  template: ExpeditionTemplate,
  activeExpedition: ActiveExpedition,
  finalStageSeed: string
): ExpeditionResult {
  const allStageResults = [...activeExpedition.stageResults];

  // Simulate the final stage
  const finalStageResult = simulateExpeditionStage(
    mercs,
    template,
    activeExpedition.currentStageIndex,
    finalStageSeed,
    activeExpedition.consumablesAssigned
  );
  allStageResults.push(finalStageResult);

  // Total outcome: majority of stage outcomes
  const outcomes = allStageResults.map((r) => r.outcome);
  const successCount = outcomes.filter((o) => o === 'success').length;
  const failCount = outcomes.filter((o) => o === 'failure').length;
  const totalOutcome: MissionOutcome =
    successCount > allStageResults.length / 2
      ? 'success'
      : failCount > allStageResults.length / 2
      ? 'failure'
      : 'partial';

  // Aggregate gold
  const bonusGold = allStageResults.reduce((s, r) => s + r.goldBonus, 0);
  const baseGoldMult =
    totalOutcome === 'success' ? 1 : totalOutcome === 'partial' ? 0.5 : 0;
  const goldEarned = Math.floor(template.reward.gold * baseGoldMult) + bonusGold;

  // Renown
  const renownMult =
    totalOutcome === 'success' ? 1 : totalOutcome === 'partial' ? 0.5 : 0.1;
  const renownEarned = Math.max(1, Math.floor(template.reward.renown * renownMult));

  // Aggregate materials
  const matMap: Record<string, number> = {};
  for (const sr of allStageResults) {
    for (const mf of sr.materialsFound) {
      matMap[mf.materialId] = (matMap[mf.materialId] ?? 0) + mf.quantity;
    }
  }
  const materialsEarned = Object.entries(matMap).map(([materialId, quantity]) => ({
    materialId,
    quantity,
  }));

  // Aggregate items
  const itemsEarned = allStageResults.flatMap((r) => r.itemsFound);

  // Aggregate injuries/fatigue (last state wins per merc)
  const injuredMercIds = [
    ...new Set(allStageResults.flatMap((r) => r.injuredMercIds)),
  ];
  const fatiguedMercIds = [
    ...new Set(
      allStageResults
        .flatMap((r) => r.fatiguedMercIds)
        .filter((id) => !injuredMercIds.includes(id))
    ),
  ];

  // Bond changes: based on stages survived together
  const stagesSurvived = allStageResults.filter((r) => r.outcome !== 'failure').length;
  const bondDelta = stagesSurvived * 0.5;
  const mercIds = activeExpedition.assignedMercIds;
  const bondChanges: Array<{ mercId1: string; mercId2: string; delta: number }> = [];
  for (let i = 0; i < mercIds.length; i++) {
    for (let j = i + 1; j < mercIds.length; j++) {
      bondChanges.push({ mercId1: mercIds[i], mercId2: mercIds[j], delta: bondDelta });
    }
  }

  return {
    templateId: template.id,
    mercIds,
    totalOutcome,
    goldEarned,
    renownEarned,
    itemsEarned,
    materialsEarned,
    injuredMercIds,
    fatiguedMercIds,
    stageResults: allStageResults,
    bondChanges,
  };
}

export function getExpeditionTemplate(templateId: string): ExpeditionTemplate | undefined {
  return EXPEDITION_TEMPLATES.find((t) => t.id === templateId);
}
