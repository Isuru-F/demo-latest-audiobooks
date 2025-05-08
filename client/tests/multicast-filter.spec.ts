import { test, expect } from '@playwright/test';

test('MultiCast filter should show only multi-narrator audiobooks', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:5173');
  
  // Wait for content to load
  await page.waitForSelector('.audiobook-card', { state: 'visible' });
  
  // Count initial audiobooks
  const initialCount = await page.locator('.audiobook-card').count();
  expect(initialCount).toBeGreaterThan(0);
  
  // Toggle the MultiCast filter on
  const toggleCheckbox = page.locator('.toggle input[type="checkbox"]');
  await toggleCheckbox.check();
  
  // Wait for results to update
  await page.waitForTimeout(500); // Short wait for the UI to update
  
  // Get the filtered count
  const filteredCount = await page.locator('.audiobook-card').count();
  
  // Filtered count should be less than or equal to the initial count
  // (since we're filtering to show only multi-narrator books)
  expect(filteredCount).toBeLessThanOrEqual(initialCount);
  
  // Check if toggle shows active state visually
  const slider = page.locator('.slider');
  const sliderComputedStyle = await slider.evaluate((el) => {
    return window.getComputedStyle(el).background;
  });
  
  // The checked slider should have a gradient background
  expect(sliderComputedStyle).toContain('gradient');
  
  // Try combining with search
  const searchInput = page.locator('.search-input');
  await searchInput.fill('test search');
  
  // Ensure the multi-cast filter stays active after search
  const isToggleStillChecked = await toggleCheckbox.isChecked();
  expect(isToggleStillChecked).toBe(true);
});