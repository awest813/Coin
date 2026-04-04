# Banner & Coin

A browser idle RPG / guild management sim built with React, TypeScript, Vite, and Tailwind CSS.

## Architecture

### Tech Stack
- **React 19** — UI framework
- **TypeScript** — type safety throughout
- **Vite** — fast dev/build tooling
- **Tailwind CSS v4** — utility-first styling
- **Zustand** — global state management with localStorage persistence
- **shadcn/ui primitives** — badge, button (extendable)

### Folder Structure

```
src/
├── types/          # TypeScript interfaces (data model layer)
│   ├── mercenary.ts   # Mercenary, Trait, Relationship, EquipmentSlot
│   ├── item.ts        # Item, ItemRarity, ItemCategory, ItemTag
│   ├── mission.ts     # MissionTemplate, MissionResult, ScoreBreakdownEntry
│   ├── guild.ts       # Guild, RoomUpgrade, RoomUpgradeLevel
│   └── save.ts        # SaveData schema (SAVE_VERSION = 2)
├── data/           # Seed data / content files
│   ├── mercenaries.ts  # 9 unique mercenaries with traits, relationships, morale/loyalty
│   ├── missions.ts     # 12 mission templates with event snippets
│   └── items.ts        # 25 items across all rarities with tags and flavor text
├── store/          # Zustand stores
│   └── gameStore.ts    # Full game state + actions (equip, sell, upgrade rooms)
├── simulation/     # Game logic (pure functions, no UI)
│   └── missionSim.ts   # Mission scoring with equipment, relationships, morale
├── components/
│   ├── screens/    # Full-page screen components
│   │   ├── GuildDashboard.tsx   # Resource overview + working room upgrade UI
│   │   ├── MercenaryRoster.tsx  # Merc inspect + equipment slot management
│   │   ├── MissionBoard.tsx     # Contract list + party assignment
│   │   └── InventoryPanel.tsx   # Stash + equip/sell actions
│   ├── ui/         # shadcn/ui primitives
│   ├── NavBar.tsx
│   ├── MercCard.tsx     # Shows equipped gear, morale, traits
│   ├── MissionCard.tsx  # Shows tags, difficulty label
│   ├── ItemCard.tsx     # Shows rarity, tags, flavor text, stat bonuses
│   └── ResultsModal.tsx # Outcome, loot, narrative events, score breakdown
├── lib/
│   └── utils.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

## How to Run

```bash
pnpm install   # or npm install
pnpm dev       # or npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Gameplay Loop (Phase 1)

1. **Guild Dashboard** — view resources, manage and upgrade guild rooms (Barracks, Common Room, Forge)
2. **Roster** — inspect mercenaries, their stats, traits, relationships, morale/loyalty; equip/unequip items to specific slots
3. **Mission Board** — select a contract, assign a party (mercs with good traits and gear score higher), send them out
4. **Resolve** — click "Resolve Mission" to simulate; outcome accounts for gear, traits, relationships, morale, and a random roll
5. **Results** — see outcome, loot (with rarity colors), casualties, narrative event snippets, expandable score breakdown per merc
6. **Inventory** — inspect earned items with tags and flavor text; equip directly to mercs or sell for gold

## Phase 1 Systems

### Equipment
Mercs have three slots: **weapon**, **armor**, **accessory**. Items provide stat bonuses that flow directly into mission scoring. Equip/unequip from the Roster or Inventory screens. Swapping a slot returns the old item to the stash.

### Item Expansion
25 items across common/uncommon/rare/legendary tiers. Each has:
- Stat bonuses (including negative tradeoffs on some)
- Optional tags (`holy`, `cursed`, `scout`, `fine_steel`, `arcane`, `ancient`, etc.)
- Short flavor text
- Gold sell value

### Guild Room Upgrades
Three rooms with three levels each:
| Room | Effect |
|---|---|
| Barracks | Roster cap increase, injury recovery speed |
| Common Room | Post-mission morale bonus, event frequency |
| Forge | Extra loot drops on success (forgeLevel passed to simulation) |

Each room shows current effects, next-level preview, and upgrade cost. Upgrade button is disabled when resources are insufficient.

### Mercenary State
Mercs now track:
- `morale` (0–10): drops on mission failure, rises on success; low morale imposes mission score penalty
- `loyalty` (0–10): visible in the roster detail panel
- `isInjured` / `isFatigued`: unchanged from Phase 0 but now shown in the roster with status badges

### Relationships
Four relationship types: `neutral`, `friend`, `rival`, `bonded`. When two mercs are in the same party:
- **bonded** → +2 party score each
- **friend** → +1 party score each
- **rival** → −1 party score each

Relationships are visible in the merc detail panel with color-coded icons.

### Mission Improvements
12 missions across combat, stealth, social, exploration, escort, hunt, bounty, and ruin tags. Each mission now has `eventSnippets` — short contextual vignettes that are randomly drawn and shown in the results screen alongside the outcome flavor text.

### Score Breakdown
The Results modal includes a collapsible score breakdown showing each merc's contribution: base stats, trait bonus, gear bonus, relationship bonus, and status penalties.

## Extending Content

### Adding Mercenaries
Add entries to `src/data/mercenaries.ts`. New fields in Phase 1: `morale` (0–10), `loyalty` (0–10).

### Adding Missions
Add entries to `src/data/missions.ts`. New field: `eventSnippets?: string[]` — pool of short event lines randomly drawn during result generation.

### Adding Items
Add entries to `src/data/items.ts`. New fields: `flavorText?: string`, `tags?: ItemTag[]`. Update `ITEMS_MAP` automatically via the `Object.fromEntries()` call.

### Adding Trait Effects
Modify `scoreMercDetailed()` in `src/simulation/missionSim.ts` — the `tagMap` maps mission tags to trait tags that score bonuses.

## Save / Load

State is auto-persisted to `localStorage` under the key `banner-coin-save`. Save schema is `SAVE_VERSION = 2`. Increment to invalidate old saves on schema change.

To reset: click "Reset Save Data" at the bottom of the Guild Dashboard.

## Phase 2 Opportunities

- **Crafting / Alchemy** — combine items at the Forge to produce new gear; requires ingredients + gold
- **Romance & Deep Bonds** — extend the relationship layer; `bonded` pairs can form deeper story arcs; add "bonded" event chains
- **Factions** — guilds, noble houses, cults; reputation with factions unlocks missions and NPCs
- **Longer Expeditions** — multi-stage missions with mid-mission choices and branching outcomes
- **Intervention Minigames** — lightweight dice-roll or card-flip mechanics for key mission moments
- **Authored Quest Chains** — sequential story contracts with persistent NPCs and narrative memory
- **Hiring & Firing** — spend gold/renown at the tavern to recruit new mercs; dismissal with relationship fallout
- **Rival Guilds** — competing factions that try to take contracts, steal mercs, or sabotage the guild
- **Prestige & Legacy** — retired mercs leave behind items or reputation bonuses for future hires
- **Seasonal Events** — time-limited events that change the contract pool or introduce special NPCs
