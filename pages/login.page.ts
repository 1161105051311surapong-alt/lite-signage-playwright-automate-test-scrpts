// import { Page } from '@playwright/test';

// export class LoginPage {
//   baseURL = 'https://cds.zignstack.com/cms/lite/login';

//   constructor(private page: Page) {}

//   // ค้นหาและส่งคืน input field สำหรับกรอก Username

//     get usernameInput() {return this.page.locator('#lite_login_username');}
//     get passwordInput() {return this.page.locator('#lite_login_password');}
//     get loginButton() { return this.page.getByRole('button', { name: 'Sign In' }); }
//     get togglePasswordVisibilityButton() {return this.page.locator('[aria-label="eye"], [aria-label="eye-invisible"]');}
//     get invalidCredentialError() {return this.page.getByText(/invalid username or password/i);}
//     get usernameRequiredError() {return this.page.getByText('Please enter your username');}
//     get passwordRequiredError() {return this.page.getByText('Please enter your password');}
//     get loginGoogleButton() { return this.page.getByRole('button', { name: 'Google' }); }
  

//   async goto() {
//     await this.page.goto(this.baseURL, { waitUntil: 'domcontentloaded' });
//   }

//   async fillUserPassword(username: string, password: string) {
//     await this.usernameInput.fill(username);
//     await this.passwordInput.fill(password);
//   }

//   async clickLogin() {
//     await this.loginButton.click();
//   }
//   async login(username: string, password: string) {
//     await this.fillUserPassword(username, password);
//     await this.clickLogin();
//   }

//   async togglePasswordVisibility() {
//     await this.togglePasswordVisibilityButton.waitFor({ state: 'visible' });
//     await this.togglePasswordVisibilityButton.click();
//   }

//   async isPasswordVisible() {
//     return await this.passwordInput.getAttribute('type') === 'text';
//   }

//   async isInvalidCredentialErrorVisible() {
//     return await this.invalidCredentialError.isVisible();
//   }

//   async clickLoginWithGoogle() {
//       await this.loginGoogleButton.click();
//   }


// }

import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // 🔥 Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly googleLoginButton: Locator;

  readonly invalidCredentialError: Locator;
  readonly usernameRequiredError: Locator;
  readonly passwordRequiredError: Locator;

  readonly passwordToggleButton: Locator;
  readonly signUpLink: Locator;
  readonly emailFormatError: Locator;

  constructor(page: Page) {
    this.page = page;

    // ✅ ใช้ id → stable สุด
    this.usernameInput = page.locator('#lite_login_username');
    this.passwordInput = page.locator('#lite_login_password');

    // ✅ ใช้ role → readable
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
    this.googleLoginButton = page.getByRole('button', { name: 'Google' });

    // ✅ error messages
    this.invalidCredentialError = page.getByText(/invalid username or password/i);
    this.usernameRequiredError = page.getByText('Please enter your username');
    this.passwordRequiredError = page.getByText('Please enter your password');

    // ✅ eye icon
    this.passwordToggleButton = page.locator('[aria-label="eye-invisible"], [aria-label="eye"]');

    // ✅ Sign Up link (LGN-10)
    this.signUpLink = page.getByText(/Sign up/i);

    // ✅ email format validation (LGN-05)
    this.emailFormatError = page.getByText(/please enter a valid email/i);
  }

  // 🔥 Navigation
  // async goto() {
  //   await this.page.goto('https://cds.zignstack.com/cms/lite/login', {
  //     waitUntil: 'domcontentloaded'
  //   });
  // }

  async goto() {
  await this.page.goto('https://cds.zignstack.com/cms/lite/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000, // 🔥 เพิ่ม timeout
  });
}

  // 🔥 Actions
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillUserPassword(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
  }

  // async clickLogin() {
  //   await this.loginButton.click();
  // }

  async clickLogin() {
    await this.loginButton.waitFor({
      state: 'visible',
    });

    await this.loginButton.click();
}

  async clickLoginWithGoogle() {
    await this.googleLoginButton.click();
  }

  async togglePasswordVisibility() {
    await this.passwordToggleButton.click();
  }

  // 🔥 States / Checks
  async isPasswordVisible(): Promise<boolean> {
    return (await this.passwordInput.getAttribute('type')) === 'text';
  }

  async isOnLoginPage() {
    await expect(this.loginButton).toBeVisible();
  }

  async isLoginSuccess() {
    await expect(this.page).toHaveURL(/overview/);
  }

  async isErrorVisible() {
    return await this.invalidCredentialError.isVisible();
  }

  // 🔥 LGN-10: คลิกลิงก์ Sign Up
  async clickSignUp() {
    await this.signUpLink.click();
  }
}