import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded. Clicking a node...');
  // Find the first ideology item and click it
  await page.click('.ideology-item');
  
  console.log('Node clicked. Waiting a moment...');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
