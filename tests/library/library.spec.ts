import { test, expect } from '@playwright/test';
import { LibraryPage } from '../../pages/library.page';
import { LoginPage } from '../../pages/login.page';
import { loginData } from '../../data/login.data';

// สเปกนี้ล็อกอินเองทุกครั้ง ไม่ใช้ storageState จาก config เพื่อกัน session เก่าค้าง
test.use({ storageState: { cookies: [], origins: [] } });

// ============================================================================
// 🛠️ REUSABLE HELPERS
// ============================================================================

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
        // ไม่มีปุ่มนี้ ลองปุ่มถัดไป
      }
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
    } catch {
      // ไม่มี dialog ที่จะปิด
    }

    if (!dismissed) break;
  }
}

/**
 * ล็อกอินและไปหน้า Library พร้อมใช้งาน
 */
async function loginAndGoToLibrary(page: import('@playwright/test').Page) {
  // ยอมรับ browser dialogs
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await dismissAnyPopup(page);

  // ล็อกอิน
  await loginPage.fillUserPassword(loginData.valid.username, loginData.valid.password);
  await Promise.all([
    page.waitForURL(/\/overview/, { timeout: 60000 }),
    loginPage.clickLogin(),
  ]);

  // รอหน้าโหลดเสร็จ
  await page.waitForLoadState('networkidle');
  await dismissAnyPopup(page);
  await page.waitForTimeout(1200);
  await dismissAnyPopup(page);

  // ไปหน้า Library โดยคลิก "Medias" ใน sidebar
  await Promise.all([
    page.waitForURL(/library/, { timeout: 30000 }),
    page.getByText('Medias', { exact: true }).click(),
  ]);

  await page.waitForLoadState('networkidle');
  await dismissAnyPopup(page);
}

/**
 * ตรวจสอบว่าไฟล์มีอยู่ใน library หรือไม่ (ถ้าไม่มีให้อัปโหลด)
 */
async function ensureFileExists(libraryPage: LibraryPage, fileName: string, filePath: string) {
  try {
    await libraryPage.getFileLocator(fileName).waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    // ไฟล์ไม่มี - อัปโหลด
    await libraryPage.uploadSingleFile(filePath);
    await libraryPage.getFileLocator(fileName).waitFor({ state: 'visible', timeout: 15000 });
  }
}

// ============================================================================
// 📋 TEST SUITE
// ============================================================================

test.describe('Content Library (LIB)', () => {
  // บังคับให้รันเทสแบบ Serial (ทีละเทส) ไม่รันพร้อมกัน
  test.describe.configure({ mode: 'serial' });

  // ก่อนแต่ละเทส: ล็อกอินและไปหน้า Library
  test.beforeEach(async ({ page }) => {
    await loginAndGoToLibrary(page);
  });

  // ============================================================================
  // LIB-01: อัปโหลดหลายไฟล์พร้อมกัน
  // ============================================================================
  test('TC-LIB-01 > อัปโหลดหลายไฟล์พร้อมกัน', async ({ page }) => {
    test.setTimeout(120000);
    const libraryPage = new LibraryPage(page);

    // 📌 Arrange
    const testFiles = [
      { name: 'img.simple', path: 'file/img.simple.jpg' },
      { name: 'video.simple', path: 'file/video.simple.mp4' },
    ];

    // 📌 Act
    await libraryPage.uploadMultipleFiles(testFiles.map(f => f.path));

    // 📌 Assert - ทุกไฟล์ต้องปรากฏใน Library
    for (const file of testFiles) {
      const waitTime = file.name.includes('video') ? 60000 : 15000;
      await expect(libraryPage.getFileLocator(file.name)).toBeVisible({ timeout: waitTime });
    }
  });

  // ============================================================================
  // LIB-02: อัปโหลดไฟล์ซ้ำ (Duplicate)
  // ============================================================================
  test('TC-LIB-02 > อัปโหลดไฟล์ซ้ำ (Duplicate)', async ({ page }) => {
    const libraryPage = new LibraryPage(page);
    const testFileName = 'img.simple';
    const testFilePath = 'file/img.simple.jpg';

    // 📌 Arrange - ตรวจสอบจำนวนไฟล์ก่อนอัปโหลด
    const countBefore = await libraryPage.countFilesWithName(testFileName);

    // 📌 Act - อัปโหลดไฟล์เดิมซ้ำ
    await libraryPage.uploadSingleFile(testFilePath);
    await page.waitForTimeout(3000);

    // 📌 Assert - จำนวนไฟล์ต้องเพิ่มขึ้น
    const countAfter = await libraryPage.countFilesWithName(testFileName);
    expect(countAfter).toBeGreaterThanOrEqual(countBefore + 1);
  });

  // ============================================================================
  // LIB-03: อัปโหลดไฟล์เกิน 1GB
  // ============================================================================
  test.skip('TC-LIB-03 > อัปโหลดไฟล์เกิน 1GB (Single)', async ({ page }) => {
    // ⚠️ Skip: ต้องมีไฟล์ขนาดมากกว่า 1GB เพื่อทดสอบ
    const libraryPage = new LibraryPage(page);
    const testFilePath = 'file/1.4gb.mp4';

    // 📌 Act
    await libraryPage.uploadSingleFile(testFilePath);

    // 📌 Assert - ต้องมี error message
    const errorLocator = libraryPage.getErrorMessageLocator(/exceeds the maximum file size/i);
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // LIB-04: ลบไฟล์และคืนพื้นที่
  // ============================================================================
  test('TC-LIB-04 > ลบไฟล์และคืนพื้นที่', async ({ page }) => {
    const libraryPage = new LibraryPage(page);

    // ✅ Assert: ต้องอยู่หน้า Library
    await expect(page).toHaveURL(/library/);

    // 📌 Act - ลบไฟล์
    await libraryPage.deleteContent();

    // ✅ Assert - แสดงข้อความ "File deleted."
    await expect(libraryPage.fileDeletedMsg).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // LIB-05: ค้นหาไฟล์ (Search)
  // ============================================================================
  test('TC-LIB-05 > ค้นหาไฟล์ (Search)', async ({ page }) => {
    const libraryPage = new LibraryPage(page);
    const testFileName = 'img.simple';
    const testFilePath = 'file/img.simple.jpg';

    // ✅ Assert: ต้องอยู่หน้า Library
    await expect(page).toHaveURL(/library/);

    // 📌 Arrange - ตรวจสอบว่ามีไฟล์ให้ค้นหาแน่นอน
    await ensureFileExists(libraryPage, testFileName, testFilePath);

    // 📌 Act #1 - ค้นหาด้วยชื่อที่มีอยู่จริง
    await libraryPage.searchFile(testFileName);

    // 📌 Assert #1 - ไฟล์นั้นต้องปรากฏ
    await expect(libraryPage.getFileLocator(testFileName)).toBeVisible({ timeout: 10000 });

    // 📌 Act #2 - ค้นหาด้วยชื่อมั่วๆ ที่ไม่มีในระบบ
    await libraryPage.searchFile('nonexistent_file_xyz');

    // 📌 Assert #2 - ต้องไม่พบไฟล์ใดๆ เลย
    const countItems = await libraryPage.countFilesWithName('nonexistent_file_xyz');
    expect(countItems).toBe(0);

    // 📌 Act #3 - ล้างการค้นหา (Clear Search)
    await libraryPage.clearSearch();

    // 📌 Assert #3 - ไฟล์ทดสอบต้องกลับมาแสดงให้เห็นอีกครั้ง
    await expect(libraryPage.getFileLocator(testFileName)).toBeVisible({ timeout: 10000 });
  });
});
