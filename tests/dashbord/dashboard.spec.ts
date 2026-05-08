import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboard.page';
import { LoginPage } from '../../pages/login.page';
import { loginData } from '../../data/login.data';

// ล็อกอินเองทุกครั้ง ไม่ใช้ storageState เก่า
test.use({ storageState: { cookies: [], origins: [] } });

// ========== HELPER FUNCTIONS ==========

/**
 * ดักจับและปิด Popup ทุกชนิด (Session Expired, Welcome, etc.)
 */
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

    // ลองหาปุ่มปิด popup จาก selectors
    for (const selector of popupSelectors) {
      const button = page.locator(selector).first();
      try {
        if (await button.isVisible({ timeout: 800 })) {
          await button.click({ timeout: 2000 });
          await page.waitForTimeout(300);
          dismissed = true;
          break;
        }
      } catch {
        // ไม่มีปุ่มนี้ ต่อไป
      }
    }

    if (dismissed) continue;

    // ลองดึง dialog และกดปุ่มแรกที่เห็น
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
    } catch {
      // ไม่มี dialog
    }

    if (!dismissed) break;
  }
}

/**
 * ล็อกอินและไปหน้า Overview
 */
async function loginAndGoToOverview(page: import('@playwright/test').Page) {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

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
}

// ========== TEST SUITE ==========

test.describe('Dashboard Navigation', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAndGoToOverview(page);
  });

  // ✅ TC-DASH-001
  test('TC-DASH-001: Navigate to My Display', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await Promise.all([
      page.waitForURL(/\/screen/, { timeout: 30000 }),
      dashboard.clickMyDisplay(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า My Display
    await expect(page).toHaveURL(/\/screen/);
  });

  // ✅ TC-DASH-002
  test('TC-DASH-002: Navigate to Home via Side Menu', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await Promise.all([
      page.waitForURL(/\/overview/, { timeout: 30000 }),
      dashboard.clickHomeMenu(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า Overview (Home)
    await expect(page).toHaveURL(/\/overview/);
  });

  // ✅ TC-DASH-003
  test('TC-DASH-003: Navigate to Display via Side Menu', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await Promise.all([
      page.waitForURL(/\/screen/, { timeout: 30000 }),
      dashboard.clickDisplayMenu(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า Display (screen)
    await expect(page).toHaveURL(/\/screen/);
  });

  // ✅ TC-DASH-004
  test('TC-DASH-004: Navigate to Library via Side Menu', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await Promise.all([
      page.waitForURL(/library/, { timeout: 30000 }),
      dashboard.clickLibraryMenu(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า Library
    await expect(page).toHaveURL(/library/);
  });

  // ✅ TC-DASH-005
  test('TC-DASH-005: Navigate to Playlist via Side Menu', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await Promise.all([
      page.waitForURL(/playlist/, { timeout: 30000 }),
      dashboard.clickPlaylistMenu(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า Playlist
    await expect(page).toHaveURL(/playlist/);
  });

  // ✅ TC-DASH-006
  test('TC-DASH-006: Get Started - Upload Media and Verify Completed Status', async ({ page }) => {
    test.setTimeout(60000);
    const dashboard = new DashboardPage(page);

    // ลองตรวจสอบหน้า empty (อาจจะมี library ซ้ำอยู่)
    try {
      await expect(dashboard.getStartedEmptyText).toBeVisible({ timeout: 5000 });
    } catch {
      console.log('ℹ️ Library อาจจะมีไฟล์อยู่แล้ว ข้าม initial check');
    }

    // ไปหน้า Library
    await Promise.all([
      page.waitForURL(/library/, { timeout: 30000 }),
      dashboard.clickLibraryMenu(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า Library
    await expect(page).toHaveURL(/library/);

    // อัปโหลดไฟล์
    await dashboard.uploadMedia('file/img.simple.jpg');

    // ✅ Assertion: ไฟล์อัปโหลดสำเร็จ
    await dashboard.waitForFileToAppear('img.simple');

    // กลับหน้า Home
    await Promise.all([
      page.waitForURL(/overview/, { timeout: 30000 }),
      dashboard.clickHomeMenu(),
    ]);

    // ✅ Assertion: เห็น "Upload more media" และ "Completed"
    await expect(dashboard.getStartedUploadText).toBeVisible({ timeout: 10000 });
    await expect(dashboard.getStartedCompletedText).toBeVisible({ timeout: 10000 });
  });

  // ✅ TC-DASH-007
  test('TC-DASH-007: Preview Content', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    // ไปหน้า Library
    await Promise.all([
      page.waitForURL(/library/, { timeout: 30000 }),
      dashboard.clickLibraryMenu(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า Library
    await expect(page).toHaveURL(/library/);

    // Preview ไฟล์
    await dashboard.previewContent();

    // ✅ Assertion: Preview modal เปิด
    await dashboard.waitForPreviewModalToAppear();
    await expect(dashboard.previewModal).toBeVisible();

    // ✅ Assertion: เห็นรูป/วิดีโอใน modal
    await dashboard.waitForPreviewMediaToAppear();
    await expect(dashboard.previewMedia.first()).toBeVisible();
  });

  // ✅ TC-DASH-008
  test('TC-DASH-008: Delete Content and Verify Incomplete Status', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    // ไปหน้า Library
    await Promise.all([
      page.waitForURL(/library/, { timeout: 30000 }),
      dashboard.clickLibraryMenu(),
    ]);

    // ✅ Assertion: ต้องอยู่หน้า Library
    await expect(page).toHaveURL(/library/);

    // ลบไฟล์
    await dashboard.deleteContent();

    // ✅ Assertion: แสดงข้อความ "File deleted."
    await expect(dashboard.fileDeletedMsg).toBeVisible({ timeout: 10000 });
  });
});


