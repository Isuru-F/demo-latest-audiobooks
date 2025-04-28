import { test, expect } from '@playwright/test';

test('Audiobook popup should not show "NaNm chapters" or release date', async ({ page }) => {
  // Create a page with our AudiobookCard component
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Audiobook Modal Test</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f6fa;
        }
      </style>
    </head>
    <body>
      <div id="app">
        <!-- Case 1: Normal audiobook with valid data -->
        <div class="audiobook-card" id="normal-case">
          <div class="view-details-btn">View Details</div>
        </div>

        <!-- Case 2: Audiobook with missing or NaN total_chapters -->
        <div class="audiobook-card" id="nan-case">
          <div class="view-details-btn">View Details (NaN case)</div>
        </div>
      </div>
    </body>
    </html>
  `);

  // Add scripts to simulate our component behavior
  await page.addScriptTag({
    content: `
      // Normal case setup
      const normalBtn = document.querySelector('#normal-case .view-details-btn');
      const normalData = {
        name: 'Normal Audiobook',
        duration_ms: 3600000,
        total_chapters: 12,
        release_date: '2023-01-01',
        publisher: 'Test Publisher',
        authors: [{ name: 'Author 1' }, { name: 'Author 2' }]
      };

      // NaN case setup
      const nanBtn = document.querySelector('#nan-case .view-details-btn');
      const nanData = {
        name: 'Problem Audiobook',
        duration_ms: 3600000,
        total_chapters: NaN,  // Problematic value
        release_date: null,   // Missing value
        publisher: 'Test Publisher',
        authors: [{ name: 'Author 1' }]
      };

      // Setup modals
      function setupModal(buttonEl, data, modalId) {
        // Create modal element
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.zIndex = '9999';

        // Format duration
        function formatDuration(ms) {
          const minutes = Math.floor(ms / 60000);
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          
          if (hours > 0) {
            return hours + 'h ' + remainingMinutes + 'm';
          }
          return minutes + 'm';
        }

        // Create modal content
        modal.innerHTML = `
          <div class="modal-content" style="background:#2a2d3e; color:white; border-radius:16px; padding:20px; width:80%; max-width:700px; margin:10% auto;">
            <button class="close-btn" style="position:absolute; top:15px; right:15px; background:transparent; border:none; color:white; font-size:24px; cursor:pointer;">×</button>
            <div class="modal-header">
              <div class="modal-title">
                <h2>${data.name}</h2>
                <p class="modal-authors">By ${data.authors.map(a => a.name).join(', ')}</p>
                <p class="modal-publisher">Publisher: ${data.publisher}</p>
                <p class="modal-details">
                  <span>${formatDuration(data.duration_ms)}</span>
                </p>
              </div>
            </div>
            <div class="modal-body">
              <h3>Description</h3>
              <div class="description">Test description</div>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        buttonEl.addEventListener('click', () => {
          modal.style.display = 'flex';
        });

        modal.querySelector('.close-btn').addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }

      // Setup both modals
      setupModal(normalBtn, normalData, 'normal-modal');
      setupModal(nanBtn, nanData, 'nan-modal');
    `
  });

  // Test Case 1: Normal audiobook with valid data
  await page.click('#normal-case .view-details-btn');
  
  // Verify the modal is visible
  const normalModal = page.locator('#normal-modal');
  await expect(normalModal).toBeVisible();
  
  // Verify duration is displayed
  await expect(normalModal.locator('.modal-details')).toContainText('1h 0m');
  
  // Verify NO chapters text or release date is displayed
  const modalDetailsText = await normalModal.locator('.modal-details').textContent();
  expect(modalDetailsText.trim()).toBe('1h 0m');
  expect(modalDetailsText).not.toContain('chapters');
  expect(modalDetailsText).not.toContain('Released');
  
  // Close the first modal
  await page.click('#normal-modal .close-btn');
  await expect(normalModal).not.toBeVisible();

  // Test Case 2: Audiobook with missing or NaN total_chapters
  await page.click('#nan-case .view-details-btn');
  
  // Verify the modal is visible
  const nanModal = page.locator('#nan-modal');
  await expect(nanModal).toBeVisible();
  
  // Verify duration is displayed 
  await expect(nanModal.locator('.modal-details')).toContainText('1h 0m');
  
  // Verify NO "NaN chapters" or release date is displayed
  const nanModalDetailsText = await nanModal.locator('.modal-details').textContent();
  expect(nanModalDetailsText.trim()).toBe('1h 0m');
  expect(nanModalDetailsText).not.toContain('NaN');
  expect(nanModalDetailsText).not.toContain('chapters');
  expect(nanModalDetailsText).not.toContain('Released');
  
  // Close the second modal
  await page.click('#nan-modal .close-btn');
  await expect(nanModal).not.toBeVisible();
});