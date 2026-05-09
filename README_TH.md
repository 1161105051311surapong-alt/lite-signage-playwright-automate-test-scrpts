# Lite Signage Playwright สคริปต์การทดสอบอัตโนมัติ

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=microsoft&logoColor=white)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

ชุดการทดสอบอัตโนมัติที่ครอบคลุมสำหรับแพลตฟอร์ม Lite Signage สร้างด้วย Playwright และ TypeScript โปรเจคนี้มีการใช้องค์ประกอบที่ดีที่สุดในการทดสอบอัตโนมัติ เช่น Page Object Model, ส่วนแบ่งปันการยืนยันตัวตน และการทำงานของการทดสอบอย่างเป็นอิสระ

## สารบัญ

- [ภาพรวม](#ภาพรวม)
- [คุณสมบัติหลัก](#คุณสมบัติหลัก)
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [ความต้องการเบื้องต้น](#ความต้องการเบื้องต้น)
- [การติดตั้ง](#การติดตั้ง)
- [การตั้งค่า](#การตั้งค่า)
- [การรันการทดสอบ](#การรันการทดสอบ)
- [สถาปัตยกรรมโปรเจค](#สถาปัตยกรรมโปรเจค)
- [องค์ประกอบที่ดีที่สุดที่ใช้](#องค์ประกอบที่ดีที่สุดที่ใช้)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)
- [การมีส่วนร่วม](#การมีส่วนร่วม)

## ภาพรวม

โปรเจคนี้แก้ไขปัญหาทั่วไปในการทดสอบอัตโนมัติ:

| ปัญหา | วิธีแก้ไข |
|-------|---------|
| เทสต์ล้มเหลวเมื่อรันทั้งหมด แต่สำเร็จเมื่อรันเดี่ยว | การแยกการทดสอบและ setup/teardown ที่เหมาะสม |
| เทสต์ที่ไม่เสถียรเนื่องจากการพึ่งพิสัยนอก (Google Login) | แยกการทดสอบระบบนอกที่มีลอจิก retry |
| การรันการทดสอบที่ช้าเนื่องจาก login ซ้ำ | ส่วนแบ่งปันของเซสชันการยืนยันตัวตน |
| ความเป็นอิสระของการทดสอบและปัญหาการบำรุงรักษา | Page Object Model + การทดสอบที่เป็นอิสระ |
| ข้อมูลการทดสอบที่ไม่สอดคล้องกัน | การจัดการข้อมูลการทดสอบที่เป็นศูนย์กลาง |

## คุณสมบัติหลัก

✅ **Page Object Model** - ตัวเลือกองค์ประกอบและการโต้ตอบของหน้าเว็บแบบรวมศูนย์  
❌ การยืนยันตัวตนที่แบ่งปัน - ล็อกอินครั้งเดียว ใช้ซ้ำในการทดสอบทั้งหมด **ระบบมีการจัดการเรือง session 1 userเข้าได้1รอบต่อการใช้งานเลยจำเป็นต้อง login ใหม่ทุกครั้งเวลาเทส   
✅ **การแยกการทดสอบ** - แต่ละการทดสอบเป็นอิสระอย่างสมบูรณ์  
✅ **สนับสนุน TypeScript** - ความปลอดภัยประเภทเต็มรูปแบบและสนับสนุน IDE ที่ดีขึ้น  
✅ **โครงสร้างแบบมอดูลาร์** - หน้า อุปกรณ์เสริม และข้อมูลแยกตามหน่วยงาน  
✅ **การแยกระบบนอก** - เทสต์ Google Login แยกออกจากการทดสอบหลัก  
✅ **ข้อมูลการทดสอบที่ครอบคลุม** - สถานการณ์การทดสอบแบบรวมศูนย์รวมถึงกรณีขอบ  

## โครงสร้างโปรเจค

```
lite-signage-playwright-automate-test-scrpts/
├── tests/                          # ข้อกำหนดการทดสอบ
│   ├── auth/
│   │   ├── login.spec.ts          # เทสต์การตรวจสอบแบบฟอร์ม login
│   │   ├── google-login.spec.ts   # เทสต์ Google OAuth นอกระบบ
│   │   └── logout.spec.ts         # เทสต์ logout
│   ├── dashboard/
│   │   └── dashboard.spec.ts      # เทสต์ฟีเจอร์หน้า dashboard
│   ├── library/
│   │   └── library.spec.ts        # เทสต์ content library
│   ├── playlist/
│   │   └── playlist.spec.ts       # เทสต์จัดการ playlist
│   └── setup/
│       └── auth.setup.ts          # การตั้งค่าการยืนยันตัวตนกลาง
│
├── pages/                          # Page Object Models
│   ├── login.page.ts              # ตัวเลือก login page และ methods
│   ├── dashboard.page.ts          # ตัวเลือก dashboard page และ methods
│   ├── library.page.ts            # ตัวเลือก library page และ methods
│   ├── playlist.page.ts           # ตัวเลือก playlist page และ methods
│   └── base.page.ts               # หน้าพื้นฐาน methods ทั่วไป
│
├── fixtures/                       # อุปกรณ์เสริมการทดสอบ
│   └── auth.fixture.ts            # อุปกรณ์เสริมการยืนยันตัวตน
│
├── data/                          # ข้อมูลการทดสอบ
│   ├── login.data.ts              # สถานการณ์ login
│   ├── library.data.ts            # ข้อมูล library
│   └── playlist.data.ts           # ข้อมูล playlist
│
├── storage/                       # ที่เก็บข้อมูลถาวร
│   └── auth.json                  # เซสชันการยืนยันตัวตนที่บันทึก (สร้างขึ้นอัตโนมัติ)
│
├── setup/                         # อรรถประโยชน์การตั้งค่า
│   └── database.setup.ts          # เริ่มต้นฐานข้อมูล (หากจำเป็น)
│
├── playwright.config.ts           # การตั้งค่า Playwright
├── tsconfig.json                  # การตั้งค่า TypeScript
├── package.json                   # ไลบรารี่และสคริปต์
└── README.md                       # ไฟล์นี้

```

## ความต้องการเบื้องต้น

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **เบราว์เซอร์สมัยใหม่** (Chrome, Firefox, หรือ Edge)
- **อินสแตนซ์ Lite Signage ที่ใช้งาน** (หรือเซิร์ฟเวอร์พัฒนาเฉพาะที่)

## การติดตั้ง

### 1. โคลน Repository

```bash
git clone https://github.com/1161105051311surapong-alt/lite-signage-playwright-automate-test-scrpts.git
cd lite-signage-playwright-automate-test-scrpts
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ติดตั้งเบราว์เซอร์ Playwright

```bash
npx playwright install
```

### 4. ตั้งค่าตัวแปรสภาพแวดล้อม

สร้างไฟล์ `.env` ในโปรเจคราก:

```env
# การตั้งค่าแอปพลิเคชัน
BASE_URL=http://localhost:3000
TEST_USERNAME=test@example.com
TEST_PASSWORD=รหัสผ่านของคุณ

# การตั้งค่าเบราว์เซอร์
HEADLESS=true
BROWSER=chromium
SLOW_MO=0

# เวลาหมดเขต
TIMEOUT=30000
```

### 5. ตรวจสอบการติดตั้ง

```bash
npm test -- --list
```

## การตั้งค่า

### การตั้งค่า Playwright (`playwright.config.ts`)

การตั้งค่าหลัก:

```typescript
{
  testDir: './tests',
  timeout: 30 * 1000,              // 30 วินาทีต่อเทสต์
  expect: { timeout: 5000 },       // 5 วินาทีสำหรับ assertions
  fullyParallel: true,             // รันเทสต์แบบขนาน
  workers: 4,                      // จำนวนเทรด worker
  retries: 1,                      // ลองใหม่เทสต์ที่ล้มเหลว 1 ครั้ง
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',       // บันทึก trace สำหรับแก้ไขจุดบกพร่อง
    video: 'retain-on-failure',    // บันทึกวิดีโอสำหรับเทสต์ที่ล้มเหลว
    screenshot: 'only-on-failure', // บันทึกภาพหน้าจอสำหรับเทสต์ที่ล้มเหลว
  },
}
```

### สำคัญ: การตั้งค่าการยืนยันตัวตน

เซสชันการยืนยันตัวตนจะบันทึกไปยัง `storage/auth.json` ไฟล์นี้สร้างขึ้นระหว่างการรันการทดสอบครั้งแรก:

```bash
# การตั้งค่าเริ่มต้น - สร้าง auth.json
npm test tests/setup/auth.setup.ts

# การทดสอบที่ตามมาใช้เซสชันที่บันทึก
npm test
```

เพื่อรีเฟรชการยืนยันตัวตน:

```bash
rm storage/auth.json
npm test tests/setup/auth.setup.ts
```

## การรันการทดสอบ

### รันเทสต์ทั้งหมด

```bash
npm test
```

### รันไฟล์การทดสอบที่เฉพาะเจาะจง

```bash
npm test -- tests/auth/login.spec.ts
```

### รันเทสต์ที่ตรงกับรูปแบบ

```bash
npm test -- --grep "login"
```

### รันในโหมด Headed (เห็นเบราว์เซอร์)

```bash
npm test -- --headed
```

### รันในโหมด Debug

```bash
npm test -- --debug
```

### รันเทสต์ด้วย UI Mode (แบบโต้ตอบ)

```bash
npx playwright test --ui
```

### ดูว่าเกิดอะไรขึ้นด้วย Trace Viewer

```bash
npx playwright show-trace trace.zip
```

### รันสถานการณ์เทสต์ที่เฉพาะเจาะจง

```bash
npm test -- -g "ควรล็อกอินด้วยข้อมูลประจำตัวที่ถูกต้อง"
```

### สร้างรายงานการทดสอบ

```bash
npm test
npx playwright show-report
```

## สถาปัตยกรรมโปรเจค

### ขั้นตอนการไหลของการยืนยันตัวตน

```
┌──────────────────────────────────────────┐
│  1. การรันครั้งแรก: auth.setup.ts       │
│     • ไปที่หน้า login                    │
│     • ป้อนข้อมูลประจำตัว                 │
│     • ตรวจสอบ login สำเร็จ              │
│     • บันทึกเซสชัน → storage/auth.json   │
└──────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────┐
│  2. การรันการทดสอบในภายหลัง              │
│     • โหลดเซสชันจาก storage/auth.json   │
│     • เบราว์เซอร์เปิดด้วย auth cookies   │
│     • ผู้ใช้ login อยู่แล้ว              │
│     • เทสต์ดำเนินการกับฟีเจอร์           │
└──────────────────────────────────────────┘
```

### ขั้นตอนการไหลของการดำเนินการทดสอบ

```
┌──────────────────────┐
│ เทสต์เริ่มรัน        │
└────────┬─────────────┘
         ↓
┌────────────────────────────────┐
│ โหลด Storage State (auth.json)  │
│ • Cookies โหลด                │
│ • LocalStorage โหลด           │
│ • ผู้ใช้ยืนยันตัวตนแล้ว        │
└────────┬─────────────────────────┘
         ↓
┌────────────────────────────────┐
│ ดำเนินการขั้นตอนเทสต์           │
│ • ไปยังฟีเจอร์                  │
│ • ทำการกระทำต่าง ๆ              │
│ • ตรวจสอบผลลัพธ์                │
└────────┬──────────────────────────┘
         ↓
┌────────────────────────────────┐
│ เทสต์สิ้นสุด                    │
│ • สำเร็จ ✓                     │
│ • ล้มเหลว ✗ (ภาพหน้าจอ/วิดีโอ) │
│ • ลองใหม่ (ถ้าตั้งค่าไว้)        │
└────────────────────────────────┘
```

## องค์ประกอบที่ดีที่สุดที่ใช้

### 1. **ความเป็นอิสระของการทดสอบ** ✅

แต่ละการทดสอบเป็นอิสระอย่างสมบูรณ์:

```typescript
test('ควรแสดง dashboard', async ({ page }) => {
  // เซสชันโหลดโดยอัตโนมัติจาก auth.json
  // ไม่จำเป็นต้อง login อีก
  await page.goto('/overview');
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

### 2. **Page Object Model** ✅

ตัวเลือกและการโต้ตอบจะห่อหุ้ม:

```typescript
// pages/login.page.ts
export class LoginPage {
  readonly usernameInput = this.page.locator('input[name="username"]');
  readonly passwordInput = this.page.locator('input[name="password"]');
  
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### 3. **Fixtures ที่แบ่งปัน** ✅

อรรถประโยชน์การทดสอบที่นำกลับมาใช้ได้:

```typescript
// fixtures/auth.fixture.ts
export const authenticatedPage = test.extend({
  page: async ({ page }, use) => {
    // หน้าเว็บที่ยืนยันตัวตนแล้วพร้อมใช้
    await page.context().addCookies([...]);
    await use(page);
  },
});
```

### 4. **ข้อมูลการทดสอบที่รวมศูนย์** ✅

ข้อมูลการทดสอบทั้งหมดอยู่ในที่เดียว:

```typescript
// data/login.data.ts
export const loginTestData = {
  validCredentials: {
    username: 'test@example.com',
    password: 'ValidPassword123!',
  },
  invalidPassword: {
    username: 'test@example.com',
    password: 'WrongPassword',
  },
};
```

### 5. **การแยกระบบนอก** ✅

เทสต์ Google Login แยกออก:

```typescript
// tests/auth/google-login.spec.ts
test.skip('Google OAuth login', async ({ page }) => {
  // เทสต์นี้ข้ามไป CI/CD หรือทำเครื่องหมายว่าไม่เสถียร
  // ต้องมีการแทรกแซงด้วยตนเองสำหรับการจัดการ popup
});
```

### 6. **การจัดการข้อผิดพลาดและการลองใหม่** ✅

ตั้งค่าในหลายระดับ:

```typescript
// playwright.config.ts
retries: process.env.CI ? 2 : 0,  // ลองใหม่ 2 ครั้ง CI

// ในเทสต์
await expect(element).toBeVisible({ timeout: 10000 });
```

## การแก้ไขปัญหา

### เทสต์สำเร็จเดี่ยว แต่ล้มเหลวเมื่อรันทั้งหมด

**สาเหตุ:** การทดสอบไม่เป็นอิสระจริง ๆ หรือแบ่งปันสถานะ  
**วิธีแก้ไข:** ตรวจสอบว่าแต่ละการทดสอบใช้บริบทสด ๆ และล้าง auth.json ระหว่างการรัน

```bash
rm storage/auth.json && npm test
```

### เทสต์ Google Login ไม่เสถียร

**สาเหตุ:** ขึ้นอยู่กับบริการนอกและการจัดการ popup  
**วิธีแก้ไข:** เทสต์แยกออกใน `google-login.spec.ts` และสามารถข้ามหรือรันแยกกันได้

```bash
npm test -- --grep "google"
```

### เซสชันการยืนยันตัวตนหมดอายุ

**สาเหตุ:** ระยะเวลาเซสชันเกินขีด จำกัด หรือเซสชันไม่ถูกต้อง  
**วิธีแก้ไข:** สร้าง auth.json ใหม่

```bash
rm storage/auth.json
npm test tests/setup/auth.setup.ts
```

### ข้อผิดพลาดหมดเวลา

**สาเหตุ:** การทดสอบใช้เวลานานกว่าเวลาที่ตั้งค่าไว้  
**วิธีแก้ไข:** เพิ่มเวลาหมดเขต ใน playwright.config.ts หรือใช้เวลาที่เฉพาะเจาะจง:

```typescript
await page.waitForNavigation({ timeout: 60000 });
```

### ไม่พบองค์ประกอบ

**สาเหตุ:** ตัวเลือกเปลี่ยนไป หรือองค์ประกอบโหลดแบบอะซิงโครนัส  
**วิธีแก้ไข:** อัปเดตตัวเลือกใน Page Object Model และเพิ่มเงื่อนไขการรอ:

```typescript
await page.waitForSelector('[data-testid="target"]');
```

### เทสต์ค้างหรือแช่อยู่

**สาเหตุ:** การรอไม่มีที่สิ้นสุด หรือล็อค  
**วิธีแก้ไข:** รันด้วย debug เพื่อดูว่าเกิดอะไรขึ้น:

```bash
npm test -- --debug
```

## การมีส่วนร่วม

### การเพิ่มเทสต์ใหม่

1. สร้างไฟล์เทสต์ในไดเร็กทอรี่ที่เหมาะสมภายใต้ `tests/`
2. นำเข้า Page Objects และข้อมูลการทดสอบที่จำเป็น
3. ใช้ fixtures ที่มีอยู่เพื่อการยืนยันตัวตน
4. ปฏิบัติตามหลักเกณฑ์การตั้งชื่อ: `feature.spec.ts`

ตัวอย่าง:

```typescript
// tests/library/create-content.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { LibraryPage } from '../../pages/library.page';
import { libraryTestData } from '../../data/library.data';

test.describe('Library - สร้างเนื้อหา', () => {
  test('ควรสร้างรายการเนื้อหาใหม่', async ({ page }) => {
    const libraryPage = new LibraryPage(page);
    
    await page.goto('/library');
    await libraryPage.createNewItem(libraryTestData.validContent);
    
    await expect(page.locator('text=สร้างเนื้อหาแล้ว')).toBeVisible();
  });
});
```

### การเพิ่ม Page Objects ใหม่

1. สร้างไฟล์ในไดเร็กทอรี่ `pages/`
2. ขยาย BasePageClass หากมี
3. กำหนดตัวเลือกทั้งหมดเป็น properties
4. สร้าง methods สำหรับการโต้ตอบทั่วไป

ตัวอย่าง:

```typescript
// pages/settings.page.ts
import { Page, Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly saveButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.saveButton = this.page.locator('button:has-text("บันทึก")');
  }
  
  async save() {
    await this.saveButton.click();
    await this.page.waitForNavigation();
  }
}
```

### หลักเกณฑ์ลักษณะรหัส

- ใช้ TypeScript เพื่อความปลอดภัยประเภท
- ปฏิบัติตามการตั้งชื่อ camelCase สำหรับตัวแปรและ methods
- ใช้ PascalCase สำหรับคลาส
- เพิ่มความเห็นชอบของ JSDoc สำหรับ public methods
- ให้ methods มีความมุ่งเน้นไปยังหน้าที่เดียว

## ทรัพยากรเพิ่มเติม

- [เอกสาร Playwright](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices Test Isolation](https://playwright.dev/docs/auth#multi-step-authentication)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## ใบอนุญาต

โปรเจคนี้ได้รับอนุญาตภายใต้ MIT License - ดูไฟล์ LICENSE สำหรับรายละเอียด

## การสนับสนุน

สำหรับปัญหาหรือคำถาม:

1. ตรวจสอบส่วน [การแก้ไขปัญหา](#การแก้ไขปัญหา)
2. ทบทวนเอาต์พุตการทดสอบและภาพหน้าจอ/วิดีโอใน `test-results/`
3. รันด้วยแฟล็ก `--debug` เพื่อข้อมูลโดยละเอียด
4. ตรวจสอบเอกสาร Playwright
5. เปิด issue บน GitHub

---

**อัปเดตครั้งล่าสุด:** 2024  
**บำรุงรักษาโดย:** ทีม QA Automation
