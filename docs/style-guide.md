# Banner & Coin — Style Guide

> "Gold is the only true language in these parts."

This guide defines the visual language, interaction patterns, and editorial voice for Banner & Coin. All new code and content should reinforce these standards.

---

## I. Visual Identity

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#FBBF24` (amber-400) | Gold/coins, active states, CTA buttons |
| `--color-accent` | `#A78BFA` (violet-400) | Legendary items, special effects |
| `--color-danger` | `#F43F5E` (rose-500) | Injuries, failures, warnings |
| `--color-success` | `#34D399` (emerald-400) | Successes, positive outcomes |
| `--color-background` | `#1C1917` (stone-950) | Page background |
| `--color-surface` | `rgba(255,255,255,0.05)` | Glass panels, cards |
| `--color-border` | `rgba(255,255,255,0.10)` | Panel borders, dividers |
| `--color-text` | `#E7E5E4` (stone-200) | Primary text |
| `--color-text-muted` | `#78716C` (stone-500) | Labels, metadata, captions |

### Typography

- **Headings**: `font-heading` (imported via Google Fonts — Unbounded or Cinzel), `font-black`, `tracking-tighter`
- **Body/UI**: System font stack via Tailwind, `font-bold`, uppercase for labels/caps
- **Flavor/Narrative**: `font-serif italic` — used for event text, chronicle entries, mission briefings
- **Monospace**: `font-mono` — resource counts, stats, timestamps, technical values

**Scale**:
- Hero titles: `text-6xl` to `text-7xl`
- Section headers: `text-4xl` to `text-5xl`
- Card titles: `text-lg` to `text-xl`
- Labels/captions: `text-[9px]` to `text-xs`
- Body text: `text-sm` to `text-base`

### Spacing & Layout

- **Panel padding**: `p-8` to `p-12` for content sections
- **Card padding**: `p-5` to `p-6`
- **Gap rhythm**: `space-y-8` between major sections, `space-y-4` between items, `gap-4` between related elements
- **Border radius**:
  - Panels/modals: `rounded-[2.5rem]` (large), `rounded-[2rem]` (medium)
  - Cards/buttons: `rounded-2xl`
  - Tags/chips: `rounded-full`
- **Max content width**: `max-w-7xl` for data-dense screens, `max-w-2xl` for modals

### Motion Philosophy

Animations communicate *state change*, not decoration. Every motion should answer: "what just happened?"

| Animation | Duration | Usage |
|-----------|----------|-------|
| `fade-in slide-in-from-bottom-4` | 700ms | Screen content entering |
| `fade-in slide-in-from-top-4` | 500ms | Modals, dropdowns |
| `slide-in-from-left-8` | 700ms | List items, chronicle entries |
| `fade-in slide-in-from-top-4` | 700ms | Tab transitions |
| `pulse` | 2s infinite | Active indicators, notifications |
| `shimmer-effect` | 3s infinite | Resource display, premium UI |

**Reduced Motion**: All animations respect `prefers-reduced-motion`. When set, swap to instant transitions via CSS media query override.

### Visual Assets

- **Icons**: Native emoji only — consistent with the game's hand-drawn, slightly rough aesthetic. No external icon library.
- **Backgrounds**: Noise texture overlay at `opacity-[0.03]` on the body. Two ambient radial gradient blobs (primary and accent) positioned at top-left and bottom-right.
- **Glass panels**: `glass` utility class = `bg-white/5 backdrop-blur-xl border border-white/10`
- **Glass dark**: `glass-dark` = `bg-black/60 backdrop-blur-xl border border-white/5`
- **Premium button**: `premium-button` = amber gradient with glow, scale on hover, press effect

---

## II. Component Patterns

### Navigation Bar

- Sticky top, `z-[100]`
- Three zones: Guild branding (left), screen tabs (center), resources (right)
- Active tab: amber background, dark text, subtle scale-up
- Inactive tab: stone-500 text, transparent background
- Notification badges: pulsing amber dots on dashboard (events) and missions (ready)
- Resource counters use `font-mono` with `text-glow` text-shadow

### Screens

Each screen follows this structure:

```
<Screen> = <div className="p-6 max-w-[W]xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <header>  ← Title + subtitle + breadcrumb
  <content> ← Main data/UI
  <footer>  ← Actions (if applicable)
</div>
```

**Header pattern**:
```tsx
<header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
  <div className="space-y-4">
    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[COLOR]/10 border border-[COLOR]/20 rounded-full">
      <span className="w-2 h-2 bg-[COLOR] rounded-full animate-pulse shadow-[0_0_8px_rgba(COLOR,0.6)]" />
      <span className="text-[10px] font-black text-[COLOR] uppercase tracking-[0.2em]">CATEGORY</span>
    </div>
    <h1 className="text-6xl font-black font-heading text-white tracking-tighter text-glow">Title</h1>
    <p className="text-stone-500 max-w-2xl italic font-serif text-lg leading-relaxed">Subtitle</p>
  </div>
  <div className="stat-badge ...">Metadata</div>
</header>
```

