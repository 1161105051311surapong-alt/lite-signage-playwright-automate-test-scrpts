const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to login...');
    await page.goto('https://cds.zignstack.com/cms/lite/login');
    await page.waitForLoadState('networkidle');

    console.log('Logging in...');
    await page.fill('#lite_login_username', 'test2');
    await page.fill('#lite_login_password', '123456789');
    await page.click('button:has-text("Sign In")');

    await page.waitForURL('**/overview', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); 

    // Remove driver overlay
    await page.evaluate(() => {
      document.querySelectorAll('.driver-overlay, .driver-overlay-animated, .driver-popover').forEach(el => el.remove());
      document.body.classList.remove('driver-active', 'driver-fade');
    });

    const headerHTML = await page.$$eval('header', els => els.map(e => e.innerHTML));
    console.log('Header HTML:', headerHTML[0] ? headerHTML[0].substring(0, 500) : 'No header');

    // get topbar details
    const topbarTexts = await page.$$eval('.topbar, .header, nav', els => els.map(e => e.innerText));
    console.log('Topbar texts:', topbarTexts);

    // Go to Library via menu
    console.log('Navigating to library...');
    await page.getByText('Library', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(3000);
    const libraryButtons = await page.$$eval('button', els => 
      els.map(e => e.innerText ? e.innerText.trim().replace(/\n/g, ' ') : '').filter(t => t)
    );
    console.log('Library buttons:', Array.from(new Set(libraryButtons)).join(' | '));
    const libraryInputs = await page.$$eval('input', els => 
      els.map(e => e.placeholder ? e.placeholder : '').filter(t => t)
    );
    console.log('Library inputs:', Array.from(new Set(libraryInputs)).join(' | '));

    // Go to Playlist via menu
    console.log('Navigating to playlist...');
    await page.getByText('Playlist', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(3000);
    const playlistButtons = await page.$$eval('button', els => 
      els.map(e => e.innerText ? e.innerText.trim().replace(/\n/g, ' ') : '').filter(t => t)
    );
    console.log('Playlist buttons:', Array.from(new Set(playlistButtons)).join(' | '));
    const emptyTexts = await page.$$eval('.ant-empty-description', els => els.map(e => e.innerText));
    console.log('Empty states:', emptyTexts);

    // Go to Display via menu
    console.log('Navigating to display...');
    await page.getByText('Display', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(3000);
    const displayButtons = await page.$$eval('button', els => 
      els.map(e => e.innerText ? e.innerText.trim().replace(/\n/g, ' ') : '').filter(t => t)
    );
    console.log('Display buttons:', Array.from(new Set(displayButtons)).join(' | '));

    await browser.close();
    console.log('Done mapping UI!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
