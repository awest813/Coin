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
│   ├── mercenary.ts
│   ├── item.ts
│   ├── mission.ts
│   ├── guild.ts
│   └── save.ts
├── data/           # Seed data / content files
│   ├── mercenaries.ts
│   ├── missions.ts
│   └── items.ts
├── store/          # Zustand stores
│   └── gameStore.ts
├── simulation/     # Game logic (pure functions, no UI)
│   └── missionSim.ts
├── components/
│   ├── screens/    # Full-page screen components
│   │   ├── GuildDashboard.tsx
│   │   ├── MercenaryRoster.tsx
│   │   ├── MissionBoard.tsx
│   │   └── InventoryPanel.tsx
│   ├── ui/         # shadcn/ui primitives
│   ├── NavBar.tsx
│   ├── MercCard.tsx
│   ├── MissionCard.tsx
│   ├── ItemCard.tsx
│   └── ResultsModal.tsx
├── lib/
│   └── utils.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

## How to Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Gameplay Loop (Phase 0)

1. **Guild Dashboard** — view resources (gold, renown, supplies) and guild rooms
2. **Roster** — inspect mercenaries, their stats, traits, and relationships
3. **Mission Board** — select a contract, assign a party, send them out
4. **Resolve** — click "Resolve Mission" to simulate the outcome instantly
5. **Results** — see outcome (success/partial/fail), loot, injuries, flavor text
6. **Inventory** — inspect earned items in the guild stash

## Extending Content

### Adding Mercenaries
Add entries to `src/data/mercenaries.ts` following the `Mercenary` interface. Traits must use one of the defined `TraitTag` values.

### Adding Missions
Add entries to `src/data/missions.ts` following the `MissionTemplate` interface. Tags determine which traits are relevant during simulation.

### Adding Items
Add entries to `src/data/items.ts` and update `ITEMS_MAP`. Items referenced in `MissionTemplate.reward.possibleItems` must exist here.

### Adding Trait Effects
Modify `scoreMerc()` in `src/simulation/missionSim.ts` — the `tagMap` controls which traits apply to which mission tags.

## Save / Load

State is auto-persisted to `localStorage` under the key `banner-coin-save`. The save schema is versioned via `SAVE_VERSION` in `src/types/save.ts`. Increment this constant to invalidate old saves when the schema changes.

To reset: click "Reset Save Data" at the bottom of the Guild Dashboard.

## TODO — Phase 1 (Highest-Value Next Steps)

- [ ] **Equipment system** — equip/unequip items from inventory to mercs, apply stat bonuses to mission scores
- [ ] **Sell items** — sell inventory items for gold
- [ ] **Room upgrades** — spend resources to level up guild rooms for passive bonuses
- [ ] **Merc recovery timers** — injured mercs recover after N missions or a time delay
- [ ] **Hiring mercs** — spend gold/renown to recruit new guild members
- [ ] **Event system** — random events between missions (relationship changes, rumors, small choices)
- [ ] **Multiple active missions** — send parties on concurrent contracts
- [ ] **Mission history log** — persistent log of past results
- [ ] **Relationship changes** — dynamic friendship/rivalry shifts from shared missions
- [ ] **Crafting/alchemy placeholder** — hook for combining items
