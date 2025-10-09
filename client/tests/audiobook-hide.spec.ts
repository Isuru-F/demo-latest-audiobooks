import { test, expect } from '@playwright/test';

test.describe('Audiobook Hide Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/audiobooks');
    await page.waitForSelector('.audiobook-card', { timeout: 10000 });
  });

  test('should show X button on hover', async ({ page }) => {
    const firstCard = page.locator('.audiobook-card').first();
    await firstCard.hover();
    const hideBtn = firstCard.locator('.hide-btn');
    await expect(hideBtn).toBeVisible();
  });

  test('should hide audiobook when X button is clicked', async ({ page }) => {
    const initialCardCount = await page.locator('.audiobook-card').count();
    expect(initialCardCount).toBeGreaterThan(0);

    const firstCard = page.locator('.audiobook-card').first();
    const audiobookTitle = await firstCard.locator('.audiobook-title').textContent();
    
    await firstCard.hover();
    const hideBtn = firstCard.locator('.hide-btn');
    await hideBtn.click();

    await page.waitForTimeout(500);
    
    const newCardCount = await page.locator('.audiobook-card').count();
    expect(newCardCount).toBe(initialCardCount - 1);

    const remainingTitles = await page.locator('.audiobook-title').allTextContents();
    expect(remainingTitles).not.toContain(audiobookTitle);
  });

  test('should restore hidden audiobooks on page refresh', async ({ page }) => {
    const initialCardCount = await page.locator('.audiobook-card').count();

    const firstCard = page.locator('.audiobook-card').first();
    await firstCard.hover();
    const hideBtn = firstCard.locator('.hide-btn');
    await hideBtn.click();

    await page.waitForTimeout(500);
    const countAfterHiding = await page.locator('.audiobook-card').count();
    expect(countAfterHiding).toBe(initialCardCount - 1);

    await page.reload();
    await page.waitForSelector('.audiobook-card', { timeout: 10000 });

    const countAfterRefresh = await page.locator('.audiobook-card').count();
    expect(countAfterRefresh).toBe(initialCardCount);
  });

  test('should hide multiple audiobooks', async ({ page }) => {
    const initialCardCount = await page.locator('.audiobook-card').count();
    expect(initialCardCount).toBeGreaterThan(2);

    for (let i = 0; i < 2; i++) {
      const firstCard = page.locator('.audiobook-card').first();
      await firstCard.hover();
      const hideBtn = firstCard.locator('.hide-btn');
      await hideBtn.click();
      await page.waitForTimeout(300);
    }

    const newCardCount = await page.locator('.audiobook-card').count();
    expect(newCardCount).toBe(initialCardCount - 2);
  });

  test('should not show X button when not hovering', async ({ page }) => {
    const firstCard = page.locator('.audiobook-card').first();
    const hideBtn = firstCard.locator('.hide-btn');
    await expect(hideBtn).not.toBeVisible();
  });
});
