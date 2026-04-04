import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mercenary, EquipmentSlot } from '~/types/mercenary';
import type { Item } from '~/types/item';
import type { ActiveMission, MissionResult } from '~/types/mission';
import type { Guild, RoomUpgrade } from '~/types/guild';
import { SAVE_VERSION } from '~/types/save';
import { INITIAL_MERCENARIES } from '~/data/mercenaries';
import { ITEMS_MAP } from '~/data/items';

export type ActiveScreen = 'dashboard' | 'roster' | 'missions' | 'inventory';

interface GameState {
  guild: Guild;
  mercenaries: Mercenary[];
  items: Record<string, Item>;
  activeMission: ActiveMission | null;
  lastResult: MissionResult | null;
  activeScreen: ActiveScreen;
  showResultModal: boolean;

  // navigation
  setScreen: (screen: ActiveScreen) => void;
  // mission
  setActiveMission: (mission: ActiveMission | null) => void;
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
        upgradeCost: { gold: 0, supplies: 0, renown: 0 }, // max level
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
});

const defaultState = () => ({
  guild: defaultGuild(),
  mercenaries: INITIAL_MERCENARIES,
  items: ITEMS_MAP,
  activeMission: null,
  lastResult: null,
  activeScreen: 'dashboard' as ActiveScreen,
  showResultModal: false,
});

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...defaultState(),

      setScreen: (screen) => set({ activeScreen: screen }),

      setActiveMission: (mission) => set({ activeMission: mission }),

      applyMissionResult: (result) =>
        set((state) => {
          // update guild resources
          const resources = {
            ...state.guild.resources,
            gold: state.guild.resources.gold + result.goldEarned,
            renown: state.guild.resources.renown + result.renownEarned,
          };

          // update inventory
          const inventoryItemIds = [
            ...state.guild.inventoryItemIds,
            ...result.itemsEarned,
          ];

          // update mercs
          const mercenaries = state.mercenaries.map((m) => {
            if (!result.mercIds.includes(m.id)) return m;
            const injured = result.injuredMercIds.includes(m.id);
            const fatigued = result.fatiguedMercIds.includes(m.id);
            // morale change: success +1, partial ±0, failure -1 (clamped 0-10)
            const moraleDelta =
              result.outcome === 'success' ? 1 : result.outcome === 'failure' ? -1 : 0;
            return {
              ...m,
              missionsCompleted: m.missionsCompleted + 1,
              isInjured: injured,
              isFatigued: fatigued,
              morale: Math.max(0, Math.min(10, m.morale + moraleDelta)),
            };
          });

          return {
            guild: { ...state.guild, resources, inventoryItemIds },
            mercenaries,
            activeMission: null,
            lastResult: result,
            showResultModal: true,
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

          // If a different item was already in that slot, return it to inventory
          const previousItemId = merc.equipment[slot];
          let inventoryItemIds = [...state.guild.inventoryItemIds];

          // Remove the new item from inventory (first occurrence)
          const itemIdx = inventoryItemIds.indexOf(itemId);
          if (itemIdx !== -1) {
            inventoryItemIds.splice(itemIdx, 1);
          }

          // Return the old equipped item to inventory
          if (previousItemId) {
            inventoryItemIds = [...inventoryItemIds, previousItemId];
          }

          const updatedMerc: Mercenary = {
            ...merc,
            equipment: { ...merc.equipment, [slot]: itemId },
          };

          return {
            mercenaries: state.mercenaries.map((m) => (m.id === mercId ? updatedMerc : m)),
            guild: {
              ...state.guild,
              inventoryItemIds,
            },
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
          const nextLevel = room.levels[room.level - 1]; // cost is on the CURRENT level to upgrade
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

      resetSave: () =>
        set({
          ...defaultState(),
        }),
    }),
    {
      name: 'banner-coin-save',
      version: SAVE_VERSION,
    }
  )
);
