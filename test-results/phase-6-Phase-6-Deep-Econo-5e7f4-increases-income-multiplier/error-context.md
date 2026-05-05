# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase-6.spec.ts >> Phase 6: Deep Economy Integration >> Guild Business investment increases income multiplier
- Location: e2e\phase-6.spec.ts:65:3

# Error details

```
TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Enter Guild/i }) to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e7]: EST. 1204
      - heading "COIN & IRON" [level=1] [ref=e8]
      - paragraph [ref=e9]: "\"A Guild Master's legacy is written in blood and gold.\""
    - navigation [ref=e10]:
      - button "Commence Operations →" [ref=e11]
      - button "Strategic Options [⚙️]" [ref=e12]
    - contentinfo [ref=e13]:
      - generic [ref=e14]: Advanced Agentic Coding Simulation
      - generic [ref=e15]: v0.4.2-ALPHA // DEEPMIND ANTIGRAVITY ENGINE
  - generic [ref=e16]:
    - navigation [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: 🏴
          - generic [ref=e21]:
            - heading "The Tarnished Banner" [level=1] [ref=e22]
            - generic [ref=e23]: RANK 1 SOVEREIGN GUILD
        - generic [ref=e24]:
          - button "🏰 Guild Hall" [ref=e25]:
            - generic [ref=e26]: 🏰
            - generic [ref=e27]: Guild Hall
          - button "⚔️ Roster" [ref=e28]:
            - generic [ref=e29]: ⚔️
            - generic [ref=e30]: Roster
          - button "📋 Missions" [ref=e31]:
            - generic [ref=e32]: 📋
            - generic [ref=e33]: Missions
          - button "🎒 Inventory" [ref=e34]:
            - generic [ref=e35]: 🎒
            - generic [ref=e36]: Inventory
          - button "🔨 Workshop" [ref=e37]:
            - generic [ref=e38]: 🔨
            - generic [ref=e39]: Workshop
          - button "🧑‍🤝‍🧑 Hiring" [ref=e40]:
            - generic [ref=e41]: 🧑‍🤝‍🧑
            - generic [ref=e42]: Hiring
          - button "🗺️ Expeditions" [ref=e43]:
            - generic [ref=e44]: 🗺️
            - generic [ref=e45]: Expeditions
          - button "🌐 Influence" [ref=e46]:
            - generic [ref=e47]: 🌐
            - generic [ref=e48]: Influence
          - button "🏺 Reliquary" [ref=e49]:
            - generic [ref=e50]: 🏺
            - generic [ref=e51]: Reliquary
          - button "📖 Chronicles" [ref=e52]:
            - generic [ref=e53]: 📖
            - generic [ref=e54]: Chronicles
          - button "🎭 Custom Hall" [ref=e55]:
            - generic [ref=e56]: 🎭
            - generic [ref=e57]: Custom Hall
          - button "📜 Policies" [ref=e58]:
            - generic [ref=e59]: 📜
            - generic [ref=e60]: Policies
          - button "⚖️ Market" [ref=e61]:
            - generic [ref=e62]: ⚖️
            - generic [ref=e63]: Market
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]: 💰
              - generic [ref=e68]: "150"
            - generic [ref=e69]: Gold
          - generic [ref=e70]:
            - generic [ref=e71]:
              - generic [ref=e72]: ⭐
              - generic [ref=e73]: "0"
            - generic [ref=e74]: Renown
          - generic [ref=e75]:
            - generic [ref=e76]:
              - generic [ref=e77]: 🧴
              - generic [ref=e78]: "20"
            - generic [ref=e79]: Supplies
    - main [ref=e80]:
      - generic [ref=e81]:
        - generic [ref=e83]:
          - generic:
            - generic [ref=e84]:
              - heading "🏰 The Tarnished Banner" [level=1] [ref=e85]:
                - generic [ref=e86]: 🏰
                - generic [ref=e87]: The Tarnished Banner
              - generic [ref=e88]:
                - generic [ref=e89]: Rank 1 Guild
                - generic [ref=e90]: 0 Contracts Completed
            - generic [ref=e91]:
              - generic [ref=e92]:
                - generic [ref=e93]: ☀️
                - generic [ref=e94]:
                  - generic [ref=e95]: Atmosphere
                  - generic [ref=e96]: clear
              - generic [ref=e97]:
                - generic [ref=e98]: 🛏️ Barracks
                - generic [ref=e99]: 🍺 Tavern
                - generic [ref=e100]: 🔨 Forge
        - generic [ref=e101]:
          - generic [ref=e102]:
            - generic [ref=e103]:
              - generic [ref=e104]: 💰
              - generic [ref=e105]: +0.10/s
            - generic [ref=e106]: 150g
            - generic [ref=e107]: Gold
            - generic [ref=e111]:
              - generic [ref=e112]: Capacity
              - generic [ref=e113]: 2000 max
          - generic [ref=e114]:
            - generic [ref=e116]: ⭐
            - generic [ref=e117]: "0"
            - generic [ref=e118]: Renown
          - generic [ref=e119]:
            - generic [ref=e120]:
              - generic [ref=e121]: 🧴
              - generic [ref=e122]: +0.05/s
            - generic [ref=e123]: "20"
            - generic [ref=e124]: Supplies
            - generic [ref=e128]:
              - generic [ref=e129]: Capacity
              - generic [ref=e130]: 300 max
          - generic [ref=e131]:
            - generic [ref=e133]: ⚖️
            - generic [ref=e134]: "50"
            - generic [ref=e135]: Morale
            - generic [ref=e139]:
              - generic [ref=e140]: Steady
              - generic [ref=e141]: 100 max
        - generic [ref=e142]:
          - generic [ref=e143]:
            - generic [ref=e144]:
              - generic [ref=e145]: 🏢
              - generic [ref=e146]:
                - heading "Guild Business Ventures" [level=3] [ref=e147]
                - paragraph [ref=e148]: "\"A guild that doesn't grow, dies.\""
                - generic [ref=e149]:
                  - generic [ref=e150]:
                    - generic [ref=e151]: Level
                    - generic [ref=e152]: "0"
                  - generic [ref=e153]:
                    - generic [ref=e154]: Efficiency
                    - generic [ref=e155]: +0%
            - generic [ref=e156]:
              - generic [ref=e157]:
                - generic [ref=e158]: Investment Cost
                - generic [ref=e159]: 500g
              - button "Expand Business" [disabled] [ref=e160]
          - generic [ref=e161]:
            - heading "Projected Yield" [level=3] [ref=e162]
            - generic [ref=e163]:
              - generic [ref=e164]:
                - generic [ref=e165]:
                  - generic [ref=e166]: 💰
                  - generic [ref=e167]: Net Gold / sec
                - generic [ref=e168]: "+0.10"
              - generic [ref=e169]:
                - generic [ref=e170]:
                  - generic [ref=e171]: 🧴
                  - generic [ref=e172]: Net Supplies / sec
                - generic [ref=e173]: "-0.04"
              - paragraph [ref=e175]: "Roster Maintenance: -0.09 supplies/sec"
        - generic [ref=e176]:
          - generic [ref=e178]:
            - heading "⚔️ Active Contracts" [level=3] [ref=e179]:
              - generic [ref=e180]: ⚔️
              - text: Active Contracts
            - paragraph [ref=e182]: No active contracts. Send mercs from the board.
          - generic [ref=e183]:
            - generic [ref=e184]:
              - generic [ref=e186]:
                - heading "Guild Roster" [level=3] [ref=e187]
                - button "View All 9 Mercs →" [ref=e188]
              - generic [ref=e189]:
                - generic [ref=e190]:
                  - generic [ref=e191]: "9"
                  - generic [ref=e192]: Ready
                - generic [ref=e193]:
                  - generic [ref=e194]: "0"
                  - generic [ref=e195]: Injured
                - generic [ref=e196]:
                  - generic [ref=e197]: "0"
                  - generic [ref=e198]: Fatigued
                - generic [ref=e199]:
                  - generic [ref=e200]: "0"
                  - generic [ref=e201]: Deployed
            - generic [ref=e202]:
              - heading "Guild Hall Improvements" [level=3] [ref=e203]
              - generic [ref=e204]:
                - generic [ref=e205]:
                  - generic [ref=e206]:
                    - generic [ref=e207]: 🛏️
                    - heading "Barracks" [level=4] [ref=e209]
                  - paragraph [ref=e214]: Basic bunks. Mercs recover from fatigue between missions.
                  - generic [ref=e215]:
                    - generic [ref=e216]: "Roster cap: 10 mercs"
                    - generic [ref=e218]: Standard recovery
                    - generic [ref=e220]: +0.05 supplies / sec
                  - button "Insufficient Funds" [disabled] [ref=e222]
                - generic [ref=e223]:
                  - generic [ref=e224]:
                    - generic [ref=e225]: 🍺
                    - heading "Common Room" [level=4] [ref=e227]
                  - paragraph [ref=e232]: A hearth and a keg. Morale holds steady after tough missions.
                  - generic [ref=e233]:
                    - generic [ref=e234]: Morale stable
                    - generic [ref=e236]: Standard event rate
                    - generic [ref=e238]: +0.1 gold / sec
                  - button "Insufficient Funds" [disabled] [ref=e240]
                - generic [ref=e241]:
                  - generic [ref=e242]:
                    - generic [ref=e243]: 🔨
                    - heading "Forge" [level=4] [ref=e245]
                  - paragraph [ref=e250]: Basic upkeep. Gear stays functional.
                  - generic [ref=e251]:
                    - generic [ref=e252]: Standard loot
                    - generic [ref=e254]: Forge level 1
                  - button "Insufficient Funds" [disabled] [ref=e256]
        - button "Destructive Reset Save Data" [ref=e258]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Phase 6: Deep Economy Integration', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     // The main menu takes a moment to load
  7  |     const enterButton = page.getByRole('button', { name: /Enter Guild/i });
> 8  |     await enterButton.waitFor({ state: 'visible', timeout: 15000 });
     |                       ^ TimeoutError: locator.waitFor: Timeout 15000ms exceeded.
  9  |     await enterButton.click();
  10 |   });
  11 | 
  12 |   test('Marketplace allows buying and selling materials', async ({ page }) => {
  13 |     // Navigate to Inventory then Market
  14 |     await page.locator('nav').getByText('Inventory').click();
  15 |     await page.getByText('⚖️ Trade at Market').click();
  16 | 
  17 |     await expect(page.getByText("Merchant's Exchange")).toBeVisible();
  18 | 
  19 |     // Check buying
  20 |     // The gold indicator in NavBar is usually "💰 X"
  21 |     const initialGold = await page.evaluate(() => {
  22 |        const text = document.querySelector('.shimmer-effect')?.innerText || '';
  23 |        const match = text.match(/([\d,]+)\nGold/);
  24 |        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  25 |     });
  26 | 
  27 |     await page.getByRole('button', { name: /Buy/i }).first().click();
  28 |     
  29 |     // Check toast
  30 |     await expect(page.getByText(/Purchased materials/i)).toBeVisible();
  31 | 
  32 |     const newGold = await page.evaluate(() => {
  33 |        const text = document.querySelector('.shimmer-effect')?.innerText || '';
  34 |        const match = text.match(/([\d,]+)\nGold/);
  35 |        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  36 |     });
  37 |     expect(newGold).toBeLessThan(initialGold);
  38 | 
  39 |     // Check selling
  40 |     await page.getByRole('button', { name: /x1/i }).first().click();
  41 |     await expect(page.getByText(/Sold materials/i)).toBeVisible();
  42 |   });
  43 | 
  44 |   test('Maintenance costs drain supplies over time', async ({ page }) => {
  45 |     await page.locator('nav').getByText('Guild Hall').click();
  46 |     
  47 |     const initialSupplies = await page.evaluate(() => {
  48 |        const text = document.querySelector('.shimmer-effect')?.innerText || '';
  49 |        const match = text.match(/([\d,]+)\nSupplies/);
  50 |        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  51 |     });
  52 | 
  53 |     // Wait a few seconds for ticks
  54 |     await page.waitForTimeout(3000);
  55 | 
  56 |     const finalSupplies = await page.evaluate(() => {
  57 |        const text = document.querySelector('.shimmer-effect')?.innerText || '';
  58 |        const match = text.match(/([\d,]+)\nSupplies/);
  59 |        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  60 |     });
  61 | 
  62 |     expect(finalSupplies).toBeLessThan(initialSupplies);
  63 |   });
  64 | 
  65 |   test('Guild Business investment increases income multiplier', async ({ page }) => {
  66 |     await page.locator('nav').getByText('Guild Hall').click();
  67 |     
  68 |     await expect(page.getByText(/Guild Business Ventures/i)).toBeVisible();
  69 | 
  70 |     // Click Invest
  71 |     const investButton = page.getByRole('button', { name: /Expand Business/i });
  72 |     if (await investButton.isEnabled()) {
  73 |       await investButton.click();
  74 |       await expect(page.getByText(/Business expanded/i)).toBeVisible();
  75 |     }
  76 |   });
  77 | 
  78 |   test('Equipment durability is tracked and repairable', async ({ page }) => {
  79 |     await page.getByRole('button', { name: /Roster/i }).click();
  80 |     
  81 |     // Check for condition bars (if any items equipped)
  82 |     // For testing, we assume the initial state has items or we can equip one
  83 |     await page.getByRole('button', { name: /Inventory/i }).click();
  84 |     await page.getByRole('button', { name: /Equip/i }).first().click();
  85 |     await page.getByRole('button', { name: /Assign/i }).first().click(); // Assuming button says Assign or click merc name
  86 | 
  87 |     await page.getByRole('button', { name: /Roster/i }).click();
  88 |     // Look for durability percentage or repair button
  89 |     // (In a fresh save, it might be 100%, so we can't test "repair" easily without simulation)
  90 |   });
  91 | });
  92 | 
```