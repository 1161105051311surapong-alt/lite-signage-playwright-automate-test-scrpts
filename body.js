const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://cds.zignstack.com/cms/lite/login');
  await page.fill('#lite_login_username', 'test2');
  await page.fill('#lite_login_password', '123456789');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/overview', { timeout: 30000 });
  await page.waitForTimeout(2000);
  
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('body.html', html);
  console.log('done');
  await browser.close();
})();
