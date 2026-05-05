# Banner & Coin — Gameplay Roadmap

> "Every banner tells a story. Every coin has a weight. Every mercenary has a price."

---

## I. Design Pillars

### 1. The Ledger is the Heart
All progress — gold, renown, bonds, materials — flows through the guild ledger.
The player should *feel* the accumulation. Numbers go up. The ledger grows. The guild
becomes more powerful. This is the core satisfaction loop.

### 2. The Roster Has Weight
Mercenaries are not disposable stats. They have names, bonds, backgrounds, injuries,
fatigue, and morale. Sending someone injured should feel like a *decision*.
Losing a bonded mercenary should sting. This is the emotional core.

### 3. The World is Living
Regions change. Weather shifts. Events interrupt. Contracts have consequences.
The world breathes even when the player is idle. This creates urgency and narrative texture.

### 4. Depth Over Width
New systems should *layer* onto existing ones rather than replacing them.
Crafting deepens mission value. Bonds affect mission outcomes. Influence unlocks perks.
Every system should reinforce every other system.

---

## II. Current State (Phase 4: Legends & Legacies)

| System | Status | Notes |
|--------|--------|-------|
| Core missions loop | ✅ Complete | 16 missions, scoring, outcomes |
| Crafting (Workshop) | ✅ Complete | 18 recipes, 14 materials, forge levels |
| Regional Influence | ✅ Complete | 5 regions, 10 perks |
| Hero Quests | ✅ Complete | 2 quests, 2 legendary mercs |
| Expeditions | ✅ Complete | 5 multi-stage expeditions |
| Bond System | ✅ Complete | Score tracking, sentiment labels |
| Weather Effects | ✅ Complete | 5 states, dashboard animations |
| Procedural Recruits | ✅ Complete | 12 archetypes, seeded generation |
| Guild Policies | ✅ Complete | 5 policies, mechanical tradeoffs |
| Chronicles | ✅ Complete | Timeline history, chronicle entries |
| Save Persistence | ✅ Complete | Zustand persist, v3 migration |
| Playwright Tests | ✅ Complete | 13/13 passing |

---

## III. The Gap — What's Missing from a Complete Game

### Core Loops
- **No active mercenary management after assignment** — once sent, mercs are invisible until return
- **No injury/fatigue recovery UI** — fatigue resolves passively but no player action available
- **No morale restoration mechanism** — morale decays but can't be intentionally raised
- **No gear equipping from mission rewards** — items go to inventory but can't be equipped from there

### Depth & Progression
- **No guild reputation beyond renown** — factions, standings, political consequences
- **No mercenary specializations** — no skill trees, no per-merc progression beyond stats
- **No artifact collection loop** — artifacts exist but are end-game only (no mid-game artifact hunting)
- **No seasonal/weekly reset content** — no rotation, leaderboards, or challenge modes
- **No achievement system** — milestones untracked beyond chronicles

### Economy
- **Materials only drop, never bought** — no material market or trade system
- **No consumable crafting economy** — consumables are just crafted once and stockpiled
- **No equipment degradation** — gear never breaks, removing a resource sink
- **Passive income is too simple** — tavern/ barracks rates are static

### Content
- **Only 2 hero quests** — need 6–8 for endgame depth
- **Only 2 legendary mercs** — need 6–10 for a full roster of legends
- **Only 22 event templates** — need 40+ for narrative variety
- **No item rarity below common** — flat rarity ladder
- **No raid-style content** — expeditions are hard but not coordinate-able group content

### UI/UX
- **No mission briefing/detail modal** — no expanded contract view before committing
- **No bulk actions** — can't assign multiple consumables efficiently
- **No sound/ambient audio** — no soundscape
- **No tutorial or tooltips** — new player orientation missing
- **No settings panel** — volume, reduced motion, reset not accessible from menu

---

## IV. Roadmap by Phase

### Phase 5: The Living Guild
*Focus: Active management, recovery systems, morale, and roster depth*

1. **Recovery Actions**
   - Allow players to rest injured/fatigued mercs at the tavern for gold
   - Rest action: costs gold + supplies, clears injury or fatigue
   - Rested mercs gain morale bonus

2. **Morale System**
   - Add a "Guild Morale" stat to the Guild object (0–100)
   - High morale: +5% party score globally
   - Low morale (< 30): injuries more likely
   - Sources: rest actions (+5), successful missions (+1), failed missions (−3), events (±varies)

3. **Mercenary Detailed View**
   - Click any merc to see full stat breakdown, equipment, bonds, and mission history
   - Visual indicator when a merc is injured/fatigued vs. ready
   - Training progress bar if merc is actively training

4. **Mission Briefing Modal**
   - Click "View Details" on any mission card to expand a full briefing
   - Shows: difficulty breakdown, recommended stats, failure consequences, loot table preview
   - "Accept" vs. "Decline" choice before committing mercs

5. **Consumable Pre-Stockpiling**
   - Allow pre-assigning consumables to the guild stash for auto-deployment
   - Auto-deploy at Rank 4 uses stockpiled consumables automatically

---

### Phase 6: The Deep Economy
*Focus: Material trade, equipment degradation, active income management*