### Cards

**MercCard**: Portrait emoji + name + title + stat bars + trait chips + bond indicators
**MissionCard**: Name + tags + difficulty indicator + rewards + duration + material hints
**ItemCard**: Icon + name + rarity border + stat bonuses + flavor text

### Modals

- Full-screen overlay: `fixed inset-0 z-[110] bg-stone-950/90 backdrop-blur-xl`
- Modal panel: `glass-dark rounded-[2.5rem] max-w-2xl w-full shadow-2xl border [OUTCOME_COLOR]-700`
- Header: Outcome color accent, mission name + result badge
- Content: Sections with `space-y-8`, narrative text in serif italic
- Footer: Action buttons, right-aligned with `gap-4`

### Status Indicators

| Status | Color | Icon | Badge Style |
|--------|-------|------|------------|
| Ready | `text-green-400` | 💚 | none (default text) |
| Injured | `text-rose-400` | 🩹 | `bg-rose-950/30 text-rose-400 border-rose-900/50` |
| Fatigued | `text-amber-400` | 😓 | `bg-amber-950/30 text-amber-400 border-amber-900/50` |
| Deployed | `text-stone-500` | ⚔️ | subtle italic caption |

### Outcome Colors

| Outcome | Color | Border | Usage |
|--------|-------|--------|-------|
| Success | `text-green-400` | `border-green-700` | Result modal header, score positive |
| Partial | `text-yellow-400` | `border-yellow-700` | Result modal header, mid scores |
| Failure | `text-red-400` | `border-red-700` | Result modal header, casualty warnings |

### Rarity Colors

| Rarity | Text Color | Badge Style |
|--------|-----------|------------|
| Common | `text-stone-300` | default |
| Uncommon | `text-green-400` | `bg-green-900/30` |
| Rare | `text-blue-400` | `bg-blue-900/30` |
| Legendary | `text-purple-400` | `bg-purple-900/30`, pulsing glow |

---

## III. Interaction Patterns

### Click Actions

- All clickable elements have `:hover` and `:active` states
- `haptic-click` class adds subtle scale feedback on press
- Buttons: `hover:scale-[1.02] active:scale-[0.98]`
- Cards: `hover:bg-white/5 hover:border-primary/20`

### State Transitions

- Toggling content: `animate-in fade-in slide-in-from-top-2 duration-300`
- Screen changes: fade-out + fade-in via React key remounting
- Result modals: fade-in from center, content staggers in with 100ms delays

### Loading States

- Skeleton loaders: pulsing `animate-pulse` glass panels with reduced opacity
- Never use spinners for content — use inline skeleton cards matching the actual layout

### Error States

- Inline error text: `text-rose-400 text-sm italic`
- Blocked buttons (unmet requirements): `opacity-30 grayscale cursor-not-allowed`
- Invalid inputs: `ring-2 ring-rose-500`

### Empty States

- Centered layout, large icon emoji, italic message
- Always include a call to action ("Send your first mission" instead of just "No missions")

---

## IV. Naming Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `MercCard.tsx`, `GuildDashboard.tsx`)
- Data files: `lowercase.ts` (e.g., `mercenaries.ts`, `events.ts`)
- Simulation: `camelCase.ts` (e.g., `missionSim.ts`, `bondSim.ts`)
- Types: `PascalCase.ts` (e.g., `mercenary.ts`, `crafting.ts`)
- Test files: `kebab-case.spec.ts` (e.g., `gameplay.spec.ts`)

### ID Naming

- Mercenary IDs: `merc_<type>_<name>` (e.g., `merc_valerius`, `merc_saria`)
- Item IDs: `item_<name>` (e.g., `item_silver_rapier`)
- Mission IDs: `mission_<name>` (e.g., `mission_river_toll`)
- Material IDs: `<name>_<type>` (e.g., `iron_scraps`, `tallow_candles`)
- Region IDs: `<name>` (e.g., `Thornwood`, `City Below`)
- Trait IDs: `trait_<name>` (e.g., `trait_legendary_precision`)
- Recipe IDs: `<item>_recipe` (e.g., `iron_sword_recipe`)

### Variable Naming

- Booleans: `is<Noun>`, `has<Noun>`, `can<Verb>` (e.g., `isInjured`, `hasRequirements`)
- Arrays: plural nouns (e.g., `mercenaries`, `activeMissions`)
- Sets/Maps: descriptive (e.g., `unlockedRegions`, `activePerks`)
- Computed values: `computed<Name>` or `<name>Result`
- State updates: `set<Property>` or `<action>State`

---

## V. Code Patterns

