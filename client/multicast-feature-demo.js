import { chromium } from '@playwright/test';

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Create a test page demonstrating the multi-cast filter
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Multi-Cast Narrator Filter Demo</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f0f2f5; }
        .container { display: flex; gap: 20px; flex-wrap: wrap; }
        .search-container { margin-bottom: 30px; position: relative; width: 300px; }
        .toggle-container { margin-top: 15px; display: flex; align-items: center; }
        .toggle-label { display: flex; align-items: center; cursor: pointer; user-select: none; }
        .toggle-text { position: relative; padding-left: 50px; color: #2a2d3e; font-size: 14px; }
        .toggle-text:before { content: ''; position: absolute; left: 0; top: 0; width: 40px; height: 20px; border-radius: 10px; background: #f0f2fa; transition: background-color 0.3s; }
        .toggle-text:after { content: ''; position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: white; transition: transform 0.3s, background-color 0.3s; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); }
        .toggle-input { position: absolute; opacity: 0; height: 0; width: 0; }
        .toggle-input:checked + .toggle-text:before { background: linear-gradient(90deg, #e942ff, #8a42ff); }
        .toggle-input:checked + .toggle-text:after { transform: translateX(20px); background: white; }
        .search-input { width: 100%; padding: 12px 20px; border: none; border-radius: 30px; background: #f0f2fa; color: #2a2d3e; font-size: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); transition: all 0.3s ease; }
        .search-input:focus { outline: none; box-shadow: 0 4px 15px rgba(138, 66, 255, 0.2); background: #ffffff; }
        .card { width: 280px; background: #2a2d3e; color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .card-image { height: 180px; overflow: hidden; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; }
        .card-content { padding: 16px; }
        .card-title { margin: 0 0 8px; font-size: 18px; }
        .card-narrator { color: #b2b5c4; margin: 4px 0; font-size: 14px; }
        .label { color: #8a8c99; font-weight: normal; }
        h2 { color: #333; margin-top: 40px; }
        .section { margin-bottom: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .implementation { background:#f4f4f4; padding:10px; border-radius:4px; overflow:auto; margin-top: 30px; }
        .highlight { background: rgba(138, 66, 255, 0.1); border-left: 4px solid #8a42ff; padding: 10px 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>Multi-Cast Narrator Filter</h1>
      <p>GTM-2: Add multi-cast narrator support to allow filtering audiobooks with multiple narrators</p>
      
      <div class="section">
        <div class="header">
          <h2>All Audiobooks</h2>
          <div class="search-container">
            <input type="text" placeholder="Search titles, authors or narrators..." class="search-input">
            <div class="toggle-container">
              <label for="multicast-toggle" class="toggle-label">
                <input type="checkbox" id="multicast-toggle" class="toggle-input">
                <span class="toggle-text">Multi-Cast Only</span>
              </label>
            </div>
          </div>
        </div>

        <div class="container">
          <div class="card">
            <div class="card-image">
              <img src="https://i.scdn.co/image/ab67616d0000b273a1d8b333cb41079046175066" alt="Audiobook">
            </div>
            <div class="card-content">
              <h3 class="card-title">Single Narrator Book</h3>
              <p>By Alice Wonder</p>
              <p class="card-narrator">
                <span class="label">Narrator:</span> John Smith
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card-image">
              <img src="https://i.scdn.co/image/ab67616d0000b27390fd9741e1838115cd90b3b6" alt="Audiobook">
            </div>
            <div class="card-content">
              <h3 class="card-title">Dual Narrator Book</h3>
              <p>By Bob Johnson</p>
              <p class="card-narrator">
                <span class="label">Narrators:</span> Sarah Connor, Michael Davis
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card-image">
              <img src="https://i.scdn.co/image/ab67616d0000b273b24d88750322242b7f58fbf0" alt="Audiobook">
            </div>
            <div class="card-content">
              <h3 class="card-title">Full Cast Production</h3>
              <p>By Charles Xavier</p>
              <p class="card-narrator">
                <span class="label">Narrators:</span> James Earl, Lucy Liu, Morgan Freeman
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>With Multi-Cast Filter Applied</h2>
        <div class="container">
          <div class="card">
            <div class="card-image">
              <img src="https://i.scdn.co/image/ab67616d0000b27390fd9741e1838115cd90b3b6" alt="Audiobook">
            </div>
            <div class="card-content">
              <h3 class="card-title">Dual Narrator Book</h3>
              <p>By Bob Johnson</p>
              <p class="card-narrator">
                <span class="label">Narrators:</span> Sarah Connor, Michael Davis
              </p>
            </div>
          </div>

          <div class="card">
            <div class="card-image">
              <img src="https://i.scdn.co/image/ab67616d0000b273b24d88750322242b7f58fbf0" alt="Audiobook">
            </div>
            <div class="card-content">
              <h3 class="card-title">Full Cast Production</h3>
              <p>By Charles Xavier</p>
              <p class="card-narrator">
                <span class="label">Narrators:</span> James Earl, Lucy Liu, Morgan Freeman
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="implementation">
        <h3>Implementation Details:</h3>
        <div class="highlight">
          <p><strong>Feature Requirements:</strong></p>
          <ol>
            <li>A "Multi-Cast Only" toggle is displayed next to the search bar</li>
            <li>When enabled, only audiobooks with more than one narrator are shown</li>
            <li>Toggle state persists during search operations</li>
            <li>Toggle can be combined with text search</li>
            <li>Toggle shows visual indication of active state</li>
            <li>User sees feedback when no multi-cast audiobooks match criteria</li>
          </ol>
        </div>
        <pre>
// Vue.js implementation
// In AudiobooksView.vue
const multiCastOnly = ref(false);

const filteredAudiobooks = computed(() => {
  let result = spotifyStore.audiobooks;
  
  // Apply multi-cast filter if enabled
  if (multiCastOnly.value) {
    result = result.filter(audiobook => {
      return audiobook.narrators && audiobook.narrators.length > 1;
    });
  }
  
  // Apply text search if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(audiobook => {
      // Search by audiobook name, authors, narrators...
      // Existing search logic
    });
  }
  
  return result;
});
        </pre>
      </div>
    </body>
    </html>
  `);
  
  // Take screenshot and save it
  await page.screenshot({ path: 'client/multicast-filter-feature.png', fullPage: true });
  
  console.log('Screenshot saved as multicast-filter-feature.png');
  
  // Close browser
  await browser.close();
})();