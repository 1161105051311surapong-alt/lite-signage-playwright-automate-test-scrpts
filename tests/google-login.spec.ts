import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe.configure({ mode: 'serial' });

test.use({ storageState: { cookies: [], origins: [] } });
test('TC-GOOGLE > ควร redirect ไป Google', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();

  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    loginPage.clickLoginWithGoogle()
  ]);

  await popup.waitForLoadState();

  await expect(popup).toHaveURL(/google|firebaseapp/, { timeout: 15000 });
});