# Banner & Coin

A browser idle RPG / guild management sim built with React 19, TypeScript, Vite, and Tailwind CSS v4. Now at **Phase 2**.

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
├── types/
│   ├── mercenary.ts   # Mercenary, Trait, Relationship, bondScores, background
│   ├── item.ts        # Item, ItemRarity, ItemCategory, ItemTag
│   ├── mission.ts     # MissionTemplate, MissionResult, ActiveMission (with consumables)
│   ├── guild.ts       # Guild (with materials, guildRank, completedContracts, unlockedRegions)
│   ├── save.ts        # SaveData schema (SAVE_VERSION = 3)
│   ├── crafting.ts    # Material, Recipe, RecipeIngredient, RecipeCategory
│   ├── expedition.ts  # ExpeditionTemplate, ActiveExpedition, ExpeditionResult
│   ├── event.ts       # GameEventTemplate, PendingEvent, EventChoice
│   └── recruit.ts     # RecruitArchetype, GeneratedRecruit
├── data/
│   ├── mercenaries.ts  # 9 starting mercenaries
│   ├── missions.ts     # 16 mission templates (12 Phase 1 + 4 Phase 2)
│   ├── items.ts        # 37 items (25 Phase 1 + 12 crafted Phase 2)
│   ├── materials.ts    # 14 materials (common/uncommon/rare)
│   ├── recipes.ts      # 18 crafting recipes (weapons/armor/consumables)
│   ├── expeditions.ts  # 5 expedition templates with multi-stage progression
│   ├── events.ts       # 22 guild/social/mission event templates
│   └── recruits.ts     # 12 recruit archetypes for procedural hiring
├── store/
│   └── gameStore.ts    # Full game state + all Phase 2 actions; v2→v3 migration
├── simulation/
│   ├── missionSim.ts   # Mission scoring + consumable effects
│   ├── expeditionSim.ts # Multi-stage expedition simulation
│   ├── recruitGen.ts   # Seeded procedural recruit generation
│   ├── bondSim.ts      # Bond score tracking between mercs
│   └── eventSim.ts     # Weighted event selection + placeholder resolution
├── components/
│   ├── screens/
│   │   ├── GuildDashboard.tsx   # Rank display, pending events, region map
│   │   ├── MercenaryRoster.tsx  # Background, bond scores, equipment
│   │   ├── MissionBoard.tsx     # Consumable assignment step, material drop hints
│   │   ├── InventoryPanel.tsx   # Items tab + Materials tab with Workshop link
│   │   ├── Workshop.tsx         # Crafting: materials inventory + 18 recipes
│   │   ├── HiringHall.tsx       # Procedural recruits, hire/reroll, roster display
│   │   └── ExpeditionPanel.tsx  # Multi-stage expedition launcher and resolver
│   ├── NavBar.tsx         # 7 nav items + event badge counter
│   ├── ResultsModal.tsx   # Materials drop, bond changes, View Roster link
│   ├── MercCard.tsx
│   ├── MissionCard.tsx
│   └── ItemCard.tsx
└── App.tsx
```

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Gameplay Loop (Phase 2)

1. **Guild Dashboard** — guild rank + progress bar, pending events with inline resolution, unlocked regions, room upgrades
2. **Roster** — inspect mercs: background flavor text, bond scores (with sentiment labels), equipment
3. **Mission Board** — two-step assignment: pick mercs, then optionally assign consumables; material drop hints shown per mission
4. **Resolve Mission** — consumable effects applied to simulation; materials dropped based on mission tags; bonds updated after mission
5. **Results Modal** — shows materials found, bond changes (e.g. "Aldric & Syla grew closer"), and loot
6. **Workshop** — craft items using materials collected on missions; shows materials inventory + recipes by category
7. **Hiring Hall** — browse 4 procedurally generated recruits per archetype; hire for gold or reroll pool for 25g
8. **Expeditions** — multi-stage deep missions: assign party + consumables, advance stage by stage, finalize for full result

## Phase 2 Systems

### Crafting (Workshop)
18 recipes across weapons, armor, and consumables. Recipes require materials (collected from missions) and gold. Some recipes require Forge Level 2 or 3. Crafted items are added to inventory.

**Crafted items include:**
- Weapons: Forged Iron Sword, Scout Blade, Silver Combat Knife, and more
- Armor: Reinforced Mail, Handmade Scout Cloak, Padded Coat, and more
- Consumables: Bandages, Field Rations, Lesser Antidote, Torch Bundle, Lucky Salve, Smoke Bomb

### Materials
14 materials in three tiers:
- **Common** (8): iron_scraps, tanned_hide, herbs_bundle, tallow_candles, rough_cloth, wolf_pelt, bone_fragment, swamp_reed
- **Uncommon** (4): refined_steel, silver_dust, monster_gland, ancient_ink
- **Rare** (2): moonstone_shard, dragonscale_fragment

Materials drop from missions based on tags: combat → iron/hide, exploration → herbs/ink, ruin → bone/ink, hunt → wolf pelt/bone.

### Consumables in Missions
Consumables can be assigned to missions and expeditions for mechanical bonuses:
| Item | Effect |
|---|---|
| Bandages | −20% injury chance |
| Field Rations | −20% fatigue chance |
| Torch Bundle | +1 party score on ruin/exploration missions |
| Lucky Salve | +0.5 party score |
| Smoke Bomb | Converts one failure to partial (escape clause) |

### Expeditions
5 expedition templates across 3–4 stages each:
| Expedition | Region | Stages |
|---|---|---|
| The Sunken Vault | Ashfen Marsh | 3 |
| Stonepeak Descent | Grey Mountains | 4 (req. 5 contracts) |
| The Haunted Road | Thornwood | 3 |
| Relic Hunt: The Old Fort | Pale Border | 4 (req. 3 contracts) |
| Whisper Market | City Below | 3 (req. 50 renown) |

Each stage resolves independently and contributes to the final outcome. Stage results are shown inline as they complete.

### Guild Progression
**Guild Rank** (1–5) based on contracts completed:
| Rank | Name | Contracts |
|---|---|---|
| 1 | Scratch Crew | 0 |
| 2 | Known Band | 5 |
| 3 | Established Guild | 15 |
| 4 | Respected Order | 30 |
| 5 | Legendary Company | 50 |

**Region Unlocks:**
- Grey Mountains: 5 dangerous contracts
- City Below: 50 renown
- Pale Border: Rank 3

### Bond System
Bond scores track relationships between mercs (−10 to +10):
- Missions together: +1 success, +0.5 partial, −0.5 failure
- Events can modify bonds further
- Sentiment labels: neutral → friendly → close → bonded (8+) or rival (≤ −3)

### Procedural Recruitment
12 archetypes: Sellsword, Scout, Hedge Witch, Field Surgeon, Disgraced Noble, Pirate Deserter, Wandering Monk, Street Thief, Former Guard, Wilderness Ranger, Hedge Mage, Tribal Warrior.

Recruits are generated using a seeded algorithm that picks archetype, rolls stats within ranges, selects traits, and generates a name and background line. Hire cost scales with total stat values.

### Guild Events (22 templates)
Events fire after missions/expeditions and during idle time. Three types:
- **Guild events** (8): tavern arguments, homesick mercs, trader visits, donations
- **Social events** (7): campfire confessions, rivalries, mentoring, shared dreams
- **Mission events** (7): wounded requests, hidden routes, supply shortages, rival encounters

Events with choices are shown inline on the Guild Dashboard (up to 3 at once). Resolving events can affect gold, renown, morale, loyalty, and bond scores.

## Save Migration
Save version bumped from 2 → 3. Existing saves are migrated automatically on load:
- Guild gains `materials`, `guildRank`, `completedContracts`, `unlockedRegions`
- Mercs gain `bondScores` and `background`
- New Phase 2 state fields initialized with safe defaults

## Build

```bash
npm run build   # tsc -b && vite build
```
