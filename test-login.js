const puppeteer = require('puppeteer');

async function testHealthDashboard() {
  console.log('Starting browser to test the health dashboard...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a reasonable size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the login page
    console.log('Accessing login page...');
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot of login page
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    
    // Fill in login form and submit
    console.log('Logging in with admin credentials...');
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'admin');
    
    // Click login button and wait for navigation
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);
    
    // Take a screenshot after login
    await page.screenshot({ path: 'after-login.png', fullPage: true });
    
    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      return !document.body.innerText.includes('Invalid credentials');
    });
    
    console.log('Login successful:', isLoggedIn);
    
    if (isLoggedIn) {
      // Navigate to health dashboard
      console.log('Navigating to health dashboard...');
      await page.goto('http://localhost:3000/health', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Take a screenshot of health dashboard
      await page.screenshot({ path: 'health-dashboard.png', fullPage: true });
      
      // Check for error messages
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });
      
      // Wait a bit to capture console errors
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for specific error message
      const hasNullError = consoleMessages.some(msg => 
        msg.includes('is not iterable') || 
        msg.includes('TypeError') || 
        msg.includes('Cannot read property')
      );
      
      console.log('Console errors detected:', hasNullError);
      if (hasNullError) {
        console.log('Error messages found in console:', consoleMessages.filter(msg => 
          msg.includes('is not iterable') || 
          msg.includes('TypeError') || 
          msg.includes('Cannot read property')
        ));
      }
      
      // Check page content for health data sections
      const hasWeightSection = await page.evaluate(() => {
        return document.body.innerText.includes('Weight History');
      });
      
      const hasBPSection = await page.evaluate(() => {
        return document.body.innerText.includes('Blood Pressure History');
      });
      
      console.log('Found Weight section:', hasWeightSection);
      console.log('Found Blood Pressure section:', hasBPSection);
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Test completed. Screenshots saved.');
  }
}

testHealthDashboard();