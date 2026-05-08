import { test, expect } from '@playwright/test';
import { SignUpPage } from '../../pages/signup.page';
import { signUpData } from '../../data/signup.data';

// ไม่ต้องใช้ session ล็อกอิน เพราะเป็นหน้าสมัครสมาชิก
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Sign Up Page (SU - 2 Steps)', () => {
  test.describe.configure({ mode: 'serial' });

  // SU-01: สมัครสมาชิกสำเร็จ → ข้ามเพราะจะสร้าง account จริง
  test.skip('TC-SU-01 > สมัครสมาชิกสำเร็จ (Step 1 -> 2)', async ({ page }) => {
    // ⚠️ Skip: จะสร้าง account จริงในระบบ ไม่ควรรัน auto ซ้ำๆ
    const signUpPage = new SignUpPage(page);
    await signUpPage.goto();
    await signUpPage.fillStep1(
      signUpData.newUser.email,
      signUpData.newUser.password,
      signUpData.newUser.confirmPassword
    );
    await signUpPage.clickNext();
    await signUpPage.fillStep2Username(signUpData.newUser.username);
    await signUpPage.clickCreateAccount();
    await expect(page).toHaveURL(/overview|dashboard/, { timeout: 30000 });
  });

  // SU-02: ตรวจสอบรหัสผ่านไม่ตรงกัน → แสดง "Passwords do not match"
  test('TC-SU-02 > ตรวจสอบรหัสผ่านไม่ตรงกัน (Step 1)', async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();

    // กรอก Password และ Confirm Password ให้ต่างกัน
    await signUpPage.fillStep1(
      signUpData.mismatchPassword.email,
      signUpData.mismatchPassword.password,
      signUpData.mismatchPassword.confirmPassword
    );

    // กด Next → ระบบต้องแจ้ง "Passwords do not match"
    await signUpPage.clickNext();
    await expect(signUpPage.passwordMismatchError).toBeVisible({ timeout: 5000 });
  });

  // SU-03: ตรวจสอบความแข็งแรงรหัสผ่าน (Weak Password) → แถบสีแดง
  test('TC-SU-03 > ตรวจสอบความแข็งแรงรหัสผ่าน (Weak Pass)', async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();

    // กรอกรหัส "1234" ที่อ่อนมาก
    await signUpPage.fillStep1(
      signUpData.weakPassword.email,
      signUpData.weakPassword.password,
      signUpData.weakPassword.confirmPassword
    );

    // แถบสีต้องขึ้นสีแดงและแจ้งว่าเป็น Weak Password
    await expect(signUpPage.weakPasswordIndicator).toBeVisible({ timeout: 5000 });
  });

  // SU-04: ตรวจสอบการย้อนกลับ (Back Button) → กลับไป Step 1 และข้อมูลยังอยู่
  test('TC-SU-04 > ตรวจสอบการย้อนกลับ (Back Button)', async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.goto();

    // กรอก Step 1 ให้ถูกต้อง แล้วไป Step 2
    const testEmail = 'backtest@example.com';
    await signUpPage.fillStep1(testEmail, 'ValidPass123!', 'ValidPass123!');
    await signUpPage.clickNext();

    // ตรวจสอบว่าอยู่ Step 2
    await expect(signUpPage.usernameInput).toBeVisible({ timeout: 5000 });

    // กดปุ่ม Back
    await signUpPage.clickBack();

    // ตรวจสอบว่ากลับมา Step 1
    await expect(signUpPage.emailInput).toBeVisible({ timeout: 5000 });

    // ตรวจสอบว่าข้อมูล email ที่กรอกไว้ยังอยู่
    const emailValue = await signUpPage.emailInput.inputValue();
    expect(emailValue).toBe(testEmail);
  });

  // SU-05: ตรวจสอบ Username ซ้ำ → ข้ามเพราะต้องผ่าน Step 1 ได้ก่อน
  test.skip('TC-SU-05 > ตรวจสอบ Username ซ้ำ (Step 2)', async ({ page }) => {
    // ⚠️ Skip: ต้องผ่าน Step 1 (กรอก email ใหม่จริง + reCAPTCHA)
    // จึงจะไปถึง Step 2 เพื่อทดสอบ Username ซ้ำได้
  });

  // SU-06: ลืมติ๊ก reCAPTCHA → ข้ามเพราะ reCAPTCHA ทดสอบ auto ไม่ได้
  test.skip('TC-SU-06 > ลืมติ๊ก reCAPTCHA (Step 2)', async ({ page }) => {
    // ⚠️ Skip: reCAPTCHA ถูกออกแบบมาเพื่อป้องกัน automation
    // ไม่สามารถทดสอบแบบ automated ได้
  });

  // // SU-07: Refresh หน้าจอขณะอยู่ Step 2 → ระบบจัดการได้เหมาะสม
  // test('TC-SU-07 > Refresh หน้าจอขณะอยู่ Step 2', async ({ page }) => {
  //   const signUpPage = new SignUpPage(page);

  //   await signUpPage.goto();

  //   // กรอก Step 1 แล้วไป Step 2
  //   await signUpPage.fillStep1('refresh_test@example.com', 'ValidPass123!', 'ValidPass123!');
  //   await signUpPage.clickNext();

  //   // ตรวจสอบว่าอยู่ Step 2
  //   try {
  //     await expect(signUpPage.usernameInput).toBeVisible({ timeout: 5000 });
  //   } catch {
  //     // บางระบบอาจมี validation ที่ต้อง email จริง
  //     console.log('⚠️ ไม่สามารถไป Step 2 ได้ (อาจต้อง email ที่ยังไม่ซ้ำ)');
  //     return;
  //   }

  //   // กด Refresh
  //   await page.reload();
  //   await page.waitForLoadState('domcontentloaded');

  //   // ระบบควรกลับไป Step 1 หรือยังอยู่ Step 2 ได้อย่างเหมาะสม (ไม่พัง)
  //   const isStep1 = await signUpPage.emailInput.isVisible({ timeout: 5000 }).catch(() => false);
  //   const isStep2 = await signUpPage.usernameInput.isVisible({ timeout: 5000 }).catch(() => false);

  //   // อย่างน้อยต้องอยู่ที่ step ใดสักอัน ไม่ใช่หน้าว่าง
  //   expect(isStep1 || isStep2).toBe(true);
  // });

  // SU-08: ข้ามขั้นตอนผ่าน URL → ระบบ redirect กลับ Step 1
  test('TC-SU-08 > ข้ามขั้นตอนผ่าน URL (Security)', async ({ page }) => {
    // พิมพ์ URL เข้าหน้า Step 2 โดยตรงโดยไม่ผ่าน Step 1
    await page.goto('https://cds.zignstack.com/cms/lite/register?step=2', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await page.waitForTimeout(2000);

    // ระบบต้อง redirect กลับไป Step 1 หรือหน้า register หลัก
    const signUpPage = new SignUpPage(page);
    await expect(signUpPage.emailInput).toBeVisible({ timeout: 5000 });
  });
});
