import { test, expect } from '@playwright/test';

test('Multi-cast narrator toggle works correctly', async ({ page }) => {
  // Navigate to the site
  await page.goto('http://localhost:5173/');
  
  // Wait for content to load
  await page.waitForSelector('.audiobook-card', { state: 'visible' });
  
  // Get initial count of audiobooks
  const initialCards = await page.$$('.audiobook-card');
  const initialCount = initialCards.length;
  console.log(`Initial audiobook count: ${initialCount}`);
  
  // Find multi-cast toggle and click it
  const multiCastToggle = page.locator('#multicast-toggle');
  await multiCastToggle.check();
  
  // Wait for the filter to be applied
  await page.waitForTimeout(500);
  
  // Count audiobooks after filtering
  const filteredCards = await page.$$('.audiobook-card');
  const filteredCount = filteredCards.length;
  console.log(`Filtered audiobook count: ${filteredCount}`);
  
  // Filtered count should be less than initial count
  expect(filteredCount).toBeLessThan(initialCount);
  
  // Check that filtered books have multiple narrators
  for (let i = 0; i < filteredCount; i++) {
    const narratorText = await page.locator('.audiobook-narrator').nth(i).textContent();
    console.log(`Narrator for audiobook ${i + 1}: ${narratorText}`);
    
    // Count commas to determine if multiple narrators exist
    const commaCount = (narratorText?.match(/,/g) || []).length;
    expect(commaCount).toBeGreaterThan(0);
  }
  
  // Test search while filter is active
  const searchInput = page.locator('.search-input');
  await searchInput.fill('Test Search Term');
  
  // Wait for search to apply
  await page.waitForTimeout(500);
  
  // Check if filter is still active (checkbox still checked)
  expect(await multiCastToggle.isChecked()).toBe(true);
  
  // Clear search
  await searchInput.clear();
  await page.waitForTimeout(500);
  
  // Toggle off filter
  await multiCastToggle.uncheck();
  await page.waitForTimeout(500);
  
  // Count should be back to initial
  const finalCards = await page.$$('.audiobook-card');
  expect(finalCards.length).toBe(initialCount);
});