import { test, expect } from '@playwright/test';
import type { Chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5174';

let browser: Chromium;

test.describe('Banner & Coin — Full Gameplay Loop', () => {
  test.beforeAll(async () => {
    const pw = await import('@playwright/test');
    browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  });

  test.afterAll(async () => {
    if (browser) await browser.close();
  });

  test('loads main menu without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await expect(page.locator('text=COIN & IRON')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Commence Operations")')).toBeVisible({ timeout: 5000 });
    const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('net::ERR'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('enters guild dashboard', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.waitForSelector('text=Guild Hall', { timeout: 5000 });
    const state = await page.evaluate(() => (window as Record<string, unknown>).render_game_to_text?.());
    expect(state).toBeTruthy();
    const parsed = JSON.parse(state!);
    expect(parsed.mode).toBe('guild');
    expect(parsed.activeScreen).toBe('dashboard');
  });

  test('navigates to roster screen', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Roster")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Personnel Roster').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to mission board', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Missions")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Contract Board').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to inventory', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Inventory")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Inventory').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to workshop', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Workshop")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Workshop').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to hiring hall', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Hiring")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Hiring Hall').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to expeditions', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Expeditions")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Expeditions').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to world map', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Influence")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Influence').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to reliquary', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Reliquary")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Reliquary').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to chronicles', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Chronicles")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Chronicles').first()).toBeVisible({ timeout: 3000 });
  });

  test('navigates to policies', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.locator('button:has-text("Policies")').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Policies').first()).toBeVisible({ timeout: 3000 });
  });

  test('no console errors across all screens', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    const screens = ['Guild Hall', 'Roster', 'Missions', 'Inventory', 'Workshop', 'Hiring', 'Expeditions', 'Influence', 'Reliquary', 'Chronicles', 'Policies'];
    for (const screen of screens) {
      const btn = page.locator(`button:has-text("${screen}")`);
      if (await btn.count() > 0) await btn.click();
      await page.waitForTimeout(500);
    }
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('Babylon') &&
      !e.includes('<path> attribute d')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});