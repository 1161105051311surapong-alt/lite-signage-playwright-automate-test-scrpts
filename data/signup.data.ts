export const signUpData = {
  // SU-01: ข้อมูลสำหรับสมัครสมาชิกใหม่ (⚠️ จะสร้าง account จริง)
  newUser: {
    email: `testuser_${Date.now()}@example.com`,
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!',
    username: `testuser_${Date.now()}`
  },
  // SU-02: Password ไม่ตรงกัน
  mismatchPassword: {
    email: 'test_mismatch@example.com',
    password: 'StrongPass123!',
    confirmPassword: 'DifferentPass456!'
  },
  // SU-03: Weak password
  weakPassword: {
    email: 'test_weak@example.com',
    password: '11111111',
    confirmPassword: '11111111'
  },
  // SU-05: Username ที่มีคนใช้แล้ว
  existingUsername: 'test2'
};
