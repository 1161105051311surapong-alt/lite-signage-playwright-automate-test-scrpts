import { Page, Locator, expect } from '@playwright/test';

/**
 * Display Page Object Model
 * จัดการ locator และ action ทั้งหมดของหน้า Display Management
 */
export class DisplayPage {
  readonly page: Page;

  // 🔥 Locators
  readonly pairButton: Locator;
  readonly codeInput: Locator;
  readonly submitCodeButton: Locator;
  readonly errorPopupNoscreenfoundMsg: Locator;
  readonly ratioButtons: {
    '16:9': Locator;
    '9:16': Locator;
    '4:3': Locator;
  };
  readonly previewArea: Locator;
  // TC-DSP-05
 readonly langSelect: Locator;
  readonly currentLangLabel: Locator;
  
  constructor(page: Page) {
    this.page = page;

    // ปุ่ม Pair / Link Screen
    this.pairButton = page.locator('button', { hasText: /Pair|Link Screen|เชื่อมต่อ/ });

    // ช่อง input กรอก Code 6 หลัก
    this.codeInput = page.locator('input[placeholder*="Code"], input[placeholder*="code"], input[maxlength="6"]').first();

    // ปุ่ม Submit Code
    this.submitCodeButton = page.getByText('✓ Connect Now', { exact: true }).first();

    // Popup แจ้ง error
    this.errorPopupNoscreenfoundMsg = page.getByText('No screen found with this code. Make sure your screen is connected to the internet.');

    // ปุ่มเปลี่ยน ratio
    this.ratioButtons = {
      '16:9': page.locator('button, .ratio-btn, [data-ratio]', { hasText: '16:9' }),
      '9:16': page.locator('button, .ratio-btn, [data-ratio]', { hasText: '9:16' }),
      '4:3': page.locator('button, .ratio-btn, [data-ratio]', { hasText: '4:3' }),
    };

    // Preview area
    this.previewArea = page.locator('.preview-container, .screen-preview, [class*="preview"]').first();

    // TC-DSP-05: Locators สำหรับเปลี่ยนภาษา
    // ตัว Select หลัก
    this.langSelect = page.locator('.lang-toggle-select');
    // ตัว Label ที่แสดงค่าภาษาปัจจุบัน
    this.currentLangLabel = page.locator('.ant-select-selection-item');
  }

  

  // 🔥 Actions

  /**
   * คลิกปุ่ม Pair / Link Screen
   */
  async clickPair() {
    await this.pairButton.first().click({ timeout: 10000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * กรอก Code แล้วกด Submit (DSP-01, DSP-02)
   */
  async enterCodeAndSubmit(code: string) {
    await this.codeInput.fill(code);
    await this.submitCodeButton.first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * เปลี่ยน ratio (DSP-06)
   */
  async changeRatio(ratio: '16:9' | '9:16' | '4:3') {
    await this.ratioButtons[ratio].first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

  // 🔥 Assertions

  /**
   * ตรวจสอบ error popup เมื่อกรอก Code ผิด (DSP-02)
   */
  async errorPopupCode() {
    await expect(this.errorPopupNoscreenfoundMsg).toBeVisible({ timeout: 10000 });
  }

  /**
   * ตรวจสอบว่า Preview area เปลี่ยน ratio ได้
   */
  async verifyPreviewVisible() {
    await expect(this.previewArea).toBeVisible({ timeout: 5000 });
  }

 /**
   * Action: คลิกเปิดและเลือกภาษาจาก Dropdown
   */
  async selectLanguage(langName: string): Promise<void> {
    // คลิกเปิด Dropdown
    await this.langSelect.click();

    // หา Option ที่ต้องการ
    const option = this.page.locator('.ant-select-item-option-content').filter({ 
      hasText: langName 
    });

    // รอให้เห็นและคลิก
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  /**
   * Helper: ดึงข้อความภาษาที่แสดงอยู่ปัจจุบัน (เพื่อเอาไป Assert ใน Test)
   */
  getCurrentLanguageLocator(): Locator {
    return this.currentLangLabel;
  }
}
