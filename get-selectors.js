const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to login...');
    await page.goto('https://cds.zignstack.com/cms/lite/login');
    await page.waitForLoadState('networkidle');
    fs.writeFileSync('login_page.html', await page.content());

    console.log('Logging in...');
    await page.fill('#lite_login_username', 'test2');
    await page.fill('#lite_login_password', '123456789');
    await page.click('button:has-text("Sign In")');

    console.log('Waiting for overview...');
    await page.waitForURL('**/overview', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // wait for dynamic content
    fs.writeFileSync('overview_page.html', await page.content());

    console.log('Navigating to library...');
    await page.goto('https://cds.zignstack.com/cms/lite/library');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    fs.writeFileSync('library_page.html', await page.content());

    console.log('Navigating to playlist...');
    await page.goto('https://cds.zignstack.com/cms/lite/playlist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    fs.writeFileSync('playlist_page.html', await page.content());

    console.log('Navigating to screen...');
    await page.goto('https://cds.zignstack.com/cms/lite/screen');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    fs.writeFileSync('screen_page.html', await page.content());

    console.log('Done!');
    await browser.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
