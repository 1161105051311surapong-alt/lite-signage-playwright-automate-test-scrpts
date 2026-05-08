import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { loginData } from '../data/login.data';






test.describe('Login Functionality', () => {

  test.describe('Positive Case', () => {

    test('TC-001 > login สำเร็จด้วยข้อมูลที่ถูกต้อง', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.fillUserPassword(loginData.valid.username, loginData.valid.password);
      // await loginPage.clickLogin();

      //ลด flaky 
      await Promise.all([
        page.waitForURL(/\/overview$/),
        loginPage.clickLogin()]);

      await expect(page).toHaveURL(/overview/);
      await expect(page.getByText('Welcome to Lite Workspace')).toBeVisible();


    });

    test.use({ storageState: { cookies: [], origins: [] } });
    test('T-002 > toggle password visibility', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.fillUserPassword(loginData.valid.username, loginData.valid.password);

      // default = ซ่อน
      expect(await loginPage.isPasswordVisible()).toBe(false);

      // กด → แสดง
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(true);

      // กดอีก → ซ่อน
      await loginPage.togglePasswordVisibility();
      expect(await loginPage.isPasswordVisible()).toBe(false);
    });


  });



  test.describe('Negative Case', () => {

    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-004 > ควรแสดง error เมื่อ password ไม่ถูกต้อง', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.fillUserPassword(loginData.valid.username, loginData.invalidPassword.password);
      await loginPage.clickLogin();

      await expect(loginPage.invalidCredentialError).toBeVisible();

      //optional: ตรวจสอบว่า error message ถูกต้อง
      await expect(loginPage.invalidCredentialError).toHaveText(/invalid username or password/i);
    });

    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-005 > ไม่กรอกข้อมูลเลยแล้วกด Login -> ระบบต้องแจ้งเตือนให้กรอกข้อมูล (Validation message)', async ({ page }) => {
      const loginpage = new LoginPage(page);

      await loginpage.goto();

      // 🔥 ก่อนกด → ไม่ควรมี error
      await expect(loginpage.usernameRequiredError).not.toBeVisible();
      await expect(loginpage.passwordRequiredError).not.toBeVisible();
      // 🔥 กด login
      await loginpage.clickLogin();
      // 🔥 หลังจากกด → ต้องมี error
      await expect(loginpage.usernameRequiredError).toBeVisible();
      await expect(loginpage.passwordRequiredError).toBeVisible();
    });

    // LGN-03: Login ด้วย Email ที่ไม่มีในระบบ → ระบบแจ้งเตือน Invalid Username or Password
    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-LGN-03 > Login ด้วย Email ที่ไม่มีในระบบ', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.fillUserPassword(
        loginData.nonExistentUser.username,
        loginData.nonExistentUser.password
      );
      await loginPage.clickLogin();

      // ระบบต้องแสดง error "Invalid Username or Password"
      await expect(loginPage.invalidCredentialError).toBeVisible();
      await expect(loginPage.invalidCredentialError).toHaveText(/invalid username or password/i);
    });

    // LGN-05: ตรวจสอบรูปแบบ Email (Invalid Format) → ระบบแจ้งเตือน
    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-LGN-05 > ตรวจสอบรูปแบบ Email (Invalid Format)', async ({ page }) => {
      const loginPage = new LoginPage(page);

      for (const invalidEmail of loginData.invalidEmailFormats) {
        await loginPage.goto();
        await loginPage.fillUserPassword(invalidEmail, 'anypassword');
        await loginPage.clickLogin();

        // หลังกด Login ระบบต้องยังอยู่หน้า login (ไม่ redirect ไป overview)
        await expect(page).toHaveURL(/login/);
      }
    });
  });

  test.describe('Security & Edge Cases', () => {

    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-006 > ควรไม่สามารถ login ได้เมื่อใช้ SQL Injection', async ({ page }) => {
      const loginPage = new LoginPage(page);

      for (const playload of loginData.sqlInjection) {
        await loginPage.goto();
        await loginPage.fillUserPassword(playload, playload);
        await Promise.all([
          page.waitForURL(/login/),
          loginPage.clickLogin()
        ]);

        // // ✅ ต้องไม่ redirect
        // await expect(page).toHaveURL(/login/);


        // ควรแสดง error ว่าไม่สามารถ login ได้
        await expect(loginPage.invalidCredentialError).toBeVisible();
      }
    });


    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-007 > เข้าหน้า Dashboard โดยตรงผ่าน URL (ขณะที่ยังไม่ Login) -> ระบบต้อง Redirect กลับมาหน้า Login', async ({ page }) => {
      const loginPage = new LoginPage(page);

      // พยายามเข้าหน้า dashboard โดยตรง
      await page.goto('https://cds.zignstack.com/cms/lite/overview');
      // ควรโดน redirect กลับมาที่หน้า login
      await expect(page).toHaveURL(/\/login$/);

      // เช็คว่าอยู่ที่หน้า login จริง
      await expect(loginPage.loginButton).toBeVisible();
    });

    // LGN-09: ยกเลิกการ Login ผ่าน Social → ปิด popup แล้วกลับมาหน้า login ปกติ
    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-LGN-09 > ยกเลิกการ Login ผ่าน Social (ปิด popup)', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();

      // กดปุ่ม Google → รอ popup ขึ้นมา
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        loginPage.clickLoginWithGoogle()
      ]);

      // ปิด popup ทันที (จำลองการยกเลิกของ user)
      await popup.close();

      // ระบบต้องกลับมาหน้า Login ปกติ ไม่ค้างหรือขาว
      await expect(page).toHaveURL(/login/);
      await expect(loginPage.loginButton).toBeVisible();
    });

    // LGN-10: ตรวจสอบลิงก์ไปหน้า Sign Up → redirect ไปหน้าสมัครสมาชิก
    test.use({ storageState: { cookies: [], origins: [] } });
    test('TC-LGN-10 > ตรวจสอบลิงก์ไปหน้า Sign Up', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.clickSignUp();

      // ระบบต้อง redirect ไปหน้าสมัครสมาชิก (register)
      await expect(page).toHaveURL(/register|signup|sign-up/, { timeout: 10000 });
    });

  });


});
