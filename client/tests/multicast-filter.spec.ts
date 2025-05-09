import { test, expect } from '@playwright/test';

test('Multi-cast filter should work correctly', async ({ page }) => {
  // Navigate to the local development server
  await page.goto('http://localhost:5173/');
  
  // Wait for the page to load and audiobooks to display
  await page.waitForSelector('.audiobook-card', { timeout: 10000 });
  
  // Count the initial number of audiobooks
  const initialCount = await page.locator('.audiobook-card').count();
  expect(initialCount).toBeGreaterThan(0);
  
  // Enable the multi-cast toggle
  await page.locator('.toggle-switch').click();
  
  // Wait for the filter to apply
  await page.waitForTimeout(500);
  
  // Get the filtered count of audiobooks
  const filteredCount = await page.locator('.audiobook-card').count();
  
  // Verify that the count has changed (we expect fewer books now)
  expect(filteredCount).toBeLessThanOrEqual(initialCount);
  
  // Verify at least one multi-cast book is displayed if available
  // This assumes there is at least one multi-cast book in the dataset
  if (filteredCount > 0) {
    // Check the first audiobook card for multiple narrators
    const narratorText = await page.locator('.audiobook-card .audiobook-narrator').first().textContent();
    
    // Split the narrator text and check if there are multiple narrators (indicated by a comma)
    // Format is typically "Narrator: Name1, Name2, Name3"
    expect(narratorText).toContain(',');
  } else {
    // If no results, verify the no results message is displayed
    const noResultsText = await page.locator('.no-results').textContent();
    expect(noResultsText).toContain('No audiobooks match');
  }
  
  // Disable the toggle and check that books are restored
  await page.locator('.toggle-switch').click();
  await page.waitForTimeout(500);
  
  const restoredCount = await page.locator('.audiobook-card').count();
  expect(restoredCount).toEqual(initialCount);
  
  // Test with search functionality
  // Enter a search term
  await page.locator('.search-input').fill('a');
  await page.waitForTimeout(500);
  
  // Get the count after search
  const searchCount = await page.locator('.audiobook-card').count();
  
  // Enable multi-cast filter again while search is active
  await page.locator('.toggle-switch').click();
  await page.waitForTimeout(500);
  
  // Get the count with both filters
  const combinedCount = await page.locator('.audiobook-card').count();
  
  // Combined count should be less than or equal to search count
  expect(combinedCount).toBeLessThanOrEqual(searchCount);
});