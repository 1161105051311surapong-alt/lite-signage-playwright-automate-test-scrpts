const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://cds.zignstack.com/cms/lite/login');
  await page.fill('#lite_login_username', 'test2');
  await page.fill('#lite_login_password', '123456789');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/overview');
  
  const items = await page.$$eval('.ant-menu-item, a', els => 
    els.map(e => ({ text: e.innerText.trim(), href: e.href }))
       .filter(x => x.text.length > 0 && x.text.length < 50)
  );
  console.log(items);
  await browser.close();
})();
