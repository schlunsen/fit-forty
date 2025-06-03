const puppeteer = require('puppeteer');

async function testHealthData() {
  console.log('Starting browser to test health data display...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const consoleMessages = [];
  const networkRequests = [];
  
  try {
    const page = await browser.newPage();
    
    // Log console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      
      // Log errors in real time
      if (msg.type() === 'error') {
        console.error('Browser console error:', text);
      }
    });
    
    // Log network requests
    page.on('request', request => {
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        networkRequests.push(`${request.method()} ${request.url()}`);
      }
    });
    
    // Log network responses
    page.on('response', async response => {
      const request = response.request();
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        try {
          // Only try to get text for JSON responses
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            const responseText = await response.text();
            console.log(`Response from ${request.url()}: ${response.status()}`);
            console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
          }
        } catch (e) {
          // Ignore errors for this debug code
        }
      }
    });
    
    // Login first
    console.log('Logging in...');
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'admin');
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    ]);
    
    // Add a weight entry to ensure we have data
    console.log('Adding a test weight entry...');
    await page.goto('http://localhost:3000/health/weight/add', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Fill out weight form
    await page.type('input#weight', '75.5');
    
    // Submit form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    ]);
    
    // Add a BP reading
    console.log('Adding a test BP reading...');
    await page.goto('http://localhost:3000/health/bp/add', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Fill out BP form
    await page.type('input#systolic', '120');
    await page.type('input#diastolic', '80');
    await page.type('input#pulse', '72');
    
    // Submit form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    ]);
    
    // Now go to health page
    console.log('Navigating to health page...');
    await page.goto('http://localhost:3000/health', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of health page
    await page.screenshot({ path: 'health-data.png', fullPage: true });
    
    // Extract data from the page
    const pageData = await page.evaluate(() => {
      return {
        // Check weight section
        weightEntries: document.querySelectorAll('.card:has-text("Weight History") tbody tr').length,
        weightEmptyMessage: document.querySelector('.card:has-text("Weight History") div:has-text("No weight entries yet")') !== null,
        
        // Check BP section
        bpEntries: document.querySelectorAll('.card:has-text("Blood Pressure History") tbody tr').length,
        bpEmptyMessage: document.querySelector('.card:has-text("Blood Pressure History") div:has-text("No blood pressure readings yet")') !== null,
        
        // Check debug data in window (if any)
        windowHealthStore: JSON.stringify(window.__pinia?.state?.value?.health || {})
      };
    });
    
    console.log('Page data:', pageData);
    
    // Add debug output to expose Vue component state
    await page.evaluate(() => {
      // Add debug output
      window.debugHealthStore = () => {
        const healthStore = window.__pinia?.state?.value?.health;
        console.log('Health store state:', healthStore);
        return healthStore;
      };
      
      // Call it immediately
      console.log('Debug health store:', window.debugHealthStore());
    });
    
    // Wait a bit to collect console logs
    await new Promise(r => setTimeout(r, 1000));
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Print all network requests
    console.log('\nNetwork requests:');
    networkRequests.forEach(req => console.log(req));
    
    // Print console messages with data or state info
    console.log('\nRelevant console messages:');
    consoleMessages
      .filter(msg => 
        msg.includes('state') || 
        msg.includes('data') || 
        msg.includes('entries') || 
        msg.includes('readings') ||
        msg.includes('fetch') ||
        msg.includes('api')
      )
      .forEach(msg => console.log(msg));
    
    await browser.close();
    console.log('Test completed.');
  }
}

testHealthData();