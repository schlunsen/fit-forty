const puppeteer = require('puppeteer');

async function testHealthPage() {
  console.log('Starting browser to test the health page...');
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
    
    // Set up response logging
    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        console.error(`API error: ${response.url()} - Status: ${status}`);
      }
    });
    
    // Navigate to the login page
    console.log('Accessing login page...');
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Fill and submit the login form
    console.log('Logging in...');
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'admin');
    
    // Click the login button and wait for navigation
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);
    
    // Take screenshot after login
    await page.screenshot({ path: 'login-result.png' });
    
    // Check current URL to see if login was successful
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Navigate directly to health page
    console.log('Navigating to health page...');
    await page.goto('http://localhost:3000/health', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for potential redirects to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take a screenshot of the health page
    await page.screenshot({ path: 'health-page.png', fullPage: true });
    
    // Check if we're still on the health page or redirected to login
    const healthUrl = page.url();
    console.log('URL after navigating to health page:', healthUrl);
    
    // Check page content
    const pageContent = await page.content();
    const isOnHealthPage = pageContent.includes('Health Metrics') || 
                          pageContent.includes('Weight History') ||
                          pageContent.includes('Blood Pressure History');
    
    console.log('On health page:', isOnHealthPage);
    
    if (isOnHealthPage) {
      console.log('Successfully loaded health page');
      
      // Check for presence of weight and blood pressure sections
      const hasWeightSection = await page.evaluate(() => {
        return !!document.querySelector('.card:has-text("Weight History")');
      });
      
      const hasBPSection = await page.evaluate(() => {
        return !!document.querySelector('.card:has-text("Blood Pressure History")');
      });
      
      console.log('Found Weight History section:', hasWeightSection);
      console.log('Found Blood Pressure section:', hasBPSection);
      
      // Check for "is not iterable" or other errors in console
      const hasIterableError = consoleMessages.some(msg => msg.includes('is not iterable'));
      console.log('Found "is not iterable" error:', hasIterableError);
      
      // Print all console errors
      const errors = consoleMessages.filter(msg => msg.startsWith('[error]'));
      if (errors.length > 0) {
        console.log('Console errors detected:');
        errors.forEach(error => console.log(`- ${error}`));
      } else {
        console.log('No console errors detected!');
      }
    }
    
  } catch (error) {
    console.error('Test script error:', error);
  } finally {
    // Print all collected console messages
    console.log('\nAll browser console messages:');
    consoleMessages.forEach(msg => console.log(msg));
    
    await browser.close();
    console.log('Test completed.');
  }
}

testHealthPage();