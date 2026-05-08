import { Page, Locator } from '@playwright/test';

/**
 * SignUp Page Object Model
 * จัดการ locator และ action ทั้งหมดของหน้า Sign Up (2 Steps)
 */
export class SignUpPage {
  readonly page: Page;

  // 🔥 Step 1 Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly nextButton: Locator;
  readonly passwordMismatchError: Locator;
  readonly weakPasswordIndicator: Locator;

  // 🔥 Step 2 Locators
  readonly usernameInput: Locator;
  readonly createAccountButton: Locator;
  readonly backButton: Locator;
  readonly usernameExistsError: Locator;
  readonly recaptcha: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1: กรอก Email, Password, Confirm Password
    this.emailInput = page.locator('input[type="email"], input[placeholder*="Email"], input[placeholder*="email"]').first();
    this.passwordInput = page.locator('input[placeholder*="Password"], #password').first();
    this.confirmPasswordInput = page.locator('input[placeholder*="Confirm"], input[placeholder*="confirm"]').first();
    this.nextButton = page.locator('button', { hasText: /Next|Continue|Proceed|ถัดไป|ดำเนินการต่อ|下一步/ });

    // Error messages Step 1
    this.passwordMismatchError = page.getByText(/Passwords do not match/i);
    this.weakPasswordIndicator = page.getByText('Weak password');

    // Step 2: กรอก Username
    this.usernameInput = page.locator('input[placeholder*="Username"], input[placeholder*="username"]').first();
    this.createAccountButton = page.locator('button', { hasText: /Create Account|สร้างบัญชี|创建账户/ });
    this.backButton = page.locator('button').filter({ hasText: /Back|ย้อนกลับ/ }).filter({ hasNotText: /Sign In/ });

    // Error messages Step 2
    this.usernameExistsError = page.getByText(/Username is already taken|ชื่อผู้ใช้ถูกใช้แล้ว/i);

    // reCAPTCHA
    this.recaptcha = page.locator('.g-recaptcha, iframe[src*="recaptcha"]').first();
  }

  // 🔥 Navigation
  async goto() {
    await this.page.goto('https://cds.zignstack.com/cms/lite/register', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  }

  // 🔥 Step 1 Actions
  async fillStep1(email: string, password: string, confirmPassword: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async clickNext() {
    await this.nextButton.first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

  // 🔥 Step 2 Actions
  async fillStep2Username(username: string) {
    await this.usernameInput.fill(username);
  }

  async clickCreateAccount() {
    await this.createAccountButton.first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

  async clickBack() {
    await this.backButton.first().click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);
  }

}