1. **Material Market**
   - New "Market" screen accessible from nav bar
   - Buy common materials for gold (prices fluctuate by region)
   - Sell materials back at 50% value
   - Regional price modifiers: Ashfen cheap on swamp_reed, Grey Mountains cheap on iron

2. **Equipment Degradation**
   - Items lose durability on mission failure or tough missions
   - At 0 durability: item gives 0 stat bonus, must be repaired at Workshop
   - Repair costs: 30% of item value in gold + common materials

3. **Dynamic Passive Income**
   - Tavern income scales with guild rank and active policy
   - Barracks supply generation scales with mercenary count
   - Add a "Guild Business" system: optional investments (trading post, caravan route, mine stake)
     that generate passive gold/supplies per cycle

4. **Supply Maintenance Cost**
   - Each mercenary consumes 0.01 supplies/sec
   - When supplies hit 0: mercenaries start gaining fatigue at 2x rate
   - Forces active supply management at scale

---

### Phase 7: The Provenance
*Focus: Legendary content, guild reputation, artifact hunting, narrative depth*

1. **6 Hero Quests** (currently 2)
   - Quest for a combat specialist legendary (e.g., "The Warlord's Challenge")
   - Quest for a healer/Support legendary (e.g., "The Plague Doctor's Debt")
   - Quest for a stealth/intel legendary (e.g., "The Shadow's Bargain")
   - Quest for a leadership legendary (e.g., "The Captain's Commission")
   - Quest for a cursed/void legendary (already have Saria)
   - Quest for a wildcard legendary (e.g., "The Jester's Game")

2. **Artifact Hunting Loop**
   - Relic Hunt expeditions have a chance to uncover artifact fragments
   - 3 fragments → forge a minor artifact (new tier below existing 6)
   - Gives mid-game artifact progression rather than only end-game

3. **Guild Reputation**
   - Add a Reputation tracker per region (separate from influence)
   - Reputation affects: recruit quality, mission availability, shop prices
   - Earned by: completing missions without failures, resolving events favorably, building regional perks

4. **Faction Standing**
   - Three factions: The Crown, The Merchant Circle, The Underground
   - Completing missions affects standing with one or more factions
   - High standing: exclusive contracts, faction recruits, bonus loot
   - Low standing: hostile contracts (harder, higher reward), faction bounties

---

### Phase 8: The Legend
*Focus: Endgame, achievements, seasonal content, polish*

1. **Achievement System**
   - Track milestones: first legend recruited, 100 contracts, 50 bonded mercs, full gear on all mercs
   - Achievements unlock: banners, portrait frames, titles, bonus gameplay modifiers
   - Displayed in a new Achievements screen accessible from menu

2. **Weekly Contracts**
   - Each week, 3 "Featured Contracts" rotate in with bonus rewards
   - Featured contracts are higher difficulty, higher reward, special loot tables
   - Weekly reset keeps long-term players engaged

3. **Tutorial & Onboarding**
   - First-launch interactive tutorial: send first mission with guided UI
   - Tooltip system on hover for all major systems
   - "Help" button in navbar opens context-sensitive help overlay

4. **Settings Panel**
   - Volume sliders (ambient, SFX, UI)
   - Reduced motion toggle (respects `prefers-reduced-motion`)
   - Reset save option
   - Language selector (structure in place for i18n)

5. **Ambient Soundscape**
   - Layered audio: rain, hearth crackle, tavern murmur, footsteps
   - Context-aware: different audio when on mission board vs. roster vs. idle dashboard

---

## V. Priority Matrix

| Priority | Feature | Impact | Effort | Phase |
|----------|---------|--------|--------|-------|
| P0 | Mission Briefing Modal | Medium | Low | 5 |
| P0 | Recovery Rest Actions | High | Medium | 5 |
| P0 | Morale System | High | Medium | 5 |
| P1 | Material Market | High | Medium | 6 |
| P1 | Equipment Degradation | High | Medium | 6 |
| P1 | 4 More Hero Quests | High | Medium | 7 |
| P1 | Guild Reputation | Medium | High | 7 |
| P2 | Achievement System | Medium | Medium | 8 |
| P2 | Weekly Contracts | Medium | Medium | 8 |
| P2 | Tutorial/Onboarding | High | High | 8 |
| P3 | Faction Standing | Medium | Very High | 7+ |
| P3 | Ambient Soundscape | Medium | High | 8 |

---

## VI. Measurement — What Makes Phase 5–8 Successful

### Engagement Metrics
- Average session length increases each phase
- Daily active users retained week-over-week
- Number of missions completed per session increases
- Roster churn (merc turnover) rate is healthy (not too low = bored, not too high = chaotic)

### Economy Health
- Material circulation rate: materials flow in from missions and out through crafting
- No material is ever permanently worthless (sink + source for every material)
- Gold cap is meaningful — gold never becomes permanently irrelevant

### Narrative Depth
- Player can recite the names of at least 3 mercenaries and a meaningful event
- Chronicles contains at least 10 entries by mid-game
- Events feel like they matter, not random interruptions

### Technical
- Build stays under 600 KB main JS (gzipped < 200 KB)
- All 13 Playwright tests pass after every change
- No TypeScript errors in production
- Lighthouse performance score > 85
