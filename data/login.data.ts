export const loginData = {
  valid: {
    username: 'test2',
    password: '123456789'
  },
  invalidPassword: {
    // username: 'test2',
    password: 'wrong'
  },
  invalidUsername: {
    username: 'wrong',
    // password: '123456789'
  },
  // LGN-03: Email ที่ไม่มีในระบบ
  nonExistentUser: {
    username: 'nonexistent_user_xyz_99999',
    password: 'SomePassword123'
  },
  // LGN-05: รูปแบบ Email ไม่ถูกต้อง
  invalidEmailFormats: ['test@', 'abc.com', '@gmail.com'],

  sqlInjection: [
    "' OR '1'='1",
    "' OR 1=1 --",
    "'; DROP TABLE users; --"
  ]
};
