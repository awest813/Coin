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
import { CAMPAIGN_MISSIONS, STRATEGIC_ASSETS } from '~/data/campaign';
import { ARTIFACTS_MAP } from '~/data/artifacts';
import { HERO_QUESTS } from '~/data/heroQuests';
import { LEGENDARY_MERCENARIES } from '~/data/legendaryMercs';
import { DIORAMA_PROPS } from '~/types/customization';
import type { HeroQuest } from '~/types/heroQuests';

export interface StrategicAsset {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: { gold: number; renown: number };
  modifier: { type: string; value: number };
}

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
  | 'policies'
  | 'market'
  | 'warroom'
  | 'settings';

// Guild rank thresholds (contracts completed)
const RANK_THRESHOLDS = [0, 5, 12, 25, 45, 75, 120, 180, 260, 400];
const RANK_NAMES = [
  'Scratch Crew',
  'Known Band',
  'Established Guild',
  'Respected Order',
  'Legendary Company',
  'Elite Syndicate',
  'Regional Power',
  'Imperial Contender',
  'Sovereign Order',
  'Keep Wardens',
];

export function getGuildRankName(rank: number): string {
  return RANK_NAMES[Math.min(rank - 1, RANK_NAMES.length - 1)];
}

export function getNextRankThreshold(rank: number): number {
  return RANK_THRESHOLDS[Math.min(rank, RANK_THRESHOLDS.length - 1)] ?? 50;
}

/** Max concurrent missions allowed based on guild rank */
export function maxConcurrentMissions(guildRank: number): number {
  if (guildRank >= 10) return 6;
  if (guildRank >= 8) return 5;
  if (guildRank >= 6) return 4;
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
  equipItem: (mercId: string, slot: EquipmentSlot, inventoryIndex: number) => void;
  autoEquipMercenary: (mercId: string) => void;
  unequipItem: (mercId: string, slot: EquipmentSlot) => void;
  restMercenary: (mercId: string) => void;
  // inventory management
  sellItem: (inventoryIndex: number) => void;
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
  // stockpile
  depositToStockpile: (inventoryIndex: number) => void;
  withdrawFromStockpile: (itemId: string) => void;
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
  // market
  buyMaterial: (materialId: string, quantity: number, costPerUnit: number) => void;
  sellMaterial: (materialId: string, quantity: number, pricePerUnit: number) => void;
  repairItem: (mercId: string, slot: import('~/types/mercenary').EquipmentSlot) => void;
  investInBusiness: () => void;
  // campaign
  campaignStage: number;
  campaignActive: boolean;
  unlockedStrategicAssetIds: string[];
  startCampaign: () => void;
  purchaseStrategicAsset: (assetId: string) => void;
  prestigeMercenary: (mercId: string) => void;
  // toasts
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  // data
  resetGame: () => void;
  exportSave: () => string;
  importSave: (json: string) => boolean;
}

export interface GameToast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
}

