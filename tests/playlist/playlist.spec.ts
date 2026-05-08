import { test, expect } from '@playwright/test';
import { PlaylistPage } from '../../pages/playlist.page';
import { LoginPage } from '../../pages/login.page';
import { LibraryPage } from '../../pages/library.page';
import { loginData } from '../../data/login.data';

// สเปกนี้ล็อกอินเองทุกครั้ง ไม่ใช้ storageState จาก config
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
 * ล็อกอินและไปหน้า Playlist พร้อมใช้งาน
 */
async function loginAndGoToPlaylist(page: import('@playwright/test').Page) {
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

  // ไปหน้า Playlist โดยคลิก "Playlists" ใน sidebar
  await Promise.all([
    page.waitForURL(/playlist/, { timeout: 15000 }),
    page.getByText('Playlists', { exact: true }).click(),
  ]);

  await page.waitForLoadState('networkidle');
  await dismissAnyPopup(page);
}

/**
 * ตรวจสอบว่าไฟล์มีอยู่ใน library หรือไม่ (ถ้าไม่มีให้อัปโหลด)
 */
async function ensureFileExists(libraryPage: LibraryPage, fileName: string, filePath: string) {
  try {
    await libraryPage.getFileLocator(fileName).waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    // ไฟล์ไม่มี - อัปโหลด
    await libraryPage.uploadSingleFile(filePath);
    await libraryPage.getFileLocator(fileName).waitFor({ state: 'visible', timeout: 15000 });
  }
}

// ============================================================================
// 📋 TEST SUITE
// ============================================================================

