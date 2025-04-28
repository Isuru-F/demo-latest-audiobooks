import { test, expect } from '@playwright/test';

test('Audiobook card should not display NaNm when duration is not valid', async ({ page }) => {
  // Mock the API response with a problematic audiobook (missing duration_ms)
  await page.route('**/api/spotify/audiobooks', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        audiobooks: {
          items: [
            {
              id: '1',
              name: 'Test Audiobook With Invalid Duration',
              authors: [{ name: 'Test Author' }],
              narrators: ['Test Narrator'],
              description: 'Test description',
              publisher: 'Test Publisher',
              images: [{ url: 'https://via.placeholder.com/300', height: 300, width: 300 }],
              external_urls: { spotify: 'https://spotify.com/audiobook/1' },
              release_date: '2023-01-01',
              media_type: 'audiobook',
              type: 'audiobook',
              uri: 'spotify:audiobook:1',
              total_chapters: 10,
              // Missing duration_ms or NaN duration_ms
              duration_ms: NaN
            }
          ]
        }
      })
    });
  });

  // Navigate to audiobooks page
  await page.goto('http://localhost:5173/audiobooks');
  
  // Wait for the audiobook card to appear
  await page.waitForSelector('.audiobook-card');

  // Take screenshot of the card
  const cardElement = await page.locator('.audiobook-card').first();
  await cardElement.screenshot({ path: './audiobook-card.png' });

  // Make sure the card doesn't contain 'NaNm'
  const cardText = await page.textContent('.audiobook-card');
  expect(cardText).not.toContain('NaNm');

  // Open the modal
  await page.click('.view-details-btn');

  // Wait for modal to appear
  await page.waitForSelector('.modal-overlay');

  // Take screenshot of the modal
  const modalElement = await page.locator('.modal-content').first();
  await modalElement.screenshot({ path: './audiobook-modal.png' });

  // Make sure the modal doesn't contain 'NaNm'
  const modalText = await page.textContent('.modal-content');
  expect(modalText).not.toContain('NaNm');

  // Close modal
  await page.click('.close-btn');

  // Make sure modal is closed
  await expect(page.locator('.modal-overlay')).not.toBeVisible();
});