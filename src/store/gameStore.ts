import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mercenary, EquipmentSlot } from '~/types/mercenary';
import type { Item } from '~/types/item';
import type { ActiveMission, MissionResult } from '~/types/mission';
import type { Guild, RoomUpgrade } from '~/types/guild';
import type { GeneratedRecruit } from '~/types/recruit';
import type { PendingEvent } from '~/types/event';
import type { ActiveExpedition, ExpeditionResult } from '~/types/expedition';
import { SAVE_VERSION } from '~/types/save';
import { INITIAL_MERCENARIES } from '~/data/mercenaries';
import { ITEMS_MAP } from '~/data/items';
import { EXPEDITION_TEMPLATES } from '~/data/expeditions';
import { generateRecruitBatch } from '~/simulation/recruitGen';
import { computeMissionBondChanges, applyBondChanges } from '~/simulation/bondSim';
import { generateGuildEvents } from '~/simulation/eventSim';
import {
  simulateExpeditionStage,
  finalizeExpedition,
} from '~/simulation/expeditionSim';
import { RECIPES } from '~/data/recipes';

export type ActiveScreen =
  | 'dashboard'
  | 'roster'
  | 'missions'
  | 'inventory'
  | 'workshop'
  | 'hiring'
  | 'expeditions';

// Guild rank thresholds (contracts completed)
const RANK_THRESHOLDS = [0, 5, 15, 30, 50];
const RANK_NAMES = [
  'Scratch Crew',
  'Known Band',
  'Established Guild',
  'Respected Order',
  'Legendary Company',
];

export function getGuildRankName(rank: number): string {
  return RANK_NAMES[Math.min(rank - 1, RANK_NAMES.length - 1)];
}

export function getNextRankThreshold(rank: number): number {
  return RANK_THRESHOLDS[Math.min(rank, RANK_THRESHOLDS.length - 1)] ?? 50;
}

/** Max concurrent missions allowed based on guild rank */
export function maxConcurrentMissions(guildRank: number): number {
  if (guildRank >= 4) return 3;
  if (guildRank >= 2) return 2;
  return 1;
}

interface GameState {
  guild: Guild;
  mercenaries: Mercenary[];
  items: Record<string, Item>;
  /** All currently active missions (multiple allowed based on guild rank) */
  activeMissions: ActiveMission[];
  lastResult: MissionResult | null;
  activeScreen: ActiveScreen;
  showResultModal: boolean;

  // Recruiting
  availableRecruits: GeneratedRecruit[];
  lastRecruitRefresh: string;

  // Events
  pendingEvents: PendingEvent[];

  // Expeditions
  activeExpedition: ActiveExpedition | null;
  lastExpeditionResult: ExpeditionResult | null;
  showExpeditionResult: boolean;

  // navigation
  setScreen: (screen: ActiveScreen) => void;
  // mission
  addActiveMission: (mission: ActiveMission) => void;
  applyMissionResult: (result: MissionResult) => void;
  dismissResult: () => void;
  // merc management
  updateMercenary: (merc: Mercenary) => void;
  equipItem: (mercId: string, slot: EquipmentSlot, itemId: string) => void;
  unequipItem: (mercId: string, slot: EquipmentSlot) => void;
  // inventory management
  sellItem: (itemId: string) => void;
  // guild management
  upgradeRoom: (roomId: string) => void;
  resetSave: () => void;
  // crafting
  craftItem: (recipeId: string) => void;
  // recruiting
  generateRecruits: () => void;
  hireRecruit: (recruitId: string) => void;
  // events
  dismissEvent: (eventId: string) => void;
  resolveEventChoice: (eventId: string, choiceIndex: number) => void;
  // expeditions
  startExpedition: (templateId: string, mercIds: string[], consumableItemIds: string[]) => void;
  advanceExpeditionStage: () => void;
  dismissExpeditionResult: () => void;
  // progression
  checkProgressionUnlocks: () => void;
}

