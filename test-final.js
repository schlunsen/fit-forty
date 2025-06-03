const puppeteer = require('puppeteer');

async function testApp() {
  console.log('Starting browser to test the application...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const consoleMessages = [];
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a reasonable size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Capture console messages
    page.on('console', message => {
      const text = message.text();
      consoleMessages.push(`${message.type()}: ${text}`);
      
      if (message.type() === 'error') {
        console.error('Browser error:', text);
      }
    });
    
    // Navigate to the main page
    console.log('Accessing localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.screenshot({ path: 'landing-page.png', fullPage: true });
    console.log('Took landing page screenshot');
    
    // Basic checks
    const bodyText = await page.evaluate(() => document.body.innerText);
    const isOnLogin = bodyText.includes('Sign In') || bodyText.includes('Login');
    const isOnDashboard = bodyText.includes('Dashboard') || bodyText.includes('Welcome back');
    
    console.log('Is on login page:', isOnLogin);
    console.log('Is on dashboard:', isOnDashboard);
    
    if (isOnLogin) {
      console.log('Attempting to log in...');
      
      // Find the inputs and log in
      await page.waitForSelector('input[type="password"]', { timeout: 5000 });
      const usernameSelector = await page.$('input[placeholder*="user" i], input[placeholder*="name" i], input[type="text"]');
      const passwordSelector = await page.$('input[type="password"]');
      
      if (usernameSelector && passwordSelector) {
        await usernameSelector.type('admin');
        await passwordSelector.type('admin');
        
        // Find and click the login button
        const submitButton = await page.$('button[type="submit"]');
        if (submitButton) {
          await Promise.all([
            submitButton.click(),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => console.log('No navigation after login - this might be OK'))
          ]);
          
          await page.screenshot({ path: 'after-login.png', fullPage: true });
          console.log('Took after-login screenshot');
          
          // Check if logged in
          const dashboardText = await page.evaluate(() => document.body.innerText);
          console.log('Logged in successfully:', dashboardText.includes('Dashboard'));
        } else {
          console.log('No submit button found');
        }
      } else {
        console.log('Login inputs not found');
      }
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Print console messages that contain errors
    const errorMessages = consoleMessages.filter(msg => {
      return msg.includes('error') || msg.includes('not iterable');
    });
    
    if (errorMessages.length > 0) {
      console.log('\nError messages from browser:');
      errorMessages.forEach(msg => console.log('- ' + msg));
    } else {
      console.log('\nNo error messages detected in the browser console');
    }
    
    await browser.close();
    console.log('Test completed.');
  }
}

testApp();