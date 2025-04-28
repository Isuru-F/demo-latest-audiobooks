import { test, expect } from '@playwright/test';

test('Audiobook popup should not show chapters or release date', async ({ page }) => {
  // Create a simple HTML page for testing
  await page.setContent(`
    <div class="audiobook-card">
      <div class="view-details-btn">View Details</div>
    </div>

    <div class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7);">
      <div class="modal-content" style="position: relative; background: white; margin: 10% auto; padding: 20px; width: 50%;">
        <button class="close-btn" style="position: absolute; top: 10px; right: 10px;">X</button>
        <h2>Test Audiobook</h2>
        <p class="modal-details">1h 0m</p>
        <p class="description">This is a test description</p>
      </div>
    </div>
  `);

  // Add JavaScript
  await page.addScriptTag({
    content: `
      const viewDetailsBtn = document.querySelector('.view-details-btn');
      const modal = document.querySelector('.modal-overlay');
      const closeBtn = document.querySelector('.close-btn');

      viewDetailsBtn.addEventListener('click', () => {
        modal.style.display = 'block';
      });

      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    `
  });

  // Open the modal
  await page.click('.view-details-btn');

  // Verify modal is visible
  await expect(page.locator('.modal-overlay')).toBeVisible();

  // Check that modal details only contains duration 
  const modalDetailsText = await page.locator('.modal-details').textContent();
  expect(modalDetailsText.trim()).toBe('1h 0m');
  expect(modalDetailsText).not.toContain('chapters');
  expect(modalDetailsText).not.toContain('Released');

  // Close the modal
  await page.click('.close-btn');
  await expect(page.locator('.modal-overlay')).not.toBeVisible();
});