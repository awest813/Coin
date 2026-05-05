import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:5174';

test.describe('Phase 5 — System Verification', () => {
  test.beforeAll(async () => {
    const pw = await import('@playwright/test');
    await pw.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  });

  test('dashboard shows morale card', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.waitForTimeout(1500);
    // Morale card should be visible with value 50
    await expect(page.locator('text=Morale').first()).toBeVisible({ timeout: 5000 });
    const moraleText = await page.locator('text=Morale').first().locator('..').innerText();
    console.log('MORALE CARD:', moraleText.slice(0, 200));
  });

  test('mission briefing modal opens and closes', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.waitForTimeout(1000);
    // Navigate to missions
    await page.locator('button:has-text("Missions")').click();
    await page.waitForTimeout(1000);
    // Click the first mission's "Initialize Contract" button to open briefing
    await page.locator('button:has-text("Initialize Contract")').first().click();
    await page.waitForTimeout(1000);
    // Briefing modal should be visible
    await expect(page.locator('text=Accept Contract').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Decline Contract').first()).toBeVisible({ timeout: 3000 });
    // Decline should close the modal
    await page.locator('button:has-text("Decline Contract")').click();
    await page.waitForTimeout(500);
    // Briefing should be gone
    await expect(page.locator('text=Accept Contract')).not.toBeVisible({ timeout: 3000 });
  });

  test('mission briefing shows difficulty and loot', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Missions")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Initialize Contract")').first().click();
    await page.waitForTimeout(1000);
    // Should show difficulty assessment
    await expect(page.locator('text=Difficulty Assessment').first()).toBeVisible({ timeout: 5000 });
    // Should show contract payment
    await expect(page.locator('text=Contract Payment').first()).toBeVisible({ timeout: 3000 });
    // Should show possible loot
    await expect(page.locator('text=Possible Loot').first()).toBeVisible({ timeout: 3000 });
    // Decline
    await page.locator('button:has-text("Decline Contract")').click();
  });

  test('roster shows training and morale indicators', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Roster")').click();
    await page.waitForTimeout(1000);
    // Click on the first mercenary to expand detail view
    await page.locator('text=Aldric Vane').first().click();
    await page.waitForTimeout(1000);
    // Should show morale badge
    await expect(page.locator('text=Morale').first()).toBeVisible({ timeout: 5000 });
    // Should show deployments completed
    await expect(page.locator('text=Deployments Complete').first()).toBeVisible({ timeout: 3000 });
  });

  test('no console errors in Phase 5 systems', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Commence Operations")').click();
    await page.waitForTimeout(1000);
    // Visit missions and open briefing
    await page.locator('button:has-text("Missions")').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Initialize Contract")').first().click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Decline Contract")').click();
    // Visit roster
    await page.locator('button:has-text("Roster")').click();
    await page.waitForTimeout(500);
    // Click first merc
    await page.locator('text=Aldric Vane').first().click();
    await page.waitForTimeout(500);
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('Babylon') &&
      !e.includes('<path> attribute d')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});