import { chromium } from '@playwright/test';

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Create a test page demonstrating the fix
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Audiobook Narrator Fix Demo</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f0f2f5; }
        .container { display: flex; gap: 20px; flex-wrap: wrap; }
        .card { width: 300px; background: #2a2d3e; color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .card-image { height: 180px; overflow: hidden; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; }
        .card-content { padding: 16px; }
        .card-title { margin: 0 0 8px; font-size: 18px; }
        .card-narrator { color: #b2b5c4; margin: 4px 0; font-size: 14px; }
        .label { color: #8a8c99; font-weight: normal; }
        h2 { color: #333; }
        .fixed { border: 2px solid #4CAF50; }
        .broken { border: 2px solid #F44336; }
      </style>
    </head>
    <body>
      <h1>Audiobook Narrator Display Fix</h1>
      <p>Demonstration of fixing the [object Object] bug in narrator display</p>
      
      <h2>Before Fix (Bug)</h2>
      <div class="container">
        <div class="card broken">
          <div class="card-image">
            <img src="https://i.scdn.co/image/ab67616d0000b273a1d8b333cb41079046175066" alt="Audiobook">
          </div>
          <div class="card-content">
            <h3 class="card-title">The Great Adventure</h3>
            <p>By John Smith</p>
            <p class="card-narrator">
              <span class="label">Narrator:</span> [object Object], [object Object]
            </p>
          </div>
        </div>
      </div>
      
      <h2>After Fix</h2>
      <div class="container">
        <div class="card fixed">
          <div class="card-image">
            <img src="https://i.scdn.co/image/ab67616d0000b273a1d8b333cb41079046175066" alt="Audiobook">
          </div>
          <div class="card-content">
            <h3 class="card-title">The Great Adventure</h3>
            <p>By John Smith</p>
            <p class="card-narrator">
              <span class="label">Narrator:</span> Sarah Johnson, Michael Davis
            </p>
          </div>
        </div>
      </div>
      
      <h3>Implementation Details:</h3>
      <pre style="background:#f4f4f4; padding:10px; border-radius:4px; overflow:auto;">
// Format narrators to handle both string arrays and object arrays
const formatNarrators = (narrators) => {
  if (!Array.isArray(narrators)) {
    return String(narrators) === '[object Object]' ? 'Various' : String(narrators);
  }
  
  return narrators.map(narrator => {
    if (typeof narrator === 'string') {
      return narrator;
    } else if (narrator && typeof narrator === 'object') {
      // If narrator is an object, try to get name property, otherwise use 'Narrator'
      return narrator.name || 'Narrator';
    }
    return 'Narrator';
  }).join(', ');
};
      </pre>
    </body>
    </html>
  `);
  
  // Take screenshot and save it
  await page.screenshot({ path: 'audiobook-narrator-fix.png', fullPage: true });
  
  console.log('Screenshot saved as audiobook-narrator-fix.png');
  
  // Close browser
  await browser.close();
})();