import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // 🔥 Locators
  readonly myDisplayMenu: Locator;
  readonly homeMenu: Locator;
  readonly displayMenu: Locator;
  readonly libraryMenu: Locator;
  readonly playlistMenu: Locator;
  readonly contentDropdownBtn: Locator;
  readonly previewMenuBtn: Locator;
  readonly deleteMenuBtn: Locator;
  readonly previewModal: Locator;
  readonly previewMedia: Locator;
  readonly deleteConfirmBtn: Locator;
  readonly languageDropdown: Locator;
  readonly accountIdDisplay: Locator;
  readonly uploadArea: Locator;
  readonly getStartedEmptyText: Locator;
  readonly getStartedUploadText: Locator;
  readonly getStartedCompletedText: Locator;
  readonly fileDeletedMsg: Locator;

  constructor(page: Page) {
    this.page = page;

    // Side Menu Navigation
    this.myDisplayMenu = page.getByText('My Screen', { exact: true });
    this.homeMenu = page.locator('#lite-nav-overview', { hasText: 'Home' });
    this.displayMenu = page.locator('#lite-nav-screen', { hasText: 'Screens' });
    this.libraryMenu = page.locator('#lite-nav-library');
    this.playlistMenu = page.locator('#lite-nav-playlist');

    // Content Actions
    this.contentDropdownBtn = page.locator('.lite-library-item', { hasText: 'img.simple' }).locator('button.ant-dropdown-trigger');
    this.previewMenuBtn = page.locator('.ant-dropdown-menu-item', { hasText: 'Preview' });
    this.deleteMenuBtn = page.locator('.ant-dropdown-menu-item', { hasText: 'Delete' });
    this.deleteConfirmBtn = page.getByRole('button', { name: 'Delete' });

    // Preview Modal
    this.previewModal = page.locator('div[role="dialog"].ant-modal');
    this.previewMedia = this.previewModal.locator('img, video');

    // Header Elements
    this.languageDropdown = page.locator('header .ant-dropdown-trigger, [class*="header"] .ant-dropdown-trigger').first();
    this.accountIdDisplay = page.locator('.ant-layout-header, header, .topbar').first();

    // Upload & Get Started
    this.uploadArea = page.getByText('Drop files here or click to upload');
    this.getStartedEmptyText = page.getByText('Add images and videos to your library');
    this.getStartedUploadText = page.getByText('Upload more media');
    this.getStartedCompletedText = page.getByText(/Completed/).first();
    this.fileDeletedMsg = page.getByText('File deleted.');
  }

  // 🔥 Helper: Remove overlays (Driver.js, etc.)
  private async removeOverlays() {
    await this.page.evaluate(() => {
      document.querySelectorAll('.driver-overlay, .driver-overlay-animated, .driver-popover').forEach(el => el.remove());
      document.body.classList.remove('driver-active', 'driver-fade');
    }).catch(() => { });
  }

  // ========== NAVIGATION ACTIONS ==========

  async clickMyDisplay() {
    await this.removeOverlays();
    await this.myDisplayMenu.click({ force: true });
  }

  async clickHomeMenu() {
    await this.removeOverlays();
    await this.homeMenu.click({ force: true });
  }

  async clickDisplayMenu() {
    await this.removeOverlays();
    await this.displayMenu.click({ force: true });
  }

  async clickLibraryMenu() {
    await this.removeOverlays();
    await this.libraryMenu.click({ force: true });
  }

  async clickPlaylistMenu() {
    await this.removeOverlays();
    await this.playlistMenu.click({ force: true });
  }

  // ========== CONTENT ACTIONS ==========

  async uploadMedia(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.uploadArea.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  async previewContent() {
    await this.removeOverlays();
    await this.contentDropdownBtn.first().click({ timeout: 10000, force: true });
    await this.previewMenuBtn.first().waitFor({ state: 'visible', timeout: 10000 });
    await this.previewMenuBtn.first().click({ timeout: 10000, force: true });
  }

  async deleteContent() {
    await this.removeOverlays();
    // เปิด dropdown menu
    await this.contentDropdownBtn.first().click();
    // คลิก Delete ใน dropdown
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    // คลิก Delete ใน confirm dialog
    await this.deleteConfirmBtn.click();
  }

  // ========== LANGUAGE ACTIONS ==========

  async switchLanguage(lang: 'TH' | 'EN' | 'CN') {
    const langMap: Record<string, RegExp> = {
      'TH': /ภาษาไทย/,
      'EN': /English/,
      'CN': /中文/
    };

    // เปิด language dropdown
    await this.languageDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.languageDropdown.click({ force: true });
    await this.page.waitForTimeout(500);

    // เลือกภาษา
    const langOption = this.page.locator('.ant-dropdown-menu-item').filter({ hasText: langMap[lang] });
    await langOption.first().waitFor({ state: 'visible', timeout: 5000 });
    await langOption.first().click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  // ========== WAIT HELPERS (ไม่ใช่ assertion) ==========

  async waitForFileToAppear(fileName: string) {
    // รอจนกว่าจะเห็นชื่อไฟล์บนหน้าจอ (15 วินาที)
    await this.page.getByText(fileName).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async waitForPreviewModalToAppear() {
    await this.previewModal.waitFor({ state: 'visible', timeout: 10000 });
  }

  async waitForPreviewMediaToAppear() {
    await this.previewMedia.first().waitFor({ state: 'visible', timeout: 15000 });
  }
}

