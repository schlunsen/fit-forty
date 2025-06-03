const puppeteer = require('puppeteer');

async function testDashboard() {
  console.log('Starting browser to test the dashboard...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  // Array to store console messages
  const consoleMessages = [];
  
  try {
    const page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      
      // Log errors in real time
      if (msg.type() === 'error') {
        console.error('Browser console error:', text);
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
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);
    
    // Wait for dashboard to load
    console.log('Accessing dashboard...');
    
    // Take screenshot
    await page.screenshot({ path: 'dashboard-page.png', fullPage: true });
    
    // Check dashboard elements
    const dashboardElements = await page.evaluate(() => {
      return {
        hasWeightSection: !!document.querySelector('.card:has-text("Weight Tracking")'),
        hasBPSection: !!document.querySelector('.card:has-text("Blood Pressure")'),
        hasWorkoutsSection: !!document.querySelector('.card:has-text("Recent Workouts")'),
        hasPhotosSection: !!document.querySelector('.card:has-text("Progress Photos")'),
      };
    });
    
    console.log('Dashboard elements:', dashboardElements);
    
    // Wait a moment to collect any error messages
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Print any console errors
    const errors = consoleMessages.filter(msg => msg.startsWith('[error]'));
    if (errors.length > 0) {
      console.log('\nConsole errors detected:');
      errors.forEach(error => console.log(error));
    } else {
      console.log('No console errors detected!');
    }
    
    await browser.close();
    console.log('Test completed.');
  }
}

testDashboard();