const defaultRooms = (): RoomUpgrade[] => [
  {
    id: 'room_barracks',
    name: 'Barracks',
    icon: '🛏️',
    description: 'Bunks and basic recovery for the guild roster.',
    level: 1,
    maxLevel: 3,
    levels: [
      {
        description: 'Basic bunks. Mercs recover from fatigue between missions.',
        effects: { rosterCap: 6, recoveryBonus: 0 },
        upgradeCost: { gold: 200, supplies: 10, renown: 5 },
      },
      {
        description: 'Proper beds and a healer on rotation. Injuries heal faster.',
        effects: { rosterCap: 9, recoveryBonus: 1 },
        upgradeCost: { gold: 400, supplies: 20, renown: 15 },
      },
      {
        description: 'Full infirmary wing. Mercs bounce back quickly.',
        effects: { rosterCap: 12, recoveryBonus: 2 },
        upgradeCost: { gold: 0, supplies: 0, renown: 0 },
      },
    ],
  },
  {
    id: 'room_tavern',
    name: 'Common Room',
    icon: '🍺',
    description: 'Where mercs rest, drink, and build bonds. Or feuds.',
    level: 1,
    maxLevel: 3,
    levels: [
      {
        description: 'A hearth and a keg. Morale holds steady after tough missions.',
        effects: { moraleBonus: 0, eventChance: 0 },
        upgradeCost: { gold: 200, supplies: 15, renown: 5 },
      },
      {
        description: 'Good food and music. Morale recovers faster. Stories spread.',
        effects: { moraleBonus: 1, eventChance: 1 },
        upgradeCost: { gold: 350, supplies: 25, renown: 12 },
      },
      {
        description: 'Legendary hospitality. Mercs talk about this place in other towns.',
        effects: { moraleBonus: 2, eventChance: 2 },
        upgradeCost: { gold: 0, supplies: 0, renown: 0 },
      },
    ],
  },
  {
    id: 'room_forge',
    name: 'Forge',
    icon: '🔨',
    description: 'A whetstone, anvil, and enough heat to sharpen anything.',
    level: 1,
    maxLevel: 3,
    levels: [
      {
        description: 'Basic upkeep. Gear stays functional.',
        effects: { lootBonus: 0, forgeLevel: 1 },
        upgradeCost: { gold: 250, supplies: 20, renown: 8 },
      },
      {
        description: 'Full smithing tools. Loot quality improves. Gear repaired faster.',
        effects: { lootBonus: 1, forgeLevel: 2 },
        upgradeCost: { gold: 500, supplies: 30, renown: 20 },
      },
      {
        description: 'Master forge. Each successful mission has a chance of an extra item drop.',
        effects: { lootBonus: 2, forgeLevel: 3 },
        upgradeCost: { gold: 0, supplies: 0, renown: 0 },
      },
    ],
  },
];

const defaultGuild = (): Guild => ({
  name: 'The Tarnished Banner',
  resources: { gold: 150, supplies: 20, renown: 0 },
  inventoryItemIds: [],
  rooms: defaultRooms(),
  materials: {},
  guildRank: 1,
  completedContracts: 0,
  unlockedRegions: ['Thornwood', 'Ashfen Marsh'],
});

const defaultState = () => ({
  guild: defaultGuild(),
  mercenaries: INITIAL_MERCENARIES,
  items: ITEMS_MAP,
  activeMissions: [] as ActiveMission[],
  lastResult: null,
  activeScreen: 'dashboard' as ActiveScreen,
  showResultModal: false,
  availableRecruits: generateRecruitBatch(4, Date.now().toString()),
  lastRecruitRefresh: new Date().toISOString(),
  pendingEvents: [] as PendingEvent[],
  activeExpedition: null,
  lastExpeditionResult: null,
  showExpeditionResult: false,
});

