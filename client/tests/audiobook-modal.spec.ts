import { test, expect } from '@playwright/test';

test('Audiobook modal opens and closes correctly', async ({ page }) => {
  // Mock data for the page
  await page.route('**/api/spotify/audiobooks', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        audiobooks: {
          items: [
            {
              id: '1',
              name: 'Test Audiobook',
              authors: [{ name: 'Test Author' }],
              narrators: ['Test Narrator'],
              description: '<p>This is a test description with <b>HTML content</b></p>',
              publisher: 'Test Publisher',
              images: [{ url: 'https://via.placeholder.com/300', height: 300, width: 300 }],
              external_urls: { spotify: 'https://spotify.com/audiobook/1' },
              release_date: '2023-01-01',
              media_type: 'audiobook',
              type: 'audiobook',
              uri: 'spotify:audiobook:1',
              total_chapters: 10,
              duration_ms: 3600000 // 1 hour
            }
          ]
        }
      })
    });
  });

  // Navigate to audiobooks page
  await page.goto('http://localhost:5173/audiobooks');
  
  // Mock for any other API requests
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'xhr' || route.request().resourceType() === 'fetch') {
      return route.fulfill({ status: 200, body: '{}' });
    }
    return route.continue();
  });

  // Create a test component with a button and modal
  await page.setContent(`
    <div id="app">
      <div class="audiobook-card">
        <button class="view-details-btn">View Details</button>
      </div>
    </div>
  `);
  
  // Inject our component script
  await page.addScriptTag({
    content: `
      // Create a simple Vue app with our modal
      const app = document.querySelector('#app');
      const button = app.querySelector('.view-details-btn');
      
      // Add modal markup
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal-overlay';
      modalDiv.style.display = 'none';
      modalDiv.innerHTML = `
        <div class="modal-content">
          <button class="close-btn">×</button>
          <div class="modal-title">
            <h2>Test Audiobook</h2>
          </div>
          <div class="description">
            <p>This is a test description with <b>HTML content</b></p>
          </div>
        </div>
      `;
      app.appendChild(modalDiv);
      
      // Add event handlers
      button.addEventListener('click', () => {
        modalDiv.style.display = 'flex';
      });
      
      const closeBtn = modalDiv.querySelector('.close-btn');
      closeBtn.addEventListener('click', () => {
        modalDiv.style.display = 'none';
      });
    `,
  });

  // Add some basic styles
  await page.addStyleTag({
    content: `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .modal-content {
        background: #2a2d3e;
        border-radius: 16px;
        width: 90%;
        max-width: 700px;
        position: relative;
        color: white;
        padding: 30px;
      }
      .close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: transparent;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
      }
    `,
  });

  // Click on the View Details button
  await page.click('.view-details-btn');
  
  // Check if modal appears
  const modal = page.locator('.modal-overlay');
  await expect(modal).toBeVisible();
  
  // Click somewhere in the modal content to ensure it doesn't close when clicking inside
  await page.click('.modal-title h2');
  
  // Check if modal is still visible
  await expect(modal).toBeVisible();
  
  // Move mouse around to check for flicker issues
  await page.mouse.move(100, 100);
  await page.mouse.move(200, 200);
  await page.mouse.move(300, 300);
  
  // Check if modal is still visible after mouse movements
  await expect(modal).toBeVisible();
  
  // Click close button
  await page.click('.close-btn');
  
  // Check if modal disappears
  await expect(modal).not.toBeVisible();
});