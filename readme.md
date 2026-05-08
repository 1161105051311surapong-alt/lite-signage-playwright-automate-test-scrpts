🎯 ภาพรวม: เรากำลังแก้อะไรอยู่
❗ ปัญหาเดิมของคุณ
test รันเดี่ยวผ่าน แต่รันรวม fail
มี flaky จาก Google login
login ซ้ำทุก test → ช้า
test เริ่มพึ่งกัน (เริ่มเละ)
🎯 เป้าหมายที่เราทำ

ทำ test ให้ “นิ่ง + เร็ว + scale ได้”

🧱 โครงสร้างใหม่ (ตัวตั้งต้น)
tests/
 ├── auth/
 │    ├── login.spec.ts
 │    └── google-login.spec.ts
 │
 ├── dashboard/
 │    └── dashboard.spec.ts
 │
 ├── setup/
 │    └── auth.setup.ts
 │
pages/
 ├── login.page.ts
 └── dashboard.page.ts
 │
data/
 └── login.data.ts
 │
fixtures/
 └── auth.fixture.ts
 │
storage/
 └── auth.json
🧠 อธิบายทีละไฟล์ (สำคัญมาก)
🔐 1. pages/login.page.ts
👉 ทำไมต้องมี
รวม locator + method ของหน้า login
ไม่ต้องเขียน selector ซ้ำทุก test
👉 หน้าที่
fillUserPassword()
clickLogin()
togglePasswordVisibility()
👉 ทำไปทำไม

✔ ทำให้ test อ่านง่าย
✔ เปลี่ยน UI ทีเดียว แก้ที่เดียว

📊 2. pages/dashboard.page.ts
👉 ทำไมต้องมี
แยก logic ของ dashboard ออกจาก login
👉 ทำไปทำไม

✔ ทำ test feature อื่นได้โดยไม่ยุ่งกับ login
✔ scale ง่าย

🧪 3. tests/auth/login.spec.ts
👉 ใช้ทำอะไร
test login form โดยตรง
👉 เช่น
login success
invalid password
empty field
SQL injection
👉 ทำไปทำไม

✔ test business logic ของ login
✔ ไม่เกี่ยวกับ feature อื่น

🌐 4. tests/auth/google-login.spec.ts
👉 ทำไมต้องแยก

Google login:

ใช้ popup
ใช้ external system
flaky
👉 ทำไปทำไม

✔ isolate test ที่ unstable
✔ ไม่ทำให้ test อื่นพัง

⚙️ 5. tests/setup/auth.setup.ts 🔥 (ตัวสำคัญ)
👉 ทำอะไร

login 1 ครั้ง แล้ว save session

await page.context().storageState({ path: 'storage/auth.json' });
👉 ทำไปทำไม

✔ ไม่ต้อง login ทุก test
✔ test เร็วขึ้นมาก
✔ ลด flaky

💾 6. storage/auth.json
👉 คืออะไร
session ที่ login แล้ว (cookie/localStorage)
👉 ทำไปทำไม
test.use({ storageState: 'storage/auth.json' });

✔ เปิดมา = login แล้วทันที
✔ ข้าม UI login ได้เลย

🧪 7. tests/dashboard/dashboard.spec.ts
👉 ใช้ทำอะไร

test หลัง login แล้ว

await page.goto('/overview');
👉 ทำไปทำไม

✔ ไม่ต้อง login ซ้ำ
✔ test เร็ว + stable

📦 8. data/login.data.ts
👉 ใช้ทำอะไร

เก็บ test data

valid.username
invalidPassword.password
sqlInjection[]
👉 ทำไปทำไม

✔ แยก data ออกจาก logic
✔ เปลี่ยนง่าย
✔ reuse ได้

🧩 9. fixtures/auth.fixture.ts (ระดับโปร)
👉 ทำอะไร

สร้าง page ที่ login แล้วให้ใช้เลย

authenticatedPage
👉 ทำไปทำไม

✔ ไม่ต้องเขียน setup ซ้ำ
✔ code สั้นลง
✔ ใช้ใน test เยอะ ๆ ได้ดี

🔥 Flow การทำงานทั้งหมด
1. auth.setup.ts → login → save session
2. test อื่นใช้ storage/auth.json
3. เข้า page ไหนก็ได้เลย (เหมือน login แล้ว)
🧠 แนวคิดสำคัญที่คุณได้จากชุดนี้
🟢 1. Test ต้อง Independent

❌ test ห้ามพึ่งกัน
✔ แต่ละ test ต้องเริ่มใหม่เสมอ

🟢 2. แยก “Login” ออกจาก “Feature”
ก่อน	หลัง
login ทุก test	login ครั้งเดียว
test ช้า	test เร็ว
🟢 3. External = isolate

Google login → แยกไฟล์ / serial / skip

🟢 4. ใช้ Page Object

ลด duplication
ทำให้ code readable

🟢 5. ใช้ Storage State

✔ มาตรฐานของ Playwright
✔ บริษัทใช้จริง

🚀 สรุปภาพใหญ่ (จำอันนี้ให้ขึ้นใจ)
login.spec.ts → ทดสอบ login
google-login.spec.ts → แยก external
auth.setup.ts → login ครั้งเดียว
auth.json → เก็บ session
dashboard.spec.ts → test หลัง login
🔥 ถ้าคุณลืม ให้จำสั้น ๆ

🔑 Login ครั้งเดียว → ใช้ซ้ำ
🧪 Test แยกกัน → ไม่พึ่งกัน
🌐 External → แยกออก