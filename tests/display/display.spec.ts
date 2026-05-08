import { test, expect } from '@playwright/test';
import { DisplayPage } from '../../pages/display.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { LoginPage } from '../../pages/login.page';
import { loginData } from '../../data/login.data';

// สเปกนี้ล็อกอินเองทุกครั้ง ไม่ใช้ storageState จาก config
test.use({ storageState: { cookies: [], origins: [] } });

// Helper function: ดักจับและปิด Popup ทุกชนิด
async function dismissAnyPopup(page: import('@playwright/test').Page) {
  const popupSelectors = [
    'dialog button:has-text("Close")',
    '[role="dialog"] button:has-text("Close")',
    'dialog [aria-label="Close"]',
    '[role="dialog"] [aria-label="Close"]',
    'dialog button:has-text("×")',
    'button:has-text("OK")',
    'button:has-text("Close")',
    'button:has-text("Confirm")',
    'button:has-text("Got it")',
    'button:has-text("Skip")',
    'button:has-text("Later")',
  ];

  for (let i = 0; i < 5; i++) {
    let dismissed = false;
    for (const selector of popupSelectors) {
      const button = page.locator(selector).first();
      try {
        if (await button.isVisible({ timeout: 800 })) {
          await button.click({ timeout: 2000 });
          await page.waitForTimeout(300);
          dismissed = true;
          break;
        }
      } catch { /* ไม่มีปุ่มนี้ */ }
    }
    if (dismissed) continue;
    try {
      const dialog = page.locator('dialog, [role="dialog"]').first();
      if (await dialog.isVisible({ timeout: 800 })) {
        const dialogButton = dialog.locator('button:visible').first();
        if (await dialogButton.count()) {
          await dialogButton.click({ timeout: 2000 });
          await page.waitForTimeout(300);
          dismissed = true;
        }
      }
    } catch { /* ไม่มี dialog */ }
    if (!dismissed) break;
  }
}

// Helper function: ล็อกอินแล้วไปหน้า Display
async function loginAndGoToDisplay(page: import('@playwright/test').Page) {
  page.on('dialog', async (dialog) => { await dialog.accept(); });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await dismissAnyPopup(page);

  await loginPage.fillUserPassword(loginData.valid.username, loginData.valid.password);
  await Promise.all([
    page.waitForURL(/\/overview/, { timeout: 60000 }),
    loginPage.clickLogin(),
  ]);

  await page.waitForLoadState('networkidle');
  await dismissAnyPopup(page);
  await page.waitForTimeout(1200);
  await dismissAnyPopup(page);

  // นำทางไปหน้า Display
  await page.getByText('My Screen', { exact: true }).click();
  await page.waitForURL(/screen/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await dismissAnyPopup(page);
}

test.describe('Display Management (DSP)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAndGoToDisplay(page);
  });

  // // DSP-01: เชื่อมต่อหน้าจอสำเร็จ (Pairing) → ต้องมี device จริง
  // test.skip('TC-DSP-01 > เชื่อมต่อหน้าจอสำเร็จ (Pairing)', async ({ page }) => {
  //   // ⚠️ Skip: ต้องมีเครื่อง Player จริงที่แสดง Code 6 หลักเพื่อ Pair
  //   const displayPage = new DisplayPage(page);
  //   await displayPage.clickPair();
  //   await displayPage.enterCodeAndSubmit('123456'); // ต้องเป็น code จริง
  // });

  // DSP-02: กรอก Code ผิด → แสดง Popup "No screen found with this code..."
  test('TC-DSP-02 > กรอก Code ผิด', async ({ page }) => {
    const displayPage = new DisplayPage(page);

    // กดปุ่ม Pair เพื่อเปิด dialog กรอก Code
    await displayPage.clickPair();

    // กรอก Code ที่ไม่มีอยู่จริง
    await displayPage.enterCodeAndSubmit('999999');

    // ตรวจสอบว่าแสดง popup แจ้งเตือน
    await displayPage.errorPopupCode();
  });

  // DSP-03: ยกเลิกการเชื่อมต่อ (Unpair) → ต้องมี device ที่ paired อยู่
  test.skip('TC-DSP-03 > ยกเลิกการเชื่อมต่อ (Unpair)', async ({ page }) => {
    // ⚠️ Skip: ต้องมีหน้าจอที่เชื่อมต่อ (paired) อยู่แล้วจึงจะกด Unpair ได้
  });

  // DSP-05: เปลี่ยนภาษาหน้า Pairing → ข้อความใน Popup ต้องเปลี่ยนตามภาษา
  test('TC-DSP-05 > เปลี่ยนภาษาหน้า Pairing', async ({ page }) => {
    const displayPage = new DisplayPage(page);

    // --- 1. Action: ทำผ่าน Page Object ---
    await displayPage.selectLanguage('ภาษาไทย');

    // --- 2. Assertion: ทำใน Test เท่านั้น ---

    // ตรวจสอบว่า Label ใน Dropdown เปลี่ยนเป็น "ภาษาไทย"
    const currentLang = displayPage.getCurrentLanguageLocator();
    await expect(currentLang).toHaveText('ภาษาไทย');

    // ตรวจสอบว่าเนื้อหาในหน้าเว็บเปลี่ยนเป็นภาษาไทย (ตัวอย่าง)
    await expect(page.locator('h2')).toHaveText('จอแสดงผลของฉัน'); // สมมติว่าเป็นหัวข้อหลักในหน้า Pairing

  });

  // DSP-06: ปรับสัดส่วน Preview (Ratio) → Preview ต้องเปลี่ยนขนาดตามสัดส่วน
  //⚠️ Skip: เกินขอบเขตของการทดสอบแบบไ ต้องมีการเชื่อต่อกับ Player จริงที่แสดงผล Preview ได้ถึงจะทดสอบได้
  test.skip('TC-DSP-06 > ปรับสัดส่วน Preview (Ratio)', async ({ page }) => {
    const displayPage = new DisplayPage(page);

    // ทดสอบเปลี่ยนเป็น 16:9
    await displayPage.changeRatio('16:9');
    await displayPage.verifyPreviewVisible();

    // ทดสอบเปลี่ยนเป็น 9:16
    await displayPage.changeRatio('9:16');
    await displayPage.verifyPreviewVisible();

    // ทดสอบเปลี่ยนเป็น 4:3
    await displayPage.changeRatio('4:3');
    await displayPage.verifyPreviewVisible();
  });

  // DSP-07: การเจน Code ใหม่ → ต้องมี Player จริง
  test.skip('TC-DSP-07 > การเจน Code ใหม่', async ({ page }) => {
    // ⚠️ Skip: ต้องปิดและเปิด Player ใหม่ที่ตัวเครื่องจริง
  });
});
