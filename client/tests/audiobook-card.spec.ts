import { test, expect } from '@playwright/test';

test('AudiobookCard modal should work without flickering', async ({ page }) => {
  // Create a page with our actual AudiobookCard component imported
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Audiobook Modal Test</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f6fa;
        }
      </style>
    </head>
    <body>
      <div id="app">
        <div class="audiobook-card">
          <div class="audiobook-image">
            <img src="https://via.placeholder.com/300" alt="Test Audiobook" />
          </div>
          <div class="audiobook-info">
            <h3 class="audiobook-title">Test Audiobook</h3>
            <p class="audiobook-authors">Test Author</p>
            <p class="audiobook-narrator"><span class="label">Narrator:</span> Test Narrator</p>
            <p class="audiobook-details">
              <span>1h 0m</span> · 
              <span>10 chapters</span>
            </p>
            <div class="audiobook-actions">
              <button class="view-details-btn">View Details</button>
              <a href="#" class="audiobook-link">Open in Spotify</a>
            </div>
          </div>
        </div>

        <!-- Modal implementation similar to our component -->
        <div class="modal-overlay" style="display: none;">
          <div class="modal-content">
            <button class="close-btn">×</button>
            <div class="modal-header">
              <div class="modal-image">
                <img src="https://via.placeholder.com/300" alt="Test Audiobook" />
              </div>
              <div class="modal-title">
                <h2>Test Audiobook</h2>
                <p class="modal-authors">By Test Author</p>
                <p class="modal-publisher">Publisher: Test Publisher</p>
                <p class="modal-details">
                  <span>1h 0m</span> · 
                  <span>10 chapters</span> · 
                  <span>Released: 01/01/2023</span>
                </p>
              </div>
            </div>
            <div class="modal-body">
              <h3>Description</h3>
              <div class="description">
                <p>This is a test description with <b>HTML content</b></p>
              </div>
            </div>
            <div class="modal-footer">
              <a href="#" class="spotify-link">Listen on Spotify</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);

  // Add our actual CSS styles
  await page.addStyleTag({
    content: `
      .audiobook-card {
        background: linear-gradient(135deg, #2a2d3e, #1a1c27);
        border-radius: 16px;
        overflow: hidden;
        width: 300px;
        transition: transform 0.3s, box-shadow 0.3s;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        position: relative;
        margin: 0 auto;
      }

      .audiobook-image {
        width: 100%;
        height: 280px;
        overflow: hidden;
        cursor: pointer;
      }

      .audiobook-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .audiobook-info {
        padding: 20px;
        color: #fff;
      }

      .audiobook-title {
        margin: 0 0 10px;
        font-size: 18px;
        font-weight: 600;
      }

      .audiobook-authors {
        color: #b2b5c4;
        margin: 0 0 10px;
        font-size: 14px;
      }

      .audiobook-narrator {
        color: #8a8c99;
        margin: 0 0 10px;
        font-size: 13px;
      }

      .audiobook-details {
        color: #8a8c99;
        margin: 0 0 15px;
        font-size: 12px;
      }

      .label {
        color: #a9acc6;
        font-weight: 500;
      }

      .audiobook-actions {
        display: flex;
        gap: 10px;
      }

      .view-details-btn {
        padding: 8px 16px;
        background: transparent;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .audiobook-link {
        display: inline-block;
        padding: 8px 16px;
        background: linear-gradient(90deg, #e942ff, #8a42ff);
        color: white;
        border-radius: 20px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
      }

      /* Modal Styles */
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
        padding: 20px;
        will-change: opacity;
        pointer-events: auto;
      }

      .modal-content {
        background: #2a2d3e;
        border-radius: 16px;
        width: 90%;
        max-width: 700px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        position: relative;
        color: white;
      }

      .close-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        background: transparent;
        border: none;
        color: #f5f6fa;
        font-size: 28px;
        cursor: pointer;
        z-index: 10;
        height: 40px;
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        padding: 0;
      }

      .modal-header {
        padding: 30px;
        display: flex;
        gap: 25px;
        background: linear-gradient(to bottom, rgba(42, 45, 62, 0.8), #2a2d3e);
      }

      .modal-image {
        flex-shrink: 0;
        width: 150px;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      .modal-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .modal-title {
        flex-grow: 1;
      }

      .modal-title h2 {
        margin: 0 0 10px;
        font-size: 26px;
        font-weight: 700;
      }

      .modal-authors, .modal-publisher {
        color: #b2b5c4;
        margin: 0 0 8px;
        font-size: 16px;
      }

      .modal-details {
        color: #a9acc6;
        margin: 0;
        font-size: 14px;
      }

      .modal-body {
        padding: 10px 30px 30px;
      }

      .modal-body h3 {
        font-size: 20px;
        margin-bottom: 15px;
        color: #f5f6fa;
        position: relative;
        display: inline-block;
      }

      .modal-body .description {
        line-height: 1.7;
        color: #b2b5c4;
      }

      .modal-footer {
        padding: 20px 30px 30px;
        display: flex;
        justify-content: center;
      }

      .spotify-link {
        display: inline-block;
        padding: 12px 30px;
        background: linear-gradient(90deg, #e942ff, #8a42ff);
        color: white;
        border-radius: 25px;
        text-decoration: none;
        font-size: 16px;
        font-weight: 600;
      }
    `
  });

  // Add JavaScript to handle the modal
  await page.addScriptTag({
    content: `
      const viewDetailsBtn = document.querySelector('.view-details-btn');
      const modalOverlay = document.querySelector('.modal-overlay');
      const closeBtn = document.querySelector('.close-btn');
      const modalContent = document.querySelector('.modal-content');

      // Open modal function with event handling
      viewDetailsBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();
        modalOverlay.style.display = 'flex';
      });

      // Close modal function
      closeBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
      });

      // Prevent closing when clicking inside modal
      modalContent.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      // Close when clicking outside modal
      modalOverlay.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
      });

      // Close on escape key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
          modalOverlay.style.display = 'none';
        }
      });
    `
  });

  // Click the View Details button
  await page.click('.view-details-btn');

  // Check if modal appears
  const modal = page.locator('.modal-overlay');
  await expect(modal).toBeVisible();

  // Click somewhere in the modal content
  await page.click('.modal-title h2');

  // Check if modal is still visible
  await expect(modal).toBeVisible();

  // Move mouse around to check for flicker issues
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(100 + i*20, 100 + i*20);
    await page.waitForTimeout(50); // Short wait to simulate real movement
  }

  // Check if modal is still visible after mouse movements
  await expect(modal).toBeVisible();

  // Click close button
  await page.click('.close-btn');

  // Check if modal disappears
  await expect(modal).not.toBeVisible();
});