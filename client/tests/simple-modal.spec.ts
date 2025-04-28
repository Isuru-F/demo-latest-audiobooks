import { test, expect } from '@playwright/test';

test('Modal should open and close correctly', async ({ page }) => {
  // Create a simple HTML page with a button and modal
  await page.setContent(`
    <button id="openModal">Open Modal</button>
    <div id="modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);">
      <div id="modalContent" style="position: relative; background: white; margin: 10% auto; padding: 20px; width: 50%;">
        <button id="closeModal" style="position: absolute; top: 10px; right: 10px;">X</button>
        <h2>Test Modal</h2>
        <p>This is a test modal</p>
      </div>
    </div>
  `);

  // Add JavaScript to control the modal
  await page.addScriptTag({
    content: `
      const openBtn = document.getElementById('openModal');
      const modal = document.getElementById('modal');
      const closeBtn = document.getElementById('closeModal');

      openBtn.addEventListener('click', () => {
        modal.style.display = 'block';
      });

      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });

      // Prevent modal from closing when clicking inside content
      document.getElementById('modalContent').addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Close modal when clicking outside content
      modal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    `
  });

  // Test opening the modal
  await page.click('#openModal');
  await expect(page.locator('#modal')).toBeVisible();

  // Test clicking inside doesn't close it
  await page.click('h2');
  await expect(page.locator('#modal')).toBeVisible();

  // Move mouse around to test for flicker issues
  await page.mouse.move(100, 100);
  await page.mouse.move(200, 200);
  await page.mouse.move(300, 300);
  await expect(page.locator('#modal')).toBeVisible();

  // Test closing the modal with the close button
  await page.click('#closeModal');
  await expect(page.locator('#modal')).not.toBeVisible();

  // Test opening and closing again
  await page.click('#openModal');
  await expect(page.locator('#modal')).toBeVisible();

  // Test clicking outside closes it
  await page.mouse.click(10, 10);
  await expect(page.locator('#modal')).not.toBeVisible();
});