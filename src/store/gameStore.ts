import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mercenary, EquipmentSlot } from '~/types/mercenary';
import type { Item } from '~/types/item';
import type { ActiveMission, MissionResult } from '~/types/mission';
import { WEATHER_IDS, type AutomationSettings, type Guild, type GuildPolicyId, type RoomUpgrade, type WeatherId } from '~/types/guild';
import type { MercStats } from '~/types/mercenary';
import type { GeneratedRecruit } from '~/types/recruit';
import type { PendingEvent } from '~/types/event';
import type { ActiveExpedition, ExpeditionResult } from '~/types/expedition';
import type { ChronicleEntry } from '~/types/chronicles';
import { SAVE_VERSION } from '~/types/save';
import { INITIAL_MERCENARIES } from '~/data/mercenaries';
import { ITEMS_MAP } from '~/data/items';
import { EXPEDITION_TEMPLATES } from '~/data/expeditions';
import { generateRecruitBatch } from '~/simulation/recruitGen';
import { computeMissionBondChanges, applyBondChanges } from '~/simulation/bondSim';
import { generateGuildEvents } from '~/simulation/eventSim';
import { simulateExpeditionStage, finalizeExpedition } from '~/simulation/expeditionSim';
import { simulateMission } from '~/simulation/missionSim';
import { MISSION_TEMPLATES } from '~/data/missions';
import { RECIPES } from '~/data/recipes';
import { buildDefaultInfluence, REGION_DATA, computeUnlockedPerks, INFLUENCE_PER_OUTCOME, getAllActivePerks } from '~/data/regions';
import { ARTIFACTS_MAP } from '~/data/artifacts';
import { HERO_QUESTS } from '~/data/heroQuests';
import { LEGENDARY_MERCENARIES } from '~/data/legendaryMercs';
import { DIORAMA_PROPS } from '~/types/customization';
import type { HeroQuest } from '~/types/heroQuests';

export type ActiveScreen =
  | 'dashboard'
  | 'roster'
  | 'missions'
  | 'inventory'
  | 'workshop'
  | 'hiring'
  | 'expeditions'
  | 'worldmap'
  | 'reliquary'
  | 'chronicles'
  | 'customization'
  | 'policies';

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
  currentTime: number; // Date.now()
  lastTickTime: number; // Date.now()

  // Recruiting
  availableRecruits: GeneratedRecruit[];
  lastRecruitRefresh: string;

  // Events
  pendingEvents: PendingEvent[];

  // Expeditions
  activeExpedition: ActiveExpedition | null;
  lastExpeditionResult: ExpeditionResult | null;
  showExpeditionResult: boolean;
  
  // Offline Progress
  lastOfflineResult: {
    goldGained: number;
    suppliesGained: number;
    missionsCompleted: number;
    secondsPassed: number;
  } | null;
  showOfflineModal: boolean;

  isInMainMenu: boolean;
  activeHeroQuest: HeroQuest | null;
  activeHeroQuestStageId: string | null;
  completedHeroQuestIds: string[];

  // navigation
  setScreen: (screen: ActiveScreen) => void;
  setInMainMenu: (val: boolean) => void;
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
  forgeArtifact: (artifactId: string) => void;
  // recruiting
  generateRecruits: () => void;
  hireRecruit: (recruitId: string) => void;
  // hero quests
  startHeroQuest: (questId: string) => void;
  progressHeroQuest: (choiceIndex: number) => void;
  completeHeroQuest: (questId: string) => void;
  // customization
  unlockProp: (propId: string) => void;
  setWeather: (weather: WeatherId) => void;
  // chronicles
  addChronicleEntry: (entry: ChronicleEntry) => void;
  // events
  dismissEvent: (eventId: string) => void;
  resolveEventChoice: (eventId: string, choiceIndex: number) => void;
  // expeditions
  startExpedition: (templateId: string, mercIds: string[], consumableItemIds: string[]) => void;
  advanceExpeditionStage: () => void;
  dismissExpeditionResult: () => void;
  // progression
  checkProgressionUnlocks: () => void;
  // idle ticking
  tick: () => void;
  calculateOfflineProgress: () => void;
  dismissOfflineResult: () => void;
  // automation
  setAutomationSetting: (key: keyof AutomationSettings, value: boolean) => void;
  toggleTraining: (mercId: string, stat?: keyof MercStats) => void;
  setPolicy: (policyId: GuildPolicyId) => void;
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
        effects: { rosterCap: 10, recoveryBonus: 0, passiveSupplies: 0.05 },
        upgradeCost: { gold: 200, supplies: 10, renown: 5 },
      },
      {
        description: 'Proper beds and a healer on rotation. Injuries heal faster.',
        effects: { rosterCap: 15, recoveryBonus: 1, passiveSupplies: 0.15 },
        upgradeCost: { gold: 400, supplies: 20, renown: 15 },
      },
      {
        description: 'Full infirmary wing. Mercs bounce back quickly.',
        effects: { rosterCap: 20, recoveryBonus: 2, passiveSupplies: 0.4 },
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
        effects: { moraleBonus: 0, eventChance: 0, passiveGold: 0.1 },
        upgradeCost: { gold: 200, supplies: 15, renown: 5 },
      },
      {
        description: 'Good food and music. Morale recovers faster. Stories spread.',
        effects: { moraleBonus: 1, eventChance: 1, passiveGold: 0.3 },
        upgradeCost: { gold: 350, supplies: 25, renown: 12 },
      },
      {
        description: 'Legendary hospitality. Mercs talk about this place in other towns.',
        effects: { moraleBonus: 2, eventChance: 2, passiveGold: 0.8 },
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
  automationSettings: { autoDeploy: false, autoRefill: false },
  regionalInfluence: buildDefaultInfluence(),
  unlockedArtifactIds: [],
  unlockedPropIds: [],
  currentWeather: 'clear',
  chronicles: [],
  activePolicyIds: [],
  maxPolicySlots: 1,
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
  currentTime: Date.now(),
  lastTickTime: Date.now(),
  lastOfflineResult: null,
  showOfflineModal: false,
  isInMainMenu: true,

  activeHeroQuest: null as HeroQuest | null,
  activeHeroQuestStageId: null as string | null,
  completedHeroQuestIds: [] as string[],
});