const defaultRooms = (): RoomUpgrade[] => [
  {
    id: 'room_barracks',
    name: 'Barracks',
    icon: '🛏️',
    description: 'Bunks and basic recovery for the guild roster.',
    level: 1,
    maxLevel: 5,
    levels: [
      {
        description: 'Basic bunks. Mercs recover from fatigue between missions.',
        effects: { rosterCap: 10, recoveryBonus: 0, passiveSupplies: 0.05 },
        upgradeCost: { gold: 150, supplies: 10, renown: 5 },
      },
      {
        description: 'Proper beds and a healer on rotation. Injuries heal faster.',
        effects: { rosterCap: 15, recoveryBonus: 1, passiveSupplies: 0.15 },
        upgradeCost: { gold: 300, supplies: 20, renown: 10 },
      },
      {
        description: 'Full infirmary wing. Mercs bounce back quickly.',
        effects: { rosterCap: 20, recoveryBonus: 2, passiveSupplies: 0.4 },
        upgradeCost: { gold: 800, supplies: 50, renown: 30 },
      },
      {
        description: 'Luxury Suites. Mercs rest in style. Supply production doubled.',
        effects: { rosterCap: 30, recoveryBonus: 3, passiveSupplies: 1.0 },
        upgradeCost: { gold: 3500, supplies: 200, renown: 150 },
      },
      {
        description: 'The Hero\'s Rest. Legendary recovery speed. Industrial supply lines.',
        effects: { rosterCap: 50, recoveryBonus: 5, passiveSupplies: 3.0 },
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
    maxLevel: 5,
    levels: [
      {
        description: 'A hearth and a keg. Morale holds steady after tough missions.',
        effects: { moraleBonus: 0, eventChance: 0, passiveGold: 0.1 },
        upgradeCost: { gold: 150, supplies: 15, renown: 5 },
      },
      {
        description: 'Good food and music. Morale recovers faster. Stories spread.',
        effects: { moraleBonus: 1, eventChance: 1, passiveGold: 0.3 },
        upgradeCost: { gold: 300, supplies: 30, renown: 12 },
      },
      {
        description: 'Legendary hospitality. Mercs talk about this place in other towns.',
        effects: { moraleBonus: 2, eventChance: 2, passiveGold: 0.8 },
        upgradeCost: { gold: 900, supplies: 80, renown: 40 },
      },
      {
        description: 'Grand Gala Hall. Attracts wealthy patrons. Tax the locals.',
        effects: { moraleBonus: 3, eventChance: 4, passiveGold: 2.0 },
        upgradeCost: { gold: 4500, supplies: 300, renown: 200 },
      },
      {
        description: 'The Golden Hearth. Infinite morale and constant revenue.',
        effects: { moraleBonus: 5, eventChance: 8, passiveGold: 6.0 },
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
    maxLevel: 5,
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
        upgradeCost: { gold: 1000, supplies: 60, renown: 40 },
      },
      {
        description: 'Magical Resonance Forge. Artifact fragments can be sensed.',
        effects: { lootBonus: 3, forgeLevel: 4 },
        upgradeCost: { gold: 2500, supplies: 150, renown: 100 },
      },
      {
        description: 'The Sovereign Anvil. Perfect loot drops. Artifacts hum in its presence.',
        effects: { lootBonus: 5, forgeLevel: 5 },
        upgradeCost: { gold: 0, supplies: 0, renown: 0 },
      },
    ],
  },
];

const defaultGuild = (): Guild => ({
  name: 'The Tarnished Banner',
  resources: { gold: 300, supplies: 50, renown: 10 },
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
  guildMorale: 50,
  consumableStockpile: {},
  inventoryDurability: {},
  businessLevel: 0,
});

const defaultState = () => ({
  guild: defaultGuild(),
  mercenaries: INITIAL_MERCENARIES.slice(0, 4),
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
  toasts: [] as GameToast[],
  campaignStage: 0,
  campaignActive: false,
  unlockedStrategicAssetIds: [] as string[],
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
  if (guildRank >= 2 && !unlockedRegions.includes('Grey Mountains')) {
    unlockedRegions.push('Grey Mountains');
  }
  if (guildRank >= 3 && !unlockedRegions.includes('Ashfen Marsh')) {
    unlockedRegions.push('Ashfen Marsh');
  }
  if (guildRank >= 5 && !unlockedRegions.includes('City Below')) {
    unlockedRegions.push('City Below');
  }
  if (guildRank >= 7 && !unlockedRegions.includes('Pale Border')) {
    unlockedRegions.push('Pale Border');
  }
  if (guildRank >= 9 && !unlockedRegions.includes('Whispering Peaks')) {
    unlockedRegions.push('Whispering Peaks');
  }
  if (guildRank >= 10 && !unlockedRegions.includes('Sovereign Keep')) {
    unlockedRegions.push('Sovereign Keep');
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
          const activePerks = getAllActivePerks(state.guild.regionalInfluence);
          const artifacts = state.guild.unlockedArtifactIds.map(id => ARTIFACTS_MAP[id]).filter(Boolean);
          const durationMod = artifacts.reduce((acc, art) => {
            const mod = art.modifiers.find(m => m.type === 'mission_duration');
            return acc + (mod?.value ?? 0);
          }, 0);
          
          let finalDurationMod = durationMod;
          // Apply Perk: peaks_storm_riders (-25% duration)
          if (activePerks.has('peaks_storm_riders')) {
            finalDurationMod -= 0.25;
          }
          duration = Math.max(1, Math.floor(duration * (1 + finalDurationMod)));

          // Apply Policy: safety_first
          if (state.guild.activePolicyIds.includes('safety_first')) {
            duration = Math.floor(duration * 1.25);
          }

          const endTime = new Date(new Date(mission.startedAt).getTime() + duration * 1000).toISOString();

          // ── Auto-Deploy Consumables (Phase 5) ──────────────────────────────
          let finalConsumables = [...(mission.consumablesAssigned ?? [])];
          const updatedStockpile = { ...state.guild.consumableStockpile };

          if (state.guild.automationSettings.autoDeploy && state.guild.guildRank >= 4) {
            const needed = [];
            if (template && template.difficulty >= 10 && updatedStockpile['bandages'] > 0 && !finalConsumables.includes('bandages')) {
              needed.push('bandages');
            }
            if (updatedStockpile['field_rations'] > 0 && !finalConsumables.includes('field_rations')) {
              needed.push('field_rations');
            }
            if (template && (template.tags.includes('ruin') || template.tags.includes('exploration'))) {
              if (updatedStockpile['torch_bundle'] > 0 && !finalConsumables.includes('torch_bundle')) needed.push('torch_bundle');
              if (updatedStockpile['scouts_cloak'] > 0 && !finalConsumables.includes('scouts_cloak')) needed.push('scouts_cloak');
            }
            if (template && (template.tags.includes('social') || template.tags.includes('escort'))) {
               if (updatedStockpile['sigil_badge'] > 0 && !finalConsumables.includes('sigil_badge')) needed.push('sigil_badge');
            }

            for (const itemId of needed) {
              if (updatedStockpile[itemId] > 0) {
                finalConsumables.push(itemId);
                updatedStockpile[itemId] -= 1;
                if (updatedStockpile[itemId] <= 0) delete updatedStockpile[itemId];
                state.addToast(`Logistics: Auto-deployed ${itemId.replace('_', ' ')}`, 'info');
              }
            }
          }

          return {
            activeMissions: [...state.activeMissions, { ...mission, endTime, consumablesAssigned: finalConsumables }],
            guild: { ...state.guild, consumableStockpile: updatedStockpile },
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
          let finalGoldMod = goldMod;
          // Apply Perk: city_informants (+10% global gold)
          if (activePerks.has('city_informants')) {
            finalGoldMod += 0.10;
          }
          // Apply Perk: sovereign_authority (+25% global gold)
          if (activePerks.has('sovereign_authority')) {
            finalGoldMod += 0.25;
          }
          finalGoldEarned = Math.floor(finalGoldEarned * (1 + finalGoldMod));

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
          // Base cap scales with rank: 100 + rank*200
          const baseCap = 100 + (state.guild.guildRank * 200);
          const supplyCap = baseCap + supplyCapMod;

          // Separate items from artifacts
          const newItems = finalItemsEarned.filter(id => !ARTIFACTS_MAP[id]);
          const newArtifacts = finalItemsEarned.filter(id => ARTIFACTS_MAP[id] && !state.guild.unlockedArtifactIds.includes(id));

          // Update inventory
          const inventoryItemIds = [
            ...state.guild.inventoryItemIds,
            ...newItems,
          ];

          const unlockedArtifactIds = [
            ...state.guild.unlockedArtifactIds,
            ...newArtifacts,
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
          const extraMaterials = (result as MissionResult & { materialsEarned?: Record<string, number> }).materialsEarned ?? {};
          
          // Apply Perk: mountain_quarry (+1 iron_scraps from all successful missions)
          if (activePerks.has('mountain_quarry') && result.outcome !== 'failure') {
            materials['iron_scraps'] = (materials['iron_scraps'] ?? 0) + 1;
          }

          for (const [matId, qty] of Object.entries(extraMaterials)) {
            materials[matId] = (materials[matId] ?? 0) + qty;
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

              // Skill XP Gain
              const newSkills = { ...(m.skills ?? {}) };
              const xpGained = result.skillXP?.[m.id] ?? {};
              for (const [skillId, xp] of Object.entries(xpGained)) {
                newSkills[skillId as keyof typeof newSkills] = (newSkills[skillId as keyof typeof newSkills] ?? 0) + xp;
              }

              return {
                ...m,
                missionsCompleted: m.missionsCompleted + 1,
                isInjured: injured,
                isFatigued: fatigued,
                morale: Math.max(0, Math.min(10, m.morale + moraleDelta)),
                skills: newSkills,
              };
            }

            // Apply durability loss if provided
            if (result.durabilityLoss) {
               const lossData = result.durabilityLoss.find(l => l.mercId === m.id);
               if (lossData) {
                  const newDur = { ...(m.equipmentDurability ?? {}) };
                  for (const [slot, loss] of Object.entries(lossData.loss)) {
                     const current = newDur[slot as import('~/types/mercenary').EquipmentSlot] ?? 100;
                     newDur[slot as import('~/types/mercenary').EquipmentSlot] = Math.max(0, current - (loss as number));
                  }
                  return { ...m, equipmentDurability: newDur };
               }
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

          // Guild Morale update based on mission outcome
          let moraleDelta = result.outcome === 'success' ? 1 : result.outcome === 'failure' ? -3 : 0;
          // Policy: profit_maximization → additional morale decay on failure
          if (state.guild.activePolicyIds.includes('profit_maximization') && result.outcome === 'failure') {
            moraleDelta -= 2;
          }
          const newGuildMorale = Math.max(0, Math.min(100, state.guild.guildMorale + moraleDelta));

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
            guildMorale: newGuildMorale,
            unlockedArtifactIds,
          };

          // ── Campaign Progress ─────────────────────────────────────────────
          let campaignStage = state.campaignStage;
          if (template?.isCampaign && result.outcome === 'success') {
            campaignStage += 1;
            state.addToast(`Campaign Progress: Stage ${campaignStage} Complete!`, 'warning');
          }

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
            campaignStage,
          };
        }),

      dismissResult: () => set({ showResultModal: false }),

      updateMercenary: (merc) =>
        set((state) => ({
          mercenaries: state.mercenaries.map((m) => (m.id === merc.id ? merc : m)),
        })),

      equipItem: (mercId, slot, itemIdx) =>
        set((state) => {
          const merc = state.mercenaries.find((m) => m.id === mercId);
          if (!merc) return {};

          const itemId = state.guild.inventoryItemIds[itemIdx];
          if (!itemId) return {};

          const previousItemId = merc.equipment[slot];
          let inventoryItemIds = [...state.guild.inventoryItemIds];

          // Remove item from inventory
          inventoryItemIds.splice(itemIdx, 1);

          if (previousItemId) {
            inventoryItemIds = [...inventoryItemIds, previousItemId];
          }

          const updatedMerc: Mercenary = {
            ...merc,
            equipment: { ...merc.equipment, [slot]: itemId },
            equipmentDurability: { 
              ...(merc.equipmentDurability ?? {}), 
              [slot]: state.guild.inventoryDurability[itemIdx] ?? 100 
            },
          };

          const updatedInventoryDurability: Record<number, number> = {};
          Object.entries(state.guild.inventoryDurability).forEach(([idxStr, dur]) => {
            const idx = parseInt(idxStr);
            if (idx < itemIdx) {
              updatedInventoryDurability[idx] = dur;
            } else if (idx > itemIdx) {
              updatedInventoryDurability[idx - 1] = dur;
            }
          });

          // Add previous item's durability back to inventory (it will be at the end)
          if (previousItemId) {
            const prevDur = merc.equipmentDurability?.[slot] ?? 100;
            if (prevDur < 100) {
              updatedInventoryDurability[inventoryItemIds.length - 1] = prevDur;
            }
          }

          return {
            mercenaries: state.mercenaries.map((m) => (m.id === mercId ? updatedMerc : m)),
            guild: { ...state.guild, inventoryItemIds, inventoryDurability: updatedInventoryDurability },
          };
        }),
      
      autoEquipMercenary: (mercId) =>
        set((state) => {
          const merc = state.mercenaries.find(m => m.id === mercId);
          if (!merc) return {};

          const inventory = state.guild.inventoryItemIds.map((id, idx) => ({
            id,
            idx,
            item: ITEMS_MAP[id] || state.items[id],
            dur: state.guild.inventoryDurability[idx] ?? 100
          })).filter(entry => entry.item);

          const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
          let currentMerc = { ...merc };
          let currentInventory = [...state.guild.inventoryItemIds];
          let currentInventoryDurability = { ...state.guild.inventoryDurability };

          // Class-based stat prioritization
          let primaryStat: 'strength' | 'agility' | 'intellect' | 'presence' = 'strength';
          if (merc.classRole === 'Infiltrator' || merc.classRole === 'Scout' || merc.classRole === 'Street Thief') primaryStat = 'agility';
          if (merc.classRole === 'Scholar' || merc.classRole === 'Hedge Witch') primaryStat = 'intellect';
          if (merc.classRole === 'Diplomat' || merc.classRole === 'Disgraced Noble') primaryStat = 'presence';

          for (const slot of slots) {
            const available = inventory.filter(e => e.item.category === slot && e.dur > 0);
            if (available.length === 0) continue;

            // Find best item based on primary stat bonus
            const bestEntry = available.reduce((best, curr) => {
              const bestBonus = best.item.statBonus?.[primaryStat] ?? 0;
              const currBonus = curr.item.statBonus?.[primaryStat] ?? 0;
              if (currBonus > bestBonus) return curr;
              if (currBonus === bestBonus && curr.item.value > best.item.value) return curr;
              return best;
            });

            // Compare with current equipment
            const currentEquippedId = currentMerc.equipment[slot];
            const currentEquippedItem = currentEquippedId ? (ITEMS_MAP[currentEquippedId] || state.items[currentEquippedId]) : null;
            const currentBonus = currentEquippedItem?.statBonus?.[primaryStat] ?? -1;
            const bestBonus = bestEntry.item.statBonus?.[primaryStat] ?? 0;

            if (bestBonus > currentBonus || !currentEquippedItem) {
              // Equip it! (Simulate the logic of equipItem)
              const previousId = currentMerc.equipment[slot];
              const previousDur = currentMerc.equipmentDurability?.[slot] ?? 100;

              currentMerc.equipment = { ...currentMerc.equipment, [slot]: bestEntry.id };
              currentMerc.equipmentDurability = { ...currentMerc.equipmentDurability, [slot]: bestEntry.dur };

              // Remove from inventory
              const itemIdx = currentInventory.indexOf(bestEntry.id);
              if (itemIdx !== -1) {
                currentInventory.splice(itemIdx, 1);
                // Shift durabilities
                const newDurs: Record<number, number> = {};
                Object.entries(currentInventoryDurability).forEach(([idxStr, d]) => {
                  const idx = parseInt(idxStr);
                  if (idx < itemIdx) newDurs[idx] = d;
                  else if (idx > itemIdx) newDurs[idx - 1] = d;
                });
                currentInventoryDurability = newDurs;
              }

              // Add previous back to inventory
              if (previousId) {
                currentInventory.push(previousId);
                if (previousDur < 100) {
                  currentInventoryDurability[currentInventory.length - 1] = previousDur;
                }
              }
            }
          }

          return {
            mercenaries: state.mercenaries.map(m => m.id === mercId ? currentMerc : m),
            guild: {
              ...state.guild,
              inventoryItemIds: currentInventory,
              inventoryDurability: currentInventoryDurability
            }
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

          const newDur = { ...(merc.equipmentDurability ?? {}) };
          const itemDur = newDur[slot] ?? 100;
          delete newDur[slot];

          const inventoryItemIds = [...state.guild.inventoryItemIds, itemId];
          const inventoryDurability = { ...state.guild.inventoryDurability };
          if (itemDur < 100) {
            inventoryDurability[inventoryItemIds.length - 1] = itemDur;
          }

          return {
            mercenaries: state.mercenaries.map((m) =>
              m.id === mercId ? { ...m, equipment: newEquip, equipmentDurability: newDur } : m
            ),
            guild: {
              ...state.guild,
              inventoryItemIds,
              inventoryDurability,
            },
          };
        }),

      restMercenary: (mercId) =>
        set((state) => {
          const merc = state.mercenaries.find((m) => m.id === mercId);
          if (!merc || (!merc.isInjured && !merc.isFatigued)) return {};

          const tavern = state.guild.rooms.find(r => r.id === 'room_tavern');
          const tavernLevel = tavern?.level ?? 1;
          const baseCost = merc.isInjured ? 30 : 15;
          const cost = Math.floor(baseCost * (1 + (tavernLevel - 1) * 0.5));
          const suppliesCost = merc.isInjured ? 10 : 5;

          if (state.guild.resources.gold < cost || state.guild.resources.supplies < suppliesCost) {
            return {};
          }

          const newMorale = Math.min(10, merc.morale + 2);
          const updatedMerc = {
            ...merc,
            isInjured: false,
            isFatigued: false,
            morale: newMorale,
          };

          const newGuildMorale = Math.min(100, state.guild.guildMorale + 1);

          return {
            mercenaries: state.mercenaries.map((m) => (m.id === mercId ? updatedMerc : m)),
            guild: {
              ...state.guild,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - cost,
                supplies: state.guild.resources.supplies - suppliesCost,
              },
              guildMorale: newGuildMorale,
            },
          };
        }),

      sellItem: (itemIdx) =>
        set((state) => {
          const itemId = state.guild.inventoryItemIds[itemIdx];
          if (!itemId) return {};
          const item = state.items[itemId];
          if (!item) return {};
          
          const inventoryItemIds = [...state.guild.inventoryItemIds];
          inventoryItemIds.splice(itemIdx, 1);

          const updatedInventoryDurability: Record<number, number> = {};
          Object.entries(state.guild.inventoryDurability).forEach(([idxStr, dur]) => {
            const idx = parseInt(idxStr);
            if (idx < itemIdx) {
              updatedInventoryDurability[idx] = dur;
            } else if (idx > itemIdx) {
              updatedInventoryDurability[idx - 1] = dur;
            }
          });

          return {
            guild: {
              ...state.guild,
              inventoryItemIds,
              inventoryDurability: updatedInventoryDurability,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold + item.value,
              },
            },
          };
        }),

      depositToStockpile: (itemIdx) =>
        set((state) => {
          const itemId = state.guild.inventoryItemIds[itemIdx];
          if (!itemId) return {};
          const item = state.items[itemId] ?? (ITEMS_MAP[itemId]);
          if (!item || item.category !== 'consumable') return {};
          
          const inventoryItemIds = [...state.guild.inventoryItemIds];
          inventoryItemIds.splice(itemIdx, 1);
          
          const stockpile = { ...state.guild.consumableStockpile };
          stockpile[itemId] = (stockpile[itemId] ?? 0) + 1;

          // Note: consumables usually don't have durability, but we should shift anyway
          const updatedInventoryDurability: Record<number, number> = {};
          Object.entries(state.guild.inventoryDurability).forEach(([idxStr, dur]) => {
            const idx = parseInt(idxStr);
            if (idx < itemIdx) updatedInventoryDurability[idx] = dur;
            else if (idx > itemIdx) updatedInventoryDurability[idx - 1] = dur;
          });

          return {
            guild: {
              ...state.guild,
              inventoryItemIds,
              inventoryDurability: updatedInventoryDurability,
              consumableStockpile: stockpile,
            },
          };
        }),

      withdrawFromStockpile: (itemId) =>
        set((state) => {
          const stockpile = { ...state.guild.consumableStockpile };
          if (!stockpile[itemId] || stockpile[itemId] <= 0) return {};
          stockpile[itemId] -= 1;
          if (stockpile[itemId] <= 0) delete stockpile[itemId];

          return {
            guild: {
              ...state.guild,
              inventoryItemIds: [...state.guild.inventoryItemIds, itemId],
              consumableStockpile: stockpile,
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
            toasts: [
              ...state.toasts,
              { id: Math.random().toString(36).slice(2), message: `Forged: ${newItem.name}`, type: 'success', createdAt: Date.now() }
            ].slice(-5)
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
            skills: recruit.skills || {},
            level: recruit.level || 1,
            classRole: recruit.classRole,
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
            toasts: [
              ...state.toasts,
              { id: Math.random().toString(36).slice(2), message: `Hired: ${newMerc.name}`, type: 'success', createdAt: Date.now() }
            ].slice(-5)
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
          
          // ── Dynamic World Events (Phase 5 Polish) ──────────────────────────
          // 0.5% chance per second to trigger a minor world shift
          if (seededRandom(now.toString()) < 0.005 * cappedDelta) {
            const events = [
              { msg: 'A sudden fog rolls over the Ashfen Marsh.', weather: 'fog' },
              { msg: 'Heavy rain batters the Grey Mountains.', weather: 'rain' },
              { msg: 'A clear sky opens over the City Below.', weather: 'clear' },
              { msg: 'A local merchant offers a discount on supplies!', supplies: 20 },
              { msg: 'A wandering bard boosts the guild\'s spirits.', morale: 5 },
            ];
            const event = events[Math.floor(seededRandom(now.toString() + 'ev') * events.length)];
            state.addToast(event.msg, 'info');
            
            if (event.weather) state.setWeather(event.weather as any);
            if (event.supplies) state.guild.resources.supplies += event.supplies;
            if (event.morale) state.guild.guildMorale = Math.min(100, state.guild.guildMorale + event.morale);
          }
          
          const activePerks = getAllActivePerks(state.guild.regionalInfluence);
          const bizMod = 1 + (state.guild.businessLevel * 0.1);
          const goldRate = (tavern ? getRoomEffect(tavern, 'passiveGold') : 0) * (1 + (state.guild.guildRank - 1) * 0.2) * bizMod;
          const suppliesRate = (barracks ? getRoomEffect(barracks, 'passiveSupplies') : 0) * (1 + (state.guild.guildRank - 1) * 0.2) * bizMod;
          
          const maintenanceCost = state.mercenaries.length * 0.1;
          const netSuppliesRate = suppliesRate - maintenanceCost;

          let trainingCostPerSec = 0.05;
          let trainingProgressPerSec = 1;

          // Policy: rigorous_training → 2x speed, 2x cost
          if (state.guild.activePolicyIds.includes('rigorous_training')) {
            trainingCostPerSec *= 2;
            trainingProgressPerSec *= 2;
          }

          let updatedSupplies = state.guild.resources.supplies + (cappedDelta * netSuppliesRate);
          const outOfSupplies = updatedSupplies <= 0;
          if (outOfSupplies) updatedSupplies = 0;

          const updatedMercs = [...state.mercenaries];

          // Handle Training and Supply Penalties
          for (let i = 0; i < updatedMercs.length; i++) {
            const m = updatedMercs[i];
            
            // 1. Training
            if (m.isTraining && !m.isInjured && !m.isFatigued) {
              const totalCost = cappedDelta * trainingCostPerSec;
              if (updatedSupplies >= totalCost) {
                updatedSupplies -= totalCost;
                const progressGained = cappedDelta * trainingProgressPerSec;
                const newProgress = (m.trainingProgress ?? 0) + progressGained;
                
                if (newProgress >= 100) {
                  const statToBoost = m.trainingStat ?? 'strength';
                  const currentStat = m.stats[statToBoost];
                  
                  updatedMercs[i] = {
                    ...m,
                    trainingProgress: newProgress - 100,
                    level: (m.level ?? 1) + 1,
                    stats: {
                      ...m.stats,
                      [statToBoost]: Math.min(10, currentStat + 1)
                    }
                  };
                  // Add Level Up Toast
                  state.addToast(`${m.name} leveled up! (${statToBoost.toUpperCase()} +1)`, 'success');
                } else {
                  updatedMercs[i] = { ...m, trainingProgress: newProgress };
                }
              } else {
                updatedMercs[i] = { ...m, isTraining: false };
              }
            }

            // 2. Out of Supplies Penalty
            if (outOfSupplies && Math.random() < 0.05 * cappedDelta) {
              updatedMercs[i] = { ...updatedMercs[i], isFatigued: true };
            }
          }

          const goldCap = 5000 + state.guild.guildRank * 5000;
          const suppliesCap = 500 + state.guild.guildRank * 500;

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
                    activePerkIds: Array.from(Object.values(state.guild.regionalInfluence).flatMap(ri => ri.unlockedPerks)),
                    activePolicyIds: state.guild.activePolicyIds,
                    guildMorale: state.guild.guildMorale,
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
              // Difficulty Gating: Max difficulty available increases with rank
              const maxDiff = 5 + (state.guild.guildRank * 1.5);
              
              const allPossible = [...MISSION_TEMPLATES].filter(t => t.difficulty <= maxDiff);
              if (state.campaignActive && state.campaignStage < CAMPAIGN_MISSIONS.length) {
                allPossible.push(CAMPAIGN_MISSIONS[state.campaignStage]);
              }

              const availableMission = allPossible.find(t => 
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

                  // Auto-consume from stockpile
                  const CONSUMABLE_IDS = ['bandages', 'field_rations', 'torch_bundle', 'lucky_salve', 'smoke_bomb'];
                  const updatedStockpile = { ...state.guild.consumableStockpile };
                  for (const cid of CONSUMABLE_IDS) {
                    if (autoConsumables.length >= 2) break;
                    if (updatedStockpile[cid] && updatedStockpile[cid] > 0) {
                      autoConsumables.push(cid);
                      updatedStockpile[cid] -= 1;
                      if (updatedStockpile[cid] <= 0) delete updatedStockpile[cid];
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
                      consumableStockpile: updatedStockpile,
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
            // 2. Passive Morale Recovery
            // Perk: ashfen_herbalist → +50% morale recovery
            let moraleRecRate = 0.001 * (1 + (state.guild.businessLevel * 0.05));
            if (activePerks.has('ashfen_herbalist')) moraleRecRate *= 1.5;
            
            if (!m.isTraining && !m.isInjured && m.morale < 10) {
              updatedMercs[i] = { ...m, morale: Math.min(10, m.morale + (cappedDelta * moraleRecRate)) };
            }
          }

          // Handle Recruit Refresh (Perk: city_contacts)
          const lastRefreshTime = new Date(state.lastRecruitRefresh).getTime();
          let refreshCooldownMs = 900 * 1000; // 15 mins default
          if (activePerks.has('city_contacts')) refreshCooldownMs = 300 * 1000; // 5 mins
          
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
        const currentUnlockedArtifactIds = [...state.guild.unlockedArtifactIds];
        let totalMissionsCompleted = 0;

        const tavern = state.guild.rooms.find(r => r.id === 'room_tavern');
        const barracks = state.guild.rooms.find(r => r.id === 'room_barracks');
        const forge = state.guild.rooms.find(r => r.id === 'room_forge');
        const goldRate = tavern ? getRoomEffect(tavern, 'passiveGold') : 0;
        const suppliesRate = barracks ? getRoomEffect(barracks, 'passiveSupplies') : 0;
        const forgeLevel = forge ? getRoomEffect(forge, 'forgeLevel') : 1;

        const goldCap = 1000 + state.guild.guildRank * 1000;
        const artifacts = state.guild.unlockedArtifactIds.map(id => ARTIFACTS_MAP[id]).filter(Boolean);
        const supplyCapMod = artifacts.reduce((acc, art) => {
          const mod = art.modifiers.find(m => m.type === 'supply_cap');
          return acc + (mod?.value ?? 0);
        }, 0);
        const suppliesCap = 100 + state.guild.guildRank * 200 + supplyCapMod;

        for (let i = 0; i < steps; i++) {
          const stepNow = state.lastTickTime + (i * stepDelta * 1000);
          
          // 1. Passive Gains (scaled with rank and business level)
          const bizMod = 1 + (state.guild.businessLevel * 0.1);
          const scaledGoldRate = goldRate * (1 + (state.guild.guildRank - 1) * 0.2) * bizMod;
          const scaledSuppliesRate = suppliesRate * (1 + (state.guild.guildRank - 1) * 0.2) * bizMod;
          const maintenanceCost = currentMercs.length * 0.01;
          const netSuppliesRate = scaledSuppliesRate - maintenanceCost;

          currentResources.gold = Math.min(goldCap, currentResources.gold + (stepDelta * scaledGoldRate));
          currentResources.supplies = Math.max(0, Math.min(suppliesCap, currentResources.supplies + (stepDelta * netSuppliesRate)));
          const stepOutOfSupplies = currentResources.supplies <= 0;

          // 2. Training and Penalties
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
                    level: (m.level ?? 1) + 1,
                    stats: { ...m.stats, [stat]: Math.min(10, m.stats[stat] + 1) }
                  };
                } else {
                  currentMercs[j] = { ...m, trainingProgress: progress };
                }
              } else {
                currentMercs[j] = { ...m, isTraining: false };
              }
            }

            // Out of supplies penalty
            if (stepOutOfSupplies && Math.random() < 0.05 * (stepDelta / 60)) {
               currentMercs[j] = { ...currentMercs[j], isFatigued: true };
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
                    activePerkIds: Array.from(Object.values(state.guild.regionalInfluence).flatMap(ri => ri.unlockedPerks)),
                    activePolicyIds: state.guild.activePolicyIds,
                    guildMorale: state.guild.guildMorale,
                  });
                  currentResources.gold = Math.min(goldCap, currentResources.gold + result.goldEarned);
                  currentResources.renown += result.renownEarned;
                  
                  for (const id of result.itemsEarned) {
                    if (ARTIFACTS_MAP[id]) {
                      if (!currentUnlockedArtifactIds.includes(id)) currentUnlockedArtifactIds.push(id);
                    } else {
                      currentInventory.push(id);
                    }
                  }
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
            unlockedArtifactIds: currentUnlockedArtifactIds,
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
          icon: '🌟',
        };

        return {
          mercenaries: [...state.mercenaries, rewardMerc],
          completedHeroQuestIds: [...state.completedHeroQuestIds, questId],
          activeHeroQuest: null,
          activeHeroQuestStageId: null,
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

        // Stat/Skill Check: If choice has a requirement, check if anyone in the roster meets it
        if (choice.requirement) {
          const { type, stat, value } = choice.requirement;
          const meetsReq = state.mercenaries.some(m => {
            if (type === 'skill') {
              return (m.skills?.[stat as keyof typeof m.skills] ?? 0) >= value;
            }
            return (m.stats[stat as keyof MercStats] ?? 0) >= value;
          });
          
          if (!meetsReq) return {};
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

      buyMaterial: (materialId, quantity, costPerUnit) =>
        set((state) => {
          const totalCost = quantity * costPerUnit;
          if (state.guild.resources.gold < totalCost) return {};
          
          const materials = { ...state.guild.materials };
          materials[materialId] = (materials[materialId] ?? 0) + quantity;
          
          return {
            guild: {
              ...state.guild,
              materials,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - totalCost,
              },
            },
            toasts: [
              ...state.toasts,
              { id: Math.random().toString(36).slice(2), message: `Purchased materials for ${totalCost}g`, type: 'success', createdAt: Date.now() }
            ].slice(-5)
          };
        }),

      sellMaterial: (materialId, quantity, pricePerUnit) =>
        set((state) => {
          const currentQty = state.guild.materials[materialId] ?? 0;
          if (currentQty < quantity) return {};
          
          const materials = { ...state.guild.materials };
          materials[materialId] = currentQty - quantity;
          if (materials[materialId] <= 0) delete materials[materialId];
          
          return {
            guild: {
              ...state.guild,
              materials,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold + (quantity * pricePerUnit),
              },
            },
            toasts: [
              ...state.toasts,
              { id: Math.random().toString(36).slice(2), message: `Sold materials for ${quantity * pricePerUnit}g`, type: 'success', createdAt: Date.now() }
            ].slice(-5)
          };
        }),

      repairItem: (mercId, slot) =>
        set((state) => {
          const merc = state.mercenaries.find(m => m.id === mercId);
          if (!merc) return {};
          const itemId = merc.equipment[slot];
          if (!itemId) return {};
          const item = ITEMS_MAP[itemId];
          if (!item) return {};

          const currentDur = merc.equipmentDurability?.[slot] ?? 100;
          if (currentDur >= 100) return {};

          const repairCostGold = Math.floor(item.value * 0.3);
          const repairCostMat = item.rarity === 'common' ? 1 : 3;
          const matId = item.category === 'weapon' ? 'iron_scraps' : item.category === 'armor' ? 'tanned_hide' : 'rough_cloth';

          if (state.guild.resources.gold < repairCostGold || (state.guild.materials[matId] ?? 0) < repairCostMat) {
             return {};
          }

          const updatedMaterials = { ...state.guild.materials };
          updatedMaterials[matId] -= repairCostMat;
          if (updatedMaterials[matId] <= 0) delete updatedMaterials[matId];

          const updatedMerc = {
             ...merc,
             equipmentDurability: { ...merc.equipmentDurability, [slot]: 100 }
          };

          return {
             mercenaries: state.mercenaries.map(m => m.id === mercId ? updatedMerc : m),
             guild: {
                ...state.guild,
                materials: updatedMaterials,
                resources: {
                   ...state.guild.resources,
                   gold: state.guild.resources.gold - repairCostGold
                }
             },
             toasts: [
               ...state.toasts,
               { id: Math.random().toString(36).slice(2), message: `Repaired gear for ${merc.name}`, type: 'success', createdAt: Date.now() }
             ].slice(-5)
          };
        }),

      investInBusiness: () =>
        set((state) => {
          const cost = 500 + (state.guild.businessLevel * 500);
          if (state.guild.resources.gold < cost) return {};

          return {
            guild: {
              ...state.guild,
              businessLevel: state.guild.businessLevel + 1,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - cost
              }
            },
            toasts: [
              ...state.toasts,
              { id: Math.random().toString(36).slice(2), message: `Business expanded to level ${state.guild.businessLevel + 1}!`, type: 'success', createdAt: Date.now() }
            ].slice(-5)
          };
        }),
      startCampaign: () =>
        set((state) => ({
          campaignActive: true,
          campaignStage: 0,
          toasts: [
            ...state.toasts,
            { id: Math.random().toString(36).slice(2), message: "The Grand Campaign has Begun!", type: 'warning', createdAt: Date.now() }
          ].slice(-5)
        })),
      purchaseStrategicAsset: (assetId: string) =>
        set((state) => {
          const asset = STRATEGIC_ASSETS.find(a => a.id === assetId);
          if (!asset) return {};
          if (state.guild.resources.gold < asset.cost.gold || state.guild.resources.renown < asset.cost.renown) return {};
          if (state.unlockedStrategicAssetIds.includes(assetId)) return {};

          return {
            guild: {
              ...state.guild,
              resources: {
                ...state.guild.resources,
                gold: state.guild.resources.gold - asset.cost.gold,
                renown: state.guild.resources.renown - asset.cost.renown,
              }
            },
            unlockedStrategicAssetIds: [...state.unlockedStrategicAssetIds, assetId],
            toasts: [
              ...state.toasts,
              { id: Math.random().toString(36).slice(2), message: `Asset Acquired: ${asset.name}`, type: 'success', createdAt: Date.now() }
            ].slice(-5)
          };
        }),
      prestigeMercenary: (mercId) =>
        set((state) => {
          const merc = state.mercenaries.find(m => m.id === mercId);
          if (!merc || merc.isLegendary) return {};

          // Requirements: 20 missions completed AND 250 Renown
          const PRESTIGE_COST = 250;
          const MISSIONS_REQ = 20;

          if (merc.missionsCompleted < MISSIONS_REQ || state.guild.resources.renown < PRESTIGE_COST) {
            state.addToast(`Requirement failed: ${MISSIONS_REQ} missions and ${PRESTIGE_COST} renown needed.`, 'error');
            return {};
          }

          // Generate a unique trait based on their best stat
          const bestStat = Object.entries(merc.stats).reduce((a, b) => a[1] > b[1] ? a : b)[0];
          let uniqueTrait = '';
          switch (bestStat) {
            case 'strength': uniqueTrait = 'Titan\'s Might: +10 Party Score on Combat missions.'; break;
            case 'agility': uniqueTrait = 'Wind-Walker: +10 Party Score on Stealth missions.'; break;
            case 'intellect': uniqueTrait = 'Oracle: +10 Party Score on Ruin/Exploration missions.'; break;
            case 'presence': uniqueTrait = 'Sovereign Voice: +10 Party Score on Social missions.'; break;
          }

          const updatedMerc: Mercenary = {
            ...merc,
            isLegendary: true,
            uniqueTrait,
            title: `Legendary ${merc.title}`,
            stats: {
              strength: Math.min(10, merc.stats.strength + 1),
              agility: Math.min(10, merc.stats.agility + 1),
              intellect: Math.min(10, merc.stats.intellect + 1),
              presence: Math.min(10, merc.stats.presence + 1),
            }
          };

          const entry: ChronicleEntry = {
            id: `chronicle_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'hero_unlock',
            title: `Legend Risen: ${merc.name}`,
            description: `${merc.name} has transcended their mortal limits and entered the guild's eternal chronicles.`,
            icon: '🔥',
          };

          return {
            mercenaries: state.mercenaries.map(m => m.id === mercId ? updatedMerc : m),
            guild: {
              ...state.guild,
              resources: { ...state.guild.resources, renown: state.guild.resources.renown - PRESTIGE_COST },
              chronicles: [entry, ...state.guild.chronicles].slice(0, 100),
            },
            toasts: [
              ...state.toasts,
              { id: Math.random().toString(36).slice(2), message: `${merc.name} has become a Legend!`, type: 'warning', createdAt: Date.now() }
            ].slice(-5)
          };
        }),

      addToast: (message, type = 'info') =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { id: Math.random().toString(36).slice(2), message, type, createdAt: Date.now() },
          ].slice(-5), // Keep only last 5 toasts
        })),

      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      resetGame: () => {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
          localStorage.removeItem('banner-coin-save');
          window.location.reload();
        }
      },

      exportSave: () => {
        const state = get();
        return btoa(JSON.stringify(state)); // Simple base64 encoding
      },

      importSave: (encodedJson: string) => {
        try {
          const json = atob(encodedJson);
          const state = JSON.parse(json);
          // Simple validation
          if (state && state.guild && state.mercenaries) {
            set({ ...state, isInMainMenu: true, activeScreen: 'dashboard' });
            return true;
          }
        } catch (e) {
          console.error('Failed to import save', e);
        }
        return false;
      },
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
        if (version < 10) {
          const guild = state.guild as Record<string, unknown> | undefined;
          if (guild && guild.guildMorale === undefined) {
            guild.guildMorale = 50;
          }
        }
        if (version < 11) {
          const guild = state.guild as Record<string, unknown> | undefined;
          if (guild && !guild.consumableStockpile) {
            guild.consumableStockpile = {};
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
