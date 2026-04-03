import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Mercenary } from '~/types/mercenary';
import type { Item } from '~/types/item';
import type { ActiveMission, MissionResult } from '~/types/mission';
import type { Guild } from '~/types/guild';
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

  // actions
  setScreen: (screen: ActiveScreen) => void;
  setActiveMission: (mission: ActiveMission | null) => void;
  applyMissionResult: (result: MissionResult) => void;
  dismissResult: () => void;
  updateMercenary: (merc: Mercenary) => void;
  resetSave: () => void;
}

const defaultGuild = (): Guild => ({
  name: 'The Tarnished Banner',
  resources: { gold: 150, supplies: 20, renown: 0 },
  inventoryItemIds: [],
  rooms: [
    {
      id: 'room_tavern',
      name: 'Common Room',
      description: 'Where mercs rest and rumors circulate.',
      level: 1,
      maxLevel: 3,
      upgradeCost: { gold: 200, supplies: 10, renown: 5 },
    },
    {
      id: 'room_armory',
      name: 'Armory',
      description: 'Rack of weapons and a whetstone.',
      level: 1,
      maxLevel: 3,
      upgradeCost: { gold: 250, supplies: 15, renown: 10 },
    },
  ],
});

const defaultState = () => ({
  guild: defaultGuild(),
  mercenaries: INITIAL_MERCENARIES,
  items: ITEMS_MAP,
  activeMission: null as ActiveMission | null,
  lastResult: null as MissionResult | null,
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
            return {
              ...m,
              missionsCompleted: m.missionsCompleted + 1,
              isInjured: result.injuredMercIds.includes(m.id),
              isFatigued: result.fatiguedMercIds.includes(m.id),
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