/** Compute updated guild rank and unlocked regions from completed contracts and renown */
function computeProgression(
  completedContracts: number,
  renown: number,
  currentRegions: string[],
  completedHeroQuestIds: string[]
): { guildRank: number; unlockedRegions: string[]; triggeredHeroQuestId: string | null } {
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

  // Hero Quest Triggering
  let triggeredHeroQuestId: string | null = null;
  for (const quest of HERO_QUESTS) {
    if (completedHeroQuestIds.includes(quest.id)) continue;
    if (renown >= (quest.triggerCondition.minRenown ?? 0) && completedContracts >= (quest.triggerCondition.minContracts ?? 0)) {
      triggeredHeroQuestId = quest.id;
      break;
    }
  }

  return { guildRank, unlockedRegions, triggeredHeroQuestId };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...defaultState(),

      setScreen: (screen) => set({ activeScreen: screen }),
      setInMainMenu: (val) => set({ isInMainMenu: val }),

      addActiveMission: (mission) =>
        set((state) => {
          const template = MISSION_TEMPLATES.find((t) => t.id === mission.templateId);
          let duration = template?.durationSeconds ?? 0;
          
          // Apply Artifact: mission_duration
          const artifacts = state.guild.unlockedArtifactIds.map(id => ARTIFACTS_MAP[id]).filter(Boolean);
          const durationMod = artifacts.reduce((acc, art) => {
            const mod = art.modifiers.find(m => m.type === 'mission_duration');
            return acc + (mod?.value ?? 0);
          }, 0);
          duration = Math.max(1, Math.floor(duration * (1 + durationMod)));

          // Apply Policy: safety_first
          if (state.guild.activePolicyIds.includes('safety_first')) {
            duration = Math.floor(duration * 1.25);
          }

          const endTime = new Date(new Date(mission.startedAt).getTime() + duration * 1000).toISOString();
          return {
            activeMissions: [...state.activeMissions, { ...mission, endTime }],
          };
        }),

      applyMissionResult: (result) =>
        set((state) => {
          const template = MISSION_TEMPLATES.find(t => t.id === result.templateId);
          const activeArtifacts = state.guild.unlockedArtifactIds.map(id => ARTIFACTS_MAP[id]).filter(Boolean);
          
          // ── Influence & Perks ─────────────────────────────────────────────
          const missionRegion = template?.region;
          const regionData = missionRegion ? REGION_DATA.find(r => r.name === missionRegion) : null;
          const updatedRegionalInfluence = { ...state.guild.regionalInfluence };

          if (missionRegion && regionData && result.outcome !== 'failure') {
            const gained = INFLUENCE_PER_OUTCOME[result.outcome] ?? 0;
            const existing = updatedRegionalInfluence[missionRegion] ?? {
              region: missionRegion, influence: 0, maxInfluence: 50, unlockedPerks: []
            };
            const newInfluence = Math.min(existing.maxInfluence, existing.influence + gained);
            const newPerks = computeUnlockedPerks(newInfluence, regionData.milestones);
            updatedRegionalInfluence[missionRegion] = {
              ...existing,
              influence: newInfluence,
              unlockedPerks: newPerks,
            };
          }

          const activePerks = getAllActivePerks(updatedRegionalInfluence);

          // ── Calculate Final Rewards ───────────────────────────────────────
          let finalGoldEarned = result.goldEarned;
          let finalRenownEarned = result.renownEarned;

          // Apply Policy: profit_maximization → +30% gold
          if (state.guild.activePolicyIds.includes('profit_maximization')) {
            finalGoldEarned = Math.floor(finalGoldEarned * 1.30);
          }
          // Apply Policy: frugal_operations → -20% renown
          if (state.guild.activePolicyIds.includes('frugal_operations')) {
            finalRenownEarned = Math.floor(finalRenownEarned * 0.80);
          }

          // Apply perk: thornwood_ties → +10% gold on escort/bounty
          if (activePerks.has('thornwood_ties') && template?.tags.some(t => ['escort', 'bounty'].includes(t))) {
            finalGoldEarned = Math.floor(finalGoldEarned * 1.10);
          }
          // Apply Artifact: gold_gain
          const goldMod = activeArtifacts.reduce((acc, art) => {
            const mod = art.modifiers.find(m => m.type === 'gold_gain');
            return acc + (mod?.value ?? 0);
          }, 0);
          finalGoldEarned = Math.floor(finalGoldEarned * (1 + goldMod));

          // Apply perk: ashfen_scouts → +1 loot on exploration/ruin
          const finalItemsEarned = [...result.itemsEarned];
          if (activePerks.has('ashfen_scouts') && template?.tags.some(t => ['exploration', 'ruin'].includes(t))) {
            if (template?.reward.possibleItems.length) {
              const bonus = template.reward.possibleItems[Math.floor(Math.random() * template.reward.possibleItems.length)];
              finalItemsEarned.push(bonus);
            }
          }

          // Supplies & Cap
          const baseSupplies = result.outcome === 'success' ? 5 : result.outcome === 'partial' ? 2 : 0;
          const supplyCapMod = activeArtifacts.reduce((acc, art) => {
            const mod = art.modifiers.find(m => m.type === 'supply_cap');
            return acc + (mod?.value ?? 0);
          }, 0);
          const supplyCap = 50 + supplyCapMod; // Base 50

          // Update inventory
          const inventoryItemIds = [
            ...state.guild.inventoryItemIds,
            ...finalItemsEarned,
          ];

          // Update guild resources
          const resources = {
            ...state.guild.resources,
            gold: state.guild.resources.gold + finalGoldEarned,
            renown: state.guild.resources.renown + finalRenownEarned,
            supplies: Math.min(supplyCap, state.guild.resources.supplies + baseSupplies),
          };

          // Material drops
          const materials = { ...state.guild.materials };
          if ((result as MissionResult & { materialsEarned?: Record<string, number> }).materialsEarned) {
            const extra = (result as MissionResult & { materialsEarned?: Record<string, number> }).materialsEarned!;
            for (const [matId, qty] of Object.entries(extra)) {
              materials[matId] = (materials[matId] ?? 0) + qty;
            }
          }

          // ── Mercenary & Bond Logic ─────────────────────────────────────────
          const missionMercs = state.mercenaries.filter((m) => result.mercIds.includes(m.id));
          const bondChanges = computeMissionBondChanges(
            missionMercs,
            result.outcome,
            result.templateId + result.mercIds.join('')
          );
          const updatedMercenariesWithBonds = applyBondChanges(state.mercenaries, bondChanges);

          const barracksRoom = state.guild.rooms.find((r) => r.id === 'room_barracks');
          let recoveryBonus = barracksRoom?.levels[barracksRoom.level - 1]?.effects?.recoveryBonus ?? 0;
          
          const tavernRoom = state.guild.rooms.find((r) => r.id === 'room_tavern');
          let moraleBonus = tavernRoom?.levels[tavernRoom.level - 1]?.effects?.moraleBonus ?? 0;

          // Apply Artifact: injury_recovery
          const artRecoveryMod = activeArtifacts.reduce((acc, art) => {
            const mod = art.modifiers.find(m => m.type === 'injury_recovery');
            return acc + (mod?.value ?? 0);
          }, 0);
          recoveryBonus += artRecoveryMod;

          // Apply Artifact: morale_gain
          const artMoraleMod = activeArtifacts.reduce((acc, art) => {
            const mod = art.modifiers.find(m => m.type === 'morale_gain');
            return acc + (mod?.value ?? 0);
          }, 0);
          moraleBonus += artMoraleMod;

          const deployedOnOtherMissions = new Set(
            state.activeMissions
              .filter((am) => am.missionRunId !== result.missionRunId)
              .flatMap((am) => am.assignedMercIds)
          );

          const mercenaries = updatedMercenariesWithBonds.map((m) => {
            if (result.mercIds.includes(m.id)) {
              const injured = result.injuredMercIds.includes(m.id);
              const fatigued = result.fatiguedMercIds.includes(m.id);
              let moraleDelta = result.outcome === 'success' ? 1 : result.outcome === 'failure' ? -1 : 0;
              
              // Policy: profit_maximization → 2x morale decay
              if (state.guild.activePolicyIds.includes('profit_maximization') && moraleDelta < 0) {
                moraleDelta *= 2;
              }

              return {
                ...m,
                missionsCompleted: m.missionsCompleted + 1,
                isInjured: injured,
                isFatigued: fatigued,
                morale: Math.max(0, Math.min(10, m.morale + moraleDelta)),
              };
            }
            if (deployedOnOtherMissions.has(m.id)) return m;
            
            const baseRecoveryChance = 0.4 + recoveryBonus * 0.25;
            const recoverySeed = m.id + result.missionRunId;
            let rh = 2166136261;
            for (let i = 0; i < recoverySeed.length; i++) {
              rh ^= recoverySeed.charCodeAt(i);
              rh = Math.imul(rh, 16777619);
            }
            const recoveryRoll = (rh >>> 0) / 0xffffffff;
            const recoversInjury = m.isInjured && recoveryRoll < baseRecoveryChance;
            return {
              ...m,
              isFatigued: false,
              isInjured: recoversInjury ? false : m.isInjured,
              morale: Math.max(0, Math.min(10, m.morale + moraleBonus)),
            };
          });

          // ── Progression & Metadata ─────────────────────────────────────────
          const completedContracts = state.guild.completedContracts + 1;
          const { guildRank, unlockedRegions, triggeredHeroQuestId } = computeProgression(
            completedContracts,
            resources.renown,
            state.guild.unlockedRegions,
            state.completedHeroQuestIds
          );

          let activeHeroQuest = state.activeHeroQuest;
          if (triggeredHeroQuestId && !activeHeroQuest) {
            activeHeroQuest = HERO_QUESTS.find(q => q.id === triggeredHeroQuestId) ?? null;
          }

          const chronicles = [...state.guild.chronicles];
          if (result.outcome === 'success') {
            chronicles.unshift({
              id: `chronicle_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'mission_success',
              title: `Success: ${template?.name}`,
              description: `A triumphant return from ${missionRegion}. The guild's renown grows.`,
              icon: '⚔️',
            });
          }

          // Auto-Refill Logic: If Rank 5 and gold > 50, auto-buy rations if low
          if (state.guild.automationSettings.autoRefill && guildRank >= 5 && resources.gold >= 100) {
             const rationCount = inventoryItemIds.filter(id => id === 'road_rations').length;
             if (rationCount < 2) {
                resources.gold -= 10;
                inventoryItemIds.push('road_rations');
             }
          }

          const newGuild: Guild = {
            ...state.guild,
            resources,
            inventoryItemIds,
            materials,
            completedContracts,
            guildRank,
            unlockedRegions,
            regionalInfluence: updatedRegionalInfluence,
            chronicles: chronicles.slice(0, 100),
          };

          const newEvents = generateGuildEvents(
            mercenaries,
            resources.renown,
            'mission_complete',
            result.missionRunId,
            state.guild.name,
            1
          );

          // Store bond changes on result for display
          const enrichedResult = {
            ...result,
            bondChanges,
            suppliesEarned: baseSupplies,
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
            pendingEvents: [...state.pendingEvents, ...newEvents].slice(0, 3),
            activeHeroQuest,
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
          
          let hireCost = recruit.hireCost;
          let bonusStats = 0;

          const activeArtifacts = state.guild.unlockedArtifactIds.map(id => ARTIFACTS_MAP[id]).filter(Boolean);
          const recruitQualityMod = activeArtifacts.reduce((acc, art) => {
            const mod = art.modifiers.find(m => m.type === 'recruit_quality');
            return acc + (mod?.value ?? 0);
          }, 0);
          bonusStats += recruitQualityMod;

          if (state.guild.activePolicyIds.includes('aggressive_recruiting')) {
            hireCost = Math.floor(hireCost * 1.5);
            bonusStats += 1;
          }

          if (state.guild.resources.gold < hireCost) return {};

          const barracksRoom = state.guild.rooms.find((r) => r.id === 'room_barracks');
          const rosterCap = barracksRoom?.levels[barracksRoom.level - 1]?.effects?.rosterCap ?? 6;
          if (state.mercenaries.length >= rosterCap) return {};

          const newMerc: Mercenary = {
            id: recruit.id,
            name: recruit.name,
            title: recruit.title,
            portrait: recruit.portrait,
            stats: {
              strength: Math.min(10, recruit.stats.strength + bonusStats),
              agility: Math.min(10, recruit.stats.agility + bonusStats),
              intellect: Math.min(10, recruit.stats.intellect + bonusStats),
              presence: Math.min(10, recruit.stats.presence + bonusStats),
            },
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
            isLegendary: false,
          };

          // Apply influence perk: pale_border_heroes (+1 to all stats)
          const activePerks = getAllActivePerks(state.guild.regionalInfluence);
          if (activePerks.has('pale_border_heroes')) {
            newMerc.stats.strength = Math.min(10, newMerc.stats.strength + 1);
            newMerc.stats.agility = Math.min(10, newMerc.stats.agility + 1);
            newMerc.stats.intellect = Math.min(10, newMerc.stats.intellect + 1);
            newMerc.stats.presence = Math.min(10, newMerc.stats.presence + 1);
          }

          return {
            mercenaries: [...state.mercenaries, newMerc],
            availableRecruits: state.availableRecruits.filter((r) => r.id !== recruitId),
            guild: {
              ...state.guild,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - hireCost,
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
              state.guild.unlockedRegions,
              state.completedHeroQuestIds
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

      tick: () =>
        set((state) => {
          if (state.isInMainMenu) return {};
          const now = Date.now();
          const deltaSeconds = Math.max(0, (now - state.lastTickTime) / 1000);
          const cappedDelta = Math.min(deltaSeconds, 86400);

          const tavern = state.guild.rooms.find(r => r.id === 'room_tavern');
          const barracks = state.guild.rooms.find(r => r.id === 'room_barracks');
          
          const goldRate = tavern ? getRoomEffect(tavern, 'passiveGold') : 0;
          const suppliesRate = barracks ? getRoomEffect(barracks, 'passiveSupplies') : 0;

          let trainingCostPerSec = 0.05;
          let trainingProgressPerSec = 1;

          // Policy: rigorous_training → 2x speed, 2x cost
          if (state.guild.activePolicyIds.includes('rigorous_training')) {
            trainingCostPerSec *= 2;
            trainingProgressPerSec *= 2;
          }

          let updatedSupplies = state.guild.resources.supplies + (cappedDelta * suppliesRate);
          const updatedMercs = [...state.mercenaries];

          // Handle Training
          for (let i = 0; i < updatedMercs.length; i++) {
            const m = updatedMercs[i];
            if (m.isTraining && !m.isInjured && !m.isFatigued) {
              const totalCost = cappedDelta * trainingCostPerSec;
              if (updatedSupplies >= totalCost) {
                updatedSupplies -= totalCost;
                const progressGained = cappedDelta * trainingProgressPerSec;
                const newProgress = (m.trainingProgress ?? 0) + progressGained;
                
                if (newProgress >= 100) {
                   const statToBoost = m.trainingStat ?? 'strength';
                   updatedMercs[i] = {
                     ...m,
                     trainingProgress: newProgress - 100,
                     stats: {
                       ...m.stats,
                       [statToBoost]: Math.min(10, m.stats[statToBoost] + 0.1)
                     }
                   };
                } else {
                   updatedMercs[i] = { ...m, trainingProgress: newProgress };
                }
              } else {
                updatedMercs[i] = { ...m, isTraining: false };
              }
            }
          }

          const goldCap = 1000 + state.guild.guildRank * 1000;
          const suppliesCap = 100 + state.guild.guildRank * 200;

          const newGold = Math.min(goldCap, state.guild.resources.gold + (cappedDelta * goldRate));
          const finalSupplies = Math.min(suppliesCap, updatedSupplies);

          // Handle Auto-Claim and Auto-Deploy
          let finalMissions = [...state.activeMissions];
          let autoRewardsGold = 0;
          let autoRewardsRenown = 0;
          const autoRewardsLoot: string[] = [];

          if (state.guild.automationSettings.autoDeploy && state.guild.guildRank >= 4) {
            // 1. Auto-Claim finished missions
            const finished = finalMissions.filter(am => new Date(am.endTime).getTime() <= now);
            if (finished.length > 0) {
              for (const am of finished) {
                const template = MISSION_TEMPLATES.find(t => t.id === am.templateId);
                if (template) {
                  const party = state.mercenaries.filter(m => am.assignedMercIds.includes(m.id));
                  const forge = state.guild.rooms.find(r => r.id === 'room_forge');
                  const forgeLevel = forge ? getRoomEffect(forge, 'forgeLevel') : 1;
                  
                  const result = simulateMission(party, template, am.missionRunId, {
                    forgeLevel,
                    consumableItemIds: am.consumablesAssigned,
                    unlockedArtifactIds: state.guild.unlockedArtifactIds,
                    activePerkIds: Array.from(Object.values(state.guild.regionalInfluence).flatMap(ri => ri.unlockedPerks))
                  });

                  autoRewardsGold += result.goldEarned;
                  autoRewardsRenown += result.renownEarned;
                  autoRewardsLoot.push(...result.itemsEarned);

                  // Status updates for mercs
                  for (let i = 0; i < updatedMercs.length; i++) {
                    if (result.injuredMercIds.includes(updatedMercs[i].id)) updatedMercs[i].isInjured = true;
                    if (result.fatiguedMercIds.includes(updatedMercs[i].id)) updatedMercs[i].isFatigued = true;
                  }
                }
              }
              finalMissions = finalMissions.filter(am => new Date(am.endTime).getTime() > now);
            }

            // 2. Auto-Deploy new missions
            const missionCap = maxConcurrentMissions(state.guild.guildRank);
            if (finalMissions.length < missionCap) {
              const availableMission = MISSION_TEMPLATES.find(t => 
                !finalMissions.some(am => am.templateId === t.id)
              );

              if (availableMission) {
                const deployedMercIds = new Set(finalMissions.flatMap(am => am.assignedMercIds));
                const idleMercs = updatedMercs.filter(m => 
                  !m.isTraining && 
                  !deployedMercIds.has(m.id) && 
                  !m.isInjured && 
                  !m.isFatigued
                );

                if (idleMercs.length >= 1) {
                  const partyIds = idleMercs.slice(0, 2).map(m => m.id);
                  const autoConsumables: string[] = [];
                  const currentInventory = [...state.guild.inventoryItemIds, ...autoRewardsLoot];

                  if (state.guild.automationSettings.autoRefill && state.guild.guildRank >= 5) {
                    const rationsIdx = currentInventory.indexOf('road_rations');
                    if (rationsIdx !== -1) {
                      autoConsumables.push('road_rations');
                      currentInventory.splice(rationsIdx, 1);
                    }
                  }

                  const newMission: ActiveMission = {
                    missionRunId: `auto-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    templateId: availableMission.id,
                    assignedMercIds: partyIds,
                    startedAt: new Date().toISOString(),
                    endTime: new Date(Date.now() + availableMission.durationSeconds * 1000).toISOString(),
                    consumablesAssigned: autoConsumables,
                  };

                  return {
                    currentTime: now,
                    lastTickTime: now,
                    mercenaries: updatedMercs,
                    activeMissions: [...finalMissions, newMission],
                    guild: {
                      ...state.guild,
                      inventoryItemIds: currentInventory,
                      resources: {
                        ...state.guild.resources,
                        gold: Math.min(goldCap, newGold + autoRewardsGold),
                        renown: state.guild.resources.renown + autoRewardsRenown,
                        supplies: finalSupplies,
                      }
                    }
                  };
                }
              }
            }
          }

          // Handle Recruit Refresh
          const lastRefreshTime = new Date(state.lastRecruitRefresh).getTime();
          const refreshCooldownMs = 900 * 1000; // 15 mins
          let newRecruits = state.availableRecruits;
          let newRefreshTimestamp = state.lastRecruitRefresh;

          if (now - lastRefreshTime > refreshCooldownMs) {
            newRecruits = generateRecruitBatch(4, now.toString());
            newRefreshTimestamp = new Date(now).toISOString();
          }

          return {
            currentTime: now,
            lastTickTime: now,
            mercenaries: updatedMercs,
            activeMissions: finalMissions,
            availableRecruits: newRecruits,
            lastRecruitRefresh: newRefreshTimestamp,
            guild: {
              ...state.guild,
              resources: {
                ...state.guild.resources,
                gold: Math.min(goldCap, newGold + autoRewardsGold),
                renown: state.guild.resources.renown + autoRewardsRenown,
                supplies: finalSupplies,
              }
            }
          };
        }),

      calculateOfflineProgress: () => {
        const state = get();
        const now = Date.now();
        const deltaSeconds = Math.max(0, (now - state.lastTickTime) / 1000);
        
        if (deltaSeconds < 30) {
          set({ lastTickTime: now, currentTime: now });
          return;
        }

        const cappedDelta = Math.min(deltaSeconds, 86400 * 7); // Max 7 days
        const steps = Math.min(100, Math.ceil(cappedDelta / 300)); // Simulate in 5-min chunks max 100 steps
        const stepDelta = cappedDelta / steps;

        const currentResources = { ...state.guild.resources };
        const currentMercs = [...state.mercenaries];
        let currentMissions = [...state.activeMissions];
        const currentInventory = [...state.guild.inventoryItemIds];
        let totalMissionsCompleted = 0;

        const tavern = state.guild.rooms.find(r => r.id === 'room_tavern');
        const barracks = state.guild.rooms.find(r => r.id === 'room_barracks');
        const forge = state.guild.rooms.find(r => r.id === 'room_forge');
        const goldRate = tavern ? getRoomEffect(tavern, 'passiveGold') : 0;
        const suppliesRate = barracks ? getRoomEffect(barracks, 'passiveSupplies') : 0;
        const forgeLevel = forge ? getRoomEffect(forge, 'forgeLevel') : 1;

        const goldCap = 1000 + state.guild.guildRank * 1000;
        const suppliesCap = 100 + state.guild.guildRank * 200;

        for (let i = 0; i < steps; i++) {
          const stepNow = state.lastTickTime + (i * stepDelta * 1000);
          
          // 1. Passive Gains
          currentResources.gold = Math.min(goldCap, currentResources.gold + (stepDelta * goldRate));
          currentResources.supplies = Math.min(suppliesCap, currentResources.supplies + (stepDelta * suppliesRate));

          // 2. Training
          for (let j = 0; j < currentMercs.length; j++) {
            const m = currentMercs[j];
            if (m.isTraining && !m.isInjured && !m.isFatigued) {
              const cost = stepDelta * 0.05;
              if (currentResources.supplies >= cost) {
                currentResources.supplies -= cost;
                const progress = (m.trainingProgress ?? 0) + (stepDelta * 1);
                if (progress >= 100) {
                  const stat = m.trainingStat ?? 'strength';
                  currentMercs[j] = {
                    ...m,
                    trainingProgress: progress - 100,
                    stats: { ...m.stats, [stat]: Math.min(10, m.stats[stat] + 0.1) }
                  };
                } else {
                  currentMercs[j] = { ...m, trainingProgress: progress };
                }
              } else {
                currentMercs[j] = { ...m, isTraining: false };
              }
            }
          }

          // 3. Auto-Claim
          if (state.guild.automationSettings.autoDeploy && state.guild.guildRank >= 4) {
             const finished = currentMissions.filter(am => new Date(am.endTime).getTime() <= stepNow);
             for (const am of finished) {
                const template = MISSION_TEMPLATES.find(t => t.id === am.templateId);
                if (template) {
                  const party = currentMercs.filter(m => am.assignedMercIds.includes(m.id));
                  const result = simulateMission(party, template, am.missionRunId, { 
                    forgeLevel, 
                    consumableItemIds: am.consumablesAssigned,
                    unlockedArtifactIds: state.guild.unlockedArtifactIds,
                    activePerkIds: Array.from(Object.values(state.guild.regionalInfluence).flatMap(ri => ri.unlockedPerks))
                  });
                  currentResources.gold = Math.min(goldCap, currentResources.gold + result.goldEarned);
                  currentResources.renown += result.renownEarned;
                  currentInventory.push(...result.itemsEarned);
                  totalMissionsCompleted++;
                  for (let k = 0; k < currentMercs.length; k++) {
                    if (result.injuredMercIds.includes(currentMercs[k].id)) currentMercs[k].isInjured = true;
                    if (result.fatiguedMercIds.includes(currentMercs[k].id)) currentMercs[k].isFatigued = true;
                  }
                }
             }
             currentMissions = currentMissions.filter(am => new Date(am.endTime).getTime() > stepNow);

             // 4. Auto-Deploy
             const missionCap = maxConcurrentMissions(state.guild.guildRank);
             if (currentMissions.length < missionCap) {
                const avail = MISSION_TEMPLATES.find(t => !currentMissions.some(am => am.templateId === t.id));
                if (avail) {
                   const deployedIds = new Set(currentMissions.flatMap(am => am.assignedMercIds));
                   const idle = currentMercs.filter(m => !m.isTraining && !deployedIds.has(m.id) && !m.isInjured && !m.isFatigued);
                   if (idle.length >= 1) {
                      const party = idle.slice(0, 2).map(m => m.id);
                      const cons: string[] = [];
                      if (state.guild.automationSettings.autoRefill && state.guild.guildRank >= 5) {
                         const rIdx = currentInventory.indexOf('road_rations');
                         if (rIdx !== -1) { cons.push('road_rations'); currentInventory.splice(rIdx, 1); }
                      }
                      currentMissions.push({
                        missionRunId: `auto-off-${stepNow}-${Math.random()}`,
                        templateId: avail.id,
                        assignedMercIds: party,
                        startedAt: new Date(stepNow).toISOString(),
                        endTime: new Date(stepNow + avail.durationSeconds * 1000).toISOString(),
                        consumablesAssigned: cons
                      });
                   }
                }
             }
          }
        }

        // Final cleanup for missions that finished after the last step but before 'now'
        const finalFinished = currentMissions.filter(am => new Date(am.endTime).getTime() <= now);
        totalMissionsCompleted += finalFinished.length;

        set({
          lastTickTime: now,
          currentTime: now,
          mercenaries: currentMercs,
          activeMissions: currentMissions,
          guild: {
            ...state.guild,
            inventoryItemIds: currentInventory,
            resources: {
              ...state.guild.resources,
              gold: Math.floor(currentResources.gold),
              supplies: Math.floor(currentResources.supplies),
              renown: currentResources.renown,
            }
          },
          lastOfflineResult: {
            goldGained: Math.floor(currentResources.gold - state.guild.resources.gold),
            suppliesGained: Math.floor(currentResources.supplies - state.guild.resources.supplies),
            missionsCompleted: totalMissionsCompleted,
            secondsPassed: Math.floor(deltaSeconds),
          },
          showOfflineModal: deltaSeconds > 60,
        });
      },

      dismissOfflineResult: () => set({ showOfflineModal: false, lastOfflineResult: null }),

      resetSave: () =>
        set({
          ...defaultState(),
        }),

      forgeArtifact: (artifactId) => set(state => {
        const artifact = ARTIFACTS_MAP[artifactId];
        if (!artifact) return {};
        if (state.guild.unlockedArtifactIds.includes(artifactId)) return {};
        
        // Check costs
        const { gold, renown, materials: reqMats } = artifact.cost;
        if (state.guild.resources.gold < gold || state.guild.resources.renown < renown) return {};
        
        for (const [matId, qty] of Object.entries(reqMats)) {
          if ((state.guild.materials[matId] ?? 0) < qty) return {};
        }

        // Deduct costs and unlock
        const newResources = {
          ...state.guild.resources,
          gold: state.guild.resources.gold - gold,
          renown: state.guild.resources.renown - renown,
        };

        const newMaterials = { ...state.guild.materials };
        for (const [matId, qty] of Object.entries(reqMats)) {
          newMaterials[matId] -= qty;
        }

        return {
          guild: {
            ...state.guild,
            resources: newResources,
            materials: newMaterials,
            unlockedArtifactIds: [...state.guild.unlockedArtifactIds, artifactId],
          }
        };
      }),

      setAutomationSetting: (key, value) => set(state => ({
        guild: {
          ...state.guild,
          automationSettings: {
            ...state.guild.automationSettings,
            [key]: value
          }
        }
      })),

      toggleTraining: (mercId, stat) => set(state => ({
        mercenaries: state.mercenaries.map(m => {
          if (m.id !== mercId) return m;
          const isNowTraining = !m.isTraining;
          return {
            ...m,
            isTraining: isNowTraining,
            trainingStat: (stat ?? m.trainingStat ?? 'strength') as keyof MercStats,
            trainingProgress: isNowTraining ? (m.trainingProgress ?? 0) : m.trainingProgress
          };
        })
      })),
      completeHeroQuest: (questId) => set(state => {
        const quest = HERO_QUESTS.find(q => q.id === questId);
        if (!quest) return {};
        
        const rewardMerc = LEGENDARY_MERCENARIES[quest.rewardMercenaryId];
        if (!rewardMerc) return {};

        const entry: ChronicleEntry = {
          id: `chronicle_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'hero_unlock',
          title: `Legend Recruited: ${rewardMerc.name}`,
          description: `The deeds of the guild have drawn ${rewardMerc.name} ${rewardMerc.title} to our banner.`,
          icon: '👑',
        };

        return {
          mercenaries: [...state.mercenaries, rewardMerc],
          completedHeroQuestIds: [...state.completedHeroQuestIds, questId],
          activeHeroQuest: null,
          guild: {
            ...state.guild,
            chronicles: [entry, ...state.guild.chronicles].slice(0, 100),
          }
        };
      }),

      startHeroQuest: (questId) => set(state => {
        const quest = HERO_QUESTS.find(q => q.id === questId);
        if (!quest || state.completedHeroQuestIds.includes(questId)) return {};
        return { 
          activeHeroQuest: quest,
          activeHeroQuestStageId: quest.stages[0]?.id || null
        };
      }),

      progressHeroQuest: (choiceIndex) => set(state => {
        const quest = state.activeHeroQuest;
        if (!quest || !state.activeHeroQuestStageId) return {};
        
        const currentStage = quest.stages.find(s => s.id === state.activeHeroQuestStageId);
        if (!currentStage) return {};

        const choice = currentStage.choices[choiceIndex];
        if (!choice) return {};

        // Stat Check: If choice has a requirement, check if anyone in the roster meets it
        if (choice.requirement) {
          const { stat, value } = choice.requirement;
          const meetsReq = state.mercenaries.some(m => m.stats[stat] >= value);
          if (!meetsReq) {
             // Optional: Return a "Failure" outcome or block the choice in UI
             return {}; 
          }
        }

        if (choice.outcome.nextStageId) {
          return {
            activeHeroQuestStageId: choice.outcome.nextStageId
          };
        } else {
          // Quest Complete
          const rewardMerc = LEGENDARY_MERCENARIES[quest.rewardMercenaryId];
          if (!rewardMerc) return { activeHeroQuest: null, activeHeroQuestStageId: null };

          const entry: ChronicleEntry = {
            id: `chronicle_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'hero_unlock',
            title: `Legend Recruited: ${rewardMerc.name}`,
            description: `The deeds of the guild have drawn ${rewardMerc.name} ${rewardMerc.title} to our banner.`,
            icon: '🌟',
          };

          return {
            mercenaries: [...state.mercenaries, rewardMerc],
            completedHeroQuestIds: [...state.completedHeroQuestIds, quest.id],
            activeHeroQuest: null,
            activeHeroQuestStageId: null,
            guild: {
              ...state.guild,
              chronicles: [entry, ...state.guild.chronicles].slice(0, 100),
            }
          };
        }
      }),

      unlockProp: (propId) => set(state => {
        const prop = DIORAMA_PROPS.find(p => p.id === propId);
        if (!prop || state.guild.unlockedPropIds.includes(propId)) return {};
        if (state.guild.resources.renown < prop.costRenown) return {};

        return {
          guild: {
            ...state.guild,
            resources: { ...state.guild.resources, renown: state.guild.resources.renown - prop.costRenown },
            unlockedPropIds: [...state.guild.unlockedPropIds, propId],
          }
        };
      }),

      setWeather: (weather) => set(state => ({
        guild: {
          ...state.guild,
          currentWeather: WEATHER_IDS.includes(weather) ? weather : 'clear',
        }
      })),

      addChronicleEntry: (entry) => set(state => ({
        guild: {
          ...state.guild,
          chronicles: [entry, ...state.guild.chronicles].slice(0, 100), // Keep last 100
        }
      })),

      setPolicy: (policyId) => set(state => {
        const active = [...state.guild.activePolicyIds];
        const idx = active.indexOf(policyId);
        
        if (idx !== -1) {
          active.splice(idx, 1);
        } else {
          if (active.length >= state.guild.maxPolicySlots) {
            active.shift(); // Remove oldest if full
          }
          active.push(policyId);
        }
        
        return {
          guild: {
            ...state.guild,
            activePolicyIds: active
          }
        };
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
          // ... (previous migration)
        }
        if (version < 5) {
          const guild = state.guild as Record<string, unknown> | undefined;
          if (guild && !guild.automationSettings) {
            guild.automationSettings = { autoDeploy: false, autoRefill: false };
          }
        }
        if (version < 6) {
          const guild = state.guild as Record<string, unknown> | undefined;
          if (guild && !guild.regionalInfluence) {
            guild.regionalInfluence = buildDefaultInfluence();
          }
        }
        if (version < 7) {
          const guild = state.guild as Record<string, unknown> | undefined;
          if (guild && !guild.unlockedArtifactIds) {
            guild.unlockedArtifactIds = [];
          }
        }
        if (version < 8) {
          state.activeHeroQuest = null;
          state.activeHeroQuestStageId = null;
          state.completedHeroQuestIds = [];
        }
        if (version < 9) {
          const guild = state.guild as Record<string, unknown> | undefined;
          if (guild) {
            guild.unlockedPropIds = (guild.unlockedPropIds as string[] | undefined) ?? [];
            const savedWeather = guild.currentWeather as string | undefined;
            guild.currentWeather = WEATHER_IDS.includes(savedWeather as WeatherId) ? savedWeather : 'clear';
            guild.chronicles = (guild.chronicles as ChronicleEntry[] | undefined) ?? [];
          }
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
