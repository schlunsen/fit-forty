const puppeteer = require('puppeteer');

async function testApp() {
  console.log('Starting browser to test the application...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a reasonable size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the login page
    console.log('Accessing localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take a screenshot
    console.log('Taking a screenshot...');
    await page.screenshot({ path: 'app-screenshot.png', fullPage: true });
    
    // Check page content
    const pageTitle = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('Page Title:', pageTitle);
    console.log('Page contains login form:', bodyText.includes('Login') || bodyText.includes('Sign in'));
    
    // Check for specific error messages
    const hasError = await page.evaluate(() => {
      return !!document.querySelector('.error') || 
             document.body.innerText.includes('error') || 
             document.body.innerText.includes('Error');
    });
    
    if (hasError) {
      console.log('ERROR: Found error messages on page!');
    } else {
      console.log('No visible errors detected on the page.');
    }
    
    // Try to find health dashboard link if user is logged in
    const hasDashboard = await page.evaluate(() => {
      return document.body.innerText.includes('Dashboard') || 
             document.body.innerText.includes('Health');
    });
    
    if (hasDashboard) {
      console.log('User appears to be logged in. Dashboard elements detected.');
    } else {
      console.log('User not logged in. Login page is displayed.');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Test completed. Screenshot saved as app-screenshot.png');
  }
}

testApp();