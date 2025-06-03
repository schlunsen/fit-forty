const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testProgressPhotoPage() {
  console.log('Starting browser to test progress photo upload...');
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
    
    // Test progress photos index page
    console.log('Testing progress photos index page...');
    await page.goto('http://localhost:3000/progress', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of progress page
    await page.screenshot({ path: 'progress-index.png', fullPage: true });
    
    // Test progress photo upload page
    console.log('Testing progress photo upload page...');
    await page.goto('http://localhost:3000/progress/add', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of add progress photo page
    await page.screenshot({ path: 'progress-add.png', fullPage: true });
    
    // Check if upload form exists
    const hasUploadForm = await page.evaluate(() => {
      return document.body.innerText.includes('Upload Progress Photo');
    });
    
    console.log('Progress photo upload form loaded:', hasUploadForm);
    
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

testProgressPhotoPage();