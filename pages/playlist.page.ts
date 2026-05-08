import { Page, Locator } from '@playwright/test';

/**
 * Playlist Page Object Model
 * จัดการ locator และ action ทั้งหมดของหน้า Loop Playlist
 * ⚠️ NO ASSERTIONS - ให้ test เป็นคนจัดการ expect() ทั้งหมด
 */
export class PlaylistPage {
  readonly page: Page;

  // 🔥 Locators
  readonly addContentButton: Locator;
  readonly clearAllButton: Locator;
  readonly publishButton: Locator;
  readonly scheduleButton: Locator;
  readonly proNavButton: Locator;
  readonly playlistEmptyText: Locator;
  readonly confirmButton: Locator;
  readonly proFeaturePopup: Locator;

  constructor(page: Page) {
    this.page = page;

    // ปุ่ม Add Content
    this.addContentButton = page.getByText(/Add Content|เพิ่มคอนเทนต์|添加内容|Add more from Library/);

    // ปุ่ม Clear All
    this.clearAllButton = page.locator('button', { hasText: /Clear All|ล้างทั้งหมด/ });

    // ปุ่ม Publish
    this.publishButton = page.locator('button', { hasText: /Publish|เผยแพร่|发布/ });

    // ปุ่ม Schedule (เดิม)
    this.scheduleButton = page.locator('button, .ant-btn', { hasText: /Schedule|กำหนดเวลา/ });

    // ปุ่ม Pro Nav 
    this.proNavButton = page.locator('#lite-nav-pro');

    // ข้อความ Playlist ว่าง
    this.playlistEmptyText = page.getByText(/Playlist is Empty|เพลย์ลิสต์ว่าง/);

    // ปุ่ม confirm
    this.confirmButton = page.locator('button', { hasText: /OK|Confirm|Yes|ยืนยัน|ตกลง|Done/ });

    // Pro feature popup
    this.proFeaturePopup = page.locator('.ant-modal, [role="dialog"]', { hasText: /Pro|upgrade|อัปเกรด/ });
  }

  // ============================================================================
  // 🔥 Actions (pure actions only - no assertions)
  // ============================================================================

  /**
   * กดปุ่ม Add Content (PL-01)
   */
  // async addContent() {
  //   await this.addContentButton.first().click({ timeout: 10000 });
  //   await this.page.waitForTimeout(1000);
  // }

  /**
   * เลือกไฟล์ใน modal Add Content แล้วกด Done (PL-01)
   */
  // async selectFileAndConfirm(fileName: string) {
  //   // คลิกเลือกไฟล์ใน modal
  //   const fileItem = this.page.locator('.ant-modal').getByText(fileName).first();
  //   await fileItem.click({ timeout: 5000 });
  //   await this.page.waitForTimeout(500);

  //   // กด Done/Confirm
  //   await this.confirmButton.first().click({ timeout: 5000 });
  //   await this.page.waitForTimeout(1000);
  // }

  /**
   * กดปุ่ม Clear All แล้วยืนยัน (PL-06)
   */
  async clearAll() {
    await this.clearAllButton.first().click({ timeout: 5000 });
    await this.page.waitForTimeout(500);

    // กด confirm ใน popup (ตาม codegen.ts ใช้ getByRole)
    try {
      await this.page.getByRole('dialog').getByRole('button', { name: 'Clear All' }).click({ timeout: 3000 });
    } catch {
      // fallback
      try {
        await this.confirmButton.first().click({ timeout: 3000 });
      } catch { /* ไม่มี confirm popup */ }
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * กลับมาที่หน้า Playlist โดยคลิกที่ Sidebar Menu
   */
  async clickPlaylistMenu() {
    await this.page.locator('#lite-nav-playlist').click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * กดปุ่ม Schedule (PL-07 เดิม)
   */
  async clickSchedule() {
    await this.scheduleButton.first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * กดเมนู Pro ใน Sidebar (ตาม codegen.ts)
   */
  async clickProNav() {
    await this.proNavButton.click({ timeout: 5000 });
    await this.page.waitForTimeout(500);
  }

  /**
   * กดปุ่ม Publish (PL-05)
   */
  async clickPublish() {
    await this.publishButton.first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

  // ============================================================================
  // 🔥 Getters (return Locators or data for assertions in test)
  // ============================================================================

  /**
   * ได้ Locator ของ content item ใน Playlist ตามชื่อไฟล์
   */
  getContentItemLocator(fileName: string): Locator {
    return this.page
      .locator('.playlist-item, .loop-item, [class*="playlist"]', { hasText: fileName })
      .first();
  }

  /**
   * ได้ Locator ของข้อความ "Playlist is Empty"
   */
  getPlaylistEmptyLocator(): Locator {
    return this.playlistEmptyText;
  }

  /**
   * ได้ Locator ของ default duration text (10 วินาที)
   */
  getDefaultDurationLocator(): Locator {
    return this.page.getByText(/10\s*s|10\s*sec|10\s*วินาที/).first();
  }

  /**
   * ได้ Locator ของ Total Loop เป็น 0 หลัง Clear All
   */
  getTotalLoopZeroLocator(): Locator {
    return this.page.getByText(/0\s*s|00:00|0:00/).first();
  }

  /**
   * ได้ Locator ของ Pro feature popup (PL-07)
   */
  getProFeaturePopupLocator(): Locator {
    return this.proFeaturePopup.first();
  }

  /**
   * ได้ Locator ของ Dialog สำหรับเช็ค Upgrade to Pro (อิง codegen.ts)
   */
  getProFeatureDialogLocator(): Locator {
    return this.page.getByRole('dialog');
  }
}
