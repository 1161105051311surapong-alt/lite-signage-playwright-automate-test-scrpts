const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://cds.zignstack.com/cms/lite/login');
  await page.fill('#lite_login_username', 'test2');
  await page.fill('#lite_login_password', '123456789');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/overview');
  
  const content = await page.content();
  fs.writeFileSync('overview.html', content);
  console.log('Saved to overview.html');
  await browser.close();
})();