### State Management

All game state lives in `gameStore.ts` via Zustand. No local state for game-critical data. Screen components may use local state for UI concerns (selected tab, modal visibility, form inputs).

```typescript
// Correct — game state in store
const { guild, setScreen } = useGameStore();

// Wrong — duplicating game state locally
const [guild, setGuild] = useState(initialGuild);
```

### Type Safety

All data files export both the array and a `_MAP` variant for O(1) lookup:

```typescript
export const MATERIALS: Material[] = [...];
export const MATERIALS_MAP: Record<string, Material> = Object.fromEntries(
  MATERIALS.map(m => [m.id, m])
);
```

### Simulation Purity

Simulation functions (`simulateMission`, `simulateExpeditionStage`, etc.) are pure functions that take all dependencies as parameters. They do not read from the store. This makes them testable and deterministic.

```typescript
export function simulateMission(
  mercs: Mercenary[],
  template: MissionTemplate,
  seed: string,
  options: SimulationOptions = {}
): MissionResult { ... }
```

### Event Handling

Use the `onClick` handler pattern from React. Do not use inline箭头 functions for performance-critical loops — extract to named handlers.

### CSS Ordering

In component files, apply this class ordering within `className`:
1. Layout (flex/grid, display)
2. Sizing (w/h, max/min)
3. Spacing (p/m, gap)
4. Visual (bg, border, shadow, opacity)
5. Typography (font, text, tracking)
6. Animation (animate-in, transition)
7. Responsive (sm:, lg:)

---

## VI. Content Voice

### Tone

- **Authoritative**: The narrator speaks as the guild's chronicler — distant, observant, slightly theatrical
- **Economic**: Money, contracts, and reputation are the grammar of the world
- **Grounded**: Humor is dry and situational. No jokes about mechanics. The world takes itself seriously.
- **Respectful of the player**: Never condescending. Never tutorializing in the narration.

### What to Write

- Mission flavor text: 1–2 sentences per outcome (success/partial/failure). Specific, sensory, outcome-appropriate.
- Event text: 2–3 sentences. Reveals character, creates tension, offers a choice with weight.
- Chronicle entries: Journalistic — what happened, who was involved, what it means.
- Trait descriptions: Mechanical + evocative. E.g., "Rarely hesitates when blades are drawn."

### What NOT to Write

- Meta commentary about game systems ("This item increases your score by 5")
- Anachronistic or out-of-character references
- Excessive adjectives — one well-chosen detail beats three filler words
- Second-person pronouns ("you") — the narrative is third-person

### Example: Mission Flavour Text

```typescript
// Good — specific sensory detail, world-consistent
flavorText: {
  success: 'The merchant arrived safely, purse intact. He tipped the party extra and promised a good word around the docks.',
  partial: 'The caravan made it through, but Thornwood had surprises. Goods were lost, tempers were frayed.',
  failure: 'The bandits were better organized than expected. The merchant escaped, barely. No payment.',
},

// Bad — mechanical, generic, off-tone
flavorText: {
  success: 'Mission succeeded! You earned 80 gold.',
  partial: 'Mission partially completed. You earned 40 gold.',
  failure: 'Mission failed. Better luck next time!',
},
```

---

## VII. File Organization

```
src/
├── types/          # TypeScript interfaces, enums, constants (WeatherId, ItemRarity, etc.)
├── data/           # Game data arrays + _MAP exports (items, missions, materials, etc.)
├── store/          # Zustand store — only this directory imports persist middleware
├── simulation/    # Pure simulation functions — no store imports
├── components/
│   ├── screens/   # One file per screen, named after the screen ID
│   ├── NavBar.tsx
│   ├── ResultsModal.tsx
│   ├── MercCard.tsx
│   ├── MissionCard.tsx
│   ├── ItemCard.tsx
│   ├── MainMenu.tsx
│   └── [other shared components]
└── App.tsx
```

**Rule**: `store/` may import from `types/`, `data/`, and `simulation/`. `simulation/` may not import from `store/`. This enforces simulation purity.

---

## VIII. Testing Requirements

Every new screen, modal, and simulation function requires a Playwright test. Tests live in `e2e/` and are named `[feature].spec.ts`.

### Test Naming Convention

```typescript
test('[Screen] loads without crashing', ...)
test('[Action] transitions to [Screen]', ...)
test('[Component] displays [Data]', ...)
test('[Edge case] shows error state gracefully', ...)
```

### Required Test Coverage

- All 13 existing screens navigate correctly with no console errors
- Mission flow: select mission → assign mercs → assign consumables → confirm → results
- Expedition flow: select expedition → assign party → advance stages → resolve
- Crafting flow: select recipe → craft → verify item in inventory
- Hiring flow: generate recruits → hire → verify merc joins roster
- Save persistence: start game, complete mission, reload, verify state restored
