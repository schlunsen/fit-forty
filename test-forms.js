const puppeteer = require('puppeteer');

async function testFormPages() {
  console.log('Starting browser to test the form pages...');
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
    
    // Test weight add form
    console.log('Testing weight add form...');
    await page.goto('http://localhost:3000/health/weight/add', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of weight form
    await page.screenshot({ path: 'weight-form.png', fullPage: true });
    
    // Check if weight form exists
    const hasWeightForm = await page.evaluate(() => {
      return document.body.innerText.includes('Add Weight Entry');
    });
    
    console.log('Weight form loaded:', hasWeightForm);
    
    // Test BP add form
    console.log('Testing BP add form...');
    await page.goto('http://localhost:3000/health/bp/add', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of BP form
    await page.screenshot({ path: 'bp-form.png', fullPage: true });
    
    // Check if BP form exists
    const hasBPForm = await page.evaluate(() => {
      return document.body.innerText.includes('Add Blood Pressure Reading');
    });
    
    console.log('BP form loaded:', hasBPForm);
    
    // Try to fill and submit the weight form
    if (hasWeightForm) {
      console.log('Testing weight form submission...');
      
      await page.goto('http://localhost:3000/health/weight/add', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Fill form
      await page.type('input#weight', '75.5');
      
      // Click submit
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log('No navigation after submit - this might be OK'))
      ]);
      
      // Take screenshot after submission
      await page.screenshot({ path: 'weight-form-submitted.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Print any console errors
    const errors = consoleMessages.filter(msg => msg.startsWith('[error]'));
    if (errors.length > 0) {
      console.log('\nConsole errors detected:');
      errors.forEach(error => console.log(`- ${error}`));
    }
    
    await browser.close();
    console.log('Test completed.');
  }
}

testFormPages();