test.describe('Loop Playlist (PL)', () => {
  // บังคับให้รันเทสแบบ Serial (ทีละเทส) ไม่รันพร้อมกัน
  test.describe.configure({ mode: 'serial' });

  // ก่อนแต่ละเทส: ล็อกอินและไปหน้า Playlist
  test.beforeEach(async ({ page }) => {
    await loginAndGoToPlaylist(page);
  });

  // ============================================================================
  // PL-01: เพิ่ม Content ลง Loop → ไฟล์ต้องมาปรากฏในลิสต์ลำดับการเล่น** ต้องมีการผูกกับplayer ก่อนถึงจะรันเคสนี้ได้ **
  // ============================================================================
  // test.skip('TC-PL-01 > เพิ่ม Content ลง Loop', async ({ page }) => {
  //   const playlistPage = new PlaylistPage(page);

  //   // ✅ Assert: ต้องอยู่หน้า Playlist
  //   await expect(page).toHaveURL(/playlist/);

  //   // 📌 Act - กด Add Content แล้วเลือกไฟล์
  //   await playlistPage.addContent();
  //   await playlistPage.selectFileAndConfirm('img.simple');

  //   // ✅ Assert - ไฟล์ต้องปรากฏในลิสต์ Playlist
  //   await expect(playlistPage.getContentItemLocator('img.simple')).toBeVisible({ timeout: 10000 });
  // });

  // // ============================================================================
  // // PL-02: ตรวจสอบค่าเริ่มต้นเวลา (10s) → รูปภาพใหม่ต้องมีเวลา 10 วินาที
  // // ============================================================================
  // test('TC-PL-02 > ตรวจสอบค่าเริ่มต้นเวลา (10s)', async ({ page }) => {
  //   const playlistPage = new PlaylistPage(page);

  //   // 📌 Act - เพิ่มรูปภาพเข้าไป
  //   await playlistPage.addContent();
  //   await playlistPage.selectFileAndConfirm('img.simple');

  //   // ✅ Assert - ต้องมี duration เริ่มต้นที่ 10 วินาที
  //   await expect(playlistPage.getDefaultDurationLocator()).toBeVisible({ timeout: 5000 });
  // });

  // ============================================================================
  // PL-06: การล้างรายการ (Clear All) → รายการทั้งหมดหายไป และ Total Loop กลับเป็น 0
  // ============================================================================
  test('TC-PL-06 > การล้างรายการ (Clear All)', async ({ page }) => {
    const playlistPage = new PlaylistPage(page);
    const libraryPage = new LibraryPage(page);

    // 📌 Arrange - นำทางไป Library และเพิ่มรูปภาพลง Playlist 
    await libraryPage.clickLibraryMenu(); // หรือใช้ lite-nav-library

    // ตรวจสอบว่ามีไฟล์ img.simple ใน Library หรือไม่ ถ้าไม่มีให้เพิ่มก่อน
    await ensureFileExists(libraryPage, 'img.simple', 'file/img.simple.jpg');

    // คลิกภาพ img.simple แล้ว Add to Playlist 
    await libraryPage.clickImageAndAddToPlaylist('img.simple');

    // ยืนยันว่าเพิ่มสำเร็จ
    await expect(page.locator('body')).toContainText('"img.simple" added to playlist.');

    // 📌 Act - กลับมาหน้า Playlist และกด Clear All
    await playlistPage.clickPlaylistMenu();

    // เช็คก่อนว่ามีภาพ
    await expect(playlistPage.getContentItemLocator('img.simple').first()).toBeVisible({ timeout: 10000 });

    // กด Clear All แล้วยืนยัน
    await playlistPage.clearAll();

    // ✅ Assert - แสดงข้อความว่าลบแล้ว และ Playlist ต้องว่าง
    await expect(page.locator('body')).toContainText('Playlist cleared.');

    const isEmpty = await playlistPage.getPlaylistEmptyLocator().isVisible({ timeout: 5000 }).catch(() => false);
    if (isEmpty) {
      await expect(playlistPage.getPlaylistEmptyLocator()).toBeVisible({ timeout: 10000 });
    } else {
      await expect(playlistPage.getTotalLoopZeroLocator()).toBeVisible({ timeout: 5000 });
    }
  });

  // ============================================================================
  // PL-07: ตรวจสอบฟีเจอร์ Pro (Schedule) → แสดง Popup ว่าเป็นฟีเจอร์สำหรับ Pro
  // ============================================================================
  test('TC-PL-07 > ตรวจสอบฟีเจอร์ Pro ', async ({ page }) => {
    const playlistPage = new PlaylistPage(page);

    // 📌 Act - กดเมนู Pro 
    await playlistPage.clickProNav();

    // ✅ Assert - dialog แจ้งเตือนว่าเป็นฟีเจอร์ Pro ต้องปรากฏ และมีข้อความ Upgrade to Pro
    await expect(playlistPage.getProFeatureDialogLocator()).toContainText(' Upgrade to Pro');
  });

  // ============================================================================
  // PL-09: แสดงผล Playlist ว่าง → แสดงข้อความ "Playlist is Empty"
  // ============================================================================
  test('TC-PL-09 > แสดงผล Playlist ว่าง', async ({ page }) => {
    const playlistPage = new PlaylistPage(page);
    const libraryPage = new LibraryPage(page);

    // 📌 Arrange - ตรวจสอบว่า Playlist ว่างหรือไม่
    const isEmpty = await playlistPage.getPlaylistEmptyLocator().isVisible({ timeout: 3000 }).catch(() => false);

    if (isEmpty) {
      // ถ้า Playlist ว่าง ให้ไปเพิ่มไฟล์จากหน้า Library ก่อน 
      await libraryPage.clickLibraryMenu();
      
      // ตรวจสอบว่ามีไฟล์ img.simple ใน Library หรือไม่ ถ้าไม่มีให้เพิ่มก่อน
      await ensureFileExists(libraryPage, 'img.simple', 'file/img.simple.jpg');

      await libraryPage.clickImageAndAddToPlaylist('img.simple');
      await expect(page.locator('body')).toContainText('"img.simple" added to playlist.');
      await playlistPage.clickPlaylistMenu();

      // รอให้ภาพปรากฏใน Playlist
      await expect(playlistPage.getContentItemLocator('img.simple').first()).toBeVisible({ timeout: 10000 });
    }

    // 📌 Act - ลบรายการ 
    await playlistPage.clearAll();

    // ✅ Assert - ต้องแสดงข้อความ Playlist cleared. และ Playlist is Empty
    await expect(page.locator('body')).toContainText('Playlist cleared.');
    await expect(page.locator('h4')).toContainText('Playlist is Empty');
  });

  // PL-05: การส่งข้อมูล (Publish) → ต้องมี display เชื่อมต่ออยู่จึงจะทดสอบได้จริง
  test.skip('TC-PL-05 > การส่งข้อมูล (Publish)', async ({ page }) => {
    // ⚠️ Skip: ต้องมีหน้าจอ Display เชื่อมต่ออยู่จึงจะส่งข้อมูลไปได้จริง
    const playlistPage = new PlaylistPage(page);
    await playlistPage.clickPublish();
  });
});
