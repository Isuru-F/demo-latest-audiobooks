import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'multicast-initial.png', fullPage: true });
    console.log('✓ Initial screenshot taken');
    
    // Try to find and click the toggle
    try {
      await page.waitForSelector('.toggle-label', { timeout: 10000 });
      await page.click('.toggle-label');
      await page.waitForTimeout(1000);
      
      // Take screenshot with toggle enabled
      await page.screenshot({ path: 'multicast-enabled.png', fullPage: true });
      console.log('✓ Toggle enabled screenshot taken');
      
      // Try typing in search
      await page.fill('.search-input', 'test');
      await page.waitForTimeout(1000);
      
      // Take screenshot with search
      await page.screenshot({ path: 'multicast-search.png', fullPage: true });
      console.log('✓ Search screenshot taken');
      
    } catch (e) {
      console.log('Toggle interaction failed:', e.message);
      await page.screenshot({ path: 'multicast-error.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();