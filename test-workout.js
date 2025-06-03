const puppeteer = require('puppeteer');

async function testWorkoutPages() {
  console.log('Starting browser to test workout pages...');
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
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
    ]);
    
    // Test workouts index page
    console.log('Testing workouts index page...');
    await page.goto('http://localhost:3000/workouts', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of workouts page
    await page.screenshot({ path: 'workouts-index.png', fullPage: true });
    
    // Test workouts add page
    console.log('Testing workouts add page...');
    await page.goto('http://localhost:3000/workouts/add', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of add workout page
    await page.screenshot({ path: 'workouts-add.png', fullPage: true });
    
    // Check if add workout form exists
    const hasAddForm = await page.evaluate(() => {
      return document.body.innerText.includes('Log New Workout');
    });
    
    console.log('Workout add form loaded:', hasAddForm);
    
    // Try to submit a workout
    if (hasAddForm) {
      console.log('Testing workout form submission...');
      
      // Set date - assuming there's a date input
      await page.evaluate(() => {
        const today = new Date().toISOString().split('T')[0];
        document.querySelector('input[type="date"]').value = today;
      });
      
      // Set duration
      await page.type('input#duration', '45');
      
      // Set notes
      await page.type('textarea#notes', 'Test workout from Puppeteer');
      
      // Submit form
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => console.log('No navigation after submit - this might be OK'))
      ]);
      
      // Take screenshot after submission
      await page.screenshot({ path: 'workout-submitted.png', fullPage: true });
      
      // Check current URL to see if we were redirected
      const currentUrl = page.url();
      console.log('Current URL after submission:', currentUrl);
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Print any console errors
    const errors = consoleMessages.filter(msg => msg.includes('error') || msg.includes('not iterable'));
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

testWorkoutPages();