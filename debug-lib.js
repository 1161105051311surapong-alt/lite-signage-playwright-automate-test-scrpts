const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://cds.zignstack.com/cms/lite/login');
  await page.fill('#lite_login_username', 'test2');
  await page.fill('#lite_login_password', '123456789');
  await page.click('button:has-text("Sign In")');
  
  await page.waitForURL('**/overview', { timeout: 30000 });
  await page.waitForTimeout(2000);
  
  await page.click('text="Library"');
  await page.waitForURL('**/library', { timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const buttons = await page.$$eval('.lite-library-item button', els => els.map(e => e.className));
  console.log('Library item buttons classes:', buttons);

  const libraryHtml = await page.evaluate(() => {
     const item = document.querySelector('.lite-library-item');
     return item ? item.outerHTML : 'No items found';
  });
  console.log('First item HTML:', libraryHtml);
  
  await browser.close();
})();
