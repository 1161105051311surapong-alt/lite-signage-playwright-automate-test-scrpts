import { chromium } from '@playwright/test';
import fs from 'fs';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://cds.zignstack.com/cms/lite/login');

  await page.fill('#lite_login_username', 'test2');
  await page.fill('#lite_login_password', '123456789');
  await page.click('button[type=submit]');

  await page.waitForURL('**/overview');

  await page.context().storageState({
    path: 'storage/auth.json',
  });

  await browser.close();
}

export default globalSetup;











// import { chromium } from '@playwright/test';
// import { LoginPage } from '../pages/login.page';
// import { loginData } from '../data/login.data';
// // import fs from 'fs';

// export default async () => {
//   const browser = await chromium.launch();
//   const page = await browser.newPage();

//   const loginPage = new LoginPage(page);

//   await loginPage.goto();
//   await loginPage.fillUserPassword(
//     loginData.valid.username,
//     loginData.valid.password
//   );

//   await Promise.all([
//     page.waitForURL(/overview/),
//     loginPage.clickLogin(),
//   ]);

//   // 🔥 save session
//   await page.context().storageState({
//     path: 'storage/auth.json',
//   });

//   await browser.close();
// };




// import { test as setup } from '@playwright/test';
// import { LoginPage } from '../pages/login.page';
// import { loginData } from '../data/login.data';

// setup('login and save session', async ({ page }) => {
//   const loginPage = new LoginPage(page);

//   await loginPage.goto();
//   await loginPage.fillUserPassword(loginData.valid.username, loginData.valid.password);

//   await Promise.all([
//     page.waitForURL(/overview/),
//     loginPage.clickLogin()
//   ]);

//   await page.context().storageState({ path: 'storage/auth.json' });
// });