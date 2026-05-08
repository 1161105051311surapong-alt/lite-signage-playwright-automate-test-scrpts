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
  
  const siderText = await page.$$eval('.ant-layout-sider, .sidebar, nav', els => els.map(e => e.innerText));
  console.log('Sider text:', siderText);
  
  const allLinks = await page.$$eval('a', els => els.map(e => ({text: e.innerText, href: e.href})));
  console.log('All links:', allLinks.filter(l => l.text.trim().length > 0));

  await browser.close();
})();
