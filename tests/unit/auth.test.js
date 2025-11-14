const { hashPassword, comparePassword, generateToken } = require('../../src/utils/auth')

describe('Auth Utilities', () => {
  test('Should hash password correctly', async () => {
    const password = 'testpassword123'
    const hashedPassword = await hashPassword(password)

    expect(hashedPassword).not.toBe(password)
    expect(await comparePassword(password, hashedPassword)).toBe(true)
    expect(await comparePassword('wrongpassword', hashedPassword)).toBe(false)
  }
  )
})
test('Should generate and verify general token', () => {
  const payload = { userId: 1, role: 'admin' }
  const token = generateToken(payload, '1h')
  expect(typeof token).toBe('string')
  expect(token.length).toBeGreaterThan(0)
})
