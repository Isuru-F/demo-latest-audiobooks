import { test, expect } from '@playwright/test';

test('Multi-cast narrator toggle should filter audiobooks correctly', async ({ page }) => {
  // Navigate to the audiobooks page
  await page.goto('http://localhost:5173');

  // Wait for the audiobooks to load
  await page.waitForSelector('.audiobook-grid');

  // Check that the multi-cast toggle is present
  const toggle = page.locator('.toggle-checkbox');
  await expect(toggle).toBeAttached();

  // Check that the toggle text is visible
  const toggleText = page.locator('.toggle-text');
  await expect(toggleText).toContainText('Multi-Cast Only');

  // Initially, toggle should be unchecked
  await expect(toggle).not.toBeChecked();

  // Count initial audiobooks
  const initialCards = await page.locator('.audiobook-grid .audiobook-card').count();
  console.log(`Initial audiobooks count: ${initialCards}`);

  // Enable the multi-cast toggle
  await page.click('.toggle-label');
  await expect(toggle).toBeChecked();

  // Wait for the filter to apply
  await page.waitForTimeout(500);

  // Count filtered audiobooks
  const filteredCards = await page.locator('.audiobook-grid .audiobook-card').count();
  console.log(`Filtered audiobooks count: ${filteredCards}`);

  // Verify that toggle persists during search
  await page.fill('.search-input', 'test');
  await page.waitForTimeout(500);
  
  // Toggle should still be checked
  await expect(toggle).toBeChecked();

  // Clear search
  await page.fill('.search-input', '');
  await page.waitForTimeout(500);

  // Toggle should still be checked
  await expect(toggle).toBeChecked();

  // Disable the toggle
  await page.click('.toggle-label');
  await expect(toggle).not.toBeChecked();

  // Verify audiobooks are shown again
  await page.waitForTimeout(500);
  const finalCards = await page.locator('.audiobook-grid .audiobook-card').count();
  expect(finalCards).toBeGreaterThanOrEqual(filteredCards);
});

test('Multi-cast toggle shows correct no results message', async ({ page }) => {
  // Navigate to the audiobooks page
  await page.goto('http://localhost:5173');

  // Wait for the audiobooks to load
  await page.waitForSelector('.audiobook-grid');

  // Enable the multi-cast toggle
  await page.click('.toggle-label');

  // Add a search that will likely return no results
  await page.fill('.search-input', 'nonexistentbook12345');
  await page.waitForTimeout(500);

  // Check for the specific no results message
  const noResultsText = page.locator('.no-results');
  await expect(noResultsText).toContainText('No multi-cast audiobooks match your search criteria.');

  // Clear search but keep toggle enabled
  await page.fill('.search-input', '');
  await page.waitForTimeout(500);

  // Check if there are any multi-cast audiobooks
  const cards = await page.locator('.audiobook-grid .audiobook-card').count();
  if (cards === 0) {
    await expect(noResultsText).toContainText('No multi-cast audiobooks found.');
  }
});

test('Multi-cast toggle visual state changes correctly', async ({ page }) => {
  // Navigate to the audiobooks page
  await page.goto('http://localhost:5173');

  // Wait for the toggle to be visible
  await page.waitForSelector('.toggle-checkbox');

  const toggleSlider = page.locator('.toggle-slider');
  const toggleText = page.locator('.toggle-text');

  // Check initial state (unchecked)
  await expect(toggleSlider).toHaveCSS('background', /rgb\(204, 204, 204\)/);

  // Click the toggle to enable it
  await page.click('.toggle-label');

  // Check active state visual changes
  // The background should have a gradient (we'll check if it's not the default gray)
  await expect(toggleSlider).not.toHaveCSS('background', /rgb\(204, 204, 204\)/);
  
  // The text should change color when active
  await expect(toggleText).toHaveCSS('color', /rgb\(138, 66, 255\)/);
  await expect(toggleText).toHaveCSS('font-weight', '600');

  // Click again to disable
  await page.click('.toggle-label');

  // Check that it returns to inactive state
  await expect(toggleSlider).toHaveCSS('background', /rgb\(204, 204, 204\)/);
  await expect(toggleText).toHaveCSS('color', /rgb\(42, 45, 62\)/);
  await expect(toggleText).toHaveCSS('font-weight', '500');
});