/** Compute updated guild rank and unlocked regions from completed contracts and renown */
function computeProgression(
  completedContracts: number,
  renown: number,
  currentRegions: string[]
): { guildRank: number; unlockedRegions: string[] } {
  let guildRank = 1;
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (completedContracts >= RANK_THRESHOLDS[i]) {
      guildRank = i + 1;
      break;
    }
  }

  const unlockedRegions = [...currentRegions];
  if (completedContracts >= 5 && !unlockedRegions.includes('Grey Mountains')) {
    unlockedRegions.push('Grey Mountains');
  }
  if (renown >= 50 && !unlockedRegions.includes('City Below')) {
    unlockedRegions.push('City Below');
  }
  if (guildRank >= 3 && !unlockedRegions.includes('Pale Border')) {
    unlockedRegions.push('Pale Border');
  }

  return { guildRank, unlockedRegions };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...defaultState(),

      setScreen: (screen) => set({ activeScreen: screen }),

      addActiveMission: (mission) =>
        set((state) => ({ activeMissions: [...state.activeMissions, mission] })),

      applyMissionResult: (result) =>
        set((state) => {
          // Supplies earned: mercs return with scavenged goods
          const suppliesEarned =
            result.outcome === 'success' ? 5 : result.outcome === 'partial' ? 2 : 0;

          // Update guild resources
          const resources = {
            ...state.guild.resources,
            gold: state.guild.resources.gold + result.goldEarned,
            renown: state.guild.resources.renown + result.renownEarned,
            supplies: state.guild.resources.supplies + suppliesEarned,
          };

          // Update inventory
          const inventoryItemIds = [
            ...state.guild.inventoryItemIds,
            ...result.itemsEarned,
          ];

          // Material drops: use those passed in the result (computed in MissionBoard)
          const materials = { ...state.guild.materials };
          if ((result as MissionResult & { materialsEarned?: Record<string, number> }).materialsEarned) {
            const extra = (result as MissionResult & { materialsEarned?: Record<string, number> }).materialsEarned!;
            for (const [matId, qty] of Object.entries(extra)) {
              materials[matId] = (materials[matId] ?? 0) + qty;
            }
          }

          // Bond changes
          const missionMercs = state.mercenaries.filter((m) => result.mercIds.includes(m.id));
          const bondChanges = computeMissionBondChanges(
            missionMercs,
            result.outcome,
            result.templateId + result.mercIds.join('')
          );
          const updatedMercenariesWithBonds = applyBondChanges(state.mercenaries, bondChanges);

          // Resolve room effects
          const barracksRoom = state.guild.rooms.find((r) => r.id === 'room_barracks');
          const recoveryBonus = barracksRoom?.levels[barracksRoom.level - 1]?.effects?.recoveryBonus ?? 0;
          const tavernRoom = state.guild.rooms.find((r) => r.id === 'room_tavern');
          const moraleBonus = tavernRoom?.levels[tavernRoom.level - 1]?.effects?.moraleBonus ?? 0;

          // Set of mercs deployed on ANY OTHER active mission (not this one)
          const deployedOnOtherMissions = new Set(
            state.activeMissions
              .filter((am) => am.missionRunId !== result.missionRunId)
              .flatMap((am) => am.assignedMercIds)
          );

          // Update mercs: apply mission result to deployed mercs; apply rest effects to idle mercs
          const mercenaries = updatedMercenariesWithBonds.map((m) => {
            if (result.mercIds.includes(m.id)) {
              // Returning mission mercs
              const injured = result.injuredMercIds.includes(m.id);
              const fatigued = result.fatiguedMercIds.includes(m.id);
              const moraleDelta =
                result.outcome === 'success' ? 1 : result.outcome === 'failure' ? -1 : 0;
              return {
                ...m,
                missionsCompleted: m.missionsCompleted + 1,
                isInjured: injured,
                isFatigued: fatigued,
                morale: Math.max(0, Math.min(10, m.morale + moraleDelta)),
              };
            }
            if (deployedOnOtherMissions.has(m.id)) {
              // Merc is on another mission — no rest effects yet
              return m;
            }
            // Resting mercs: recover fatigue, chance to recover injury, gain morale from tavern
            const baseRecoveryChance = 0.4 + recoveryBonus * 0.25;
            const recoversInjury = m.isInjured && Math.random() < baseRecoveryChance;
            return {
              ...m,
              isFatigued: false,
              isInjured: recoversInjury ? false : m.isInjured,
              morale: Math.max(0, Math.min(10, m.morale + moraleBonus)),
            };
          });

          // Increment completed contracts
          const completedContracts = state.guild.completedContracts + 1;

          // Post-mission events
          const eventSeed = result.templateId + completedContracts;
          const newEvents = generateGuildEvents(
            missionMercs,
            resources.renown,
            'after_mission',
            eventSeed,
            state.guild.name,
            1
          );
          const pendingEvents = [
            ...state.pendingEvents,
            ...newEvents,
          ].slice(0, 10); // cap at 10

          const { guildRank, unlockedRegions } = computeProgression(
            completedContracts,
            resources.renown,
            state.guild.unlockedRegions
          );

          const newGuild: Guild = {
            ...state.guild,
            resources,
            inventoryItemIds,
            materials,
            completedContracts,
            guildRank,
            unlockedRegions,
          };

          // Store bond changes on result for display
          const enrichedResult = {
            ...result,
            bondChanges,
            suppliesEarned,
          };

          return {
            guild: newGuild,
            mercenaries,
            // Remove the resolved mission from the active list
            activeMissions: state.activeMissions.filter(
              (am) => am.missionRunId !== result.missionRunId
            ),
            lastResult: enrichedResult as MissionResult,
            showResultModal: true,
            pendingEvents,
          };
        }),

      dismissResult: () => set({ showResultModal: false }),

      updateMercenary: (merc) =>
        set((state) => ({
          mercenaries: state.mercenaries.map((m) => (m.id === merc.id ? merc : m)),
        })),

      equipItem: (mercId, slot, itemId) =>
        set((state) => {
          const merc = state.mercenaries.find((m) => m.id === mercId);
          if (!merc) return {};

          const previousItemId = merc.equipment[slot];
          let inventoryItemIds = [...state.guild.inventoryItemIds];

          const itemIdx = inventoryItemIds.indexOf(itemId);
          if (itemIdx !== -1) {
            inventoryItemIds.splice(itemIdx, 1);
          }

          if (previousItemId) {
            inventoryItemIds = [...inventoryItemIds, previousItemId];
          }

          const updatedMerc: Mercenary = {
            ...merc,
            equipment: { ...merc.equipment, [slot]: itemId },
          };

          return {
            mercenaries: state.mercenaries.map((m) => (m.id === mercId ? updatedMerc : m)),
            guild: { ...state.guild, inventoryItemIds },
          };
        }),

      unequipItem: (mercId, slot) =>
        set((state) => {
          const merc = state.mercenaries.find((m) => m.id === mercId);
          if (!merc) return {};
          const itemId = merc.equipment[slot];
          if (!itemId) return {};

          const newEquip = { ...merc.equipment };
          delete newEquip[slot];

          return {
            mercenaries: state.mercenaries.map((m) =>
              m.id === mercId ? { ...m, equipment: newEquip } : m
            ),
            guild: {
              ...state.guild,
              inventoryItemIds: [...state.guild.inventoryItemIds, itemId],
            },
          };
        }),

      sellItem: (itemId) =>
        set((state) => {
          const item = state.items[itemId];
          if (!item) return {};
          const inventoryItemIds = [...state.guild.inventoryItemIds];
          const idx = inventoryItemIds.indexOf(itemId);
          if (idx === -1) return {};
          inventoryItemIds.splice(idx, 1);

          return {
            guild: {
              ...state.guild,
              inventoryItemIds,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold + item.value,
              },
            },
          };
        }),

      upgradeRoom: (roomId) =>
        set((state) => {
          const room = state.guild.rooms.find((r) => r.id === roomId);
          if (!room || room.level >= room.maxLevel) return {};
          const nextLevel = room.levels[room.level - 1];
          const { gold, supplies, renown } = state.guild.resources;
          if (
            gold < nextLevel.upgradeCost.gold ||
            supplies < nextLevel.upgradeCost.supplies ||
            renown < nextLevel.upgradeCost.renown
          ) {
            return {};
          }

          const updatedRooms = state.guild.rooms.map((r) =>
            r.id === roomId ? { ...r, level: r.level + 1 } : r
          );

          return {
            guild: {
              ...state.guild,
              rooms: updatedRooms,
              resources: {
                gold: gold - nextLevel.upgradeCost.gold,
                supplies: supplies - nextLevel.upgradeCost.supplies,
                renown: renown - nextLevel.upgradeCost.renown,
              },
            },
          };
        }),

      craftItem: (recipeId) =>
        set((state) => {
          const recipe = RECIPES.find((r) => r.id === recipeId);
          if (!recipe) return {};

          // Check forge level
          const forgeRoom = state.guild.rooms.find((r) => r.id === 'room_forge');
          const forgeLevel = forgeRoom?.levels[forgeRoom.level - 1]?.effects?.forgeLevel ?? 1;
          if (recipe.requiresForgeLevel && forgeLevel < recipe.requiresForgeLevel) return {};

          // Check gold
          if (state.guild.resources.gold < recipe.goldCost) return {};

          // Check materials
          const materials = { ...state.guild.materials };
          for (const ing of recipe.ingredients) {
            if ((materials[ing.materialId] ?? 0) < ing.quantity) return {};
          }

          // Deduct materials and gold
          for (const ing of recipe.ingredients) {
            materials[ing.materialId] = (materials[ing.materialId] ?? 0) - ing.quantity;
          }

          const newItem = ITEMS_MAP[recipe.outputItemId];
          if (!newItem) return {};

          // Add item to items registry if not present
          const items = state.items[recipe.outputItemId]
            ? state.items
            : { ...state.items, [recipe.outputItemId]: newItem };

          return {
            guild: {
              ...state.guild,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - recipe.goldCost,
              },
              materials,
              inventoryItemIds: [...state.guild.inventoryItemIds, recipe.outputItemId],
            },
            items,
          };
        }),

      generateRecruits: () =>
        set((state) => {
          if (state.guild.resources.gold < 25) return {};
          const seed = Date.now().toString();
          return {
            availableRecruits: generateRecruitBatch(4, seed),
            lastRecruitRefresh: new Date().toISOString(),
            guild: {
              ...state.guild,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - 25,
              },
            },
          };
        }),

      hireRecruit: (recruitId) =>
        set((state) => {
          const recruit = state.availableRecruits.find((r) => r.id === recruitId);
          if (!recruit) return {};
          if (state.guild.resources.gold < recruit.hireCost) return {};

          const forgeRoom = state.guild.rooms.find((r) => r.id === 'room_barracks');
          const rosterCap = forgeRoom?.levels[forgeRoom.level - 1]?.effects?.rosterCap ?? 6;
          if (state.mercenaries.length >= rosterCap) return {};

          const newMerc: Mercenary = {
            id: recruit.id,
            name: recruit.name,
            title: recruit.title,
            portrait: recruit.portrait,
            stats: recruit.stats,
            traits: recruit.traits,
            relationships: [],
            equipment: {},
            isInjured: false,
            isFatigued: false,
            morale: 7,
            loyalty: 5,
            missionsCompleted: 0,
            background: recruit.background,
            bondScores: {},
          };

          return {
            mercenaries: [...state.mercenaries, newMerc],
            availableRecruits: state.availableRecruits.filter((r) => r.id !== recruitId),
            guild: {
              ...state.guild,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - recruit.hireCost,
              },
            },
          };
        }),

      dismissEvent: (eventId) =>
        set((state) => ({
          pendingEvents: state.pendingEvents.filter((e) => e.id !== eventId),
        })),

      resolveEventChoice: (eventId, choiceIndex) =>
        set((state) => {
          const event = state.pendingEvents.find((e) => e.id === eventId);
          if (!event) return {};

          const choice =
            choiceIndex === -1 ? event.autoOutcome : event.choices?.[choiceIndex];
          if (!choice) return {};

          const effects = choice.effects;
          const resources = { ...state.guild.resources };
          if (effects.gold) resources.gold = Math.max(0, resources.gold + effects.gold);
          if (effects.renown) resources.renown = Math.max(0, resources.renown + effects.renown);
          if (effects.supplies) resources.supplies = Math.max(0, resources.supplies + effects.supplies);

          // Material reward
          const materials = { ...state.guild.materials };
          if (effects.materialId && effects.materialQty) {
            materials[effects.materialId] =
              (materials[effects.materialId] ?? 0) + effects.materialQty;
          }

          // Morale / loyalty changes for involved mercs
          const mercenaries = state.mercenaries.map((m) => {
            if (!event.involvedMercIds.includes(m.id)) return m;
            let morale = m.morale;
            let loyalty = m.loyalty;
            if (effects.moraleDelta) morale = Math.max(0, Math.min(10, morale + effects.moraleDelta));
            if (effects.loyaltyDelta) loyalty = Math.max(0, Math.min(10, loyalty + effects.loyaltyDelta));
            return { ...m, morale, loyalty };
          });

          // Bond changes between involved mercs
          let updatedMercs = mercenaries;
          if (effects.bondDelta && event.involvedMercIds.length >= 2) {
            const [id1, id2] = event.involvedMercIds;
            updatedMercs = updatedMercs.map((m) => {
              if (m.id === id1) {
                const prev = m.bondScores?.[id2] ?? 0;
                return {
                  ...m,
                  bondScores: {
                    ...(m.bondScores ?? {}),
                    [id2]: Math.max(-10, Math.min(10, prev + effects.bondDelta!)),
                  },
                };
              }
              if (m.id === id2) {
                const prev = m.bondScores?.[id1] ?? 0;
                return {
                  ...m,
                  bondScores: {
                    ...(m.bondScores ?? {}),
                    [id1]: Math.max(-10, Math.min(10, prev + effects.bondDelta!)),
                  },
                };
              }
              return m;
            });
          }

          return {
            pendingEvents: state.pendingEvents.filter((e) => e.id !== eventId),
            guild: { ...state.guild, resources, materials },
            mercenaries: updatedMercs,
          };
        }),

      startExpedition: (templateId, mercIds, consumableItemIds) =>
        set((state) => {
          if (state.activeExpedition) return {};
          const template = EXPEDITION_TEMPLATES.find((t) => t.id === templateId);
          if (!template) return {};

          // Remove consumables from inventory
          const inventoryItemIds = [...state.guild.inventoryItemIds];
          for (const cid of consumableItemIds) {
            const idx = inventoryItemIds.indexOf(cid);
            if (idx !== -1) inventoryItemIds.splice(idx, 1);
          }

          const activeExpedition: ActiveExpedition = {
            templateId,
            assignedMercIds: mercIds,
            startedAt: new Date().toISOString(),
            currentStageIndex: 0,
            stageResults: [],
            consumablesAssigned: consumableItemIds,
          };

          return {
            activeExpedition,
            guild: { ...state.guild, inventoryItemIds },
          };
        }),

      advanceExpeditionStage: () =>
        set((state) => {
          const ae = state.activeExpedition;
          if (!ae) return {};

          const template = EXPEDITION_TEMPLATES.find((t) => t.id === ae.templateId);
          if (!template) return {};

          const mercs = state.mercenaries.filter((m) => ae.assignedMercIds.includes(m.id));
          const seed = ae.startedAt + ae.currentStageIndex;

          const isLastStage = ae.currentStageIndex === template.stages.length - 1;

          if (isLastStage) {
            // Finalize expedition
            const expResult = finalizeExpedition(mercs, template, ae, seed);

            // Supplies earned from expedition (more than a standard mission)
            const suppliesEarned =
              expResult.totalOutcome === 'success'
                ? 10
                : expResult.totalOutcome === 'partial'
                ? 5
                : 0;

            // Apply results
            const resources = {
              ...state.guild.resources,
              gold: state.guild.resources.gold + expResult.goldEarned,
              renown: state.guild.resources.renown + expResult.renownEarned,
              supplies: state.guild.resources.supplies + suppliesEarned,
            };

            const inventoryItemIds = [
              ...state.guild.inventoryItemIds,
              ...expResult.itemsEarned,
            ];

            const materials = { ...state.guild.materials };
            for (const me of expResult.materialsEarned) {
              materials[me.materialId] = (materials[me.materialId] ?? 0) + me.quantity;
            }

            const completedContracts = state.guild.completedContracts + 1;

            const { guildRank, unlockedRegions } = computeProgression(
              completedContracts,
              resources.renown,
              state.guild.unlockedRegions
            );

            // Apply bond changes; resting mercs recover fatigue
            const updatedMercs = applyBondChanges(state.mercenaries, expResult.bondChanges).map(
              (m) => {
                if (!ae.assignedMercIds.includes(m.id)) {
                  return { ...m, isFatigued: false };
                }
                const injured = expResult.injuredMercIds.includes(m.id);
                const fatigued = expResult.fatiguedMercIds.includes(m.id);
                return { ...m, isInjured: injured, isFatigued: fatigued };
              }
            );

            return {
              activeExpedition: null,
              lastExpeditionResult: expResult,
              showExpeditionResult: true,
              mercenaries: updatedMercs,
              guild: {
                ...state.guild,
                resources,
                inventoryItemIds,
                materials,
                completedContracts,
                guildRank,
                unlockedRegions,
              },
            };
          } else {
            // Simulate next stage
            const stageResult = simulateExpeditionStage(
              mercs,
              template,
              ae.currentStageIndex,
              seed,
              ae.consumablesAssigned
            );

            return {
              activeExpedition: {
                ...ae,
                currentStageIndex: ae.currentStageIndex + 1,
                stageResults: [...ae.stageResults, stageResult],
              },
            };
          }
        }),

      dismissExpeditionResult: () => set({ showExpeditionResult: false }),

      checkProgressionUnlocks: () =>
        set((state) => {
          const { completedContracts, resources, unlockedRegions, guildRank } = state.guild;

          // Determine new rank
          let newRank = 1;
          for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
            if (completedContracts >= RANK_THRESHOLDS[i]) {
              newRank = i + 1;
              break;
            }
          }

          const newRegions = [...unlockedRegions];
          if (completedContracts >= 5 && !newRegions.includes('Grey Mountains')) {
            newRegions.push('Grey Mountains');
          }
          if (resources.renown >= 50 && !newRegions.includes('City Below')) {
            newRegions.push('City Below');
          }
          if (newRank >= 3 && !newRegions.includes('Pale Border')) {
            newRegions.push('Pale Border');
          }

          if (newRank === guildRank && newRegions.length === unlockedRegions.length) {
            return {};
          }

          return {
            guild: { ...state.guild, guildRank: newRank, unlockedRegions: newRegions },
          };
        }),

      resetSave: () =>
        set({
          ...defaultState(),
        }),
    }),
    {
      name: 'banner-coin-save',
      version: SAVE_VERSION,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 3) {
          const guild = state.guild as Record<string, unknown> | undefined;
          if (guild) {
            guild.materials = (guild.materials as Record<string, number> | undefined) ?? {};
            guild.guildRank = (guild.guildRank as number | undefined) ?? 1;
            guild.completedContracts = (guild.completedContracts as number | undefined) ?? 0;
            guild.unlockedRegions = (guild.unlockedRegions as string[] | undefined) ?? ['Thornwood', 'Ashfen Marsh'];
          }
          const mercs = state.mercenaries as Mercenary[] | undefined;
          if (mercs) {
            state.mercenaries = mercs.map((m) => ({
              ...m,
              bondScores: m.bondScores ?? {},
              background: m.background ?? '',
            }));
          }
          state.availableRecruits = state.availableRecruits ?? [];
          state.lastRecruitRefresh = state.lastRecruitRefresh ?? new Date().toISOString();
          state.pendingEvents = state.pendingEvents ?? [];
          state.activeExpedition = state.activeExpedition ?? null;
          state.lastExpeditionResult = state.lastExpeditionResult ?? null;
          state.showExpeditionResult = state.showExpeditionResult ?? false;
        }
        if (version < 4) {
          // Migrate activeMission (single) → activeMissions (array)
          const oldMission = state.activeMission as (Record<string, unknown> | null | undefined);
          if (oldMission) {
            state.activeMissions = [{
              ...oldMission,
              missionRunId: (oldMission.startedAt as string) ?? Date.now().toString(),
            }];
          } else {
            state.activeMissions = [];
          }
          delete state.activeMission;
        }
        return state;
      },
    }
  )
);

/** Helper: get the mechanical effect value for a given key from a room at its current level */
export function getRoomEffect(room: RoomUpgrade, key: string): number {
  const levelData = room.levels[room.level - 1];
  return levelData?.effects[key] ?? 0;
}
