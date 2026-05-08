import { Page, Locator } from '@playwright/test';

/**
 * Library Page Object Model
 * จัดการ locator และ action ทั้งหมดของหน้า Content Library
 * ⚠️ NO ASSERTIONS - ให้ test เป็นคนจัดการ
 */
export class LibraryPage {
  readonly page: Page;

  // 🔥 Locators
  readonly uploadArea: Locator;
  readonly searchInput: Locator;
  readonly libraryItemDropdown: Locator;
  readonly deleteMenuItem: Locator;
  readonly addToPlaylistMenuItem: Locator;
  readonly previewMenuItem: Locator;
  readonly previewModal: Locator;
  readonly previewMedia: Locator;
  readonly confirmButton: Locator;
  readonly libraryItem: Locator;
  readonly errorMessage: Locator;
  readonly contentDropdownBtn: Locator;
  readonly deleteConfirmBtn: Locator;
  readonly libraryMenu: Locator;
  readonly fileDeletedMsg: Locator;



  constructor(page: Page) {
    this.page = page;

    // พื้นที่อัปโหลดไฟล์
    this.uploadArea = page.getByText('Drop files here or click to upload');

    // ช่อง Search
    this.searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="ค้นหา"]').first();

    // เมนูสามจุดของ library item
    this.libraryItemDropdown = page.locator('.lite-library-item button.ant-dropdown-trigger');

    // เมนู dropdown items
    this.deleteMenuItem = page.locator('.ant-dropdown-menu-item', { hasText: /Delete|ลบ/ });
    this.addToPlaylistMenuItem = page.locator('.ant-dropdown-menu-item', { hasText: /Add to Playlist|เพิ่มลงเพลย์ลิสต์/ });
    this.previewMenuItem = page.locator('.ant-dropdown-menu-item', { hasText: 'Preview' });

    // Preview modal
    this.previewModal = page.locator('div[role="dialog"].ant-modal');
    this.previewMedia = this.previewModal.locator('img, video');

    // ปุ่มยืนยัน (สำหรับ confirm dialog)
    this.confirmButton = page.locator('button', { hasText: /OK|Confirm|Yes|ยืนยัน|ตกลง/ });

    // Library items
    this.libraryItem = page.locator('.lite-library-item');

    // Error messages
    this.errorMessage = page.locator('.ant-message, .ant-notification, .ant-alert');

    //ลบคอนนเทนต์
    this.contentDropdownBtn = page.locator('.lite-library-item', { hasText: 'img.simple' }).locator('button.ant-dropdown-trigger');
    this.deleteConfirmBtn = page.getByRole('button', { name: 'Delete' });

    this.libraryMenu = page.locator('#lite-nav-library');
    this.fileDeletedMsg = page.getByText('File deleted.');

  }

  // 🔥 Actions (pure actions only - no assertions)

  /**
   * นำทาง goto library page
   */
  async goto() {
    // คลิก "Medias" ใน sidebar แล้วรอ URL เปลี่ยนเป็น /library
    await Promise.all([
      this.page.waitForURL(/library/, { timeout: 15000 }),
      this.page.getByText('Medias', { exact: true }).click(),
    ]);

    // รอโหลดเสร็จสมบูรณ์
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * คลิกเมนูสามจุดของไฟล์ที่ต้องการ
   */
  // 🔥 Helper: Remove overlays (Driver.js, etc.)
  private async removeOverlays() {
    await this.page.evaluate(() => {
      document.querySelectorAll('.driver-overlay, .driver-overlay-animated, .driver-popover').forEach(el => el.remove());
      document.body.classList.remove('driver-active', 'driver-fade');
    }).catch(() => { });
  }


  /**
   * อัปโหลดไฟล์เดี่ยว
   */
  async uploadSingleFile(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.uploadArea.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  /**
   * อัปโหลดหลายไฟล์พร้อมกัน (LIB-01)
   */
  async uploadMultipleFiles(filePaths: string[]) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.uploadArea.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePaths);
  }

  /**
   * ค้นหาไฟล์ด้วยชื่อ (LIB-05)
   */
  async searchFile(fileName: string) {
    await this.searchInput.fill(fileName);
    // รอ Frontend Debounce 1 วินาที
    await this.page.waitForTimeout(1000);
  }

  /**
   * ล้างช่อง Search
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  /**
   * คลิกเมนูสามจุดของไฟล์ที่ต้องการ
   */
  async clickFileMenu(fileName: string) {
    // ปิด overlay/guide ที่อาจบัง
    await this.removeOverlays();
    await this.page.evaluate(() => {
      document.querySelectorAll('.driver-overlay, .driver-overlay-animated').forEach(el => el.remove());
      document.body.classList.remove('driver-active', 'driver-fade');
    });

    const item = this.page.locator('.lite-library-item', { hasText: fileName })
      .locator('button.ant-dropdown-trigger');
    await item.first().click({ timeout: 10000, force: true });
    await this.page.waitForTimeout(500);
  }

  /**
   * ลบไฟล์ที่ระบุ (LIB-04)
   */
  async deleteContent() {
    await this.removeOverlays();
    // เปิด dropdown menu
    await this.contentDropdownBtn.first().click();
    // คลิก Delete ใน dropdown
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    // คลิก Delete ใน confirm dialog
    await this.deleteConfirmBtn.click();
  }

  /**
   * เพิ่มไฟล์ลง Playlist (LIB-08)
   */
  async addFileToPlaylist(fileName: string) {
    await this.clickFileMenu(fileName);
    await this.addToPlaylistMenuItem.first().waitFor({ state: 'visible', timeout: 5000 });
    await this.addToPlaylistMenuItem.first().click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * คลิกเลือกรูปภาพโดยตรงและกดปุ่ม Add to Playlist (ตาม codegen.ts)
   */
  async clickImageAndAddToPlaylist(imageName: string) {
    await this.page.getByRole('img', { name: imageName }).first().click();
    await this.page.getByRole('button', { name: 'Add to Playlist' }).click();
  }

  /**
   * Preview ไฟล์ (LIB-06)
   */
  async previewFile(fileName: string) {
    await this.clickFileMenu(fileName);
    await this.previewMenuItem.first().waitFor({ state: 'visible', timeout: 5000 });
    await this.previewMenuItem.first().click({ force: true });
  }

  // 🔥 Getters (return locators or data for assertions)

  /**
   * ได้ locator ของไฟล์ที่ค้นหา
   */
  getFileLocator(fileName: string): Locator {
    return this.page.getByText(fileName).first();
  }

  /**
   * นับจำนวนไฟล์ที่มีชื่อตรงกัน
   */
  async countFilesWithName(fileName: string): Promise<number> {
    return await this.libraryItem.filter({ hasText: fileName }).count();
  }

  /**
   * นับจำนวนไฟล์ทั้งหมด
   */
  async countAllFiles(): Promise<number> {
    return await this.libraryItem.count();
  }

  /**
   * ได้ locator ของ error message ที่มี text ตรงกัน
   */
  getErrorMessageLocator(expectedText: RegExp | string): Locator {
    return this.page.locator('.ant-message, .ant-notification, .ant-alert', {
      hasText: expectedText
    }).first();
  }

  /**
   * ได้ locator ของ preview modal
   */
  getPreviewModalLocator(): Locator {
    return this.previewModal;
  }

  /**
   * ได้ locator ของ preview media
   */
  getPreviewMediaLocator(): Locator {
    return this.previewMedia.first();
  }

  /**
   * 
   */
  async clickLibraryMenu() {
    await this.removeOverlays();
    await this.libraryMenu.click({ force: true });
  }

}







